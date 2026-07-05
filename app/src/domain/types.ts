/**
 * 도메인 코어 타입 모듈.
 * React Flow는 시각 편집기 레이어일 뿐이며, 제품 데이터 모델은 이 파일의 `SOPGraph`다.
 * (React Flow nodes/edges → normalizeGraph() → SOPGraph → validateGraph() → compileGraph() → ExecutionPlan)
 */

/** 그래프 노드의 종류 — 이벤트/공간/자산/논리/SOP/사람/액션/런타임/기록을 표현하는 14종 노드 타입. */
export type NodeType =
  | "event"
  | "space_scope"
  | "asset_filter"
  | "condition"
  | "branch"
  | "sop_task"
  | "sop_group"
  | "role"
  | "notification"
  | "timer"
  | "escalation"
  | "situation_board"
  | "evidence"
  | "data_mapper";

/** 포트를 흐르는 데이터의 종류 — 타입드 포트 연결 검증의 기준이 되는 10종 데이터 타입. */
export type PortDataType =
  | "event"
  | "scoped_event"
  | "asset"
  | "condition_result"
  | "execution_flow"
  | "mission"
  | "mission_status"
  | "notification_payload"
  | "response"
  | "record";

/** 엣지(연결선)의 종류 — 노드 간 흐름의 성격을 구분하는 8종 엣지 타입. */
export type EdgeType =
  | "event_flow"
  | "scope_flow"
  | "asset_flow"
  | "condition_flow"
  | "execution_flow"
  | "notification_flow"
  | "response_flow"
  | "record_flow";

/** 이벤트 심각도 등급 — 정보/주의/경고/위험/심각 5단계. */
export type Severity = "INFO" | "CAUTION" | "WARNING" | "DANGER" | "CRITICAL";

/** 노드의 입출력 포트 정의 — 방향과 데이터 타입으로 연결 가능 여부를 판정한다. */
export interface NodePort {
  id: string;
  label: string;
  direction: "input" | "output";
  dataType: PortDataType;
  required?: boolean;
  multiple?: boolean;
}

/** SOPGraph를 구성하는 노드 — 타입, 속성, 포트, 캔버스 좌표를 갖는다. */
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  properties: Record<string, unknown>;
  ports: NodePort[];
  position: { x: number; y: number };
  size?: { width: number; height: number };
  collapsed?: boolean;
  children?: string[];
}

/** SOPGraph를 구성하는 엣지 — 소스/타깃 노드의 특정 포트를 타입드 연결한다. */
export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  edgeType: EdgeType;
  label?: string;
  condition?: Record<string, unknown>;
}

/** 노드 묶음(예: SOP Group) — 접기/펼치기 가능한 논리적 그룹. */
export interface GraphGroup {
  id: string;
  label: string;
  nodeIds: string[];
  collapsed?: boolean;
}

/** 그래프 수준 변수 — 시뮬레이션·조건식에서 참조하는 키/값 정의. */
export interface GraphVariable {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  defaultValue?: unknown;
}

/** 검증 단계에서 발견된 개별 이슈 — 오류/경고/정보 수준과 위치를 담는다. */
export interface ValidationIssue {
  level: "error" | "warning" | "info";
  nodeId?: string;
  edgeId?: string;
  message: string;
}

/** validateGraph() 결과 — 전체 유효 여부와 이슈 목록, 검증 시각. */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  validatedAt: string;
}

/** 제품 데이터 모델의 최상위 — 저작·검증·컴파일 대상이 되는 SOP 그래프 전체. */
export interface SOPGraph {
  graphId: string;
  name: string;
  description?: string;
  domain: string;
  version: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups?: GraphGroup[];
  variables?: GraphVariable[];
  validation?: ValidationResult;
  createdAt: string;
  updatedAt: string;
}

/** 시뮬레이션/실행을 촉발하는 이벤트 컨텍스트 — 발생원, 심각도, 측정값을 담는다. */
export interface EventContext {
  eventId: string;
  eventType: string;
  severity: Severity;
  occurredAt: string;
  siteId?: string;
  spaceId?: string;
  assetId?: string;
  source: "sensor" | "manual" | "ai" | "simulation";
  measuredValues?: Record<string, number | string | boolean>;
  metadata?: Record<string, unknown>;
}

/** 실행 계획에 포함된 임무 — 담당 역할과 진행 상태를 추적한다. */
export interface RuntimeMission {
  missionId: string;
  nodeId: string;
  title: string;
  assigneeRole?: string;
  status: "SENT" | "RUNNING" | "COMPLETED" | "DELAYED" | "FAILED";
  dueMinutes?: number;
}

/** 실행 계획에 포함된 상황전파 — 채널, 대상, 전달 상태를 추적한다. */
export interface RuntimeNotification {
  notificationId: string;
  nodeId: string;
  channel: "sms" | "app_push" | "broadcast";
  targets: string[];
  message: string;
  status: "SENT" | "DELIVERED" | "ACKED" | "FAILED";
}

/** compileGraph() 산출물 — 트리거부터의 실행 경로와 임무/전파 목록을 담은 실행 계획. */
export interface ExecutionPlan {
  planId: string;
  graphId: string;
  triggerNodeId: string;
  executionPath: string[];
  missions: RuntimeMission[];
  notifications: RuntimeNotification[];
  status: "READY" | "RUNNING" | "COMPLETED" | "FAILED";
}

/** Node Palette의 분류 그룹 — 트리거/공간/객체/논리/SOP/사람/액션/런타임/기록 9종. */
export type NodeTemplateGroup =
  | "trigger"
  | "scope"
  | "object"
  | "logic"
  | "sop"
  | "people"
  | "action"
  | "runtime"
  | "record";

/** 팔레트에서 노드를 생성할 때 쓰는 템플릿 — 기본 속성, 포트 구성, 액센트 색 토큰을 정의한다. */
export interface NodeTemplate {
  templateId: string;
  nodeType: NodeType;
  group: NodeTemplateGroup;
  label: string;
  description: string;
  defaultProperties: Record<string, unknown>;
  ports: NodePort[];
  accentColorToken?: string;
  defaultSize?: { width: number; height: number };
}
