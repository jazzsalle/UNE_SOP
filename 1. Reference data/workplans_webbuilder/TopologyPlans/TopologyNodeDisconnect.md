# 토폴로지 노드 연결 해제

## 목적
- 지정한 토폴로지 노드의 연결상태를 아무것도 없는 상태로 만드는 기능 구현

## 요청사항
- 토폴로지 패널의 초기화 버튼 활성화 상태와 연계하여 기능의 On/Off 처리 적용
- 연결해제 동작에 대해 Undo/Redo를 적용하여 Undo/Redo History가 없어지기 전까지 정보를 유지하고 Undo시 끊어졌던 연결 상태가 복구되어야함
- 버튼의 이름이 초기화지만 실제로 노드의 상태를 Reset이나 Clear한다는 의미가 아니고 단순히 토폴로지 노드의 연결정보는 끊어내는 역할을 하는 기능 구현 요청
- 버튼의 이름은 '초기화'로 유지하고 구현되는 Undo/Redo클래스는 ClearConnectionTopologyNodeCommand 클래스로 구현 할 것

## 사용자 동작 예시
1. 토폴로지 패널 초기화 버튼 클릭하여 활성화 상태 진입
2. 토폴로지 노드 초기화 기능 On
3. 월드에 생성되어있는 노드를 마우스 클릭으로 선택
   - 이때 클릭하기전에 마우스로 이동하다가 토폴로지 노드위로 마우스 호버 상태라면 해당 노드의 색상을 선택 대기 상태로 설정
4. 작업을 다 했으면 버튼을 다시 클릭하여 기능 Off를 하거나 Esc키로 종료
   - 다른 메뉴가 활성화 된다면 마찬가지로 기능 Off처리

## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것

---

## 구현 계획 (작업자: Claude)

### 확정된 동작 (사용자 확인)
- '초기화' 버튼을 누르면 연결해제 모드 진입(배타 선택 모드와 동일하게 토폴로지 노드만 호버/대상화).
- **노드 클릭 즉시 해당 노드의 모든 연결을 해제**(클릭당 1회, Undo 1건). 별도 적용 단계 없음.
- 연결 해제 후 노드는 **기본 상태(파란색)로 복귀**(선택 상태로 두지 않음). 연결선만 사라짐.
- 모드 Off: 버튼 재클릭 / Esc / 다른 메뉴(탭) 활성화 시.

### 현황 분석
- '선택' 모드는 `setTopologyNodeSelectEnabled` → `TopologyManager.SelectEnabled`(=true 시 isSelectAvailable) + `ObjectSelector.setExclusiveSelectable(topology)` 로 배타 선택 구현됨.
- 클릭 시 `ObjectSelector.onPointerUp` → `TopologyManager.setRaycastIntersection`(hoveringNodeId) → `setMaterialSelected()`. 호버는 `setMaterialSelectReady()`.
- '초기화' 도구는 `TopologyPanel.tsx`의 `CreateTab` 안 `EDIT_TOOLS`/`activeTool`로 관리(현재 WebEditor 미연동).
- 노드 연결은 양방향 엣지(선)로 렌더링되므로, "연결 없음"이 되려면 해당 노드에 **연결된 모든 엣지(나가는+들어오는)** 를 제거해야 한다.

### 설계
1. **`TopologyManager` 확장**
   - `EventDispatcher` 상속(`onNodeDisconnectRequested: { nodeId }` 이벤트 발행). 클릭 시 webEditor가 받아 커맨드 생성.
   - `disconnectEnabled` 플래그 + `DisconnectEnabled` 게터/세터(전환 시 호버/선택 상태 초기화).
   - `isSelectAvailable = (selectEnabled || disconnectEnabled) && nodeSelectRoot.visible` 로 변경(연결해제 모드도 호버/레이캐스트 가능).
   - `setMaterialSelected()`에 분기: `disconnectEnabled`면 클릭(호버)/드래그 노드 ID로 `onNodeDisconnectRequested` 발행 후 선택 처리 생략.
   - `clearNodeConnections(nodeId)`: 해당 노드의 나가는/들어오는 엣지 전부 제거 + 메시 재구축.
   - `restoreNodeConnections(nodeId, neighborIds, incomingIds)`: 캡처된 엣지 양방향 복원 + 메시 재구축.
   - `clear()`에 `disconnectEnabled=false` 초기화 추가.
2. **`undoRedoTopologyCommands.ts`에 `ClearConnectionTopologyNodeCommand` 추가** (요청사항)
   - 생성자에서 대상 노드의 `neighborIds`(나가는)+`incomingIds`(들어오는) 1회 캡처.
   - `execute()`→`clearNodeConnections`, `undo()`→`restoreNodeConnections`. redo는 execute 재호출로 안전.
3. **`webEditor.ts`**
   - 기존 `setTopologyNodeSelectEnabled`를 통합 메서드 `setTopologyNodeEditMode(mode: 'none'|'select'|'disconnect')`로 정리(배타 대상 1회 설정으로 순서 충돌 방지).
   - `topologyManager.onNodeDisconnectRequested` 리스너에서 `ClearConnectionTopologyNodeCommand` 실행.
4. **`TopologyPanel.tsx`(CreateTab)**
   - 편집 도구 클릭 시 `editor.setTopologyNodeEditMode(nextTool==='선택'?'select':nextTool==='초기화'?'disconnect':'none')` 호출(생성 도구의 `ActiveCreatorKey` 처리는 유지).
   - Esc 키 입력 시 활성 편집 도구 해제 + 모드 off.
   - CreateTab 언마운트(탭 전환/패널 이탈) 시 모드 off cleanup.

### 작업 단계
1. `topologyManager.ts`: EventDispatcher 상속, disconnect 플래그/모드, `clearNodeConnections`/`restoreNodeConnections`, setMaterialSelected 분기.
2. `undoRedoTopologyCommands.ts`: `ClearConnectionTopologyNodeCommand` 추가.
3. `webEditor.ts`: `setTopologyNodeEditMode` 통합 + 이벤트 리스너 + import.
4. `TopologyPanel.tsx`: 편집 도구→모드 연동, Esc, 언마운트 cleanup.
5. 타입체크 및 동작 테스트.

### 테스트 체크리스트 (런타임)
- [x] '초기화' 버튼 활성화 시 노드 호버 색(연한붉은) 표시
- [x] 노드 클릭 즉시 그 노드의 연결선이 모두 사라지고 노드는 파란색 유지
- [x] Undo 시 끊었던 연결(연결선) 복구, Redo 시 다시 해제
- [x] 버튼 재클릭/Esc/다른 탭 전환 시 모드 Off
- [x] '초기화' 모드에서 일반 객체(벽/기둥) 선택 불가(배타)

---

## 진행 상황 (작업자: Claude)

### 구현 완료 내역
1. **`topology/topologyManager.ts`**
   - `EventDispatcher<TopologyManagerEventMap>` 상속 + 생성자 `super()` 추가. `onNodeDisconnectRequested: { nodeId }` 이벤트 정의.
   - `disconnectEnabled` 필드 + `DisconnectEnabled` 게터/세터(전환 시 호버/선택 상태 초기화·색 복원).
   - `isSelectAvailable = (selectEnabled || disconnectEnabled) && nodeSelectRoot.visible` 로 변경.
   - `setMaterialSelected()` 선두 분기: `disconnectEnabled`면 클릭(호버)/드래그 노드 ID로 `onNodeDisconnectRequested` 발행 후 return(선택 처리 안 함).
   - `clearNodeConnections(nodeId)`: 나가는+들어오는 엣지 전부 제거 후 메시 재구축.
   - `restoreNodeConnections(nodeId, neighborIds, incomingIds)`: 양방향 엣지 복원 후 메시 재구축.
   - `clear()`에 `disconnectEnabled=false` 추가.
2. **`undoredo/undoRedoTopologyCommands.ts`**
   - 하단에 `ClearConnectionTopologyNodeCommand` 추가. 생성자에서 대상 노드의 나가는/들어오는 엣지 1회 캡처. `execute()`→`clearNodeConnections`, `undo()`→`restoreNodeConnections`. redo는 execute 재호출로 안전.
3. **`webEditor.ts`**
   - 기존 `setTopologyNodeSelectEnabled`를 `setTopologyNodeEditMode('none'|'select'|'disconnect')`로 통합(배타 대상 1회 설정 → 모드 전환 순서 충돌 방지).
   - `topologyManager.onNodeDisconnectRequested` 리스너에서 `ClearConnectionTopologyNodeCommand` 실행. import 추가.
4. **`app/components/panels/TopologyPanel.tsx` (CreateTab)**
   - 편집 도구 클릭 시 `editor.setTopologyNodeEditMode(...)`로 select/disconnect/none 전달.
   - Esc 키로 활성 편집 도구 종료(모드 off + activeTool 해제).
   - CreateTab 언마운트(탭 전환/패널 이탈) 시 편집 모드 off cleanup.

### 설계 핵심
- 연결은 양방향 엣지로 렌더되므로 "연결 없음"을 위해 대상 노드에 연결된 모든 엣지(나가는+들어오는)를 제거. Undo 복원은 캡처한 양방향 엣지를 `includes` 가드로 재연결.
- 연결 해제 동작 자체는 ObjectSelector 선택 플로우(클릭→setMaterialSelected)를 재사용하되, disconnect 모드에서는 선택 대신 이벤트를 발행하여 커맨드로 처리(노드는 선택 상태가 되지 않고 파란색 유지).

### 테스트 결과
- `npx tsc --noEmit` 타입체크 **통과**(오류 없음).
- 런타임(브라우저) 동작 확인: **완료** — 상단 체크리스트 전 항목 정상 동작 확인(사용자 확인 완료).