/**
 * validateGraph — SOPGraph를 저작 규칙에 따라 검증해 ValidationResult를 산출한다.
 *
 * evaluation_criteria.md Phase 4 "Validate" 6개 검증 항목 매핑:
 *   1. 필수 입력 포트   → 규칙 1 (checkRequiredInputPorts, error)
 *   2. 필수 속성        → 규칙 2 (checkRequiredProperties, error/warning)
 *   3. 포트 타입        → 규칙 3 (checkPortTypes, error)
 *   4. 고립 노드        → 규칙 4 (checkIsolatedNodes, warning)
 *   5. 도달 불가 경로   → 규칙 5 (checkReachability, warning)
 *   6. 순환 참조        → 규칙 6 (checkCycles, error)
 * 추가 규칙 7. 미응답 분기(branch timeout_out 미연결) → warning.
 * 추가 규칙 8. 공간 스키마 참조(space_scope siteId/spaceIds, asset_filter assetIds) → warning/info.
 * 추가 규칙 9. 패트롤 토폴로지 참조(sop_task taskKind==="patrol"의 topologySetId/startNodeId/
 *              endNodeId/checkpointNodeIds) → error/warning.
 */
import type {
  GraphNode,
  NodeType,
  SOPGraph,
  ValidationIssue,
  ValidationResult,
} from "../domain";
import {
  findFacility,
  findPath,
  findSpace,
  findTopologyNode,
  getSite,
  getTopologySet,
} from "../domain";
import { findCycles, reachableFrom } from "./traversal";

/** 빈 문자열/빈 배열/undefined/null은 "미입력"으로 취급한다. */
function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** 그룹 자식 노드 id 집합 — graph.groups의 nodeIds와 그룹 노드의 children 배열을 합집합으로 판정한다. */
function collectGroupChildIds(graph: SOPGraph): Set<string> {
  const childIds = new Set<string>();
  for (const group of graph.groups ?? []) {
    for (const nodeId of group.nodeIds) childIds.add(nodeId);
  }
  for (const node of graph.nodes) {
    if (node.type !== "sop_group") continue;
    for (const nodeId of node.children ?? []) childIds.add(nodeId);
  }
  return childIds;
}

/** 자식 노드 id → 부모 그룹 노드 id 매핑을 만든다. */
function buildParentGroupById(graph: SOPGraph): Map<string, string> {
  const parentById = new Map<string, string>();
  for (const group of graph.groups ?? []) {
    for (const nodeId of group.nodeIds) parentById.set(nodeId, group.id);
  }
  for (const node of graph.nodes) {
    if (node.type !== "sop_group") continue;
    for (const nodeId of node.children ?? []) parentById.set(nodeId, node.id);
  }
  return parentById;
}

/* ------------------------------------------------------------------ */
/* 규칙 1 — 필수 입력 포트 (error)                                      */
/* ------------------------------------------------------------------ */

/**
 * 각 노드의 required input 포트에 들어오는 엣지가 없으면 error.
 * 예외: sop_group 자식 sop_task의 `trigger_in`은 부모 그룹이 트리거(trigger_in incoming)를
 * 받으면 그룹 실행 흐름으로 충족된 것으로 간주하고 건너뛴다.
 */
function checkRequiredInputPorts(graph: SOPGraph, issues: ValidationIssue[]): void {
  const parentGroupById = buildParentGroupById(graph);
  const hasIncoming = (nodeId: string, portId: string): boolean =>
    graph.edges.some((edge) => edge.targetNodeId === nodeId && edge.targetPortId === portId);

  for (const node of graph.nodes) {
    for (const port of node.ports) {
      if (port.direction !== "input" || port.required !== true) continue;
      if (hasIncoming(node.id, port.id)) continue;

      // 예외: 그룹 자식 sop_task의 trigger_in — 그룹이 트리거를 받으면 충족으로 간주.
      if (node.type === "sop_task" && port.id === "trigger_in") {
        const parentGroupId = parentGroupById.get(node.id);
        if (parentGroupId && hasIncoming(parentGroupId, "trigger_in")) continue;
      }

      issues.push({
        level: "error",
        nodeId: node.id,
        message: `"${node.label}" 노드의 필수 입력 포트 "${port.label}"에 연결이 없습니다.`,
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 2 — 필수 속성 (error/warning)                                   */
/* ------------------------------------------------------------------ */

/** 필수 속성 규칙 한 건 — 노드 타입별로 검사할 속성 키/레벨/적용 조건을 정의한다. */
interface RequiredPropertyRule {
  nodeType: NodeType;
  key: string;
  level: "error" | "warning";
  /** 규칙 적용 조건(선택) — false면 이 노드는 검사하지 않는다. */
  when?: (props: Record<string, unknown>, node: GraphNode) => boolean;
  message: string;
}

/** condition 노드 중 AND/OR 결합 노드가 아니고, expression 직접 입력도 없는 경우에만 field/operator를 요구한다. */
const isPlainCondition = (props: Record<string, unknown>, node: GraphNode): boolean =>
  node.label !== "AND / OR" && isEmptyValue(props.expression);

/** 필수 속성 규칙 테이블 — 노드 타입별 미입력 시 이슈를 생성한다. */
const REQUIRED_PROPERTY_RULES: RequiredPropertyRule[] = [
  {
    nodeType: "event",
    key: "eventType",
    level: "error",
    message: "event 노드에 eventType이 지정되지 않았습니다.",
  },
  {
    nodeType: "condition",
    key: "field",
    level: "error",
    when: isPlainCondition,
    message: "condition 노드에 비교할 field가 지정되지 않았습니다 (expression 직접 입력 시 면제).",
  },
  {
    nodeType: "condition",
    key: "operator",
    level: "error",
    when: isPlainCondition,
    message: "condition 노드에 비교 operator가 지정되지 않았습니다 (expression 직접 입력 시 면제).",
  },
  {
    nodeType: "sop_task",
    key: "title",
    level: "warning",
    message: "SOP Task에 title(임무명)이 입력되지 않았습니다.",
  },
  {
    nodeType: "sop_task",
    key: "assigneeRole",
    level: "warning",
    message: "SOP Task에 assigneeRole(담당 역할)이 지정되지 않았습니다.",
  },
  {
    nodeType: "notification",
    key: "messageTemplate",
    level: "warning",
    message: "notification 노드에 messageTemplate(전파 문구)이 입력되지 않았습니다.",
  },
  {
    nodeType: "escalation",
    key: "escalateToRole",
    level: "error",
    message: "escalation 노드에 escalateToRole(상위 보고 대상)이 지정되지 않았습니다.",
  },
  {
    nodeType: "space_scope",
    key: "siteId",
    level: "warning",
    message: "space_scope 노드에 siteId(대상 사이트)가 지정되지 않았습니다.",
  },
];

/** 필수 속성 규칙 테이블을 순회하며 미입력(빈 문자열/빈 배열 포함) 속성에 이슈를 생성한다. */
function checkRequiredProperties(graph: SOPGraph, issues: ValidationIssue[]): void {
  for (const node of graph.nodes) {
    for (const rule of REQUIRED_PROPERTY_RULES) {
      if (node.type !== rule.nodeType) continue;
      if (rule.when && !rule.when(node.properties, node)) continue;
      if (!isEmptyValue(node.properties[rule.key])) continue;
      issues.push({
        level: rule.level,
        nodeId: node.id,
        message: `"${node.label}" — ${rule.message}`,
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 3 — 포트 타입 (error)                                           */
/* ------------------------------------------------------------------ */

/**
 * 모든 엣지에 대해 소스 포트 direction==="output", 타깃 포트 direction==="input",
 * 양쪽 dataType 일치를 재검증한다(편집기 checkConnection과 별개로 SOPGraph 단독 검증).
 */
function checkPortTypes(graph: SOPGraph, issues: ValidationIssue[]): void {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const edge of graph.edges) {
    const sourceNode = nodeById.get(edge.sourceNodeId);
    const targetNode = nodeById.get(edge.targetNodeId);
    if (!sourceNode || !targetNode) {
      issues.push({
        level: "error",
        edgeId: edge.id,
        message: `엣지 "${edge.id}"가 존재하지 않는 노드를 참조합니다.`,
      });
      continue;
    }
    const sourcePort = sourceNode.ports.find((port) => port.id === edge.sourcePortId);
    const targetPort = targetNode.ports.find((port) => port.id === edge.targetPortId);
    if (!sourcePort || !targetPort) {
      issues.push({
        level: "error",
        edgeId: edge.id,
        message: `엣지 "${edge.id}"가 존재하지 않는 포트를 참조합니다 (${edge.sourcePortId} → ${edge.targetPortId}).`,
      });
      continue;
    }
    if (sourcePort.direction !== "output") {
      issues.push({
        level: "error",
        edgeId: edge.id,
        message: `엣지 "${edge.id}"의 소스 포트 "${sourcePort.label}"는 output 포트가 아닙니다.`,
      });
    }
    if (targetPort.direction !== "input") {
      issues.push({
        level: "error",
        edgeId: edge.id,
        message: `엣지 "${edge.id}"의 타깃 포트 "${targetPort.label}"는 input 포트가 아닙니다.`,
      });
    }
    if (sourcePort.dataType !== targetPort.dataType) {
      issues.push({
        level: "error",
        edgeId: edge.id,
        message: `엣지 "${edge.id}"의 포트 데이터 타입이 일치하지 않습니다 (${sourcePort.dataType} → ${targetPort.dataType}).`,
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 4 — 고립 노드 (warning)                                         */
/* ------------------------------------------------------------------ */

/** 엣지가 하나도 걸리지 않고 그룹 자식도 아닌 노드에 warning. */
function checkIsolatedNodes(graph: SOPGraph, issues: ValidationIssue[]): void {
  const groupChildIds = collectGroupChildIds(graph);
  const connectedIds = new Set<string>();
  for (const edge of graph.edges) {
    connectedIds.add(edge.sourceNodeId);
    connectedIds.add(edge.targetNodeId);
  }
  for (const node of graph.nodes) {
    if (connectedIds.has(node.id) || groupChildIds.has(node.id)) continue;
    issues.push({
      level: "warning",
      nodeId: node.id,
      message: `"${node.label}" 노드가 어떤 연결도 없이 고립되어 있습니다.`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 5 — 도달 불가 경로 (warning)                                    */
/* ------------------------------------------------------------------ */

/**
 * (a) 각 event 노드에서 도달 가능한 노드 중 situation_board/evidence 타입이 하나도 없으면
 *     해당 event 노드에 warning — 실행 결과가 상황판/기록에 도달하지 않는 그래프.
 * (b) 어느 event 노드에서도 도달할 수 없는 비-트리거 노드(그룹 자식 제외)에 warning.
 */
function checkReachability(graph: SOPGraph, issues: ValidationIssue[]): void {
  const groupChildIds = collectGroupChildIds(graph);
  const eventNodes = graph.nodes.filter((node) => node.type === "event");
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const reachableFromAnyEvent = new Set<string>();

  for (const eventNode of eventNodes) {
    const reachable = reachableFrom(graph, eventNode.id);
    for (const nodeId of reachable) reachableFromAnyEvent.add(nodeId);

    const reachesRecord = [...reachable].some((nodeId) => {
      const node = nodeById.get(nodeId);
      return node?.type === "situation_board" || node?.type === "evidence";
    });
    if (!reachesRecord) {
      issues.push({
        level: "warning",
        nodeId: eventNode.id,
        message: `"${eventNode.label}" — 실행 결과가 상황판/기록에 도달하지 않습니다.`,
      });
    }
  }

  for (const node of graph.nodes) {
    if (node.type === "event") continue;
    if (groupChildIds.has(node.id)) continue;
    if (reachableFromAnyEvent.has(node.id)) continue;
    issues.push({
      level: "warning",
      nodeId: node.id,
      message: `"${node.label}" 노드는 어떤 이벤트 트리거에서도 도달할 수 없습니다.`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 6 — 순환 참조 (error)                                           */
/* ------------------------------------------------------------------ */

/** findCycles 결과의 각 순환마다 첫 노드에 error를 생성한다(메시지에 순환 경로 라벨 나열). */
function checkCycles(graph: SOPGraph, issues: ValidationIssue[]): void {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const cycle of findCycles(graph)) {
    const pathLabels = [...cycle, cycle[0]]
      .map((nodeId) => nodeById.get(nodeId)?.label ?? nodeId)
      .join(" → ");
    issues.push({
      level: "error",
      nodeId: cycle[0],
      message: `순환 참조가 발견되었습니다: ${pathLabels}`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 7 — 미응답 분기 (warning, 추가 규칙)                             */
/* ------------------------------------------------------------------ */

/** branch 노드의 timeout_out에 나가는 엣지가 없으면 warning — 미응답 시 escalation 경로 부재. */
function checkBranchTimeoutPath(graph: SOPGraph, issues: ValidationIssue[]): void {
  for (const node of graph.nodes) {
    if (node.type !== "branch") continue;
    const hasTimeoutEdge = graph.edges.some(
      (edge) => edge.sourceNodeId === node.id && edge.sourcePortId === "timeout_out",
    );
    if (!hasTimeoutEdge) {
      issues.push({
        level: "warning",
        nodeId: node.id,
        message: `"${node.label}" — 미응답 시 escalation 경로가 없습니다 (timeout_out 미연결).`,
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 8 — 공간 스키마 참조 (warning/info, 추가 규칙)                    */
/* ------------------------------------------------------------------ */

/** properties의 문자열 배열 속성을 안전하게 읽는다(비배열/비문자열 원소는 무시). */
function readStringArray(props: Record<string, unknown>, key: string): string[] {
  const value = props[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * space_scope/asset_filter 노드가 참조하는 공간 id를 공간 스키마 레지스트리로 해석한다.
 * (a) space_scope.siteId가 입력됐는데 getSite()에 없으면 warning.
 * (b) space_scope.spaceIds 각 원소가 findSpace()에 없으면 warning.
 * (c) spaceId는 존재하나 소속 ufid가 노드의 siteId와 불일치하면 warning.
 * (d) asset_filter.assetIds 중 `M_` 접두(표준 3차원객체코드 규약) id가 findFacility()에
 *     없으면 info. M_ 접두가 아닌 자유 id는 검사하지 않는다 — 레거시(Phase 4 시드) 허용.
 *
 * 레벨을 error가 아닌 warning/info로 두는 근거: 본 도구는 범용 재난안전 SOP 저작 도구로,
 * 공간 스키마에 아직 등록되지 않은 현장(자유 서술 siteId/spaceId)도 저작 대상이며
 * Phase 4 시드/localStorage 구버전 그래프(SITE-* 등)와의 호환을 유지해야 한다.
 */
function checkSpatialReferences(graph: SOPGraph, issues: ValidationIssue[]): void {
  for (const node of graph.nodes) {
    if (node.type === "space_scope") {
      const siteId = node.properties.siteId;
      const hasSiteId = typeof siteId === "string" && siteId.trim() !== "";

      // (a) 미등록 siteId — 미입력은 규칙 2(필수 속성)에서 이미 warning 처리한다.
      if (hasSiteId && getSite(siteId) === null) {
        issues.push({
          level: "warning",
          nodeId: node.id,
          message: `"${node.label}" — 공간 스키마에 등록되지 않은 siteId입니다: ${siteId}`,
        });
      }

      for (const spaceId of readStringArray(node.properties, "spaceIds")) {
        const space = findSpace(spaceId);
        if (space === null) {
          // (b) 미등록 spaceId
          issues.push({
            level: "warning",
            nodeId: node.id,
            message: `"${node.label}" — 공간 스키마에 등록되지 않은 spaceId입니다: ${spaceId}`,
          });
        } else if (hasSiteId && space.ufid !== siteId) {
          // (c) 사이트 소속 불일치
          issues.push({
            level: "warning",
            nodeId: node.id,
            message: `"${node.label}" — spaceId ${spaceId}는 siteId ${siteId} 소속이 아닙니다.`,
          });
        }
      }
    }

    if (node.type === "asset_filter") {
      for (const assetId of readStringArray(node.properties, "assetIds")) {
        // (d) M_ 접두 id만 표준 3차원객체코드로 간주해 검사한다(자유 id는 레거시 허용).
        if (!assetId.startsWith("M_")) continue;
        if (findFacility(assetId) === null) {
          issues.push({
            level: "info",
            nodeId: node.id,
            message: `"${node.label}" — 공간 스키마에 등록되지 않은 시설물 id입니다: ${assetId}`,
          });
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* 규칙 9 — 패트롤 토폴로지 참조 (error/warning, 추가 규칙)               */
/* ------------------------------------------------------------------ */

/** properties의 문자열 속성을 trim해 읽는다(비문자열은 빈 문자열 취급). */
function readTrimmedString(props: Record<string, unknown>, key: string): string {
  const value = props[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * taskKind==="patrol"인 sop_task의 토폴로지 참조를 토폴로지 레지스트리로 해석한다.
 * (a) topologySetId 미지정 또는 getTopologySet()에 없으면 error — 순회할 토폴로지 부재.
 * (b) startNodeId/endNodeId 미지정 또는 findTopologyNode()에 없으면 error.
 * (c) 셋·시작·종료가 모두 유효한데 findPath()가 null이면 error — 도달 불가 경로.
 * (d) checkpointNodeIds 원소가 셋에 없거나 계산된 경로 위에 없으면 warning —
 *     임무는 실행 가능하나 해당 점검 포인트를 경유하지 않으므로 경고에 그친다.
 * 공간 참조(규칙 8)와 달리 시작/종료는 error로 둔다 — 경로가 해석되지 않으면
 * 패트롤 임무 자체가 실행 불가능하기 때문이다.
 */
function checkPatrolTopologyReferences(graph: SOPGraph, issues: ValidationIssue[]): void {
  for (const node of graph.nodes) {
    if (node.type !== "sop_task" || node.properties.taskKind !== "patrol") continue;

    // (a) 토폴로지 셋 해석
    const setId = readTrimmedString(node.properties, "topologySetId");
    const set = setId === "" ? null : getTopologySet(setId);
    if (setId === "") {
      issues.push({
        level: "error",
        nodeId: node.id,
        message: `"${node.label}" — 패트롤 임무에 topologySetId(토폴로지 셋)가 지정되지 않았습니다.`,
      });
    } else if (set === null) {
      issues.push({
        level: "error",
        nodeId: node.id,
        message: `"${node.label}" — 등록되지 않은 패트롤 토폴로지 셋입니다: ${setId}`,
      });
    }

    // (b) 시작/종료 노드 해석 — 셋이 유효할 때만 존재 여부를 검사한다.
    let endpointsResolved = set !== null;
    for (const [key, labelKo] of [
      ["startNodeId", "시작"],
      ["endNodeId", "종료"],
    ] as const) {
      const topologyNodeId = readTrimmedString(node.properties, key);
      if (topologyNodeId === "") {
        endpointsResolved = false;
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `"${node.label}" — 패트롤 ${labelKo} 노드(${key})가 지정되지 않았습니다.`,
        });
      } else if (set !== null && findTopologyNode(setId, topologyNodeId) === null) {
        endpointsResolved = false;
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `"${node.label}" — 토폴로지 셋에 없는 패트롤 ${labelKo} 노드입니다: ${topologyNodeId}`,
        });
      }
    }

    // (c) 도달 가능성 — 셋·시작·종료가 모두 유효할 때만 경로를 계산한다.
    let pathNodeIds: Set<string> | null = null;
    if (set !== null && endpointsResolved) {
      const startNodeId = readTrimmedString(node.properties, "startNodeId");
      const endNodeId = readTrimmedString(node.properties, "endNodeId");
      const path = findPath(set, startNodeId, endNodeId);
      if (path === null) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `"${node.label}" — 패트롤 경로를 찾을 수 없습니다: ${startNodeId} → ${endNodeId} (토폴로지에서 도달 불가).`,
        });
      } else {
        pathNodeIds = new Set(path.nodeIds);
      }
    }

    // (d) 점검 포인트 — 셋이 유효할 때만 검사한다(셋 오류는 이미 error로 보고됨).
    if (set !== null) {
      for (const checkpointId of readStringArray(node.properties, "checkpointNodeIds")) {
        if (findTopologyNode(setId, checkpointId) === null) {
          issues.push({
            level: "warning",
            nodeId: node.id,
            message: `"${node.label}" — 토폴로지 셋에 없는 점검 포인트입니다: ${checkpointId}`,
          });
        } else if (pathNodeIds !== null && !pathNodeIds.has(checkpointId)) {
          issues.push({
            level: "warning",
            nodeId: node.id,
            message: `"${node.label}" — 점검 포인트 ${checkpointId}가 계산된 패트롤 경로 위에 없습니다.`,
          });
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ */

/** SOPGraph 전체를 9개 규칙으로 검증한다. error 이슈가 하나도 없으면 valid=true. */
export function validateGraph(graph: SOPGraph): ValidationResult {
  const issues: ValidationIssue[] = [];
  checkRequiredInputPorts(graph, issues); // 1. 필수 입력 포트
  checkRequiredProperties(graph, issues); // 2. 필수 속성
  checkPortTypes(graph, issues); // 3. 포트 타입
  checkIsolatedNodes(graph, issues); // 4. 고립 노드
  checkReachability(graph, issues); // 5. 도달 불가 경로
  checkCycles(graph, issues); // 6. 순환 참조
  checkBranchTimeoutPath(graph, issues); // 7. 미응답 분기(추가 규칙)
  checkSpatialReferences(graph, issues); // 8. 공간 스키마 참조(추가 규칙)
  checkPatrolTopologyReferences(graph, issues); // 9. 패트롤 토폴로지 참조(추가 규칙)

  return {
    valid: !issues.some((issue) => issue.level === "error"),
    issues,
    validatedAt: new Date().toISOString(),
  };
}
