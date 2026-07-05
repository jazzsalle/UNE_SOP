# Phase 9 계획 — 통합 시나리오 실행기 + WebGL 뷰어 + 조작 튜토리얼 (6단계, 최종)

> planner subagent 산출물 (2026-07-05). `/phase-run 9` 실행 기록.

## 선행 결정 (근거 명시)

**결정 1 — WebGL 뷰어: 순수 WebGL (신규 의존성 0)**
- 합격 기준이 문자 그대로 "WebGL 뷰어"이므로 CSS 3D는 배제.
- 렌더 요구가 최소: 볼록 footprint 압출 프리즘(별표 3 Room 볼록다각형 제약이 fan triangulation을 보장) + 노드 마커 + 링크 선 + orbit/zoom. three.js 기능의 극히 일부만 필요.
- 번들이 이미 514KB로 500KB 경고 상태 — three.js는 min+gzip ~150KB 추가, 순수 WebGL 자체 코드는 ~20KB 수준.
- Phase 7 계약 C의 무의존 기조 유지. mat4/카메라/메시 빌더를 React 무의존 순수 모듈로 분리. 색상은 `getComputedStyle`로 디자인 토큰 CSS 변수를 런타임 파싱해 RGB 변환(소스 내 hex 하드코딩 없음).

**결정 2 — 시나리오 실행기: 5번째 뷰 "시나리오" 신설 + Provider 승격**
- 실행기는 `loadDomainTemplate`/`runCompile` 등 GraphStudioContext API를 호출해야 하는데 Provider가 현재 `GraphStudio.tsx` 내부에 있음. `ReactFlowProvider + GraphStudioProvider`를 App 레벨로 승격하면 시나리오/튜토리얼이 Studio를 구동 가능. 모든 뷰 상시 마운트 패턴이라 승격 부작용 없음.
- 뷰 전환은 App의 `activeView`를 Context(AppViewContext)로 노출해 시나리오/튜토리얼이 제어.

**결정 3 — 튜토리얼: `data-tutorial-id` + getBoundingClientRect 기반 오버레이(커서 아이콘 + 하이라이트 + 다음/이전)**. 대상 id는 아래 고정 리터럴 계약으로 태스크 간 조율.

**data-tutorial-id 계약 (부여 태스크 → 소비: T6)**

| id | 대상 | 부여 |
|---|---|---|
| `nav-studio` `nav-dashboard` `nav-responder` `nav-spatial` `nav-scenario` | 글로벌 내비 탭 | T1 |
| `tutorial-start` | 내비 우측 "튜토리얼" 버튼 | T1 |
| `scenario-select` `scenario-step-topology` `scenario-step-load` `scenario-step-run` `scenario-step-reply` `scenario-contacts` | 시나리오 뷰 요소 | T4 |
| `spatial-3d-toggle` `spatial-topo-select` | 공간 모델 뷰 | T5 |
| `studio-toolbar-validate` `studio-toolbar-compile` `studio-tab-execution` `dashboard-run-list` `responder-mission-list` | 기존 화면 | T6 |

---

### Task T1: App 셸 확장 — Provider 승격 + 시나리오 뷰 슬롯 + 공유 컨텍스트 [PARALLEL]
- 목표: 시나리오 실행기/튜토리얼이 Studio API와 뷰 전환을 제어할 수 있는 앱 구조 확립. **App.tsx의 유일한 소유자.**
- 대상 파일: `app/src/App.tsx`(수정), `app/src/studio/GraphStudio.tsx`(수정 — Provider 제거, 레이아웃만), `app/src/shell/AppViewContext.tsx`(신규 — `{ activeView, setActiveView }`), `app/src/scenario/ScenarioPage.tsx`(신규 스텁), `app/src/tutorial/TutorialOverlay.tsx`(신규 스텁 — null 반환)
- 완료 기준: 빌드 성공. AppView에 "scenario" 추가, 내비 탭 5개 + "튜토리얼" 버튼(스텁 오버레이 마운트). ReactFlowProvider→GraphStudioProvider가 App 최상위. Studio 편집 회귀 없음. 내비 탭에 계약 표의 data-tutorial-id 부여. 토큰만 사용.
- 구현 세부: 뷰 wrapper는 display:none 패턴 유지. 스텁에 후속 태스크(T4/T6)가 채운다는 헤더 주석.

### Task T2: 담당자 마스터 시드 + 통합 시나리오 정의 (도메인 계약) [PARALLEL]
- 목표: "담당자" seed data 신설 + 공간·이벤트·SOP·토폴로지·담당자를 묶는 ScenarioDefinition 계약 확립.
- 대상 파일: `app/src/domain/contacts/contactTypes.ts`(ContactPerson { contactId, name, role, department, phone, siteUfid }), `contacts/seedContacts.ts`(사이트 4종+검증 건물별 3~5명 mock), `contacts/index.ts`(getContacts(siteUfid) 등), `app/src/domain/scenario/scenarioTypes.ts`, `scenario/integratedScenarios.ts`(최소 2종: ① "검증용 건물 야간 순찰 종합 데모"=검증 건물+ROBOT_PATROL_SEED+토폴로지 임의 생성, ② "LH2 누출 대응 데모"=LH2 사이트+LH2_PLANT_SEED+임의 생성), `scenario/index.ts`, `app/src/domain/index.ts`(수정 — **T2만 수정**)
- 완료 기준: 빌드 성공. React 무의존. `ScenarioDefinition = { scenarioId, name, description, siteUfid, seedId, topology: { mode: "sample"; setId } | { mode: "generate"; options }, eventId(실존), contactIds } + 단계 서술 목록`. 참조 id 전부 실존(모듈 로드 시 검출 헬퍼).

### Task T3: 토폴로지 임의 생성기 (순수 함수) + 레지스트리 확장 [PARALLEL]
- 목표: 공간 footprint 기반 토폴로지 임의 생성.
- 대상 파일: `app/src/domain/topology/generateTopology.ts`(신규), `topologyTypes.ts`(수정 — source에 "generated"), `registry.ts`(수정 — registerGeneratedSet, subscribeTopologySets; 저장 복원 시 source 보존 보정), `index.ts`(수정)
- 완료 기준: 빌드 성공. `generateTopology({ siteUfid, floors, spaces, seed?, options? }) → TopologySet`이 (a) 공간 footprint 무게중심 노드(대형 공간 그리드 보간), floorName=floorCode·slabName=spaceId·worldPosition은 plan 역변환+y=floor.elevation; (b) 같은 층: 복도(MV) 백본 상호 연결 + 방 노드→최근접 복도 연결; (c) 계단/엘리베이터 공간에 stair 수직 연결; (d) 1층 출입구 isExit; (e) 시드된 PRNG(mulberry32)로 결정성; (f) 단일 연결 요소(BFS 검증) — A*로 임의 두 노드 경로 가능. `pickPatrolEndpoints(set)` 헬퍼 포함. 기존 셋 기능 회귀 없음.

### Task T4: 시나리오 실행기 뷰 [AFTER: T1, T2, T3]
- 대상 파일: `app/src/scenario/ScenarioPage.tsx`(스텁 채움 — 이후 소유), `useScenarioRunner.ts`, `ScenarioStepCard.tsx`, `ContactRoster.tsx`, `scenario.css`(신규)
- 완료 기준: 빌드 성공. ① 시나리오 셀렉트 + 개요/담당자 표시 ② "토폴로지 생성": generateTopology→registerGeneratedSet→요약 + "공간 모델에서 보기"(뷰 전환) ③ "SOP 로드": loadDomainTemplate(seedId) 후 생성 셋이면 패트롤 노드 속성(topologySetId/start/end/checkpoints)을 updateNodeProperty로 치환(pickPatrolEndpoints) ④ "검증·컴파일": runValidate/runCompile + 이슈 요약 ⑤ "실행": eventId로 createRun→saveRun, 임무 요약 + 미니 컨트롤/Execution 탭 안내 ⑥ "회신": responder 이동 + "자동 회신"(REPORT_ACTION) ⑦ "대시보드" 이동. 단계 순차 활성화. data-tutorial-id 부여. 토큰만.

### Task T5: 순수 WebGL 3D 뷰어 + 공간 모델 뷰 통합 [AFTER: T3]
- 대상 파일: `app/src/spatial/webgl/mat4.ts`, `orbitCamera.ts`, `meshBuilders.ts`(볼록 footprint fan triangulation 압출/노드 마커/링크 GL_LINES/층 슬래브), `renderer.ts`(셰이더/버퍼/드로우, 램버트), `app/src/spatial/SpaceViewer3D.tsx`(canvas + 층 표시/숨김 + 토큰 색 해석), `SpatialModelPage.tsx`(수정 — 2D/3D 토글, subscribeTopologySets로 생성 셋 즉시 반영 — **T5가 유일 소유자**), `spatial.css`(수정)
- 완료 기준: 빌드 성공(의존성 0). 3D 뷰: 층/공간 프리즘(division 색)+시설물 마커+토폴로지 노드·링크(수직 포함)+orbit/zoom+층 표시/숨김. 색은 getComputedStyle 토큰 파싱만(hex/rgb 리터럴 금지). 2D 모드 회귀 없음. `spatial-3d-toggle` id. WebGL context lost 방어.

### Task T6: 단계별 조작 튜토리얼 오버레이 [AFTER: T1, T4, T5]
- 대상 파일: `app/src/tutorial/TutorialOverlay.tsx`(스텁 채움), `tutorialSteps.ts`, `useTargetRect.ts`([data-tutorial-id] rect 추적: resize/스크롤/rAF), `tutorial.css`(신규), `StudioToolbar.tsx`·`BottomTabs.tsx`·`DashboardPage.tsx`·`ResponderPage.tsx`(수정 — id 속성만)
- 완료 기준: 빌드 성공. "튜토리얼" 시작 → 스텝마다 (a) 필요 시 뷰 자동 전환 (b) 하이라이트 박스+SVG 마우스 커서 아이콘+말풍선(설명·순번) (c) 다음/이전/닫기 (d) 대상 미존재 시 중앙 안내 폴백. 엔드투엔드 흐름 최소 10스텝(공간 모델 2D→3D → 시나리오 선택→토폴로지 생성→SOP 로드 → Studio 검증/컴파일 → 실행 → 현장 회신 → 대시보드). fixed 최상위, 토큰만, 닫으면 완전 제거.

### Task T7: 통합 마감 — 엔드투엔드 데모 검증 + 회귀/번들 점검 [AFTER: T1~T6]
- 대상 파일: 결함 수정 임의, `app/vite.config.ts`(선택 — manualChunks로 xyflow 벤더 분리), `단계별 개발내용.txt`(6단계 기록)
- 완료 기준: ① 빌드 성공(타입 에러 0) ② 엔드투엔드: "검증용 건물 야간 순찰 종합 데모" — 토폴로지 임의 생성→3D 뷰 확인→SOP 로드(패트롤 경로 생성 셋 치환)→검증 0→실행→PATROL 로그→회신→대시보드 반영 ③ LH2 시나리오 동일 통과 ④ Phase 1~8 회귀 스팟체크 ⑤ 신규 하드코딩 hex/rgb 없음(WebGL 토큰 파서 제외 확인) ⑥ localStorage 초기화 상태에서도 전체 흐름 동작.

**실행 순서**: Wave 1 = T1·T2·T3 병렬 → Wave 2 = T4·T5 병렬 → Wave 3 = T6 → Wave 4 = T7.
