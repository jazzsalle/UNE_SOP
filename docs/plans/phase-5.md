# Phase 5 계획 — SOP 실행기 + 실행이력 로그 + 전자상황판 대시보드 (2단계)

> planner subagent 산출물 (2026-07-05). `/phase-run 5` 실행 기록.

## 선행 판단 (근거 포함)

1. **라우팅: react-router 미도입.** 평가 기준은 "대시보드 화면 존재 + 실행 결과 반영 시연"만 요구한다. `app/src/App.tsx`가 현재 `<GraphStudio />` 단일 렌더이므로, App 레벨 상태로 "Studio | Dashboard" 뷰를 전환한다. **두 뷰를 모두 마운트한 채 비활성 뷰는 `display:none`으로 숨긴다** — GraphStudio를 언마운트하면 React Flow 캔버스 편집 상태가 소실되어 Phase 3~4 회귀가 되기 때문. GraphStudio는 `height:100vh`를 쓰고 있으므로 App 셸(상단 글로벌 내비 바) 도입 시 `100%`로 조정한다.
2. **실행기는 engine 순수 모듈.** `simulate.ts` 주석("2단계에서 컴파일/실행 분리")대로, `compileGraph()`가 만든 `ExecutionPlan`을 입력으로 받아 **불변(immutable) 리듀서 방식의 상태 머신**(`applyExecutorAction(run, action) → new run`)으로 구현한다. simulate.ts/compileGraph.ts는 수정하지 않는다(회귀 방지) — 실행기는 새 파일로 추가.
3. **실행이력 저장은 별도 키 `sop-studio:runs`.** 기존 `storage.ts`(`sop-studio:graphs`)와 동일한 방어적 패턴을 따르되 파일을 분리해 병렬 작업 충돌을 없앤다. 같은 앱 내 Studio(실행기 UI)→Dashboard 실시간 반영을 위해 in-app 구독(subscribe) 메커니즘을 저장소에 포함한다(localStorage `storage` 이벤트는 same-tab에서 발화하지 않음).
4. **임무 상태 전이 규칙** (`RuntimeMission.status` 유니온 고정: SENT|RUNNING|COMPLETED|DELAYED|FAILED): 수동 전이 SENT→RUNNING(착수), RUNNING→COMPLETED(완료)/FAILED(실패), tick(모의 시간 진행)으로 dueMinutes 초과 시 SENT/RUNNING→DELAYED 자동 전이, DELAYED→COMPLETED(지연 완료) 허용. 모든 임무가 COMPLETED/FAILED에 도달하면 run 종료.

의존성 그래프: `T1 → (T2 ∥ T3) → (T4 ∥ T5) → T6`

---

### Task T1: 실행 도메인 타입 + 실행이력 저장소 (공유 계약) [선행 — 병렬 아님]

- **목표**: 실행기·실행이력·대시보드가 공유하는 타입 계약과 localStorage 저장소를 확정한다.
- **대상 파일**:
  - `app/src/engine/executionTypes.ts` (신규)
  - `app/src/engine/runStorage.ts` (신규)
  - `app/src/engine/index.ts` (수정 — 배럴 export 2줄 추가)
- **완료 기준**: `cd app && npm run build` 통과. `ExecutionRun`/`ExecutionLogEntry`/`ExecutorAction` 타입과 `saveRun/loadRun/listRuns/deleteRun/subscribeRuns`가 `engine` 배럴에서 import 가능. 저장 키는 `sop-studio:runs`.
- **구현 세부사항**:
  - `executionTypes.ts` — React 무의존 순수 타입. 도메인 타입은 `../domain`에서 type-only import.
    - `ExecutionRunStatus = "RUNNING" | "COMPLETED" | "FAILED"`
    - `ExecutionLogEntry`: `{ seq: number; loggedAt: string(ISO, 모의 시각); elapsedMinutes: number; kind: "RUN_STARTED" | "MISSION_SENT" | "MISSION_RUNNING" | "MISSION_COMPLETED" | "MISSION_DELAYED" | "MISSION_FAILED" | "NOTIFICATION_SENT" | "NOTIFICATION_ACKED" | "BOARD_RECORDED" | "RUN_COMPLETED" | "RUN_FAILED"; nodeId?: string; missionId?: string; message: string; location: string; missionSummary: string; notificationSummary: string }` — **location(장소)/loggedAt(시간)/missionSummary(임무내용)/notificationSummary(상황전파)** 4필드는 평가 기준 필수이므로 모든 엔트리에 채운다(해당 없는 항목은 run 수준 요약으로 폴백).
    - `ExecutionRun`: `{ runId; graphId; graphName; domain; eventContext: EventContext; plan: ExecutionPlan; visitedNodeIds: string[]; traversedEdgeIds: string[]; missions: RuntimeMission[](상태 전이되는 사본); notifications: RuntimeNotification[]; boardRecords: BoardRecordMock[]; status: ExecutionRunStatus; startedAt: string; endedAt?: string; elapsedMinutes: number; logs: ExecutionLogEntry[] }`
    - `ExecutorAction` (discriminated union): `{ type: "START_MISSION"; missionId } | { type: "COMPLETE_MISSION"; missionId } | { type: "FAIL_MISSION"; missionId } | { type: "ACK_NOTIFICATION"; notificationId } | { type: "TICK"; minutes: number }`
  - `runStorage.ts` — `storage.ts`의 readMap/writeMap 방어 패턴 복제. 키 `RUNS_STORAGE_KEY = "sop-studio:runs"`, `Record<runId, ExecutionRun>`. 추가로 모듈 스코프 리스너 Set 기반 `subscribeRuns(listener): () => void`를 두고 `saveRun/deleteRun` 후 동기 notify (React 무의존 — 콜백만).
  - `index.ts` — `export * from "./executionTypes"; export * from "./runStorage";` 추가.

### Task T2: 실행기 상태 머신 (engine/executor) [AFTER: T1]

- **목표**: 컴파일된 SOPGraph + EventContext → ExecutionRun 생성, 액션/틱 기반 임무 상태 전이와 로그 기록을 순수 함수로 구현한다.
- **대상 파일**:
  - `app/src/engine/executor.ts` (신규)
  - `app/src/engine/index.ts` (수정 — `export * from "./executor";` 1줄)
  - `app/src/engine/simulate.ts` (수정 — 헤더 주석 갱신만. 로직 변경 금지)
- **완료 기준**: build 통과. `createRun(graph, ctx)` → status RUNNING, 모든 임무 SENT, `RUN_STARTED`+`MISSION_SENT`+`NOTIFICATION_SENT` 로그 생성. `applyExecutorAction` 호출 시 원본 run 불변 유지(새 객체 반환). SENT→RUNNING→COMPLETED 전이, TICK으로 dueMinutes 초과 시 DELAYED 전이, 전 임무 종결 시 run COMPLETED + `BOARD_RECORDED`/`RUN_COMPLETED` 로그.
- **구현 세부사항**:
  - `createRun(graph: SOPGraph, ctx: EventContext, opts?: SimulateOptions): { run: ExecutionRun | null; reason?: string }` — 내부에서 `compileGraph(graph, ctx, opts ?? {branchOutcome:"responded"})` 호출. `matched=false`면 `run: null` + reason. 성공 시 plan의 missions/notifications를 **깊은 복제**해 run에 담는다. 모의 시계: `startedAt = ctx.occurredAt`(비어있으면 현재 시각), `elapsedMinutes = 0`, `loggedAt = startedAt + elapsedMinutes` 계산 헬퍼.
  - 로그 공통 필드: `location = ctx.spaceId ?? ctx.siteId ?? "-"`, `missionSummary` = 해당 임무 title 또는 전체 임무 title 조인, `notificationSummary` = `channel → targets (status)` 조인.
  - `applyExecutorAction(run, action): ExecutionRun` — 허용 전이표 외 액션은 no-op. `TICK`: `elapsedMinutes += minutes`, RUNNING/SENT 임무 중 `dueMinutes < elapsedMinutes`인 것을 DELAYED로 전이 + `MISSION_DELAYED` 로그. `COMPLETE_MISSION`은 RUNNING/DELAYED에서 허용.
  - 종결 판정: 모든 임무가 COMPLETED/FAILED면 boardRecords 채우고 status COMPLETED, `endedAt` 설정, `RUN_COMPLETED` 로그. 하나라도 FAILED면 로그 message에 실패 건수 명시(판단 근거 JSDoc).
  - React·xyflow import 금지. localStorage 접근 금지(저장은 UI 레이어가 `runStorage`로 수행 — 순수성 유지).

### Task T3: 앱 셸 뷰 전환 + 대시보드 골격/Run 목록 [AFTER: T1] [PARALLEL — T2와 병렬]

- **목표**: "Studio | Dashboard" 전환 셸과 전자상황판 대시보드 화면 골격(실행 Run 목록)을 만든다.
- **대상 파일**:
  - `app/src/App.tsx` (수정 — 뷰 전환 셸)
  - `app/src/studio/GraphStudio.tsx` (수정 — `height: "100vh"` → `"100%"` 한 줄만)
  - `app/src/dashboard/DashboardPage.tsx`, `RunListPanel.tsx`, `dashboard.css` (신규)
- **완료 기준**: 상단 글로벌 내비(~48px)에서 Studio/Dashboard 전환. 비활성 뷰는 `display:none`으로 숨겨 GraphStudio 캔버스 상태 유지. Dashboard에 `listRuns()` 기반 Run 목록(그래프명/도메인/이벤트/시작 시각/상태/임무 진행 n/m), run 없으면 placeholder, `subscribeRuns`로 자동 갱신. 하드코딩 hex/rgb 0건.
- **구현 세부사항**:
  - App.tsx: `useState<"studio" | "dashboard">("studio")`. 두 뷰 모두 렌더, wrapper `display: active ? "flex" : "none"`. 전체 `100vh` flex column(내비 + 콘텐츠 `flex:1 minHeight:0`).
  - 내비 탭은 Tab SPEC/BottomTabs 패턴(활성 `--color-text-brand`+`--color-border-brand` 밑줄).
  - DashboardPage: 헤더("전자상황판 — 실행이력 점검") + 좌측 RunListPanel / 우측 상세 placeholder("Run을 선택하면 상세가 표시됩니다" — T5가 교체) 2컬럼. 선택 runId는 DashboardPage state.
  - RunListPanel: `useSyncExternalStore` 또는 `useEffect + subscribeRuns`. 상태 뱃지는 status 토큰.

### Task T4: Studio 실행기 UI — Execution 탭 [AFTER: T2] [PARALLEL — T5와 병렬]

- **목표**: Studio 하단 "Execution" 탭 — run 시작, 임무 수동 전이/시간 진행, 매 변경 `saveRun` 영속화.
- **대상 파일**:
  - `app/src/studio/panels/ExecutionPanel.tsx`, `execution/MissionControlList.tsx`, `execution/ExecutionLogView.tsx`, `execution/execution.css` (신규)
  - `app/src/studio/panels/BottomTabs.tsx` (수정 — 3탭)
- **완료 기준**: "Validation / Compile | Runtime Preview | Execution" 3탭. Execution 탭: ① 이벤트 선택(ALL_SAMPLE_EVENTS) 후 "실행 시작" → run 생성·저장 ② 임무별 [착수]/[완료]/[실패] 버튼 전이 ③ "+5분 경과"(TICK)로 dueMinutes 초과 임무 DELAYED ④ 실행 로그(장소/시간/임무내용/상황전파 열) 실시간 갱신 ⑤ 전 임무 종결 시 run COMPLETED. 모든 변경 후 `saveRun`. 하드코딩 0건, 기존 두 탭 회귀 없음.
- **구현 세부사항**:
  - **GraphStudioContext.tsx 수정 금지.** ExecutionPanel이 `useStudio()`에서 `compiledGraph`/`runCompile`만 읽고, run은 `useState<ExecutionRun | null>` 로컬 관리. 액션마다 `const next = applyExecutorAction(run, action); setRun(next); saveRun(next);`.
  - 실행 시작: compiledGraph 없으면 안내 + Compile 유도(택1 근거 JSDoc). `createRun` 실패 시 Alert 스타일 경고.
  - 임무 행 상태 뱃지 5종(SENT=info, RUNNING=brand, COMPLETED=success, DELAYED=warning, FAILED=danger). 버튼은 StudioToolbar sm 버튼 관례.

### Task T5: 대시보드 상세 — 실행이력 점검 화면 [AFTER: T3] [PARALLEL — T4와 병렬]

- **목표**: 선택 run의 상세(요약 KPI, 임무 상태, 상황전파, 상황판 기록, 실행이력 로그 테이블)를 관리자 점검용으로 표시.
- **대상 파일**:
  - `app/src/dashboard/RunDetailPanel.tsx`, `ExecutionLogTable.tsx` (신규)
  - `app/src/dashboard/DashboardPage.tsx` (수정 — placeholder 교체), `dashboard.css` (수정)
- **완료 기준**: Run 선택 시 ① 요약 헤더(이벤트 타입/심각도 뱃지/장소/발생 시각/run 상태/경과 분) ② 임무 현황 ③ 상황전파 목록 ④ 상황판 기록(장소·시간·임무내용·상황전파 카드) ⑤ 실행이력 로그 테이블(시간|장소|구분|임무내용|상황전파|메시지). 미선택 시 placeholder. `subscribeRuns` 실시간 갱신. 하드코딩 0건.
- **구현 세부사항**: T4 파일 불가침(병렬). 데이터는 `loadRun(runId)` + `subscribeRuns`. kind 한국어 라벨 맵. DELAYED/FAILED 행 상태 토큰 강조. 심각도 뱃지는 RuntimePreviewPanel 매핑과 동일. 상황판 카드에 "훈련/실제 공통 점검 화면" 부기.

### Task T6: 통합 마감 — 종단 시나리오 검증 [AFTER: T4, T5]

- **목표**: Phase 5 전체 흐름 종단 검증 + 빌드·회귀·토큰 준수 확정.
- **대상 파일**: 결함 수정에 한정.
- **완료 기준**:
  1. `cd app && npm run build` 성공, 타입 에러 0.
  2. 종단 시나리오: LH2 로드 → Compile → Execution 탭 → EVT-LH2-001 → 실행 시작 → 임무1 착수→완료, "+5분"으로 임무2 DELAYED → 지연 완료 → run COMPLETED → Dashboard 전환 → 목록·상세(임무 상태·로그 4필드·상황판 기록) 일치.
  3. 두 뷰 동시 마운트 구조에서 Studio `saveRun` → Dashboard `subscribeRuns` 갱신 동작.
  4. 회귀: Phase 3 편집 + Phase 4(Validate/Compile/Simulate/Runtime Preview/하이라이트/템플릿 4종) 정상. GraphStudio height 변경에 따른 레이아웃 확인.
  5. 신규 파일 하드코딩 색상 0건.
  6. `sop-studio:runs` JSON 파손 주입 시 크래시 없이 빈 목록 복구.

---

### 참고 경로 요약

- 엔진 계약: `app/src/engine/types.ts`, `compileGraph.ts`, `runtimeMock.ts`, `storage.ts`(패턴 원형), `simulate.ts`
- 도메인 타입(수정 불필요): `app/src/domain/types.ts`
- Studio 결합점: `GraphStudioContext.tsx`(수정 금지 권장), `panels/BottomTabs.tsx`(T4), `GraphStudio.tsx`(T3 한 줄)
- 디자인 시스템: 토큰 `app/src/design-system/tokens/`, SPEC `1. Reference data/디자인 시스템 가이드/modules/react-ui/src/components/{Tab,badges,Alert,List}/SPEC.md`
