/**
 * 로봇개 패트롤 시드 — 야간 순찰 SOPGraph (Phase 7 토폴로지-SOP 연동 검증용).
 * 플로우: Manual Report(순찰 지시) → Facility(검증용 표준 건물) → Condition(INFO 이상)
 * → SOP Group(야간 순찰: Patrol Route + Checklist) → App Push(안전관리자 전파)
 * → Branch → Situation Board (+ timeout 시 Escalation → Board).
 * siteId/spaceIds는 검증용 건물 공간 스키마, 패트롤 경로는 샘플 토폴로지 셋
 * `topo-verification-building`의 실존 노드 id를 참조한다 — 검증 규칙 8·9 통과 보장.
 */
import { VERIFICATION_SPACES, VERIFICATION_UFID } from "../spatial";
import { VERIFICATION_TOPOLOGY_SET_ID } from "../topology";
import type { SOPGraph } from "../types";
import { SEED_TIMESTAMP, seedNode, type DomainTemplateSeed } from "./seedTypes";

/** 공간 표시명 → 기본키(spaceId) — 검증용 건물 실존 id만 참조하도록 보장. 미존재 시 Error. */
function spaceIdOf(name: string): string {
  const space = VERIFICATION_SPACES.find((candidate) => candidate.name === name);
  if (!space) {
    throw new Error(`검증용 건물에 존재하지 않는 공간입니다: "${name}"`);
  }
  return space.primaryKey;
}

/** 순찰 대상 공간 2개 — 순찰 경로가 관통하는 1층/2층 중앙 복도. */
const PATROL_SPACE_F1_CORRIDOR = spaceIdOf("1층 중앙 복도");
const PATROL_SPACE_F2_CORRIDOR = spaceIdOf("2층 중앙 복도");

/** 로봇개 야간 순찰 시드 그래프 — 노드 10개, 엣지 9개. */
const ROBOT_PATROL_GRAPH: SOPGraph = {
  graphId: "graph-seed-robot-patrol",
  name: "로봇개 야간 순찰",
  description:
    "야간 순찰 지시 → 검증용 건물 범위 → 위험도 조건 → 야간 순찰 SOP(패트롤 루트 + 점검 기록) → 안전관리자 전파 → 응답 분기 → 상황판 기록 (미응답 시 상향 전파).",
  domain: "robot_patrol",
  version: "0.1.0",
  nodes: [
    seedNode("tpl-trigger-manual-report", "seed-rp-event", { x: 0, y: 200 }, {
      label: "야간 순찰 지시",
      properties: { eventType: "PATROL_REQUEST", severityMin: "INFO" },
    }),
    seedNode("tpl-scope-facility", "seed-rp-facility", { x: 280, y: 200 }, {
      label: "검증용 표준 건물",
      properties: {
        siteId: VERIFICATION_UFID,
        spaceIds: [PATROL_SPACE_F1_CORRIDOR, PATROL_SPACE_F2_CORRIDOR],
      },
    }),
    seedNode("tpl-logic-condition", "seed-rp-cond", { x: 560, y: 200 }, {
      label: "위험도 INFO 이상",
      properties: { field: "severity", operator: ">=", value: "INFO" },
    }),
    seedNode("tpl-sop-group", "seed-rp-sop", { x: 840, y: 120 }, {
      label: "야간 순찰",
      properties: {
        name: "야간 순찰",
        domain: "robot_patrol",
        taskIds: ["seed-rp-task-1", "seed-rp-task-2"],
      },
      children: ["seed-rp-task-1", "seed-rp-task-2"],
    }),
    // 그룹 자식 — position은 부모(seed-rp-sop) 기준 상대좌표.
    seedNode("tpl-sop-patrol", "seed-rp-task-1", { x: 24, y: 56 }, {
      label: "건물 순찰 루트",
      properties: {
        title: "건물 순찰 루트",
        assigneeRole: "로봇개 R-01",
        dueMinutes: 30,
        instructions:
          "1층 정문에서 출발해 계단으로 2층 의무실까지 순찰하며 점검 포인트를 차례로 확인한다.",
        topologySetId: VERIFICATION_TOPOLOGY_SET_ID,
        startNodeId: "vt-f1-entrance",
        endNodeId: "vt-f2-infirmary",
        // 점검 포인트 — 계산된 경로(정문→로비→복도→계단B→2층 복도→의무실) 위의 실존 노드만 지정.
        checkpointNodeIds: ["vt-f1-lobby", "vt-f2-corridor-c"],
      },
    }),
    seedNode("tpl-sop-checklist", "seed-rp-task-2", { x: 24, y: 136 }, {
      label: "점검 결과 기록",
      properties: {
        title: "점검 결과 기록",
        assigneeRole: "통합관제실",
        items: ["점검 포인트 이상 유무 기록", "순찰 영상 업로드 확인"],
      },
    }),
    seedNode("tpl-action-app-push", "seed-rp-push", { x: 1240, y: 200 }, {
      label: "안전관리자 전파",
      properties: { messageTemplate: "[순찰] 로봇개 야간 순찰 결과 — 점검 내역 확인 요망" },
    }),
    seedNode("tpl-logic-branch", "seed-rp-branch", { x: 1520, y: 200 }, {
      label: "응답 분기",
      properties: { timeoutMinutes: 5 },
    }),
    seedNode("tpl-runtime-situation-board", "seed-rp-board", { x: 2080, y: 160 }, {
      label: "전자상황판",
      properties: { boardId: "BOARD-PATROL-MAIN" },
    }),
    seedNode("tpl-runtime-escalation", "seed-rp-esc", { x: 1800, y: 360 }, {
      label: "상향 전파",
      properties: { escalateToRole: "통합관제실장" },
    }),
  ],
  edges: [
    // 포트 id/dataType은 templates/* 정의와 일치 — edgeType은 소스 포트 dataType 기준.
    { id: "seed-rp-e1", sourceNodeId: "seed-rp-event", sourcePortId: "event_out", targetNodeId: "seed-rp-facility", targetPortId: "event_in", edgeType: "event_flow" },
    { id: "seed-rp-e2", sourceNodeId: "seed-rp-facility", sourcePortId: "scoped_out", targetNodeId: "seed-rp-cond", targetPortId: "in", edgeType: "scope_flow" },
    { id: "seed-rp-e3", sourceNodeId: "seed-rp-cond", sourcePortId: "true_out", targetNodeId: "seed-rp-sop", targetPortId: "trigger_in", edgeType: "condition_flow" },
    { id: "seed-rp-e4", sourceNodeId: "seed-rp-sop", sourcePortId: "missions_out", targetNodeId: "seed-rp-push", targetPortId: "mission_in", edgeType: "execution_flow" },
    { id: "seed-rp-e5", sourceNodeId: "seed-rp-push", sourcePortId: "response_out", targetNodeId: "seed-rp-branch", targetPortId: "response_in", edgeType: "response_flow" },
    { id: "seed-rp-e6", sourceNodeId: "seed-rp-branch", sourcePortId: "responded_out", targetNodeId: "seed-rp-board", targetPortId: "flow_in", edgeType: "execution_flow" },
    { id: "seed-rp-e7", sourceNodeId: "seed-rp-branch", sourcePortId: "timeout_out", targetNodeId: "seed-rp-esc", targetPortId: "flow_in", edgeType: "execution_flow" },
    { id: "seed-rp-e8", sourceNodeId: "seed-rp-esc", sourcePortId: "flow_out", targetNodeId: "seed-rp-board", targetPortId: "flow_in", edgeType: "execution_flow" },
    { id: "seed-rp-e9", sourceNodeId: "seed-rp-sop", sourcePortId: "flow_out", targetNodeId: "seed-rp-board", targetPortId: "flow_in", edgeType: "execution_flow" },
  ],
  groups: [
    {
      id: "seed-rp-sop",
      label: "야간 순찰",
      nodeIds: ["seed-rp-task-1", "seed-rp-task-2"],
    },
  ],
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

/** 로봇개 패트롤 도메인 템플릿 시드 — 정상 순찰 EVT-PATROL-001 + AI 이상 감지 EVT-PATROL-002 포함. */
export const ROBOT_PATROL_SEED: DomainTemplateSeed = {
  seedId: "seed-robot-patrol",
  name: "로봇개 패트롤",
  domain: "robot_patrol",
  description: "검증용 표준 건물 토폴로지를 순회하는 로봇개 야간 순찰·점검·전파 시나리오.",
  graph: ROBOT_PATROL_GRAPH,
  sampleEvents: [
    {
      // 정상 순찰 지시 — severityMin(INFO) 경계값 매칭 확인용 샘플.
      eventId: "EVT-PATROL-001",
      eventType: "PATROL_REQUEST",
      severity: "INFO",
      occurredAt: "2026-07-05T22:00:00.000Z",
      siteId: VERIFICATION_UFID,
      spaceId: PATROL_SPACE_F1_CORRIDOR,
      source: "simulation",
    },
    {
      // AI 이상 감지 후속 순찰 — WARNING 등급 확인용 샘플.
      eventId: "EVT-PATROL-002",
      eventType: "PATROL_REQUEST",
      severity: "WARNING",
      occurredAt: "2026-07-05T23:30:00.000Z",
      siteId: VERIFICATION_UFID,
      spaceId: PATROL_SPACE_F2_CORRIDOR,
      source: "simulation",
      measuredValues: { anomalyConfidence: 0.92 },
    },
  ],
};
