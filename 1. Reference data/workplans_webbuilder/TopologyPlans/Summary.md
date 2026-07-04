# 토폴로지 작업 요약 (2026-06-25 ~ 06-26, 작업자: Claude / Antigravity)

토폴로지 노드 관련 기능 구현 내역 요약입니다.
세부 계획/진행상황/테스트는 각 항목의 개별 문서를 참고하세요.
(1~6: 노드 편집/목록, 7~8: 06-26 테스트 탭/경로 테스트)

## 커밋 이력 (feature/topology)
| 커밋 | 내용 |
|------|------|
| `1ad2a5c` | 토폴로지 노드 선택 처리 |
| `e0d79f4` | 토폴로지 노드 선택 상태 버튼 연계 |
| `23553c5` | 토폴로지 제거 기능 구현 및 Undo/Redo 적용 |
| `e35a15f` | 토폴로지 노드 연결 초기화 기능 구현 및 Undo/Redo 적용 |

---

## 1. 토폴로지 노드 선택 ([TopologyNodeSelect.md](./TopologyNodeSelect.md))

### 목적
공간상에 생성된 토폴로지 노드를 클릭/드래그로 선택 가능하도록 구현.

### 구현 요약
- `TopologyManager`가 `SelectableObject` 인터페이스를 구현하여 `ObjectSelector`에 등록.
- 노드 렌더링(`InstancedMesh`)에 `setColorAt` 기반 인스턴스별 색상 적용.
  - 기본=파란색(`0.10,0.35,0.85`), 선택대기(호버)=연한 붉은색(`0.9,0.45,0.45`), 선택=진한 붉은색(`0.8,0.1,0.1`).
- 메시가 `rebuildMesh()`마다 새로 생성되어도 선택 등록이 깨지지 않도록 안정적 `nodeSelectRoot` Group을 SelectRoot로 사용(이웃 연결선은 raycast 제외).
- 클릭/드래그/Shift 다중 토글 선택 지원. 선택 상태는 매니저 내부에 transient 보관(직렬화 미영향).

### 선택 모드 게이팅(배타 모드)
- 토폴로지 패널 '노드 편집' → '선택' 활성 시에만 노드 선택 가능.
- 활성 시 **토폴로지 노드만** 선택되고 벽/기둥 등 일반 객체는 선택 불가(배타).
- `ObjectSelector.setExclusiveSelectable` + `TopologyManager.SelectEnabled` 조합으로 구현.

### 주요 변경 파일
- `topology/topologyManager.ts`, `objectSelector.ts`, `webEditor.ts`, `app/components/panels/TopologyPanel.tsx`

---

## 2. 토폴로지 노드 삭제 ([TopologyNodeDelete.md](./TopologyNodeDelete.md))

### 목적
선택 모드에서 노드를 선택하고 Delete 키로 제거(Undo/Redo 지원).

### 구현 요약
- `WebEditor.deleteSelection()`에 토폴로지 분기 추가: '선택' 모드면 선택 노드들을 `DeleteTopologyNodeCommand`로 제거.
- `undoRedoTopologyCommands.ts`에 `DeleteTopologyNodeCommand` 추가.
  - 생성자에서 노드 데이터 + 이웃 관계(나가는/들어오는 엣지)를 1회 캡처 → Undo/Redo 반복에도 동일 정보 유지.
- `TopologyManager`: `getSelectedNodeIds()`, `removeNodes()`, `restoreNodes()` 추가.
- 복원 시 다른 노드가 가리키던 참조(들어오는 엣지)까지 양방향 재연결하여 연결선까지 원상복구.

### 주요 변경 파일
- `topology/topologyNode.ts`(`TopologyNodeRestoreData` 추가), `topology/topologyManager.ts`, `undoredo/undoRedoTopologyCommands.ts`, `webEditor.ts`

---

## 3. 토폴로지 노드 연결 해제(초기화) ([TopologyNodeDisconnect.md](./TopologyNodeDisconnect.md))

### 목적
지정한 노드의 연결 상태를 모두 끊어 연결 없는 상태로 만드는 기능(노드 자체는 유지).

### 구현 요약
- 토폴로지 패널 '초기화' 버튼과 연계한 배타 모드. 노드 **클릭 즉시** 해당 노드의 모든 연결 해제(클릭당 Undo 1건), 해제 후 노드는 파란색 유지.
- `TopologyManager`가 `EventDispatcher` 상속 → 해제 모드에서 클릭 시 `onNodeDisconnectRequested` 이벤트 발행 → `WebEditor`가 `ClearConnectionTopologyNodeCommand` 실행.
- `undoRedoTopologyCommands.ts`에 `ClearConnectionTopologyNodeCommand` 추가.
  - 생성자에서 나가는/들어오는 엣지 1회 캡처. `execute`→연결 해제, `undo`→양방향 복원.
- `TopologyManager`: `DisconnectEnabled`, `clearNodeConnections()`, `restoreNodeConnections()` 추가.
- 모드 On/Off: 버튼 재클릭 / Esc / 다른 탭 전환(CreateTab 언마운트) 시 해제.
- `WebEditor`: 기존 `setTopologyNodeSelectEnabled`를 `setTopologyNodeEditMode('none'|'select'|'disconnect')`로 통합(모드 전환 순서 충돌 방지).

### 주요 변경 파일
- `topology/topologyManager.ts`, `undoredo/undoRedoTopologyCommands.ts`, `webEditor.ts`, `app/components/panels/TopologyPanel.tsx`

---

## 공통 설계 메모
- **선택 인프라 재사용**: 선택/삭제/연결해제 모두 `ObjectSelector` 선택 플로우 + 배타 모드(`setExclusiveSelectable`)를 공유. 모드는 `setTopologyNodeEditMode`로 일원화.
- **이웃 관계 복원**: 연결은 양방향 엣지로 렌더되므로, Undo 복원 시 나가는 엣지뿐 아니라 들어오는 엣지까지 캡처해 재연결(중복은 `includes` 가드).
- **Undo/Redo 정보 보존**: 모든 커맨드는 생성자에서 필요한 데이터를 1회 확정하여 History가 유지되는 동안 동일 정보로 복원.

## 상태
- 3개 기능 모두 `npx tsc --noEmit` 통과 및 런타임 동작 확인 완료, feature/topology 브랜치에 커밋됨(원격 push 보류 중).

---

## 4. 토폴로지 노드 연결 ([TopologyNodeConnect.md](./TopologyNodeConnect.md)) (작업자: Antigravity)

### 목적
공간에 생성된 토폴로지 노드를 마우스 클릭-클릭으로 1:1 상호 연결(Undo/Redo 지원).

### 구현 요약
- `TopologyManager`에 `connectEnabled`, `startNodeId` 내부 상태 관리 및 `connectNodes()` / `disconnectNodes()` API 추가.
- `setMaterialSelected`에 연결 모드 분기를 구현하여, 시작 노드 지정 시 시각적 선택 상태(`COLOR_SELECTED`)로 유지하고 종료 노드 선택 시 상호 이웃 관계에 서로를 추가하도록 `onNodeConnectRequested` 이벤트 발생.
- `webEditor.ts`에서 이벤트를 수신받아 `ConnectTopologyNodeCommand` 실행.
- `TopologyPanel.tsx`의 '연결' 버튼과 `setTopologyNodeEditMode("connect")` 연계.
- 드래그 및 Shift 다중 선택 차단 처리 적용. 이미 연결되었거나 동일한 노드 선택 시 가드 적용하여 중복 커맨드 생성 방지.

---

## 5. 토폴로지 노드 연결 해제(단일) ([TopologyNodeDisconnectSingle.md](./TopologyNodeDisconnectSingle.md)) (작업자: Antigravity)

### 목적
마우스 클릭-클릭으로 지정한 두 노드 사이의 1:1 연결만 해제(Undo/Redo 지원).

### 구현 요약
- `TopologyManager`에 `disconnectEdgeEnabled` 플래그 및 `DisconnectEdgeEnabled` getter/setter 구현.
- `setMaterialSelected`에 단일 연결 해제 모드 분기를 구현하여, 시작 노드를 `COLOR_SELECTED` 상태로 기억한 뒤 종료 노드 클릭 시 서로의 `neighbors`에서 제거하도록 `onNodeDisconnectEdgeRequested` 이벤트 발생.
- `webEditor.ts`에서 이벤트를 수신받아 `DisconnectTopologyNodeCommand` 실행.
- `TopologyPanel.tsx`의 '연결 해제' 버튼과 `setTopologyNodeEditMode("disconnect_edge")` 연계.
- 드래그 및 Shift 다중 선택 차단 처리 적용. 이웃 관계가 아니거나 동일한 노드 선택 시 가드 적용하여 무관계 해제 커맨드 생성 방지.

---

## 6. 토폴로지 노드 목록 ([TopologyNodeList.md](./TopologyNodeList.md)) (작업자: Claude)

### 목적
좌측 토폴로지 패널의 목업 노드 목록을 실제 생성된 토폴로지 노드들로 교체하고, 데이터/선택 변경을 패널이 자동 반영하도록 연동.

### 구현 요약
- 패널 목업(`CONNECTED_NODES`/`ISOLATED_NODES`) 제거 → `TopologyManager.getNodeList()` 실제 데이터로 교체. 표시 텍스트는 `displayName`, `neighbors` 유무로 '연결된/고립된 노드 목록' 분류.
- `TopologyManager`에 `onNodesChanged` 이벤트 추가: 모든 노드/연결 변경의 단일 길목인 `rebuildMesh()`(빈 상태 포함)와 메시 미재생성 경로인 `addNode()` 빠른 경로에서 발행.
  - 생성/제거/연결/연결해제/초기화/불러오기/Undo·Redo가 모두 이를 거치므로 목록이 연결↔고립으로 자동 이동.
- `TopologyManager`에 `onSelectionChanged` 이벤트 + `getNodeList()` / `selectNodesByIds()` 추가.
  - 목록 항목 클릭 → '선택' 모드 진입(`setTopologyNodeEditMode("select")`) + `selectNodesByIds()`로 3D 선택 연동(Shift 복수 토글).
  - 뷰포트 클릭/드래그/Shift 선택 및 선택모드 해제도 `onSelectionChanged`를 발행하여 목록 하이라이트가 양방향 동기화.
- 패널은 두 이벤트를 구독하여 목록·하이라이트를 자동 갱신(테스트 탭 경로 Select는 범위 밖이라 임시 목업 ID 유지).

### 주요 변경 파일
- `topology/topologyManager.ts`, `app/components/panels/TopologyPanel.tsx`

---

## 7. 테스트 탭 노드 드롭다운 연계 ([TopologyNodeList.md](./TopologyNodeList.md)) (작업자: Claude)

### 목적
테스트 탭의 '시작 노드'/'종료 노드' 드롭다운을 실제 생성된 토폴로지 노드와 연계.

### 구현 요약
- `TestTab`에 `editor` 전달, `getNodeList()`로 **모든** 노드(연결/고립 무관)를 옵션화(value=id, label=`displayName`).
- `onNodesChanged` 구독으로 생성/제거 시 드롭다운 자동 갱신, 삭제된 선택 노드는 자동 해제.
- **상호 배제**: 시작에서 고른 노드는 종료 옵션에서 제외(반대도 동일).

### 주요 변경 파일
- `app/components/panels/TopologyPanel.tsx`

---

## 8. 토폴로지 경로 테스트 ([TopologyTest.md](./TopologyTest.md)) (작업자: Claude)

### 목적
시작-종료 노드 간 A* 길찾기 수행 + 경로 시각화 + 경로 추종 애니메이션, 시작/종료 노드 표식 및 마우스 클릭 선택.

### 구현 요약
- **A\* 길찾기** (신규 `topology/topologyPathFinder.ts`): 이웃 그래프 + worldPosition 거리 기반 cost/휴리스틱. `findPath()` → 경로 `TopologyNode[]` 또는 null.
- **경로 시각화/흐름** (신규 `topology/topologyPathVisualizer.ts`): `CatmullRomCurve3` + `TubeGeometry`(녹색) 경로, `InstancedFlow` + `ConeGeometry` 흐름 객체. `build/update/setVisible/dispose` 제공.
  - 개수(`flowObjectCount`)·일정 속도(`flowSpeedMps` 기본 1.5m/s, 경로 길이와 무관) 변수화(추후 UI 노출).
  - **이음새 찢김 해결**: 근본 원인이 벤딩이므로 `flow.value=0`(강체 배치)로 전환 + 끝단 스케일 페이드(escalatorSteps.ts 참고). 콘 색상은 경로보다 어둡게.
- **시작/종료 표식** (신규 `topology/topologyEndpointLabels.ts`): `GTAOBypassText`('시작' 녹색 / '종료' 붉은색) + 아래를 향하는 `ConeGeometry` 마커(Y 범위 상하 진동, 속도 배율 `coneBobSpeedRadio`). 드롭다운/클릭 지정 즉시 표시.
- **마우스 클릭 노드 선택**: `TopologyManager`에 단발성 pick 모드(`PathPickEnabled` + `onPathTestNodePicked`) 추가, `setTopologyNodeEditMode("pathPick")` 연계. 테스트 탭의 '시작/종료 노드 선택하기' 버튼 → 3D 클릭으로 드롭다운 반영(호버 하이라이트/Esc/상호배제).
- `WebEditor`: `onRenderBefore`에 경로 흐름/콘 진동 프레임 업데이트 연결.

### 주요 변경 파일
- (신규) `topology/topologyPathFinder.ts`, `topology/topologyPathVisualizer.ts`, `topology/topologyEndpointLabels.ts`
- `topology/topologyManager.ts`, `webEditor.ts`, `app/components/panels/TopologyPanel.tsx`

---

## 06-26 작업 상태
- 항목 6·7·8 모두 `npx tsc --noEmit` 통과 및 런타임 동작 확인 완료(사용자 확인). 원격 push 및 06-26분 커밋은 보류 중.

