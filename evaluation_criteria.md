# Evaluation Criteria — Phase별 합격 기준

evaluator는 각 Phase의 체크리스트를 검증해 PASS/FAIL을 판정한다. 모든 항목은 객관적으로 검증 가능해야 한다.

## 공통 기준 (모든 Phase)

- [ ] `app/`에서 `npm run build` 성공 (타입 에러 0)
- [ ] 기존 Phase의 기능이 회귀 없이 동작 (관련 코드/화면 유지)
- [ ] UI 신규 요소는 디자인 시스템 가이드의 토큰/컴포넌트 규칙을 따름

## Phase 1 — 스캐폴딩

- [ ] `app/` 아래 Vite + React + TypeScript 프로젝트 존재 (`package.json`, `tsconfig.json`, `vite.config.*`)
- [ ] `@xyflow/react` 의존성 설치됨
- [ ] 디자인 토큰(css)이 프로젝트에 임포트되어 적용됨
- [ ] 3패널 레이아웃 렌더링: 좌측 Node Palette 영역, 중앙 캔버스 영역, 우측 Property Inspector 영역, 하단 Validation/Compile Panel 영역
- [ ] git 저장소 초기화 및 `.gitignore`(node_modules 등) 존재
- [ ] `npm run dev`로 빈 Graph Studio 화면 확인 가능

## Phase 2 — 도메인 타입 + 노드 템플릿

- [ ] `app/src/domain/`(또는 상응 위치)에 타입 정의 존재: `NodeType`(14종: event, space_scope, asset_filter, condition, branch, sop_task, sop_group, role, notification, timer, escalation, situation_board, evidence, data_mapper), `PortDataType`(10종), `GraphNode`, `NodePort`, `GraphEdge`, `EdgeType`(8종), `SOPGraph`, `EventContext`, `ExecutionPlan`, `RuntimeMission`, `ValidationIssue`
- [ ] 노드 템플릿 정의: Trigger(Sensor Event/Manual Report/AI Detection), Scope(Facility/Zone/Evacuation Area), Object(Sensor/Equipment/CCTV/Valve), Logic(Condition/AND-OR/Branch), SOP(SOP Task/SOP Group/Checklist), People(Role/Contact Group/Agency), Action(SMS/App Push/Broadcast), Runtime(Situation Board/Timer/Escalation), Record(Evidence/Report/History)
- [ ] 각 템플릿에 기본 속성 + 입력/출력 포트(dataType 포함) 정의됨

## Phase 3 — Graph Studio UI

- [ ] Node Palette에서 캔버스로 드래그앤드롭하면 해당 타입의 기본 속성/포트를 가진 노드 생성
- [ ] 커스텀 노드가 타입별 색상/헤더/포트(핸들)를 표시
- [ ] 노드 포트 간 엣지 연결 가능, 포트 dataType이 호환되지 않으면 연결 제한 또는 오류 표시
- [ ] 노드 클릭 시 Property Inspector에 속성이 표시되고 편집이 노드 상태에 반영됨
- [ ] SOP Group 노드: 내부 Task 목록 표시, 접기/펼치기 동작
- [ ] MiniMap / Controls / Background 적용

## Phase 4 — 검증·컴파일·시뮬레이션·Runtime Preview (1단계 완료)

- [ ] Validate: 필수 입력 포트, 필수 속성, 포트 타입, 고립 노드, 도달 불가 경로, 순환 참조 검증 결과를 Validation Panel에 표시
- [ ] Compile: React Flow 상태를 normalize하여 `SOPGraph` JSON 생성·Preview 표시, localStorage 저장
- [ ] Simulate: 샘플 EventContext 선택 → Trigger 매칭 → Condition 평가 → 실행 경로 계산 → 캔버스 하이라이트
- [ ] Runtime Preview: 생성된 임무(RuntimeMission), 전파 Mock, 응답/미응답 분기, 상황판 기록 Mock, 실행 타임라인 표시
- [ ] 도메인 템플릿 4종(액화수소 플랜트/발전소/안전한국훈련/일반 사업장) 불러오기 → 캔버스 배치
- [ ] **승인 기준 플로우** 재현 가능: Event → Space Scope → Asset Filter → Condition → SOP Group → Notification → Branch → Situation Board

## Phase 5 — SOP 실행기 + 전자상황판 대시보드 (2단계)

- [ ] 컴파일된 SOPGraph를 실행하는 실행기 존재 (임무 상태 전이: SENT→RUNNING→COMPLETED/DELAYED/FAILED)
- [ ] 실행이력 로그 기록 (장소/시간/임무내용/상황전파 내용 포함, localStorage 또는 파일)
- [ ] 전자상황판 대시보드: 실행이력을 관리자가 점검할 수 있는 화면 (훈련 시 확인 용도 포함)
- [ ] 실행 결과가 대시보드에 반영됨을 시연 가능

## Phase 6 — 공간 스키마 + 3D 공간 모델링 (3단계)

- [ ] 실내공간정보 구축 작업규정(별표 2 레이어 분류체계, 별표 3 표준데이터 사양, 별표 5 명명규칙, 별표 6 속성입력) 분석 문서 존재
- [ ] 분석에 근거한 공간 스키마(레이어 분류/명명규칙/속성) 타입·데이터 정의 존재
- [ ] 검증용 3D 공간 모델(샘플 건물/층/공간 데이터) 구축
- [ ] 1단계 Space Scope/Asset 노드가 공간 스키마와 연동되도록 보완됨

## Phase 7 — 토폴로지 연동 (4단계)

- [ ] workplans_webbuilder 문서 분석: 토폴로지 개념·정의·구조·스키마 정리 문서 존재
- [ ] 토폴로지 스키마(노드/링크, 내비 메시 기반, 수직 노드 연결) 타입 정의 존재
- [ ] 층별/특정 토폴로지 셋 임포트 기능 (webbuilder에서 전달된다는 가정의 샘플 데이터 사용)
- [ ] 토폴로지를 SOP 그래프와 연결하는 노드/컴포넌트 존재 (예: 패트롤 경로 + 특정 노드에서 점검 임무 수행 시나리오 표현 가능)

## Phase 8 — 조치결과 회신 웹앱 (5단계)

- [ ] 외부 점검자/안전관리자용 웹앱(또는 라우트): 상황전파 내용 수신·조회 화면
- [ ] 조치사항 완료 처리·회신 기능
- [ ] 회신 이력이 실행이력 로그에 기록되고 전자상황판 대시보드에 표시됨

## Phase 9 — 통합 시나리오 실행기 + 튜토리얼 (6단계)

- [ ] 전 단계를 아우르는 seed data (공간, 이벤트, SOP, 토폴로지, 담당자)
- [ ] 시나리오 실행기: seed 기반 시나리오 선택·실행, 토폴로지를 임의 생성해 공간에 표현/연결
- [ ] 간단한 WebGL 뷰어로 공간/토폴로지 표시
- [ ] 단계별 조작 튜토리얼: 마우스 커서 위치 등을 표기하여 따라할 수 있음
- [ ] 공간→이벤트→SOP→토폴로지→실행→회신→대시보드의 엔드투엔드 데모 시연 가능
