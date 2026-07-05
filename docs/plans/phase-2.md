# Phase 2 계획 — 도메인 타입 + 노드 템플릿

> planner subagent 산출물 (2026-07-05). `/phase-run 2` 실행 기록.

## 코드베이스 확인 결과

- `app/src/domain/`은 아직 없음. Phase 1 스캐폴딩(`app/src/studio/*`, 디자인 토큰)만 존재.
- `app/src/studio/panels/NodePalette.tsx`는 "Phase 2에서 채워질" placeholder 상태.
- 설계 문서 `docs/design/02_domain_model.md`의 타입 정의가 합격 기준(14종 NodeType / 10종 PortDataType / 8종 EdgeType)과 일치.

## 분해 전략

공유 타입(T1)을 단일 선행 태스크로 만들고, 9개 템플릿 그룹을 3개 병렬 태스크(각 3그룹·파일 3개, 파일 겹침 없음)로 나눈 뒤, 레지스트리/배럴/팩토리 집계 태스크(T5)로 마무리한다.

## 플래너 결정 (설계 문서에 없는 부분)

- 템플릿 24종 → NodeType 14종 매핑: Trigger 3종은 모두 `event`(properties.source로 구분), Scope 3종은 `space_scope`(scopeKind), Object 4종은 `asset_filter`(assetKind), AND/OR는 `condition`(compositeOperator), Checklist는 `sop_task`(taskKind), People 3종은 `role`(roleKind), Action 3종은 `notification`(channel), Record 3종은 `evidence`(recordKind). `data_mapper`는 타입 유니온에만 존재하면 되고 템플릿은 만들지 않는다(합격 기준의 24종에 없음).
- 포트 dataType 흐름(승인 기준 플로우와 정합): `event → scoped_event → condition_result → execution_flow/mission → notification_payload/response → record`.

---

### Task T1: 도메인 코어 타입 모듈 [PARALLEL] (선행 없음 — 단독 선행 태스크)
- 목표: 합격 기준에 명시된 모든 도메인 타입 + NodeTemplate 인터페이스를 단일 타입 모듈로 정의한다.
- 대상 파일: `app/src/domain/types.ts` (신규 1개)
- 완료 기준: 아래 타입이 전부 `export`되고 `cd app && npm run build` 시 타입 에러 0. 다른 코드는 수정하지 않음.
- 구현 세부사항 (`docs/design/02_domain_model.md` §2~12 그대로 + 보강):
  - `NodeType` — 정확히 14종 문자열 리터럴 유니온: `"event" | "space_scope" | "asset_filter" | "condition" | "branch" | "sop_task" | "sop_group" | "role" | "notification" | "timer" | "escalation" | "situation_board" | "evidence" | "data_mapper"`
  - `PortDataType` — 정확히 10종: `"event" | "scoped_event" | "asset" | "condition_result" | "execution_flow" | "mission" | "mission_status" | "notification_payload" | "response" | "record"`
  - `EdgeType` — 정확히 8종: `"event_flow" | "scope_flow" | "asset_flow" | "condition_flow" | "execution_flow" | "notification_flow" | "response_flow" | "record_flow"`
  - `Severity = "INFO" | "CAUTION" | "WARNING" | "DANGER" | "CRITICAL"` (별도 export)
  - `NodePort { id: string; label: string; direction: "input" | "output"; dataType: PortDataType; required?: boolean; multiple?: boolean }`
  - `GraphNode { id; type: NodeType; label; description?; properties: Record<string, unknown>; ports: NodePort[]; position: {x: number; y: number}; size?: {width; height}; collapsed?: boolean; children?: string[] }`
  - `GraphEdge { id; sourceNodeId; sourcePortId; targetNodeId; targetPortId; edgeType: EdgeType; label?; condition?: Record<string, unknown> }`
  - `GraphGroup { id: string; label: string; nodeIds: string[]; collapsed?: boolean }`
  - `GraphVariable { key: string; label: string; type: "string" | "number" | "boolean"; defaultValue?: unknown }`
  - `ValidationIssue { level: "error" | "warning" | "info"; nodeId?; edgeId?; message: string }`
  - `ValidationResult { valid: boolean; issues: ValidationIssue[]; validatedAt: string }`
  - `SOPGraph { graphId; name; description?; domain: string; version: string; nodes: GraphNode[]; edges: GraphEdge[]; groups?: GraphGroup[]; variables?: GraphVariable[]; validation?: ValidationResult; createdAt: string; updatedAt: string }`
  - `EventContext { eventId; eventType: string; severity: Severity; occurredAt: string; siteId?; spaceId?; assetId?; source: "sensor" | "manual" | "ai" | "simulation"; measuredValues?: Record<string, number | string | boolean>; metadata?: Record<string, unknown> }`
  - `RuntimeMission { missionId; nodeId; title; assigneeRole?; status: "SENT" | "RUNNING" | "COMPLETED" | "DELAYED" | "FAILED"; dueMinutes?: number }`
  - `RuntimeNotification { notificationId: string; nodeId: string; channel: "sms" | "app_push" | "broadcast"; targets: string[]; message: string; status: "SENT" | "DELIVERED" | "ACKED" | "FAILED" }`
  - `ExecutionPlan { planId; graphId; triggerNodeId; executionPath: string[]; missions: RuntimeMission[]; notifications: RuntimeNotification[]; status: "READY" | "RUNNING" | "COMPLETED" | "FAILED" }`
  - `NodeTemplateGroup = "trigger" | "scope" | "object" | "logic" | "sop" | "people" | "action" | "runtime" | "record"`
  - `NodeTemplate { templateId: string; nodeType: NodeType; group: NodeTemplateGroup; label: string; description: string; defaultProperties: Record<string, unknown>; ports: NodePort[]; accentColorToken?: string; defaultSize?: {width: number; height: number} }`
  - 각 타입에 한국어 JSDoc 주석 1줄씩.

### Task T2: Trigger / Scope / Object 템플릿 [AFTER: T1]
- 목표: Trigger 3종, Scope 3종, Object 4종 = 10개 노드 템플릿 정의.
- 대상 파일: `app/src/domain/templates/trigger.ts`, `app/src/domain/templates/scope.ts`, `app/src/domain/templates/object.ts` (신규 3개)
- 완료 기준: 각 파일이 `NodeTemplate[]`을 named export(`TRIGGER_TEMPLATES`, `SCOPE_TEMPLATES`, `OBJECT_TEMPLATES`)하고, 모든 템플릿에 defaultProperties와 dataType 포함 포트가 있으며 타입 에러 0.
- 구현 세부사항:
  - import는 `../types`에서. accentColorToken은 `app/src/design-system/tokens/semantic/colors*.css`에 실존하는 CSS 변수명 문자열로 지정(파일을 열어 확인 후 선택; 예: trigger=위험/red 계열, scope=blue 계열, object=neutral 계열 status/intent 토큰).
  - **trigger.ts** (nodeType `"event"`, 포트: output `{ id: "event_out", label: "Event", direction: "output", dataType: "event" }` 만, input 없음):
    - `tpl-trigger-sensor-event` "Sensor Event" — defaultProperties `{ source: "sensor", eventType: "", severityMin: "INFO" }`
    - `tpl-trigger-manual-report` "Manual Report" — `{ source: "manual", eventType: "", reporterChannel: "phone" }`
    - `tpl-trigger-ai-detection` "AI Detection" — `{ source: "ai", eventType: "", model: "", confidenceThreshold: 0.8 }`
  - **scope.ts** (nodeType `"space_scope"`, 포트: input `{ id: "event_in", label: "Event", dataType: "event", required: true }`, output `{ id: "scoped_out", label: "Scoped Event", dataType: "scoped_event" }`):
    - `tpl-scope-facility` "Facility" — `{ scopeKind: "facility", siteId: "", spaceIds: [] }`
    - `tpl-scope-zone` "Zone" — `{ scopeKind: "zone", siteId: "", spaceIds: [] }`
    - `tpl-scope-evacuation-area` "Evacuation Area" — `{ scopeKind: "evacuation_area", siteId: "", spaceIds: [], capacity: 0 }`
  - **object.ts** (nodeType `"asset_filter"`, 포트: input `{ id: "scoped_in", dataType: "scoped_event", required: true }`, output `{ id: "scoped_out", dataType: "scoped_event" }`, output `{ id: "assets_out", dataType: "asset", multiple: true }`):
    - `tpl-object-sensor` "Sensor" — `{ assetKind: "sensor", assetIds: [], filterExpression: "" }`
    - `tpl-object-equipment` "Equipment" — `{ assetKind: "equipment", assetIds: [], filterExpression: "" }`
    - `tpl-object-cctv` "CCTV" — `{ assetKind: "cctv", assetIds: [], streamUrl: "" }`
    - `tpl-object-valve` "Valve" — `{ assetKind: "valve", assetIds: [], defaultAction: "close" }`

### Task T3: Logic / SOP / People 템플릿 [AFTER: T1] [PARALLEL with T2, T4]
- 목표: Logic 3종, SOP 3종, People 3종 = 9개 템플릿 정의.
- 대상 파일: `app/src/domain/templates/logic.ts`, `app/src/domain/templates/sop.ts`, `app/src/domain/templates/people.ts` (신규 3개)
- 완료 기준: `LOGIC_TEMPLATES`, `SOP_TEMPLATES`, `PEOPLE_TEMPLATES` export, 포트 dataType 명시, 타입 에러 0.
- 구현 세부사항 (accentColorToken 선택 규칙은 T2와 동일):
  - **logic.ts**:
    - `tpl-logic-condition` "Condition" (nodeType `"condition"`) — props `{ field: "severity", operator: ">=", value: "WARNING", expression: "" }`; 포트: input `{ id: "in", dataType: "scoped_event", required: true }`, output `{ id: "true_out", label: "True", dataType: "condition_result" }`, output `{ id: "false_out", label: "False", dataType: "condition_result" }`
    - `tpl-logic-and-or` "AND / OR" (nodeType `"condition"`) — `{ compositeOperator: "AND" }`; input `{ id: "conditions_in", dataType: "condition_result", required: true, multiple: true }`, output `{ id: "result_out", dataType: "condition_result" }`
    - `tpl-logic-branch` "Branch" (nodeType `"branch"`) — `{ branchKind: "response", timeoutMinutes: 5 }`; input `{ id: "response_in", dataType: "response", required: true }`, output `{ id: "responded_out", label: "응답", dataType: "execution_flow" }`, output `{ id: "timeout_out", label: "미응답", dataType: "execution_flow" }`
  - **sop.ts**:
    - `tpl-sop-task` "SOP Task" (nodeType `"sop_task"`) — `{ title: "", assigneeRole: "", dueMinutes: 10, instructions: "", taskKind: "task" }`; input `{ id: "trigger_in", dataType: "execution_flow", required: true }`, output `{ id: "mission_out", dataType: "mission" }`, output `{ id: "status_out", dataType: "mission_status" }`
    - `tpl-sop-group` "SOP Group" (nodeType `"sop_group"`) — `{ name: "", domain: "generic_safety", taskIds: [] }`, defaultSize `{ width: 320, height: 220 }`, children 사용 전제; input `{ id: "trigger_in", dataType: "condition_result", required: true }`, output `{ id: "missions_out", dataType: "mission", multiple: true }`, output `{ id: "flow_out", dataType: "execution_flow" }`, output `{ id: "status_out", dataType: "mission_status" }`
    - `tpl-sop-checklist` "Checklist" (nodeType `"sop_task"`) — `{ title: "", items: [], assigneeRole: "", taskKind: "checklist" }`; input `{ id: "trigger_in", dataType: "execution_flow", required: true }`, output `{ id: "status_out", dataType: "mission_status" }`, output `{ id: "record_out", dataType: "record" }`
  - **people.ts** (모두 nodeType `"role"`, 공통 포트: input `{ id: "mission_in", dataType: "mission", required: true, multiple: true }`, output `{ id: "mission_out", dataType: "mission" }`):
    - `tpl-people-role` "Role" — `{ roleKind: "role", roleName: "", department: "" }`
    - `tpl-people-contact-group` "Contact Group" — `{ roleKind: "contact_group", groupName: "", members: [] }`
    - `tpl-people-agency` "Agency" — `{ roleKind: "agency", agencyName: "", contactNumber: "" }`

### Task T4: Action / Runtime / Record 템플릿 [AFTER: T1] [PARALLEL with T2, T3]
- 목표: Action 3종, Runtime 3종, Record 3종 = 9개 템플릿 정의.
- 대상 파일: `app/src/domain/templates/action.ts`, `app/src/domain/templates/runtime.ts`, `app/src/domain/templates/record.ts` (신규 3개)
- 완료 기준: `ACTION_TEMPLATES`, `RUNTIME_TEMPLATES`, `RECORD_TEMPLATES` export, 포트 dataType 명시, 타입 에러 0.
- 구현 세부사항:
  - **action.ts** (모두 nodeType `"notification"`, 공통 포트: input `{ id: "mission_in", dataType: "mission", required: true, multiple: true }`, output `{ id: "payload_out", dataType: "notification_payload" }`, output `{ id: "response_out", dataType: "response" }`):
    - `tpl-action-sms` "SMS" — `{ channel: "sms", messageTemplate: "", requireAck: true }` (Mock 전파)
    - `tpl-action-app-push` "App Push" — `{ channel: "app_push", messageTemplate: "", requireAck: true }`
    - `tpl-action-broadcast` "Broadcast" — `{ channel: "broadcast", messageTemplate: "", requireAck: false }`
  - **runtime.ts**:
    - `tpl-runtime-situation-board` "Situation Board" (nodeType `"situation_board"`) — `{ boardId: "", recordFields: ["장소", "시간", "임무내용", "상황전파"] }`; input `{ id: "flow_in", dataType: "execution_flow", multiple: true }`, input `{ id: "record_in", dataType: "record", multiple: true }`, output `{ id: "record_out", dataType: "record" }`
    - `tpl-runtime-timer` "Timer" (nodeType `"timer"`) — `{ durationMinutes: 5, mode: "timeout" }`; input `{ id: "flow_in", dataType: "execution_flow", required: true }`, output `{ id: "elapsed_out", label: "경과", dataType: "execution_flow" }`
    - `tpl-runtime-escalation` "Escalation" (nodeType `"escalation"`) — `{ escalateToRole: "", channel: "sms", maxRetries: 1 }`; input `{ id: "flow_in", dataType: "execution_flow", required: true }`, output `{ id: "payload_out", dataType: "notification_payload" }`, output `{ id: "flow_out", dataType: "execution_flow" }`
  - **record.ts** (모두 nodeType `"evidence"`):
    - `tpl-record-evidence` "Evidence" — `{ recordKind: "evidence", mediaTypes: ["photo"] }`; input `{ id: "flow_in", dataType: "execution_flow", multiple: true }`, output `{ id: "record_out", dataType: "record" }`
    - `tpl-record-report` "Report" — `{ recordKind: "report", template: "종료보고" }`; input `{ id: "record_in", dataType: "record", multiple: true }`, output `{ id: "record_out", dataType: "record" }`
    - `tpl-record-history` "History" — `{ recordKind: "history", retentionDays: 90 }`; input `{ id: "record_in", dataType: "record", multiple: true }`, output `{ id: "record_out", dataType: "record" }`

### Task T5: 템플릿 레지스트리 + 노드 팩토리 + 배럴 + 팔레트 스모크 연동 [AFTER: T2, T3, T4]
- 목표: 24개 템플릿을 단일 레지스트리로 집계하고, 템플릿→GraphNode 생성 팩토리를 제공하며, NodePalette placeholder를 실제 템플릿 그룹 목록(정적 표시, DnD는 Phase 3)으로 교체해 빌드-통합을 증명한다.
- 대상 파일: `app/src/domain/templates/index.ts`, `app/src/domain/factory.ts`, `app/src/domain/index.ts` (신규 3개), `app/src/studio/panels/NodePalette.tsx` (수정 1개)
- 완료 기준: `NODE_TEMPLATES.length === 24`; `getTemplate("tpl-sop-group")` 등 조회 동작; `cd app && npm run build` 성공(타입 에러 0); dev 서버에서 팔레트에 9개 그룹·24개 템플릿 라벨이 표시되고 Phase 1 레이아웃(4영역) 회귀 없음.
- 구현 세부사항:
  - `templates/index.ts`: 9개 그룹 배열을 import → `export const NODE_TEMPLATES: NodeTemplate[]` (Trigger→Record 순서), `export const TEMPLATE_GROUPS: { group: NodeTemplateGroup; label: string; templates: NodeTemplate[] }[]` (그룹 한글/영문 라벨: Trigger, Scope, Object, Logic, SOP, People, Action, Runtime, Record), `export function getTemplate(templateId: string): NodeTemplate | undefined`, `export function getTemplatesByType(type: NodeType): NodeTemplate[]`.
  - `factory.ts`: `export function createNodeFromTemplate(template: NodeTemplate, position: {x: number; y: number}, id?: string): GraphNode` — id 미지정 시 `` `node-${template.nodeType}-${crypto.randomUUID().slice(0, 8)}` ``, `properties`는 defaultProperties의 구조적 복사(structuredClone), `ports`도 복사, label은 template.label.
  - `domain/index.ts`: `types.ts`, `templates/index.ts`, `factory.ts` 재수출(배럴).
  - `NodePalette.tsx`: 기존 placeholder 문구를 제거하고 `TEMPLATE_GROUPS`를 순회해 그룹 헤더 + 템플릿 항목 목록 렌더. 스타일은 기존 파일과 동일하게 디자인 토큰 CSS 변수만 사용(`var(--color-bg-surface)`, `var(--color-text-default)`, `var(--color-border-subtle)`, typo 유틸 클래스 `typo-text-*`; 근거: `1. Reference data/디자인 시스템 가이드` 및 `app/src/design-system/tokens/`). 각 항목에 템플릿의 accentColorToken을 좌측 색상 인디케이터로 사용. 드래그 기능·이벤트 핸들러는 붙이지 않는다(Phase 3 범위).

---

## 실행 순서 요약

```
T1 (단독 선행)
 ├─ [PARALLEL] T2 (Trigger/Scope/Object)
 ├─ [PARALLEL] T3 (Logic/SOP/People)
 └─ [PARALLEL] T4 (Action/Runtime/Record)
      └─ T5 (레지스트리+팩토리+배럴+팔레트) [AFTER: T2, T3, T4]
```

병렬 태스크 간 파일 충돌 없음(그룹별 파일 분리, 집계 파일은 T5에서만 생성). 최종 검증: `cd app && npm run build` 성공 + `evaluation_criteria.md` Phase 2 체크리스트 3항목 충족.
