# PROGRESS

## Last updated
2026-07-05

## Current goal
Phase 4 — 검증→컴파일→시뮬레이션→Runtime Preview + 도메인 템플릿 4종(액화수소/발전소/안전한국훈련/일반 사업장). **1단계 완료 기준** (`/phase-run 4`로 시작)

## Done this session
- 2026-07-04: 하네스 부트스트랩 완료 — planner/generator/evaluator subagent, phase-run/handoff/resume-work 스킬, CLAUDE.md(Phase 1~9 정의), evaluation_criteria.md, SessionStart hook 생성. 설계 문서(Project Instructions for Codex + 단계별 개발내용.txt) 분석 및 9개 Phase 분해 확정.
- 2026-07-04: 진행 방식 결정 — 별도 설계 문서 없이 바로 Phase 실행. 대신 planner 산출물을 `docs/plans/phase-N.md`로 저장하도록 phase-run 스킬 보완.
- 2026-07-04: **Phase 1 완료 (evaluator PASS)** — `app/` Vite+React+TS+Tailwind v4 스캐폴딩(@xyflow/react ^12.11.1), 디자인 토큰 15개 파일 벤더링(`app/src/design-system/tokens/`, 원본 무수정), `global.css`(rem=1px 전제), 4영역 Graph Studio 레이아웃(NodePalette/GraphCanvas/PropertyInspector/ValidationPanel + 빈 React Flow 캔버스), 루트 `.gitignore`. 계획 기록: `docs/plans/phase-1.md`
- 2026-07-05: **Phase 2 완료 (evaluator PASS)** — `app/src/domain/types.ts`(NodeType 14종/PortDataType 10종/EdgeType 8종/GraphNode/NodePort/GraphEdge/SOPGraph/EventContext/ExecutionPlan/RuntimeMission/RuntimeNotification/ValidationIssue/NodeTemplate), 노드 템플릿 9그룹 28종(`app/src/domain/templates/*` — Trigger 3/Scope 3/Object 4/Logic 3/SOP 3/People 3/Action 3/Runtime 3/Record 3, 각각 defaultProperties+타입드 포트+accentColorToken), 레지스트리(`NODE_TEMPLATES`/`TEMPLATE_GROUPS`/`getTemplate`)·팩토리(`createNodeFromTemplate`)·배럴, NodePalette를 9그룹 정적 목록 렌더로 교체(DnD는 Phase 3). planner의 "24종" 표기는 합산 오류로 28종이 정답(합격 기준 그룹 구성과 일치). 계획 기록: `docs/plans/phase-2.md`
- 2026-07-05: **Phase 3 완료 (evaluator PASS)** — Graph Studio 편집기: `studio/state/`(GraphStudioContext Provider+useStudio 훅, zustand 없이 RF useNodesState/useEdgesState를 Context로 공유, portCompatibility 6규칙 연결 검증, flowTokens 포트/엣지 토큰 맵, groupCollapse 불변 갱신), `studio/canvas/`(컨트롤드 ReactFlow + 팔레트 DnD drop + sop_task 그룹 자식 드롭 + MiniMap/Controls/Background + RF v12 --xy-* 토큰 오버라이드), `canvas/nodes/`(SOPNode accent 헤더+타입드 PortHandle, SOPGroupNode 접기/펼치기+Task 요약), NodePalette DnD+아코디언, PropertyInspector(타입별 PropertyField 편집 즉시 반영 + PortListSection). 계획 기록: `docs/plans/phase-3.md`

## In progress
- 없음

## Next steps
1. `/phase-run 4` — 검증→컴파일→시뮬레이션→Runtime Preview + 도메인 템플릿 4종 (1단계 완료 기준: Event→Space Scope→Asset Filter→Condition→SOP Group→Notification→Branch→Situation Board 플로우 재현)
2. Phase 5 — SOP 실행기 + 실행이력 로그 + 전자상황판 대시보드 (2단계)

## Blockers
- 없음

## Notes
- `tokens.css`가 `semantic/colors-intent.css`를 임포트하지 않음(원본과 동일). 이후 Phase에서 intent 토큰 사용 시 tokens.css에 임포트 추가 필요.
- html font-size 1px = rem 1px 전제(디자인 시스템 규칙). Tailwind rem 기반 유틸리티 사용 시 주의 — 레이아웃 치수는 px/토큰 변수 직접 지정.
- tsconfig.app.json은 `baseUrl` 없이 `paths`만 사용 (TS 6.0에서 baseUrl deprecated/TS5101).
- Phase 3 잔여 다듬기(경미, Phase 4에서 처리 가능): Inspector number 필드 비우면 `Number("")===0`으로 0 기록되는 UX, 엣지 markerEnd 화살표 색이 stroke 토큰과 불일치(RF 기본색).

## How to run
- `cd app && npm install && npm run dev` (빌드: `npm run build`)
