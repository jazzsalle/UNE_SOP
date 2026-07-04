# 토폴로지 노드 연결 기능 (단일)

## 목적
- 토폴로지 노드를 선택하여 인접 이웃 노드를 제거하는 기능(단일)
- ClearConnectionTopologyNodeCommand 과는 다르게 시작노드-종료노드를 선택하여 하나씩 제거하는 기능임

## 요청사항
- 토폴로지 패널의 '연결 해제' 버튼 활성화 상태와 연계하여 기능의 On/Off 처리 적용
- 연결 해제 동작에 대해 Undo/Redo를 구현하여 Undo/Redo History가 없어지기 전까지 정보를 유지하고 Undo시 끊어졌던 연결 상태가 복구되어야함
- 마찬가지로 Redo시 연결 정보가 해제되어야함(인접 이웃 노드 목록에서 제거)
- '연결 정보만 끊어낸다'라는 기능 자체는 ClearConnectionTopologyNodeCommand 와 동일하며, 처리하는 단위가 모든 연결 상태가 아닌 하나씩 제거하는 형태가됨
- 관련 Undo/Redo 클래스는 DisconnectTopologyNodeCommand 클래스로 구현할것
- 노드 연결 해제는 마우스 클릭-클릭으로 1:1 연결에 대해서만 해제를 수행하며 드래그 동작이 발생한다면 무시할것
- 하단 예시에서 3~5번에 해당하는 동작을 수행할때 색상은 마우스 클릭 선택, 초기화 노드 선택등의 처리와 유사하게 구현할 것

## 사용자 입력 및 기능 동작 예시
1. 토폴로지 패널의 '연결 해제' 버튼을 클릭하여 노드 연결 해제 상태로 진입
2. 노드 연결 해제 기능 On
   - 기능을 On하고나서 대응해야할 동작은 '시작 노드 지정' 상태
3. '시작 노드 지정' 상태에서 원하는 토폴로지 노드를 마우스 클릭으로 선택하고 '종료 노드 선택' 상태로 전환
4. '종료 노드 선택' 상태에서 원하는 토폴로지 노드를 마우스 클릭으로 선택
5. 각각의 시작노드와 종료노드의 TopologyNode정보중 인접 이웃 노드를 가지고 있는 neighbors에서 서로에 대한 정보를 제거
6. 3번 동작으로 돌아가서 기능이 Off 되기 전까지 반복

## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것

---

## 작업 진행 기록 (작업자: Antigravity)

### 1. 설계 및 구현 계획
- **연결 해제 모드 추가**: `WebEditor`의 토폴로지 노드 편집 모드(`setTopologyNodeEditMode`)에 `"disconnect_edge"` 모드를 신설하고, `TopologyManager`에서 `DisconnectEdgeEnabled` 제어 플래그를 제공하도록 설계.
- **클릭 상태 머신**: `TopologyManager` 내부에서 `startNodeId`를 상태로 관리하여, 첫 번째 클릭 시 시작 노드를 캡처(진한 붉은색 `COLOR_SELECTED` 시각 피드백 유지)하고, 두 번째 클릭 시 상호 연결 해제 이벤트를 발행하도록 구성.
- **드래그 및 Shift 다중 선택 무시**: 1:1 클릭 상호 연결 해제를 강제하기 위해, 단일 연결 해제 모드일 때는 드래그 영역 수집 및 Shift 클릭 다중 선택 동작을 차단하도록 제어 로직을 추가.
- **Undo/Redo 연계**: `DisconnectTopologyNodeCommand`를 구현하여 실행(`execute`) 시 노드 간 상호 이웃 관계 해제, 취소(`undo`) 시 이웃 관계 다시 등록을 수행하도록 설계.
- **예외 처리 (무관계 노드 해제 가드)**:
  - 시작 노드와 종료 노드가 동일하거나 이웃 관계가 아닐 경우 이벤트를 무시하고 Undo/Redo 커맨드도 생성하지 않도록 설계.

### 2. 구현 내역
- **[undoRedoTopologyCommands.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/undoredo/undoRedoTopologyCommands.ts)**:
  - `DisconnectTopologyNodeCommand` 클래스 추가 및 `topologyManager.disconnectNodes`/`connectNodes` 호출 연계.
- **[topologyManager.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/topology/topologyManager.ts)**:
  - `onNodeDisconnectEdgeRequested` 이벤트 선언.
  - `disconnectEdgeEnabled` 변수를 통한 1:1 연결 해제 상태 머신 구현 및 드래그/다중 선택 방지 처리.
  - `DisconnectEdgeEnabled` getter/setter 추가.
- **[webEditor.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/webEditor.ts)**:
  - `"disconnect_edge"` 편집 모드 정의 추가 및 `onNodeDisconnectEdgeRequested` 이벤트 발생 시 `DisconnectTopologyNodeCommand` 호출 연계.
- **[TopologyPanel.tsx](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/app/components/panels/TopologyPanel.tsx)**:
  - '연결 해제' 버튼과 `"disconnect_edge"` 에디터 모드 연동.

### 3. 테스트 및 검증 결과
- **TypeScript 빌드 및 타입 검사**:
  - `npx tsc --noEmit` 명령 실행 결과 빌드 에러 없이 성공적으로 패스 완료.
- **수동 기능 검증 시나리오**:
  - 단일 연결 해제 모드 진입 및 시작 노드 지정 시의 시각 피드백 유지 정상 동작 확인.
  - 종료 노드 지정 시 연결선 해제 및 시작 노드 선택 상태 복원 정상 동작 확인.
  - Ctrl+Z / Ctrl+Y 실행을 통한 Undo/Redo의 연결선 복구 및 재삭제 정상 동작 확인.
  - 무관계 노드 클릭 시 해제를 무시하며 히스토리를 생성하지 않는 가드 정상 동작 확인.
  - 드래그를 통한 다중 노드 획득 방지 정상 동작 확인.