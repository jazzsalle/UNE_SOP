# Phase 4 계획 — 검증·컴파일·시뮬레이션·Runtime Preview + 도메인 템플릿 4종

> planner subagent 산출물 (2026-07-05). `/phase-run 4` 실행 기록.

## 공통 계약 (모든 generator가 준수)

- 아키텍처: `React Flow(StudioNode/StudioEdge) → normalizeGraph() → SOPGraph → validateGraph() → compileGraph()/simulate() → SimulationResult → Runtime Preview`. 실행 로직은 전부 `app/src/engine/*` 순수 모듈(React·@xyflow/react 런타임 의존 금지, 도메인 타입은 `../domain`에서 type-only import).
- RF 노드 id = `GraphNode.id`, 도메인 노드는 `node.data.graphNode`, 엣지 타입은 `edge.data.edgeType` (기존 규약 유지, `app/src/studio/state/editorTypes.ts`).
- 색상은 반드시 CSS 변수 토큰(`app/src/design-system/tokens/semantic/colors.css`, `colors-status.css`에 실존: `--color-bg-{brand,danger,warning,success,info,neutral}`, `--color-bg-*-subtle`, `--color-text-{danger,warning,success,info,brand,default,placeholder}`, `--color-border-{default,subtle,brand,warning,success}`). hex/rgb 하드코딩 금지. UI 패턴은 `1. Reference data/디자인 시스템 가이드/modules/react-ui/src/components/{buttons/Button,Tab,Modal,Select,badges,Alert}/SPEC.md` 참조.
- Severity 서열: `INFO(0) < CAUTION(1) < WARNING(2) < DANGER(3) < CRITICAL(4)` — `engine/types.ts`의 `SEVERITY_ORDER`가 단일 정의.

---

### Task T1: 엔진 기반 — normalizeGraph + validateGraph (순수 모듈) [PARALLEL]

- 목표: 편집기 스냅샷을 `SOPGraph`로 정규화하고, 6종 검증(필수 포트/필수 속성/포트 타입/고립 노드/도달 불가/순환 참조)+미응답 분기 경고를 수행하는 React 무의존 모듈 구축.
- 대상 파일:
  - `app/src/engine/types.ts` (신규)
  - `app/src/engine/traversal.ts` (신규)
  - `app/src/engine/normalizeGraph.ts` (신규)
  - `app/src/engine/validateGraph.ts` (신규)
  - `app/src/engine/index.ts` (신규, 배럴)
- 완료 기준: `npm run build` 통과. 위 파일 어디에도 `react`/`@xyflow/react` import 없음(구조적 타입만 사용). validateGraph가 evaluation_criteria Phase 4의 6개 검증 항목 각각에 대해 최소 1개 이슈를 생성 가능(주석에 항목별 매핑 명시).
- 구현 세부사항:
  - `engine/types.ts`:
    ```ts
    export const SEVERITY_ORDER: Record<Severity, number> = { INFO:0, CAUTION:1, WARNING:2, DANGER:3, CRITICAL:4 };
    /** 편집기 레이어와의 구조적 계약 — StudioNode/StudioEdge와 필드 호환이지만 xyflow를 import하지 않는다. */
    export interface EditorNodeSnapshot { id: string; position: {x:number;y:number}; parentId?: string; data: { graphNode: GraphNode }; }
    export interface EditorEdgeSnapshot { id: string; source: string; target: string; sourceHandle?: string|null; targetHandle?: string|null; data?: { edgeType: EdgeType }; }
    export interface EditorSnapshot { nodes: EditorNodeSnapshot[]; edges: EditorEdgeSnapshot[]; }
    export interface GraphMeta { graphId: string; name: string; domain: string; version: string; description?: string; createdAt?: string; }
    export interface TimelineEntry { seq: number; offsetMinutes: number; nodeId: string; kind: "event"|"scope"|"asset"|"condition"|"mission"|"notification"|"response"|"escalation"|"board"|"record"; message: string; }
    export interface MockResponse { missionId: string; missionTitle: string; status: "COMPLETED"|"DELAYED"|"NO_RESPONSE"; respondedBy?: string; offsetMinutes: number; }
    export interface BoardRecordMock { boardNodeId: string; fields: { 장소: string; 시간: string; 임무내용: string; 상황전파: string }; }
    export interface SimulateOptions { branchOutcome: "responded" | "timeout"; }
    export interface SimulationResult { eventContext: EventContext; matched: boolean; reason?: string; triggerNodeId: string|null; plan: ExecutionPlan|null; visitedNodeIds: string[]; traversedEdgeIds: string[]; conditionOutcomes: Record<string, boolean>; responses: MockResponse[]; boardRecords: BoardRecordMock[]; timeline: TimelineEntry[]; options: SimulateOptions; }
    ```
  - `traversal.ts`: `buildAdjacency(graph: SOPGraph): Map<string, GraphEdge[]>`(nodeId→outgoing), `buildReverseAdjacency`, `reachableFrom(graph, startId): Set<string>`, `findCycles(graph): string[][]`(DFS 3색 마킹, 순환에 포함된 노드 id 배열들 반환).
  - `normalizeGraph(snapshot: EditorSnapshot, meta: GraphMeta): SOPGraph`:
    - 노드: `data.graphNode`를 `structuredClone`하고 `position ← snapshot.node.position` 동기화. `parentId`가 있는 노드(그룹 자식)는 position을 부모 상대좌표 그대로 저장.
    - 그룹: `parentId === g.id`인 자식들로 `groups: [{ id: 그룹노드id, label, nodeIds }]` 구성, 그룹 GraphNode의 `children`도 동기화.
    - 엣지: `{ id, sourceNodeId: source, sourcePortId: sourceHandle!, targetNodeId: target, targetPortId: targetHandle!, edgeType: data?.edgeType ?? 소스 포트 dataType으로 유도 }`. dataType→EdgeType 매핑표는 `studio/state/portCompatibility.ts`의 매핑과 동일 내용을 engine에 자체 보유(편집기 레이어 import 금지; 주석으로 이중 정의임을 명시).
    - `createdAt`/`updatedAt`: meta.createdAt ?? now / now (ISO).
  - `validateGraph(graph: SOPGraph): ValidationResult` — 이슈 규칙(레벨/메시지 한국어):
    1. **필수 입력 포트**(error): 각 노드의 `ports.filter(p=>p.direction==="input" && p.required)` 중 해당 `targetPortId`로 들어오는 엣지가 없으면 error. 단, sop_group 자식 sop_task의 `trigger_in`은 그룹이 트리거를 받으면 충족으로 간주(skip).
    2. **필수 속성**(error/warning): 규칙 테이블 `REQUIRED_PROPERTY_RULES: { nodeType, key, level, when?: (props)=>boolean, message }[]` — event:`eventType`(error), condition(label!=="AND / OR"):`field`&&`operator`(error, `expression` 있으면 면제), sop_task:`title`(warning)·`assigneeRole`(warning), notification:`messageTemplate`(warning), escalation:`escalateToRole`(error), space_scope:`siteId`(warning). 빈 문자열/빈 배열은 미입력으로 취급.
    3. **포트 타입**(error): 모든 엣지에 대해 소스 포트 direction==="output"·타깃 direction==="input"·dataType 일치 재검증(엣지 단위, `edgeId` 포함).
    4. **고립 노드**(warning): 엣지가 하나도 걸리지 않고 그룹 자식도 아닌 노드.
    5. **도달 불가 경로**(warning): (a) event 노드에서 `reachableFrom`으로 도달 가능한 노드에 situation_board/evidence 타입이 하나도 없으면 해당 event 노드에 warning "실행 결과가 상황판/기록에 도달하지 않습니다". (b) 어느 event 노드에서도 도달 불가한 비-트리거 노드(그룹 자식 제외)에 warning.
    6. **순환 참조**(error): `findCycles` 결과의 각 순환마다 첫 노드 id로 error(메시지에 순환 경로 라벨 나열).
    7. **미응답 분기**(warning): branch 노드의 `timeout_out`에 나가는 엣지가 없으면 "미응답 시 escalation 경로가 없습니다".
    - 반환: `{ valid: issues에 error 없음, issues, validatedAt: ISO }`.
  - `index.ts`: 전부 re-export.

---

### Task T2: 도메인 시드 그래프 4종 + 샘플 EventContext [PARALLEL]

- 목표: 액화수소/발전소/안전한국훈련/일반 사업장 4종을 즉시 캔버스에 배치 가능한 `SOPGraph` 시드 데이터로 정의 (`docs/design/06_seed_data.md` §3~6 재현).
- 대상 파일:
  - `app/src/domain/seeds/seedTypes.ts` (신규)
  - `app/src/domain/seeds/lh2Plant.ts`, `powerPlant.ts`, `safetyKoreaDrill.ts`, `generalWorkplace.ts` (신규)
  - `app/src/domain/seeds/index.ts` (신규)
  - `app/src/domain/index.ts` (수정: seeds re-export 추가 — T1과 파일 겹침 없음)
- 완료 기준: 4개 시드 각각 `SOPGraph`로 완결(노드 위치 지정, 엣지 포트 id가 템플릿 포트 id와 일치, edgeType이 소스 포트 dataType과 정합). LH2 시드는 승인 기준 플로우(Event→Space Scope→Asset Filter→Condition→SOP Group→Notification→Branch→Situation Board+Escalation)를 전부 포함. 각 시드에 sampleEvents ≥ 1. 빌드 통과.
- 구현 세부사항:
  - `seedTypes.ts`:
    ```ts
    export interface DomainTemplateSeed { seedId: string; name: string; domain: "lh2_plant"|"power_plant"|"safety_korea_drill"|"general_workplace"; description: string; graph: SOPGraph; sampleEvents: EventContext[]; }
    ```
  - 노드 생성은 `createNodeFromTemplate(getTemplate("tpl-...")!, {x,y}, "고정id")` 후 label/properties override (헬퍼 `seedNode(templateId, id, pos, patch?)` 를 seedTypes.ts에 두어 공유). 고정 id 규칙: `seed-lh2-event` 처럼 사람이 읽는 id. `graph.graphId`: `graph-seed-lh2` 등, `version: "0.1.0"`, `createdAt/updatedAt` 고정 ISO 문자열.
  - **LH2 (lh2Plant.ts)** — 노드 11개, x 간격 ~280/그룹 자식은 상대좌표:
    - `seed-lh2-event`(tpl-trigger-sensor-event, props: eventType:"GAS_LEAK", severityMin:"WARNING") → `event_out→event_in` → `seed-lh2-zone`(tpl-scope-zone, siteId:"SITE-LH2-PLANT", spaceIds:["SPACE-STORAGE-ZONE"], label:"저장구역") → `scoped_out→scoped_in` → `seed-lh2-sensor`(tpl-object-sensor, assetIds:["ASSET-H2-SENSOR-001"], label:"수소센서") → `scoped_out→in` → `seed-lh2-cond`(tpl-logic-condition, field:"severity", operator:">=", value:"WARNING") → `true_out→trigger_in` → `seed-lh2-sop`(tpl-sop-group, name:"가스누출 초동대응", 자식: `seed-lh2-task-1`"현장 상황 확인"(assigneeRole:"현장 안전관리자", dueMinutes:5), `seed-lh2-task-2`"밸브 차단"(assigneeRole:"설비 담당", dueMinutes:10), parentId 관계는 graph.groups + children으로 표현) → `missions_out→mission_in` → `seed-lh2-sms`(tpl-action-sms, messageTemplate:"[LH2] 가스누출 감지 — 즉시 확인 요망") → `response_out→response_in` → `seed-lh2-branch`(tpl-logic-branch, timeoutMinutes:5) → `responded_out→flow_in` → `seed-lh2-board`(tpl-runtime-situation-board) / `timeout_out→flow_in` → `seed-lh2-esc`(tpl-runtime-escalation, escalateToRole:"통합방재실장") → `flow_out→flow_in` → board. 추가로 sop `flow_out→flow_in`→board.
    - sampleEvents: 06_seed_data.md §3의 EVT-LH2-001 (h2_ppm:1200, occurredAt 포함, source:"simulation") + 미매칭 확인용 `EVT-LH2-002`(severity:"INFO").
  - **발전소 (powerPlant.ts)**: event(eventType:"TURBINE_VIBRATION") → facility(터빈실) → equipment(터빈) → condition(field:"vibration_mm_s", operator:">=", value:7.1) → sop_group("터빈 점검/부하조정", 자식 2) → missions_out→role(tpl-people-role, roleName:"발전부 책임자") → mission_out→app_push → sop.flow_out→board. sampleEvent: `EVT-PP-001`(measuredValues:{vibration_mm_s:9.4}, severity:"DANGER").
  - **안전한국훈련 (safetyKoreaDrill.ts)**: manual-report event(eventType:"EARTHQUAKE_DRILL") → evacuation-area(운동장) → condition(severity>=INFO, label:"훈련상황 확인") → sop_group("대피유도", 자식 2) → missions_out→contact-group("교직원") → mission_out→broadcast; sop.flow_out→checklist(tpl-sop-checklist "인원확인") — checklist trigger_in은 execution_flow라 sop_group.flow_out과 타입 일치; checklist.record_out→board.record_in; board.record_out→report(tpl-record-report "종료보고").record_in. sampleEvent `EVT-DRILL-001`(severity:"CAUTION").
  - **일반 사업장 (generalWorkplace.ts)**: manual-report(eventType:"WORKER_DOWN") → zone(작업구역) → cctv → condition(severity>=WARNING) → sop_group("응급조치", 자식 2: 응급처치/작업중지) → missions_out→agency(tpl-people-agency "119") 및 missions_out→sms(관리자 전파, mission_in은 multiple이라 병렬 연결 가능) → sop.flow_out→board. sampleEvent `EVT-GW-001`(severity:"DANGER").
  - `seeds/index.ts`: `export const DOMAIN_TEMPLATE_SEEDS: DomainTemplateSeed[]`, `getSeed(seedId)`, 전체 샘플 이벤트 평탄화 `ALL_SAMPLE_EVENTS`.

---

### Task T3: 엔진 실행부 — compileGraph + simulate + Mock 런타임 + localStorage 저장 [AFTER: T1]

- 목표: `SOPGraph`에서 트리거 매칭→조건 평가→경로 계산→임무/전파/응답/상황판/타임라인 Mock을 생성하는 순수 실행 모듈과 localStorage persistence.
- 대상 파일:
  - `app/src/engine/compileGraph.ts` (신규)
  - `app/src/engine/simulate.ts` (신규)
  - `app/src/engine/runtimeMock.ts` (신규)
  - `app/src/engine/storage.ts` (신규)
  - `app/src/engine/index.ts` (수정: re-export 추가)
- 완료 기준: T2의 LH2 시드 graph + EVT-LH2-001로 `simulate()` 호출 시 executionPath가 event→zone→sensor→cond→sop→(task들)→sms→branch→board(responded) / …→branch→escalation→board(timeout) 순서로 산출됨(주석으로 기대 경로 명시). React 무의존. 빌드 통과.
- 구현 세부사항:
  - `compileGraph(graph: SOPGraph, ctx: EventContext, opts: SimulateOptions): SimulationResult` — 단계:
    1. **트리거 매칭**: `type==="event"` 노드 중 `(props.eventType 빈값 || === ctx.eventType) && SEVERITY_ORDER[ctx.severity] >= SEVERITY_ORDER[props.severityMin ?? "INFO"] && (props.source 빈값 || === ctx.source || ctx.source==="simulation")` 첫 노드. 없으면 `{matched:false, reason:"매칭되는 트리거가 없습니다(...)"}` 반환.
    2. **경로 계산**(BFS, `traversal.buildAdjacency` 사용, 방문순서 기록): condition 노드 도달 시 `evaluateCondition` 결과에 따라 `true_out`/`false_out` 엣지만 따라감(AND/OR 노드: 상류 condition 결과들을 `compositeOperator`로 결합, 미계산 상류는 true 취급). branch 노드: `opts.branchOutcome==="responded"→responded_out`, `"timeout"→timeout_out` 엣지만. 그 외 노드는 모든 outgoing 추적. 방문 노드/엣지 id를 `visitedNodeIds`/`traversedEdgeIds`에 순서대로 축적. sop_group 방문 시 `graph.groups`(또는 children)로 자식 sop_task id들을 visited에 삽입.
    3. `evaluateCondition(node, ctx): boolean`: `field==="severity"` → SEVERITY_ORDER 비교; `ctx.measuredValues?.[field]`가 number → 수치 비교(`>=,>,<=,<,==,!=`); value가 Severity 문자열이면 서열 비교, 아니면 Number() 시도; 판정 불가 시 true + `conditionOutcomes`에 기록.
    4. `ExecutionPlan` 조립: `planId: "PLAN-"+ctx.eventId`, `triggerNodeId`, `executionPath: visitedNodeIds`, missions/notifications는 runtimeMock에 위임, `status:"READY"`.
  - `runtimeMock.ts`:
    - `buildMissions(graph, visited): RuntimeMission[]` — 경로상 sop_group 자식 + 독립 sop_task마다 `{ missionId: "MISSION-"+zeroPad(n), nodeId, title: props.title || label, assigneeRole: props.assigneeRole || 연결된 role 노드 label, status:"SENT", dueMinutes }`.
    - `buildNotifications(graph, visited, ctx, missions)` — 경로상 notification/escalation 노드마다 `{ notificationId:"NOTI-"+n, channel: props.channel, targets: 경로상 role 타입 노드 label들(없으면 ["전체 담당자"]), message: props.messageTemplate || `[${ctx.severity}] ${ctx.eventType} 상황 전파`, status: branchOutcome==="responded" ? "ACKED" : "SENT" }`.
    - `buildResponses(missions, opts, timeoutMinutes)` — responded: 전부 `COMPLETED`(offset 3, 마지막 하나는 `DELAYED` offset 8로 변화 부여); timeout: 첫 임무 `NO_RESPONSE`(offset=timeoutMinutes), 나머지 `DELAYED`.
    - `buildBoardRecords(graph, visited, ctx, missions, notifications)` — 경로상 situation_board 노드마다 `{ 장소: ctx.spaceId ?? ctx.siteId ?? "-", 시간: ctx.occurredAt, 임무내용: mission title 나열, 상황전파: `${channel} ${targets.join(",")} 외 상태` 요약 }`.
    - `buildTimeline(...)` — offsetMinutes 누적: event(0)→scope/asset/condition(0)→missions SENT(+1)→notifications(+1)→responses(+3 또는 +timeout)→escalation(+timeout+1)→board 기록(마지막). `TimelineEntry.message`는 한국어 서술.
  - `simulate.ts`: `export function simulate(graph, ctx, opts = {branchOutcome:"responded"}): SimulationResult` — compileGraph 호출 래퍼(향후 실행기 분리 대비 주석).
  - `storage.ts`: `const STORAGE_KEY = "sop-studio:graphs"`; `saveCompiledGraph(graph: SOPGraph): void`(graphId 키로 map에 merge), `loadCompiledGraph(graphId): SOPGraph|null`, `listCompiledGraphs(): {graphId,name,domain,updatedAt}[]`, `typeof window === "undefined"` 가드 + try/catch(JSON 파손 시 빈 map).

---

### Task T4: 스튜디오 상태 통합 — Context 확장 + graphIO + 툴바 [AFTER: T1, T2, T3]

- 목표: Validate/Compile/Simulate/템플릿 로드를 `GraphStudioApi`로 노출하고 헤더 툴바에서 구동. T5~T7이 코딩할 API 계약을 여기서 확정.
- 대상 파일:
  - `app/src/studio/state/GraphStudioContext.tsx` (수정)
  - `app/src/studio/state/graphIO.ts` (신규)
  - `app/src/studio/panels/StudioToolbar.tsx` (신규)
  - `app/src/studio/GraphStudio.tsx` (수정: 헤더에 StudioToolbar 마운트)
- 완료 기준: 툴바에서 [템플릿 Select → 로드], [Validate], [Compile], [Simulate] 동작. 템플릿 로드 시 캔버스에 시드 그래프 배치 + fitView. Compile 시 localStorage에 저장(`sop-studio:graphs` 키 확인 가능). 기존 Phase 3 기능(DnD/연결/인스펙터/그룹 접기) 회귀 없음. 빌드 통과.
- 구현 세부사항:
  - `graphIO.ts` (편집기↔도메인 변환, xyflow type import 허용):
    - `toEditorSnapshot(nodes: StudioNode[], edges: StudioEdge[]): EditorSnapshot` — 얕은 매핑(id/position/parentId/data 그대로).
    - `toStudioGraph(graph: SOPGraph): { nodes: StudioNode[]; edges: StudioEdge[] }` — node.type = graphNode.type==="sop_group" ? "sopGroup" : "sopNode"; `style`←graphNode.size; `graph.groups`의 nodeIds에 든 노드는 `parentId: group.id, extent:"parent"`; **부모가 배열에서 자식보다 앞에 오도록 정렬**; 엣지 = `{ id, source: sourceNodeId, sourceHandle: sourcePortId, target: targetNodeId, targetHandle: targetPortId, data:{edgeType}, style:{stroke: var(EDGE_COLOR_TOKEN[edgeType])} }`.
  - `GraphStudioApi` 확장 (기존 필드 유지 + 추가):
    ```ts
    graphMeta: GraphMeta;                       // 초기값 { graphId:"graph-"+uuid8, name:"새 SOP Graph", domain:"generic", version:"0.1.0" }
    updateGraphMeta(patch: Partial<GraphMeta>): void;
    validationResult: ValidationResult | null;
    compiledGraph: SOPGraph | null;
    simulation: SimulationResult | null;
    simulateDialogOpen: boolean;
    setSimulateDialogOpen(open: boolean): void;
    runValidate(): ValidationResult;            // normalizeGraph(toEditorSnapshot(...), graphMeta) → validateGraph, 상태 저장
    runCompile(): SOPGraph;                     // runValidate 포함, graph.validation에 결과 첨부, saveCompiledGraph 호출, compiledGraph 상태 저장
    runSimulate(ctx: EventContext, opts?: SimulateOptions): SimulationResult; // normalize→simulate, simulation 상태 저장
    clearSimulation(): void;
    loadDomainTemplate(seedId: string): void;   // getSeed → structuredClone(graph) → toStudioGraph → setNodes/setEdges, graphMeta 갱신, validation/compile/simulation 초기화, queueMicrotask(() => fitView({padding:0.2}))
    selectNode(nodeId: string): void;           // 해당 노드만 selected:true로 setNodes
    ```
    노드/엣지 변경 시 기존 validationResult/simulation을 자동 무효화하지 **않는다**(POC 단순화, 주석 명기).
  - `StudioToolbar.tsx` (useStudio 소비, Button/Select SPEC 참조):
    - 좌: graphMeta.name 인라인 input + domain 뱃지(`--color-bg-brand-subtle`/`--color-text-brand`).
    - 우: ① 도메인 템플릿 `<select>`(DOMAIN_TEMPLATE_SEEDS, 선택 시 노드 존재하면 `window.confirm` 후 loadDomainTemplate) ② Validate(outline) ③ Compile(primary) ④ Simulate(bg `--color-bg-info`) → `setSimulateDialogOpen(true)` ⑤ simulation 존재 시 "하이라이트 해제" 버튼 → clearSimulation.
    - Validate/Compile 후 결과 요약 뱃지(오류 n·경고 n)를 버튼 옆에 표시.
  - `GraphStudio.tsx`: header 우측에 `<StudioToolbar />` 배치(h1 유지). 하단은 ValidationPanel 유지(교체는 T-final).

---

### Task T5: Validation Panel + SOPGraph JSON Preview [AFTER: T4]

- 목표: 하단 패널에 검증 이슈 목록과 컴파일된 SOPGraph JSON 프리뷰를 표시.
- 대상 파일:
  - `app/src/studio/panels/ValidationPanel.tsx` (전면 재작성)
  - `app/src/studio/panels/panels.css` (신규, 이 태스크 소유)
- 완료 기준: runValidate 후 이슈가 레벨별 아이콘/색으로 나열되고, 이슈 클릭 시 해당 노드 선택+화면 중앙 이동. runCompile 후 JSON 프리뷰·복사·다운로드 동작. 이슈 0건이면 "검증 통과" 표시. 빌드 통과.
- 구현 세부사항:
  - `useStudio()`의 `validationResult`, `compiledGraph`, `selectNode` 소비. 좌(이슈 목록)·우(JSON 프리뷰) 2열, 헤더에 상태 뱃지(`--color-bg-success-subtle`+`--color-text-success` / `--color-bg-danger-subtle`+`--color-text-danger`).
  - 이슈 행: level 점(error/warning/info 토큰) + 메시지 + nodeId. 클릭 → `selectNode(issue.nodeId)` + `useReactFlow().setCenter(...)` (그룹 자식이면 부모 position 합산).
  - JSON 프리뷰: `<pre>` + "복사"(navigator.clipboard), "다운로드"(Blob→a[download]), "localStorage 저장됨 · updatedAt" 캡션. compiledGraph 없으면 안내 문구.

---

### Task T6: EventContext 시뮬레이터 다이얼로그 + Runtime Preview 패널 [AFTER: T4]

- 목표: 샘플 EventContext 선택/편집→시뮬레이션 실행 다이얼로그와, 임무/전파/응답/상황판/타임라인을 보여주는 Runtime Preview 컴포넌트 작성 (마운트는 T-final).
- 대상 파일:
  - `app/src/studio/panels/SimulateDialog.tsx` (신규)
  - `app/src/studio/panels/RuntimePreviewPanel.tsx` (신규)
  - `app/src/studio/panels/runtime/MissionList.tsx`, `app/src/studio/panels/runtime/TimelineView.tsx` (신규)
  - `app/src/studio/panels/runtime/runtime.css` (신규)
- 완료 기준: 다이얼로그에서 샘플 선택(4개 시드의 sampleEvents)·필드 편집·응답/미응답 선택 후 실행하면 `runSimulate` 호출되고 닫힘. RuntimePreviewPanel이 SimulationResult의 6개 섹션(Triggered Event/Execution Path/Missions/Notifications/Responses/Situation Board+Timeline)을 모두 렌더. 미매칭 시 reason 표시. 빌드 통과.
- 구현 세부사항:
  - `SimulateDialog`: `simulateDialogOpen===false`면 null 반환(자체 게이트). 오버레이는 `--color-bg-overlay`류 토큰(rgba 금지). 폼: 샘플 select(ALL_SAMPLE_EVENTS) / eventType / severity select(5단계) / source select / spaceId·assetId / measuredValues JSON textarea(파싱 실패 시 인라인 오류) / branchOutcome radio. [시뮬레이션 실행] → `runSimulate(ctx, {branchOutcome})` → 닫기.
  - `RuntimePreviewPanel`: `useStudio().simulation` 소비, null이면 placeholder. §1 Triggered Event / §2 Execution Path(노드 label 칩+"→") / §3 Missions(MissionList 표, status 뱃지 토큰) / §4 Notifications / §5 Responses(미응답 시 escalation 안내) / §6 Situation Board(fields 카드) + TimelineView(세로 타임라인, `+n분` + kind별 점 + 한국어 메시지).

---

### Task T7: 실행 경로 캔버스 하이라이트 [AFTER: T4]

- 목표: 시뮬레이션 결과의 방문 노드/엣지를 캔버스에서 강조하고 나머지는 감쇠 표시.
- 대상 파일:
  - `app/src/studio/canvas/GraphCanvas.tsx` (수정)
  - `app/src/studio/canvas/canvas.css` (수정)
  - `app/src/studio/canvas/nodes/nodes.css` (수정)
- 완료 기준: `simulation` 존재 시 경로상 노드에 강조 링/경로상 엣지 animated+굵게, 비경로 요소 opacity 감쇠; `clearSimulation` 시 원상 복구. 하이라이트 중에도 편집 동작 유지. 빌드 통과.
- 구현 세부사항:
  - GraphCanvas에서 `useMemo`로 파생 배열 생성(원본 상태 불변): visited/traversed Set → displayNodes(className `sim-node--active`/`sim-node--dimmed`), displayEdges(traversed → animated+`sim-edge--active`, 그 외 `sim-edge--dimmed`).
  - css: active 노드 `box-shadow: 0 0 0 2px var(--color-border-brand)`, dimmed `opacity: 0.3`, active 엣지 `stroke-width: 3`, dimmed 엣지 `opacity: 0.15`. 색·그림자 토큰 사용.

---

### Task T-final: 통합 마감 — 하단 탭 배선 + 종단 시나리오 검증 [AFTER: T5, T6, T7]

- 목표: RuntimePreviewPanel/SimulateDialog를 레이아웃에 배선하고, 승인 기준 플로우를 포함한 엔드투엔드 시나리오와 회귀·빌드를 최종 검증.
- 대상 파일:
  - `app/src/studio/panels/BottomTabs.tsx` (신규: "Validation / Compile" | "Runtime Preview" 탭)
  - `app/src/studio/GraphStudio.tsx` (수정: 하단 영역을 `<BottomTabs />`로 교체, `<SimulateDialog />` 마운트, 하단 행 높이 260px로 조정)
  - 필요 시 발견된 통합 버그 수정(임의 파일 — 이 태스크만 전체 수정 권한)
- 완료 기준 (전부 확인):
  1. `cd app && npm run build` 성공(타입 에러 0).
  2. "액화수소 플랜트" 로드 → 승인 기준 플로우 배치·연결 확인.
  3. Validate → 시드는 error 0 (error 발생 시 시드/검증 규칙 정합 수정). 빈 캔버스에 event 노드만 두면 고립/도달불가/필수속성 이슈 확인.
  4. Compile → JSON 프리뷰 + localStorage `sop-studio:graphs` 저장 확인.
  5. Simulate(EVT-LH2-001, 응답) → 경로 하이라이트 + Runtime Preview 탭 자동 전환 + 임무 2건/전파/응답/상황판/타임라인. "미응답" 재실행 → escalation 경로·NO_RESPONSE.
  6. 나머지 시드 3종 로드→Validate→Simulate 각 1회 통과.
  7. Phase 3 회귀: 팔레트 DnD, 포트 타입 불일치 거부, 인스펙터 편집, 그룹 접기/펼치기.
  8. 신규 UI hex/rgb 하드코딩 없음.
- 구현 세부사항: BottomTabs 로컬 activeTab, 활성 탭 `--color-text-brand`+`border-bottom: 2px solid var(--color-border-brand)`. simulation 생성 시 runtime 탭 자동 전환. GraphStudio grid-template-rows `"auto 1fr 260px"`.

## 실행 순서 요약

- 1차 병렬: **T1**(engine 기반) + **T2**(시드 4종)
- 2차: **T3**(engine 실행부, T1 뒤)
- 3차: **T4**(Context/툴바 통합, T1·T2·T3 뒤)
- 4차 병렬: **T5**(ValidationPanel) + **T6**(Simulate/RuntimePreview) + **T7**(하이라이트) — 서로 파일 겹침 없음
- 5차: **T-final**(배선 + 종단 검증)

파일 소유권 충돌 없음: `engine/index.ts`(T1→T3 순차), `domain/index.ts`(T2 단독), `GraphStudioContext.tsx`(T4 단독), `GraphStudio.tsx`(T4→T-final 순차), `panels/*`(T5/T6 신규 파일 분리), `canvas/*`(T7 단독).
