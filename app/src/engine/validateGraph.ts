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
 */
import type {
  GraphNode,
  NodeType,
  SOPGraph,
  ValidationIssue,
  ValidationResult,
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

/** SOPGraph 전체를 7개 규칙으로 검증한다. error 이슈가 하나도 없으면 valid=true. */
export function validateGraph(graph: SOPGraph): ValidationResult {
  const issues: ValidationIssue[] = [];
  checkRequiredInputPorts(graph, issues); // 1. 필수 입력 포트
  checkRequiredProperties(graph, issues); // 2. 필수 속성
  checkPortTypes(graph, issues); // 3. 포트 타입
  checkIsolatedNodes(graph, issues); // 4. 고립 노드
  checkReachability(graph, issues); // 5. 도달 불가 경로
  checkCycles(graph, issues); // 6. 순환 참조
  checkBranchTimeoutPath(graph, issues); // 7. 미응답 분기(추가 규칙)

  return {
    valid: !issues.some((issue) => issue.level === "error"),
    issues,
    validatedAt: new Date().toISOString(),
  };
}
