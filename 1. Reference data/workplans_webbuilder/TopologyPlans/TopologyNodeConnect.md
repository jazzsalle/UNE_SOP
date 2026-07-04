# 토폴로지 노드 연결 기능

## 목적
- 토폴로지 노드를 선택하여 인접 이웃 노드로 연결하는 기능

## 요청사항
- 연결 동작에 대해 Undo/Redo를 적용하여 Undo/Redo History가 없어지기 전까지는 정보를 유지하고, Undo시 연결했던 인접 이웃 노드 정보가 연결 해제 되어야함(목록에서 제거)
- src/WebEditor/undoredo/undoRedoTopologyCommands.ts 파일내 ConnectTopologyNodeCommand 클래스로 구현할 것
- 하단 예시의 3~5번에서 노드에 마우스 호버시 색상처리는 마우스 클릭 선택, 초기화 노드 선택등의 처리와 유사하게 처리할 것
- 노드 연결은 무조건 마우스 클릭으로 1:1 연결만 수행하며 드래그를 통한 다중 선택, 다중 연결을 허용하지 않음
  - 기본적으로 드래그 동작을 막되 알 수 없는 이유로 드래그 동작이 발동한다면 무시할것

## 사용자 동작, 기능 작동 예시
1. 토폴로지 패널의 '연결' 버튼 클릭하여 노드 연결 상태 진입
2. 노드 연결 기능 On
   - 기능을 On하게 되고 최초로 대응해야할 동작은 '시작노드 지정' 상태
3. '시작노드 지정' 상태에서 원하는 토폴로지 노드를 마우스 클릭으로 선택
4. 3번 동작에서 '시작노드'가 선택이 되면 바로 '종료노드 지정' 상태로 진입
5. '종료노드 지정' 상태에서 원하는 토폴로지 노드를 마우스 클릭으로 선택
6. '시작노드'와 '종료노드'에 해당하는 노드들의 인접이웃노드 정보에 서로의 노드 정보가 추가되도록 구현(시작<=>종료 상호 연결)
7. 3번동작으로 돌아가서 기능이 Off 되기 전까지 반복

## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것

---

## 작업 진행 기록 (작업자: Antigravity)

### 1. 설계 및 구현 계획
- **연결 모드 추가**: `WebEditor`의 토폴로지 노드 편집 모드(`setTopologyNodeEditMode`)에 `"connect"` 모드를 신설하고, `TopologyManager`에서 `ConnectEnabled` 제어 플래그를 제공하도록 설계.
- **클릭 상태 머신**: `TopologyManager` 내부에서 `startNodeId`를 상태로 관리하여, 첫 번째 클릭 시 시작 노드를 캡처(진한 붉은색 `COLOR_SELECTED` 시각 피드백 유지)하고, 두 번째 클릭 시 상호 연결 이벤트를 발행하도록 구성.
- **드래그 및 Shift 다중 선택 무시**: 1:1 클릭 상호 연결을 강제하기 위해, 연결 모드일 때는 드래그 영역 수집 및 Shift 클릭 다중 선택 동작을 차단하도록 제어 로직을 추가.
- **Undo/Redo 연계**: `ConnectTopologyNodeCommand`를 구현하여 실행(`execute`) 시 노드 간 상호 이웃 관계 등록, 취소(`undo`) 시 이웃 관계 해제를 수행하도록 설계.
- **예외 처리 (중복/자기 자신 연결)**:
  - 시작 노드와 종료 노드가 동일하거나 이미 이웃 관계로 등록된 경우에는 이벤트 발행을 무시하여 불필요한 Undo/Redo 커맨드가 생성되지 않도록 제한.

### 2. 구현 내역
- **[undoRedoTopologyCommands.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/undoredo/undoRedoTopologyCommands.ts)**:
  - `ConnectTopologyNodeCommand` 클래스 추가 및 캡슐화를 위해 `topologyManager.connectNodes`/`disconnectNodes` 호출 연계.
- **[topologyManager.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/topology/topologyManager.ts)**:
  - `onNodeConnectRequested` 이벤트 선언.
  - `connectEnabled`, `startNodeId`를 통한 1:1 연결 상태 머신 구현 및 드래그/다중 선택 방지 처리.
  - `connectNodes()`, `disconnectNodes()` API 구현 및 visual mesh 동적 업데이트(`rebuildMesh()`) 연동.
- **[webEditor.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/webEditor.ts)**:
  - `"connect"` 편집 모드 정의 추가 및 `onNodeConnectRequested` 이벤트 발생 시 `ConnectTopologyNodeCommand` 호출 연계.
- **[TopologyPanel.tsx](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/app/components/panels/TopologyPanel.tsx)**:
  - '연결' 버튼과 `"connect"` 에디터 모드 연동.

### 3. 테스트 및 검증 결과
- **TypeScript 빌드 및 타입 검사**:
  - `npx tsc --noEmit` 명령 실행 결과 빌드 에러 없이 성공적으로 패스 완료.
- **수동 기능 검증 시나리오**:
  - 연결 모드 진입 및 시작 노드 지정 시의 시각 피드백 유지 정상 동작 확인.
  - 종료 노드 지정 시 연결선 생성 및 시작 노드 선택 상태 복원 정상 동작 확인.
  - Ctrl+Z / Ctrl+Y 실행을 통한 Undo/Redo의 연결선 삭제 및 복구 정상 동작 확인.
  - 중복 연결 및 자기 자신 클릭 시 연결을 무시하며 히스토리를 생성하지 않는 가드 정상 동작 확인.
  - 드래그를 통한 다중 노드 획득 방지 정상 동작 확인.