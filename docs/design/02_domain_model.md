# 02 — Domain Model

## 1. 모델 전환 개요

기존 모델의 중심은 `SOPBinding`이었다: `Event + Space + Asset → SOP`

수정된 모델의 중심은 `SOPGraph`이다:

```text
SOPGraph = Nodes + Edges + Ports + Groups + Variables + Validation + ExecutionPlan
```

즉, 사용자가 만든 결과물은 단순 매핑 규칙이 아니라 실행 가능한 SOP 그래프이다.

## 2. SOPGraph

```ts
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
```

| 필드 | 설명 |
|---|---|
| graphId | SOPGraph 고유 ID |
| name | 그래프 이름 |
| description | 설명 |
| domain | generic_safety, plant, power_plant, disaster_drill 등 |
| version | 버전 |
| nodes | 그래프 노드 목록 |
| edges | 연결선 목록 |
| groups | 복합 노드/그룹 정보 |
| variables | 그래프 실행 변수 |
| validation | 검증 결과 |
| createdAt | 생성일시 |
| updatedAt | 수정일시 |

## 3. GraphNode

```ts
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
```

## 4. NodeType

```ts
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
```

## 5. NodePort

```ts
export interface NodePort {
  id: string;
  label: string;
  direction: "input" | "output";
  dataType: PortDataType;
  required?: boolean;
  multiple?: boolean;
}
```

## 6. PortDataType

```ts
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
```

## 7. GraphEdge

```ts
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
```

## 8. EdgeType

```ts
export type EdgeType =
  | "event_flow"
  | "scope_flow"
  | "asset_flow"
  | "condition_flow"
  | "execution_flow"
  | "notification_flow"
  | "response_flow"
  | "record_flow";
```

## 9. EventContext

이벤트 발생 시 그래프 실행에 입력되는 표준 이벤트 객체이다.

```ts
export interface EventContext {
  eventId: string;
  eventType: string;
  severity: "INFO" | "CAUTION" | "WARNING" | "DANGER" | "CRITICAL";
  occurredAt: string;
  siteId?: string;
  spaceId?: string;
  assetId?: string;
  source: "sensor" | "manual" | "ai" | "simulation";
  measuredValues?: Record<string, number | string | boolean>;
  metadata?: Record<string, unknown>;
}
```

## 10. ExecutionPlan

컴파일된 SOPGraph가 실제 실행될 때 생성되는 실행 계획이다.

```ts
export interface ExecutionPlan {
  planId: string;
  graphId: string;
  triggerNodeId: string;
  executionPath: string[];
  missions: RuntimeMission[];
  notifications: RuntimeNotification[];
  status: "READY" | "RUNNING" | "COMPLETED" | "FAILED";
}
```

## 11. RuntimeMission

```ts
export interface RuntimeMission {
  missionId: string;
  nodeId: string;
  title: string;
  assigneeRole?: string;
  status: "SENT" | "RUNNING" | "COMPLETED" | "DELAYED" | "FAILED";
  dueMinutes?: number;
}
```

## 12. ValidationIssue

```ts
export interface ValidationIssue {
  level: "error" | "warning" | "info";
  nodeId?: string;
  edgeId?: string;
  message: string;
}
```
