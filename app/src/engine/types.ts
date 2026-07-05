/**
 * 엔진 레이어 공유 타입 — 편집기 스냅샷 계약, 심각도 서열, 시뮬레이션 결과 구조를 정의한다.
 * 엔진 모듈은 React·@xyflow/react에 의존하지 않는 순수 모듈이며,
 * 도메인 타입은 `../domain`에서 type-only import로만 가져온다.
 */
import type {
  EdgeType,
  EventContext,
  ExecutionPlan,
  GraphNode,
  Severity,
} from "../domain";

/**
 * Severity 서열 단일 정의 — INFO(0) < CAUTION(1) < WARNING(2) < DANGER(3) < CRITICAL(4).
 * 트리거 매칭(severityMin)과 조건 평가(severity 비교)가 모두 이 표를 기준으로 한다.
 */
export const SEVERITY_ORDER: Record<Severity, number> = {
  INFO: 0,
  CAUTION: 1,
  WARNING: 2,
  DANGER: 3,
  CRITICAL: 4,
};

/**
 * 편집기 레이어와의 구조적 계약 — StudioNode/StudioEdge와 필드 호환이지만 xyflow를 import하지 않는다.
 * 편집기 쪽에서 StudioNode[]를 그대로 넘겨도 구조적 타이핑으로 수용된다.
 */
export interface EditorNodeSnapshot {
  id: string;
  position: { x: number; y: number };
  parentId?: string;
  data: { graphNode: GraphNode };
}

/** 편집기 엣지 스냅샷 — RF Edge와 필드 호환(소스/타깃 노드 id + 포트 핸들 id + edgeType 페이로드). */
export interface EditorEdgeSnapshot {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: { edgeType: EdgeType };
}

/** normalizeGraph() 입력 — 편집기 캔버스의 노드/엣지 스냅샷. */
export interface EditorSnapshot {
  nodes: EditorNodeSnapshot[];
  edges: EditorEdgeSnapshot[];
}

/** SOPGraph 메타 정보 — 정규화 시 그래프 식별/버전 필드를 채우는 데 쓰인다. */
export interface GraphMeta {
  graphId: string;
  name: string;
  domain: string;
  version: string;
  description?: string;
  createdAt?: string;
}

/** 시뮬레이션 타임라인의 한 항목 — 경과 분(offset)과 한국어 서술 메시지를 담는다. */
export interface TimelineEntry {
  seq: number;
  offsetMinutes: number;
  nodeId: string;
  kind:
    | "event"
    | "scope"
    | "asset"
    | "condition"
    | "mission"
    | "notification"
    | "response"
    | "escalation"
    | "board"
    | "record";
  message: string;
}

/** 임무별 Mock 응답 — 응답/지연/미응답 상태와 응답 시각(경과 분)을 담는다. */
export interface MockResponse {
  missionId: string;
  missionTitle: string;
  status: "COMPLETED" | "DELAYED" | "NO_RESPONSE";
  respondedBy?: string;
  offsetMinutes: number;
}

/** 전자상황판 기록 Mock — 장소/시간/임무내용/상황전파 4개 필드를 채운다. */
export interface BoardRecordMock {
  boardNodeId: string;
  fields: { 장소: string; 시간: string; 임무내용: string; 상황전파: string };
}

/** 시뮬레이션 옵션 — branch 노드의 응답 수신 여부를 사용자가 선택한다. */
export interface SimulateOptions {
  branchOutcome: "responded" | "timeout";
}

/** simulate() 산출물 — 트리거 매칭 결과, 실행 계획, 방문 경로, Mock 런타임 데이터 전체. */
export interface SimulationResult {
  eventContext: EventContext;
  matched: boolean;
  reason?: string;
  triggerNodeId: string | null;
  plan: ExecutionPlan | null;
  visitedNodeIds: string[];
  traversedEdgeIds: string[];
  conditionOutcomes: Record<string, boolean>;
  responses: MockResponse[];
  boardRecords: BoardRecordMock[];
  timeline: TimelineEntry[];
  options: SimulateOptions;
}
