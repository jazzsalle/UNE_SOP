# PROGRESS

## Last updated
2026-07-05

## Current goal
Phase 7 — 4단계: webbuilder 토폴로지(내비 메시 기반 노드/링크) 구조 분석 → 토폴로지 스키마 연결 설계, 층별/특정 토폴로지 셋 임포트 및 SOP 그래프 연동 컴포넌트(예: 로봇개 패트롤 시나리오) (`/phase-run 7`로 시작)

## Done this session
- 2026-07-04: 하네스 부트스트랩 완료 — planner/generator/evaluator subagent, phase-run/handoff/resume-work 스킬, CLAUDE.md(Phase 1~9 정의), evaluation_criteria.md, SessionStart hook 생성. 설계 문서(Project Instructions for Codex + 단계별 개발내용.txt) 분석 및 9개 Phase 분해 확정.
- 2026-07-04: 진행 방식 결정 — 별도 설계 문서 없이 바로 Phase 실행. 대신 planner 산출물을 `docs/plans/phase-N.md`로 저장하도록 phase-run 스킬 보완.
- 2026-07-04: **Phase 1 완료 (evaluator PASS)** — `app/` Vite+React+TS+Tailwind v4 스캐폴딩(@xyflow/react ^12.11.1), 디자인 토큰 15개 파일 벤더링(`app/src/design-system/tokens/`, 원본 무수정), `global.css`(rem=1px 전제), 4영역 Graph Studio 레이아웃(NodePalette/GraphCanvas/PropertyInspector/ValidationPanel + 빈 React Flow 캔버스), 루트 `.gitignore`. 계획 기록: `docs/plans/phase-1.md`
- 2026-07-05: **Phase 2 완료 (evaluator PASS)** — `app/src/domain/types.ts`(NodeType 14종/PortDataType 10종/EdgeType 8종/GraphNode/NodePort/GraphEdge/SOPGraph/EventContext/ExecutionPlan/RuntimeMission/RuntimeNotification/ValidationIssue/NodeTemplate), 노드 템플릿 9그룹 28종(`app/src/domain/templates/*` — Trigger 3/Scope 3/Object 4/Logic 3/SOP 3/People 3/Action 3/Runtime 3/Record 3, 각각 defaultProperties+타입드 포트+accentColorToken), 레지스트리(`NODE_TEMPLATES`/`TEMPLATE_GROUPS`/`getTemplate`)·팩토리(`createNodeFromTemplate`)·배럴, NodePalette를 9그룹 정적 목록 렌더로 교체(DnD는 Phase 3). planner의 "24종" 표기는 합산 오류로 28종이 정답(합격 기준 그룹 구성과 일치). 계획 기록: `docs/plans/phase-2.md`
- 2026-07-05: **Phase 3 완료 (evaluator PASS)** — Graph Studio 편집기: `studio/state/`(GraphStudioContext Provider+useStudio 훅, zustand 없이 RF useNodesState/useEdgesState를 Context로 공유, portCompatibility 6규칙 연결 검증, flowTokens 포트/엣지 토큰 맵, groupCollapse 불변 갱신), `studio/canvas/`(컨트롤드 ReactFlow + 팔레트 DnD drop + sop_task 그룹 자식 드롭 + MiniMap/Controls/Background + RF v12 --xy-* 토큰 오버라이드), `canvas/nodes/`(SOPNode accent 헤더+타입드 PortHandle, SOPGroupNode 접기/펼치기+Task 요약), NodePalette DnD+아코디언, PropertyInspector(타입별 PropertyField 편집 즉시 반영 + PortListSection). 계획 기록: `docs/plans/phase-3.md`
- 2026-07-05: **Phase 4 완료 (evaluator PASS) — 1단계(POC) 완료 기준 충족** — `app/src/engine/`(React 무의존 순수 모듈: normalizeGraph/validateGraph 6종 규칙+미응답 분기 경고/compileGraph BFS 경로 계산+트리거 매칭+조건 평가/simulate/runtimeMock 임무·전파·응답·상황판·타임라인/storage localStorage `sop-studio:graphs`), `domain/seeds/` 도메인 시드 4종(LH2 승인 기준 플로우 Event→Zone→Sensor→Condition→SOP Group→SMS→Branch→Board+Escalation, 발전소/안전한국훈련/일반 사업장, 샘플 EventContext 5건), Context 확장(runValidate/runCompile/runSimulate/loadDomainTemplate/selectNode)+graphIO 왕복 변환, StudioToolbar(템플릿 로드/Validate/Compile/Simulate), ValidationPanel(이슈 클릭→노드 포커스+JSON 프리뷰·복사·다운로드), SimulateDialog+RuntimePreviewPanel 6섹션+TimelineView, 실행경로 캔버스 하이라이트(sim-node/edge active·dimmed), BottomTabs(시뮬레이션 시 Runtime Preview 자동 전환). 시드 4종 왕복 검증 error 0, 시뮬레이션 26체크 PASS. 계획 기록: `docs/plans/phase-4.md`
- 2026-07-05: **Phase 5 완료 (evaluator PASS) — 2단계 완료** — `engine/executor.ts`(createRun/applyExecutorAction 불변 리듀서 상태 머신: SENT→RUNNING→COMPLETED, TICK 기반 dueMinutes 초과 DELAYED, FAIL_MISSION, ACK_NOTIFICATION; React/localStorage 무의존), `executionTypes.ts`(ExecutionRun/ExecutionLogEntry — 장소/시간/임무내용/상황전파 4필드 전 로그 필수), `runStorage.ts`(localStorage `sop-studio:runs` + same-tab 실시간 반영용 subscribeRuns), App 셸 Studio|Dashboard 뷰 전환(두 뷰 동시 마운트 + display:none — RF 캔버스 상태 보존), Studio 하단 Execution 탭(이벤트 선택→실행 시작(자동 Compile)→임무 착수/완료/실패 버튼+TICK+로그 테이블, 매 변경 saveRun), 전자상황판 대시보드(`dashboard/` RunListPanel + RunDetailPanel: 요약/임무 현황/상황전파/상황판 기록 4필드 카드/ExecutionLogTable 6열, 훈련·실제 공통 점검 표기, 실시간 갱신). 실행기 검증 47체크+종단 42assert PASS. 계획 기록: `docs/plans/phase-5.md`
- 2026-07-05: **Phase 6 완료 (evaluator PASS) — 3단계 완료** — `docs/spatial/` 작업규정 분석 문서 7건(별표 2 레이어 분류/별표 3 표준데이터 11종 객체유형/별표 5 명명규칙+시설구분코드 전표/별표 6 속성 QAL·SLP·DIR·SKT·HCP/별표 10 품질기준/스키마 매핑 결정), `app/src/domain/spatial/`(SpatialSite·Floor·Space·Facility 타입 + DIVISION 12종·CLASSIFY 8종 코드 테이블 + naming build/parse 왕복 함수 — 기본키 38자, 규정 원문 "41"은 합산 오기로 문서화), 검증용 건물(층 3/공간 21/시설물 16, footprint+높이 3D 지오메트리, 전 id 명명 함수 생성) + 시드 4도메인 사이트 + registry 조회 API, 시드 4종 공간 id 표준 전환(SITE-*→UFID 17자 등), validateGraph 규칙 8(공간 참조 warning/info), PropertyInspector 공간 피커(SpaceScopeFields/AssetPickerField — 미등록 id 경고+값 보존), SimulateDialog 레지스트리 셀렉트, App 3뷰째 "공간 모델"(SVG 층 평면 + 명명 분해 상세). 계획 기록: `docs/plans/phase-6.md`

## In progress
- 없음

## Next steps
1. `/phase-run 7` — workplans_webbuilder 분석 → 토폴로지 스키마(노드/링크, 내비 메시, 수직 연결) + 층별 토폴로지 임포트 + SOP 그래프 연동(로봇개 패트롤 시나리오) (4단계)
2. Phase 8 — 조치결과 회신 웹앱 (5단계)

## Blockers
- 없음

## Notes
- `tokens.css`가 `semantic/colors-intent.css`를 임포트하지 않음(원본과 동일). 이후 Phase에서 intent 토큰 사용 시 tokens.css에 임포트 추가 필요.
- html font-size 1px = rem 1px 전제(디자인 시스템 규칙). Tailwind rem 기반 유틸리티 사용 시 주의 — 레이아웃 치수는 px/토큰 변수 직접 지정.
- tsconfig.app.json은 `baseUrl` 없이 `paths`만 사용 (TS 6.0에서 baseUrl deprecated/TS5101).
- Phase 3 잔여 다듬기(경미): Inspector number 필드 비우면 `Number("")===0`으로 0 기록되는 UX, 엣지 markerEnd 화살표 색이 stroke 토큰과 불일치(RF 기본색).
- Phase 4 설계 결정: 노드/엣지 편집 시 validationResult/simulation 자동 무효화 안 함(POC 단순화, "하이라이트 해제" 버튼으로 해소). `engine/normalizeGraph.ts`의 DATA_TYPE_TO_EDGE_TYPE는 `studio/state/portCompatibility.ts`와 의도적 이중 정의(엔진의 편집기 레이어 무의존 유지) — 수정 시 동기화 필요. situation_board/evidence는 "기록 싱크"로 분류되어 시뮬레이션 경로에서 항상 마지막 방문. `simulate()`는 compileGraph 래퍼(실행기는 executor.ts로 분리됨).
- Phase 5 설계 결정: run 전체 FAILED 상태는 도달 경로 없음(임무 실패 포함 종결도 COMPLETED, 실패 건수는 로그 메시지에 명시 — 향후 확장 예약). ExecutionPanel run 상태는 로컬 useState(템플릿 교체 후에도 이전 run 잔존 — "새 실행"으로 초기화). 대시보드 실시간 반영은 runStorage의 in-app subscribeRuns(같은 탭에선 storage 이벤트 미발화).
- Phase 6 설계 결정: three.js 미도입(3D는 데이터로 구축, footprint+baseElevation+height — Phase 9 뷰어가 소비 예정. 검증 가시화는 SVG 층 평면 뷰). 공간 기본키는 38자(규정 원문 "CHAR 41"은 합산 오기 — docs/spatial/04·06에 주석). localStorage 구버전 그래프(SITE-* id)는 규칙 8 warning이 정상 동작. 번들 514KB(rolldown 500KB 경고) — Phase 9에서 코드 스플리팅 검토.

## How to run
- `cd app && npm install && npm run dev` (빌드: `npm run build`)
