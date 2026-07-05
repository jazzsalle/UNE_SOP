/**
 * runtimeMock — 실행 경로(visitedNodeIds)로부터 Mock 런타임 산출물을 생성한다.
 * 임무(missions)/상황전파(notifications)/응답(responses)/전자상황판 기록(boardRecords)/
 * 타임라인(timeline)을 만들어 Runtime Preview에 공급한다. (1차 POC — 실제 SMS·IoT 없음)
 * React·@xyflow/react 무의존 순수 모듈.
 */
import type {
  EventContext,
  GraphNode,
  RuntimeMission,
  RuntimeNotification,
  SOPGraph,
} from "../domain";
import { findPath, findTopologyNode, getTopologySet } from "../domain/topology";
import type {
  BoardRecordMock,
  MockResponse,
  SimulateOptions,
  TimelineEntry,
} from "./types";

/** 순번을 2자리 0패딩 문자열로 만든다 — MISSION-01, NOTI-01 등 id 조립용. */
function zeroPad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 빈 문자열/undefined/null을 미입력으로 취급해 폴백 값을 고른다. */
function nonBlank(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/** 노드 id → GraphNode 조회 맵을 만든다. */
function buildNodeById(graph: SOPGraph): Map<string, GraphNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

/** 경로상 노드를 방문 순서대로 GraphNode 배열로 되돌린다. */
function visitedNodes(graph: SOPGraph, visited: string[]): GraphNode[] {
  const nodeById = buildNodeById(graph);
  return visited
    .map((nodeId) => nodeById.get(nodeId))
    .filter((node): node is GraphNode => node !== undefined);
}

/**
 * sop_task 노드에 연결된 role 타입 노드의 label을 찾는다 — assigneeRole 폴백.
 * ① 태스크 자신의 outgoing이 role로 향하면 그 label,
 * ② 부모 sop_group의 outgoing(missions_out 등)이 role로 향하면 그 label.
 */
function findConnectedRoleLabel(graph: SOPGraph, taskNode: GraphNode): string | undefined {
  const nodeById = buildNodeById(graph);
  const roleTargetOf = (sourceNodeId: string): string | undefined => {
    for (const edge of graph.edges) {
      if (edge.sourceNodeId !== sourceNodeId) continue;
      const target = nodeById.get(edge.targetNodeId);
      if (target?.type === "role") return target.label;
    }
    return undefined;
  };

  const direct = roleTargetOf(taskNode.id);
  if (direct) return direct;

  const parentGroup = graph.nodes.find(
    (node) => node.type === "sop_group" && (node.children ?? []).includes(taskNode.id),
  );
  return parentGroup ? roleTargetOf(parentGroup.id) : undefined;
}

/* ------------------------------------------------------------------ */
/* 임무                                                                 */
/* ------------------------------------------------------------------ */

/**
 * taskKind "patrol" sop_task 노드의 토폴로지 참조를 해석해 패트롤 경로 정보를 계산한다.
 * 셋/시작/종료 미지정, 셋 미등록, 경로 미도달이면 undefined — 임무 생성 자체는 막지 않는
 * 무해 통과(참조 오류 차단은 validateGraph의 패트롤 검증 규칙이 담당한다).
 */
function resolvePatrol(node: GraphNode): RuntimeMission["patrol"] {
  if (node.properties.taskKind !== "patrol") return undefined;
  const topologySetId = nonBlank(node.properties.topologySetId);
  const startNodeId = nonBlank(node.properties.startNodeId);
  const endNodeId = nonBlank(node.properties.endNodeId);
  if (!topologySetId || !startNodeId || !endNodeId) return undefined;

  const set = getTopologySet(topologySetId);
  if (!set) return undefined;
  const path = findPath(set, startNodeId, endNodeId);
  if (!path) return undefined;

  // 점검 포인트는 경로에 실제 포함된 노드만 담는다 — 경로 밖 지정은 검증 경고 대상.
  const checkpointIds = Array.isArray(node.properties.checkpointNodeIds)
    ? node.properties.checkpointNodeIds.filter(
        (id): id is string => typeof id === "string" && path.nodeIds.includes(id),
      )
    : [];
  return {
    topologySetId,
    routeNodeIds: path.nodeIds,
    checkpointNodeIds: checkpointIds,
    distanceM: path.distanceM,
  };
}

/**
 * 경로상 sop_task 노드(그룹 자식 + 독립 태스크 — 둘 다 visited에 포함됨)마다
 * RuntimeMission을 생성한다. 담당 역할은 assigneeRole 속성, 없으면 연결된 role 노드 label.
 * taskKind "patrol" 노드는 토폴로지 경로를 해석해 mission.patrol을 채운다(미해석 시 생략).
 */
export function buildMissions(graph: SOPGraph, visited: string[]): RuntimeMission[] {
  const missions: RuntimeMission[] = [];
  for (const node of visitedNodes(graph, visited)) {
    if (node.type !== "sop_task") continue;
    const dueMinutes = Number(node.properties.dueMinutes);
    const mission: RuntimeMission = {
      missionId: `MISSION-${zeroPad(missions.length + 1)}`,
      nodeId: node.id,
      title: nonBlank(node.properties.title) ?? node.label,
      assigneeRole:
        nonBlank(node.properties.assigneeRole) ?? findConnectedRoleLabel(graph, node),
      status: "SENT",
      dueMinutes: Number.isFinite(dueMinutes) && dueMinutes > 0 ? dueMinutes : undefined,
    };
    const patrol = resolvePatrol(node);
    if (patrol) mission.patrol = patrol;
    missions.push(mission);
  }
  return missions;
}

/* ------------------------------------------------------------------ */
/* 상황전파                                                             */
/* ------------------------------------------------------------------ */

/** notification 노드의 channel 속성을 RuntimeNotification channel로 정규화한다(기본 sms). */
function normalizeChannel(value: unknown): RuntimeNotification["channel"] {
  return value === "app_push" || value === "broadcast" ? value : "sms";
}

/**
 * 경로상 notification/escalation 노드마다 RuntimeNotification을 생성한다.
 * targets는 경로상 role 타입 노드 label들(없으면 ["전체 담당자"]),
 * message는 messageTemplate 속성(없으면 "[severity] eventType 상황 전파"),
 * status는 응답 시나리오면 ACKED, 미응답 시나리오면 SENT.
 */
export function buildNotifications(
  graph: SOPGraph,
  visited: string[],
  ctx: EventContext,
  opts: SimulateOptions,
): RuntimeNotification[] {
  const nodes = visitedNodes(graph, visited);
  const roleLabels = nodes.filter((node) => node.type === "role").map((node) => node.label);
  const targets = roleLabels.length > 0 ? roleLabels : ["전체 담당자"];

  const notifications: RuntimeNotification[] = [];
  for (const node of nodes) {
    if (node.type !== "notification" && node.type !== "escalation") continue;
    notifications.push({
      notificationId: `NOTI-${zeroPad(notifications.length + 1)}`,
      nodeId: node.id,
      channel: normalizeChannel(node.properties.channel),
      targets: [...targets],
      message:
        nonBlank(node.properties.messageTemplate) ??
        `[${ctx.severity}] ${ctx.eventType} 상황 전파`,
      status: opts.branchOutcome === "responded" ? "ACKED" : "SENT",
    });
  }
  return notifications;
}

/* ------------------------------------------------------------------ */
/* 응답                                                                 */
/* ------------------------------------------------------------------ */

/**
 * 임무별 Mock 응답을 생성한다.
 * - responded: 전부 COMPLETED(offset 3분). 임무가 2건 이상이면 마지막 하나는
 *   DELAYED(offset 8분)로 바꿔 결과에 변화를 준다.
 * - timeout: 첫 임무 NO_RESPONSE(offset=timeoutMinutes), 나머지는 DELAYED(timeout+3분).
 */
export function buildResponses(
  missions: RuntimeMission[],
  opts: SimulateOptions,
  timeoutMinutes: number,
): MockResponse[] {
  return missions.map((mission, index) => {
    if (opts.branchOutcome === "responded") {
      const isLastOfMany = missions.length > 1 && index === missions.length - 1;
      return {
        missionId: mission.missionId,
        missionTitle: mission.title,
        status: isLastOfMany ? "DELAYED" : "COMPLETED",
        respondedBy: mission.assigneeRole,
        offsetMinutes: isLastOfMany ? 8 : 3,
      };
    }
    if (index === 0) {
      return {
        missionId: mission.missionId,
        missionTitle: mission.title,
        status: "NO_RESPONSE",
        offsetMinutes: timeoutMinutes,
      };
    }
    return {
      missionId: mission.missionId,
      missionTitle: mission.title,
      status: "DELAYED",
      respondedBy: mission.assigneeRole,
      offsetMinutes: timeoutMinutes + 3,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 전자상황판 기록                                                       */
/* ------------------------------------------------------------------ */

/**
 * 경로상 situation_board 노드마다 장소/시간/임무내용/상황전파 4개 필드를 채운
 * 상황판 기록 Mock을 생성한다.
 */
export function buildBoardRecords(
  graph: SOPGraph,
  visited: string[],
  ctx: EventContext,
  missions: RuntimeMission[],
  notifications: RuntimeNotification[],
): BoardRecordMock[] {
  const missionSummary = missions.map((mission) => mission.title).join(", ") || "-";
  const notificationSummary =
    notifications
      .map((noti) => `${noti.channel} → ${noti.targets.join(", ")} (${noti.status})`)
      .join(" / ") || "-";

  const records: BoardRecordMock[] = [];
  for (const node of visitedNodes(graph, visited)) {
    if (node.type !== "situation_board") continue;
    records.push({
      boardNodeId: node.id,
      fields: {
        장소: ctx.spaceId ?? ctx.siteId ?? "-",
        시간: ctx.occurredAt,
        임무내용: missionSummary,
        상황전파: notificationSummary,
      },
    });
  }
  return records;
}

/* ------------------------------------------------------------------ */
/* 타임라인                                                             */
/* ------------------------------------------------------------------ */

/**
 * 시뮬레이션 타임라인을 생성한다 — offsetMinutes 누적 규칙:
 * event/scope/asset/condition(0분) → 임무 전송(+1분, 패트롤 임무는 경로 노드당 +1분 누적)
 * → 상황전파(+2분)
 * → 응답(responded: +3분·지연 +8분 / timeout: +timeoutMinutes)
 * → escalation(+timeoutMinutes+1분) → 상황판/기록(마지막, 이전 최대 offset).
 */
export function buildTimeline(
  graph: SOPGraph,
  visited: string[],
  ctx: EventContext,
  conditionOutcomes: Record<string, boolean>,
  missions: RuntimeMission[],
  notifications: RuntimeNotification[],
  responses: MockResponse[],
  opts: SimulateOptions,
  timeoutMinutes: number,
): TimelineEntry[] {
  const nodes = visitedNodes(graph, visited);
  const entries: TimelineEntry[] = [];
  let seq = 1;
  const push = (
    offsetMinutes: number,
    nodeId: string,
    kind: TimelineEntry["kind"],
    message: string,
  ): void => {
    entries.push({ seq: seq++, offsetMinutes, nodeId, kind, message });
  };

  // 0분 — 이벤트 발생과 범위/자산/조건 판정(즉시 처리로 간주).
  for (const node of nodes) {
    switch (node.type) {
      case "event":
        push(0, node.id, "event", `이벤트 발생 — ${ctx.eventType} (${ctx.severity}), "${node.label}" 트리거 매칭`);
        break;
      case "space_scope":
        push(0, node.id, "scope", `공간 범위 확인 — ${node.label}`);
        break;
      case "asset_filter":
        push(0, node.id, "asset", `대상 자산 확인 — ${node.label}`);
        break;
      case "condition": {
        const outcome = conditionOutcomes[node.id];
        push(0, node.id, "condition", `조건 판정 — ${node.label}: ${outcome === false ? "미충족" : "충족"}`);
        break;
      }
      default:
        break;
    }
  }

  // +1분 — 임무 전송. 패트롤 임무는 전송 엔트리 뒤에 경로 노드별 이동/점검 엔트리를 잇는다
  // (offsetMinutes는 임무 전송 후 노드당 +1분 누적 근사).
  for (const mission of missions) {
    push(1, mission.nodeId, "mission", `임무 전송 — ${mission.title} (${mission.assigneeRole ?? "담당 미지정"})`);
    if (!mission.patrol) continue;
    const { topologySetId, routeNodeIds, checkpointNodeIds } = mission.patrol;
    routeNodeIds.forEach((routeNodeId, index) => {
      const displayName = findTopologyNode(topologySetId, routeNodeId)?.displayName ?? routeNodeId;
      const isCheckpoint = checkpointNodeIds.includes(routeNodeId);
      push(
        1 + (index + 1),
        mission.nodeId,
        "patrol",
        isCheckpoint ? `점검 수행 — ${displayName}` : `패트롤 이동 — ${displayName}`,
      );
    });
  }

  // +2분 — 상황전파 발송.
  for (const noti of notifications) {
    const node = graph.nodes.find((n) => n.id === noti.nodeId);
    if (node?.type === "escalation") continue; // escalation은 아래에서 별도 시각으로 기록.
    push(2, noti.nodeId, "notification", `상황 전파 — [${noti.channel}] ${noti.message} → ${noti.targets.join(", ")}`);
  }

  // 응답 분기 판정 시각 — responded면 첫 응답 시각(3분), timeout이면 제한 시간 경과 시점.
  for (const node of nodes) {
    if (node.type !== "branch") continue;
    if (opts.branchOutcome === "responded") {
      push(3, node.id, "condition", `응답 분기 — 제한 ${timeoutMinutes}분 내 응답 수신`);
    } else {
      push(timeoutMinutes, node.id, "condition", `응답 분기 — ${timeoutMinutes}분 경과, 미응답`);
    }
  }

  // 임무별 응답 결과.
  for (const response of responses) {
    const mission = missions.find((m) => m.missionId === response.missionId);
    const nodeId = mission?.nodeId ?? response.missionId;
    const message =
      response.status === "COMPLETED"
        ? `임무 완료 보고 — ${response.missionTitle} (${response.respondedBy ?? "담당자"})`
        : response.status === "DELAYED"
          ? `임무 지연 보고 — ${response.missionTitle} (${response.respondedBy ?? "담당자"})`
          : `응답 없음 — ${response.missionTitle}`;
    push(response.offsetMinutes, nodeId, "response", message);
  }

  // 미응답 시 escalation — 제한 시간 경과 후 +1분에 상위 역할로 재전파.
  for (const node of nodes) {
    if (node.type !== "escalation") continue;
    const escalateTo = nonBlank(node.properties.escalateToRole) ?? "상위 책임자";
    const channel = normalizeChannel(node.properties.channel);
    push(timeoutMinutes + 1, node.id, "escalation", `상향 전파 — ${escalateTo}에게 ${channel} 재전파`);
  }

  // 마지막 — 상황판/기록 노드 기재(이전 항목들의 최대 offset 시점).
  const lastOffset = entries.reduce((max, entry) => Math.max(max, entry.offsetMinutes), 0);
  for (const node of nodes) {
    if (node.type === "situation_board") {
      push(lastOffset, node.id, "board", `상황판 기록 — "${node.label}"에 장소/시간/임무내용/상황전파 기재`);
    } else if (node.type === "evidence") {
      push(lastOffset, node.id, "record", `기록 생성 — ${node.label}`);
    }
  }

  return entries;
}
