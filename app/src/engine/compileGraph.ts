/**
 * compileGraph — SOPGraph와 EventContext로부터 실행 계획을 계산하는 엔진 핵심 모듈.
 * 단계: ① 트리거 매칭 → ② 경로 계산(BFS) → ③ 조건 평가 → ④ ExecutionPlan 조립.
 * React·@xyflow/react 무의존 순수 모듈이며, Mock 런타임 산출물은 runtimeMock에 위임한다.
 *
 * LH2 시드(graph-seed-lh2) + EVT-LH2-001 기준 기대 실행 경로:
 * - responded: seed-lh2-event → seed-lh2-zone → seed-lh2-sensor → seed-lh2-cond
 *   → seed-lh2-sop → seed-lh2-task-1 → seed-lh2-task-2 → seed-lh2-sms
 *   → seed-lh2-branch → seed-lh2-board (escalation 미포함)
 * - timeout:   … → seed-lh2-branch → seed-lh2-esc → seed-lh2-board
 */
import type {
  EventContext,
  ExecutionPlan,
  GraphEdge,
  GraphNode,
  SOPGraph,
  Severity,
} from "../domain";
import { SEVERITY_ORDER } from "./types";
import type { SimulateOptions, SimulationResult } from "./types";
import { buildAdjacency, buildReverseAdjacency } from "./traversal";
import {
  buildBoardRecords,
  buildMissions,
  buildNotifications,
  buildResponses,
  buildTimeline,
} from "./runtimeMock";

/** 빈 문자열/undefined/null은 "미지정"으로 취급한다(트리거 매칭 규칙 공용). */
function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

/** 값이 Severity 등급 문자열인지 판정한다. */
function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && value in SEVERITY_ORDER;
}

/** 수치 비교 연산 — 지원 연산자(>=,>,<=,<,==,!=) 외에는 null(판정 불가)을 반환한다. */
function compareNumbers(left: number, operator: string, right: number): boolean | null {
  switch (operator) {
    case ">=":
      return left >= right;
    case ">":
      return left > right;
    case "<=":
      return left <= right;
    case "<":
      return left < right;
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* ① 트리거 매칭                                                        */
/* ------------------------------------------------------------------ */

/**
 * event 노드 한 개가 EventContext와 매칭되는지 판정한다.
 * - eventType: 노드에 미지정이거나 ctx.eventType과 일치.
 * - severityMin: ctx.severity 서열이 노드의 severityMin(기본 INFO) 이상.
 * - source: 노드에 미지정이거나 ctx.source와 일치. 단 ctx.source==="simulation"이면
 *   어떤 발생원 트리거든 시뮬레이션으로 발화 가능한 것으로 간주한다.
 */
function matchesTrigger(node: GraphNode, ctx: EventContext): boolean {
  const props = node.properties;
  if (!isBlank(props.eventType) && props.eventType !== ctx.eventType) return false;

  const severityMin: Severity = isSeverity(props.severityMin) ? props.severityMin : "INFO";
  if (SEVERITY_ORDER[ctx.severity] < SEVERITY_ORDER[severityMin]) return false;

  if (!isBlank(props.source) && props.source !== ctx.source && ctx.source !== "simulation") {
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* ③ 조건 평가 (경로 계산 중 호출)                                       */
/* ------------------------------------------------------------------ */

/**
 * 단일 condition 노드를 EventContext에 대해 평가한다.
 * - field==="severity": ctx.severity 서열 vs 기준값(Severity 문자열) 서열 비교.
 * - ctx.measuredValues[field]가 number: 기준값을 Number()로 변환해 수치 비교.
 * - 기준값이 Severity 문자열: ctx.severity 서열과 비교.
 * - 그 외 Number() 변환 시도, 판정 불가 시 true(경로를 막지 않음).
 */
export function evaluateCondition(node: GraphNode, ctx: EventContext): boolean {
  const props = node.properties;
  const field = typeof props.field === "string" ? props.field : "";
  const operator = typeof props.operator === "string" ? props.operator : ">=";
  const value = props.value;

  if (field === "severity") {
    const threshold = isSeverity(value) ? SEVERITY_ORDER[value] : Number(value);
    if (Number.isFinite(threshold)) {
      return compareNumbers(SEVERITY_ORDER[ctx.severity], operator, threshold) ?? true;
    }
    return true;
  }

  const measured = ctx.measuredValues?.[field];
  if (typeof measured === "number") {
    const threshold = Number(value);
    if (Number.isFinite(threshold)) {
      return compareNumbers(measured, operator, threshold) ?? true;
    }
    return true;
  }

  // 측정값이 없거나 수치가 아닌 경우 — 기준값이 Severity면 이벤트 심각도 서열로 비교.
  if (isSeverity(value)) {
    return compareNumbers(SEVERITY_ORDER[ctx.severity], operator, SEVERITY_ORDER[value]) ?? true;
  }
  const numericValue = Number(value);
  if (measured !== undefined && Number.isFinite(numericValue)) {
    return compareNumbers(Number(measured), operator, numericValue) ?? true;
  }
  return true; // 판정 불가 — 경로를 막지 않는다.
}

/** AND/OR 결합 노드 여부 — condition 타입이면서 compositeOperator 속성을 가진 노드. */
function isCompositeCondition(node: GraphNode): boolean {
  return node.type === "condition" && "compositeOperator" in node.properties;
}

/**
 * AND/OR 결합 노드 평가 — 상류(incoming) condition 노드들의 평가 결과를
 * compositeOperator로 결합한다. 아직 계산되지 않은 상류 결과는 true로 취급한다.
 */
function evaluateComposite(
  node: GraphNode,
  incomingEdges: GraphEdge[],
  conditionOutcomes: Record<string, boolean>,
): boolean {
  const operator = node.properties.compositeOperator === "OR" ? "OR" : "AND";
  const upstream = incomingEdges.map((edge) => conditionOutcomes[edge.sourceNodeId] ?? true);
  if (upstream.length === 0) return true;
  return operator === "OR" ? upstream.some(Boolean) : upstream.every(Boolean);
}

/* ------------------------------------------------------------------ */
/* ② 경로 계산                                                          */
/* ------------------------------------------------------------------ */

/** 기록 싱크 노드 — 상황판/증적은 모든 상류 흐름이 처리된 뒤 마지막에 방문한다. */
function isRecordSink(node: GraphNode): boolean {
  return node.type === "situation_board" || node.type === "evidence";
}

/** 경로 계산 결과 — 방문 노드/엣지 순서와 condition 노드별 평가 결과. */
interface TraversalOutcome {
  visitedNodeIds: string[];
  traversedEdgeIds: string[];
  conditionOutcomes: Record<string, boolean>;
}

/**
 * 트리거 노드에서 BFS로 실행 경로를 계산한다.
 * - condition 노드: 평가 결과에 따라 true_out/false_out 엣지만 따라간다.
 *   (AND/OR 결합 노드는 결과 true일 때만 result_out을 따라간다.)
 * - branch 노드: branchOutcome에 따라 responded_out/timeout_out 엣지만 따라간다.
 * - 그 외 노드: 모든 outgoing 엣지를 따라간다.
 * - sop_group 방문 시 자식 sop_task를 visited에 곧바로 삽입하고 자식의 outgoing도 추적한다.
 * - situation_board/evidence(기록 싱크)는 별도 큐로 미뤄 경로의 마지막에 방문한다
 *   — 완료 기준의 "…→branch→board" 종단 순서를 보장하기 위함.
 */
function traverseExecutionPath(
  graph: SOPGraph,
  triggerNode: GraphNode,
  ctx: EventContext,
  opts: SimulateOptions,
): TraversalOutcome {
  const adjacency = buildAdjacency(graph);
  const reverse = buildReverseAdjacency(graph);
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

  const visitedNodeIds: string[] = [];
  const traversedEdgeIds: string[] = [];
  const traversedEdgeSet = new Set<string>();
  const conditionOutcomes: Record<string, boolean> = {};
  const enqueued = new Set<string>();
  const mainQueue: string[] = [];
  const sinkQueue: string[] = [];

  const enqueue = (nodeId: string): void => {
    if (enqueued.has(nodeId)) return;
    const node = nodeById.get(nodeId);
    if (!node) return;
    enqueued.add(nodeId);
    (isRecordSink(node) ? sinkQueue : mainQueue).push(nodeId);
  };

  /** 노드 타입/평가 결과에 따라 따라갈 outgoing 엣지를 고른다. */
  const selectOutgoingEdges = (node: GraphNode): GraphEdge[] => {
    const outgoing = adjacency.get(node.id) ?? [];
    if (node.type === "condition") {
      if (isCompositeCondition(node)) {
        const outcome = evaluateComposite(node, reverse.get(node.id) ?? [], conditionOutcomes);
        conditionOutcomes[node.id] = outcome;
        // AND/OR 노드는 result_out 단일 출력 — 결합 결과가 false면 하류로 진행하지 않는다.
        return outcome ? outgoing : [];
      }
      const outcome = evaluateCondition(node, ctx);
      conditionOutcomes[node.id] = outcome;
      const portId = outcome ? "true_out" : "false_out";
      return outgoing.filter((edge) => edge.sourcePortId === portId);
    }
    if (node.type === "branch") {
      const portId = opts.branchOutcome === "responded" ? "responded_out" : "timeout_out";
      return outgoing.filter((edge) => edge.sourcePortId === portId);
    }
    return outgoing;
  };

  /** 선택된 outgoing 엣지들을 traversed에 기록하고 타깃을 큐에 넣는다. */
  const followOutgoing = (node: GraphNode): void => {
    for (const edge of selectOutgoingEdges(node)) {
      if (!traversedEdgeSet.has(edge.id)) {
        traversedEdgeSet.add(edge.id);
        traversedEdgeIds.push(edge.id);
      }
      enqueue(edge.targetNodeId);
    }
  };

  enqueue(triggerNode.id);
  while (mainQueue.length > 0 || sinkQueue.length > 0) {
    const currentId = mainQueue.length > 0 ? mainQueue.shift()! : sinkQueue.shift()!;
    const node = nodeById.get(currentId);
    if (!node) continue;
    visitedNodeIds.push(currentId);

    // sop_group 방문 — 자식 sop_task를 visited에 삽입하고 자식의 outgoing도 이어서 추적한다.
    if (node.type === "sop_group") {
      const childIds =
        graph.groups?.find((group) => group.id === node.id)?.nodeIds ?? node.children ?? [];
      for (const childId of childIds) {
        const child = nodeById.get(childId);
        if (!child || enqueued.has(childId)) continue;
        enqueued.add(childId);
        visitedNodeIds.push(childId);
        followOutgoing(child);
      }
    }

    followOutgoing(node);
  }

  return { visitedNodeIds, traversedEdgeIds, conditionOutcomes };
}

/* ------------------------------------------------------------------ */
/* ④ ExecutionPlan 조립 + SimulationResult 산출                         */
/* ------------------------------------------------------------------ */

/**
 * SOPGraph를 EventContext에 대해 컴파일한다.
 * 트리거 매칭 실패 시 matched=false와 사유만 담은 결과를 반환하고,
 * 성공 시 실행 경로·ExecutionPlan·Mock 런타임 산출물(임무/전파/응답/상황판/타임라인)을 채운다.
 */
export function compileGraph(
  graph: SOPGraph,
  ctx: EventContext,
  opts: SimulateOptions,
): SimulationResult {
  // ① 트리거 매칭 — 조건을 만족하는 첫 event 노드.
  const triggerNode = graph.nodes.find((node) => node.type === "event" && matchesTrigger(node, ctx));
  if (!triggerNode) {
    return {
      eventContext: ctx,
      matched: false,
      reason: `매칭되는 트리거가 없습니다 (eventType: ${ctx.eventType}, severity: ${ctx.severity}, source: ${ctx.source}).`,
      triggerNodeId: null,
      plan: null,
      visitedNodeIds: [],
      traversedEdgeIds: [],
      conditionOutcomes: {},
      responses: [],
      boardRecords: [],
      timeline: [],
      options: opts,
    };
  }

  // ②·③ 경로 계산(조건 평가 포함).
  const { visitedNodeIds, traversedEdgeIds, conditionOutcomes } = traverseExecutionPath(
    graph,
    triggerNode,
    ctx,
    opts,
  );

  // 경로상 첫 branch 노드의 timeoutMinutes — 응답/미응답 Mock 타이밍 기준(기본 5분).
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const branchNode = visitedNodeIds
    .map((nodeId) => nodeById.get(nodeId))
    .find((node) => node?.type === "branch");
  const rawTimeout = Number(branchNode?.properties.timeoutMinutes);
  const timeoutMinutes = Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : 5;

  // Mock 런타임 산출물 — runtimeMock에 위임.
  const missions = buildMissions(graph, visitedNodeIds);
  const notifications = buildNotifications(graph, visitedNodeIds, ctx, opts);
  const responses = buildResponses(missions, opts, timeoutMinutes);
  const boardRecords = buildBoardRecords(graph, visitedNodeIds, ctx, missions, notifications);
  const timeline = buildTimeline(
    graph,
    visitedNodeIds,
    ctx,
    conditionOutcomes,
    missions,
    notifications,
    responses,
    opts,
    timeoutMinutes,
  );

  // ④ ExecutionPlan 조립.
  const plan: ExecutionPlan = {
    planId: `PLAN-${ctx.eventId}`,
    graphId: graph.graphId,
    triggerNodeId: triggerNode.id,
    executionPath: visitedNodeIds,
    missions,
    notifications,
    status: "READY",
  };

  return {
    eventContext: ctx,
    matched: true,
    triggerNodeId: triggerNode.id,
    plan,
    visitedNodeIds,
    traversedEdgeIds,
    conditionOutcomes,
    responses,
    boardRecords,
    timeline,
    options: opts,
  };
}
