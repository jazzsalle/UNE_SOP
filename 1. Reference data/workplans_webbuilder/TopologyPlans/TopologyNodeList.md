# 토폴로지 목록

## 목적
- 공간상에 생성된 토폴로지 노드들에 대해 목록으로 보여주는 내용 구현
- 좌측 토폴로지 패널(TopologyPanel.tsx)에서 현재 목업 데이터로 '연결된 노드 목록'(NODE_GROUPS)으로 가상의 토폴로지 노드 데이터가 보여지고 있는데 이부분을 실제로 생성되어있는 토폴로지 노드들로 교체하는 작업 

## 요청사항
- 표시되는 텍스트는 TopologyNode.displayName이 표시되도록 할 것
- 토폴로지 패널의 노드 목록에서 노드항목을 마우스 클릭으로 선택하여 하이라이트 되면 노드 편집 메뉴에서 '선택'버튼을 누른것처럼 토폴로지 노드 선택모드로 진입하고 노드목록에서 선택한 항목이 연계되도록 할 것
- '연결된 노드 목록'에는 TopologyNode.neighbors가 있는 항목을 보여줄 것
- '고립된 노드 목록'에는 TopologyNode.neighbors가 없는 항목을 보여줄 것
- 토폴로지 노드 연결 작업을 진행하여 고립된 노드 목록을 연결하였을때 토폴로지 패널의 노드 목록도 연동되어 항목이 이동되도록(고립된->연결된) 할 것
- 마찬가지로 연결 해제 작업이나 토폴로지 노드 초기화 작업을 할때 고립된 노드가 발생한다면 토폴로지 패널의 노드 목록에 연동되도록 할 것(제거시 neighbors가 비워지게된다면 연결된->고립된 목록으로 이동)
- 토폴로지 노드 생성의 경우 생성된 직후에는 연결된 것이 없을것이니 고립된 노드 목록으로 추가될 것으로 예상됨

## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것

---

## 계획 (작업자: Claude)

### 설계 개요
패널 목업 데이터를 실제 `TopologyManager` 노드로 교체하고, 데이터/선택 변경을 패널이 자동 반영하도록 이벤트로 연동한다.

1. **데이터 소스 교체**: 패널의 `CONNECTED_NODES`/`ISOLATED_NODES` 목업 → `TopologyManager.getNodeList()` 실제 데이터.
   - 표시 텍스트 = `TopologyNode.displayName`.
   - `neighbors.length > 0` → '연결된 노드 목록', `=== 0` → '고립된 노드 목록'.
2. **목록 자동 갱신**: `TopologyManager`에 `onNodesChanged` 이벤트 추가.
   - 모든 노드/연결 변경의 단일 길목인 `rebuildMesh()`에서 1회 발행(빈 상태 포함). `addNode()`의 빠른 경로(메시 미재생성)에서도 발행.
   - 생성/제거/연결/연결해제/초기화/불러오기/Undo·Redo 전부 위 메서드를 거치므로 한 곳에서 커버됨 → 목록 항목이 연결↔고립으로 자동 이동.
3. **목록↔3D 선택 연동**: `TopologyManager`에 `onSelectionChanged` 이벤트 + `selectNodesByIds()` 추가.
   - 목록 항목 클릭 → '선택' 모드 진입(`setTopologyNodeEditMode("select")`) + `selectNodesByIds()`로 3D 선택. Shift = 복수 토글.
   - 3D 뷰에서의 클릭/드래그/Shift 선택, 선택모드 해제도 `onSelectionChanged`를 발행하여 목록 하이라이트가 양방향 동기화됨.

### 변경 파일
- `topology/topologyManager.ts`: 이벤트맵에 `onNodesChanged`/`onSelectionChanged` 추가, `rebuildMesh`/`addNode`에서 `onNodesChanged` 발행, `getNodeList()`·`selectNodesByIds()` 추가, 선택 변경 지점(`setMaterialSelected`·`toggleCurrentInstanceSelection`·`SelectEnabled` 해제)에서 `onSelectionChanged` 발행.
- `app/components/panels/TopologyPanel.tsx`: 목업 제거, 실제 노드 상태(`connectedNodes`/`isolatedNodes`/`selectedNodes`)를 이벤트 구독으로 동기화, 목록 클릭 핸들러를 선택 모드 진입 + `selectNodesByIds` 연동으로 교체.
  - (테스트 탭의 경로 테스트 Select는 본 작업 범위 밖이라 임시 목업 ID 유지)

## 진행 상황 (작업자: Claude)
- [x] `TopologyManager` 이벤트/메서드 추가 및 발행 지점 연결
- [x] 패널 실제 데이터 연동 및 목록 클릭→선택 모드 연동
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

## 테스트 체크리스트 (작업자: Claude)
- [x] 토폴로지 생성(자동/Cell) 시 노드들이 목록에 표시되고 displayName이 보인다.
- [x] 연결이 있는 노드는 '연결된 노드 목록', 없는 노드는 '고립된 노드 목록'에 분류된다.
- [x] 수동 노드 생성 직후 해당 노드가 '고립된 노드 목록'에 추가된다.
- [x] '연결' 작업으로 고립 노드를 연결하면 '고립된 → 연결된'으로 이동한다.
- [x] '연결 해제(단일)'/'초기화'로 노드의 연결이 모두 사라지면 '연결된 → 고립된'으로 이동한다.
- [x] 노드 삭제 시 목록에서 제거되고, 그로 인해 고립된 노드가 생기면 목록도 갱신된다.
- [x] Undo/Redo 시 목록 분류가 항상 실제 연결 상태와 일치한다.
- [x] 목록 항목 클릭 시 '선택' 버튼이 활성화되고 3D 노드가 선택(진한 붉은색)된다.
- [x] Shift+목록 클릭으로 복수 선택/토글된다.
- [x] 3D 뷰에서 노드를 클릭/드래그 선택하면 목록 항목 하이라이트도 함께 갱신된다.
---
## 2026-06-26 요청사항(백인선)
- 토포롤지 패널의 '테스트'탭의 '시작 노드'와 '종료 노드' 드랍다운에 대해 생성되어 있는 노드 목록 연계

## 요청사항
- 토폴로지 노드 '자동 생성', 'Cell 생성' 및 수동 생성, 제거에 대해 '연결된 노드 목록'과 '고립된 노드 목록'이 연계되므로, 마찬가지로 테스트 탭의 시작노드 드랍다운과 종료노드 드롭다운목록에 추가될 수 있도록 함
- 연결된 노드, 고립된 노드 상관없이 현재 생성되어 있는 모든 토폴로지 노드를 선택 할 수 있도록 함
- 시작 노드에서 선택한 노드는 종료 노드에서 선택할 수 없도록하고 마찬가지로 종료 노드에서 선택한 노드는 시작 노드에서 선택할 수 없도록 함

### 계획 (작업자: Claude)
- 기존 테스트 탭은 목업(`MOCK_NODE_IDS`/`NODE_OPTIONS`) 기반이고 `editor`를 받지 않았음 → 실제 데이터 연계로 교체.
1. **데이터 연계**: `TestTab`에 `editor` prop 전달. `TopologyManager.getNodeList()`로 **모든** 노드(연결/고립 무관)를 옵션화(value=id, label=displayName).
2. **자동 갱신**: 기존에 추가한 `onNodesChanged` 이벤트를 `TestTab`에서도 구독 → 생성/제거 등 변경 시 드롭다운 목록 자동 갱신. 선택했던 노드가 삭제로 사라지면 선택 해제.
3. **상호 배제**: 시작 옵션에서 현재 종료 노드를 제외(`endNode`), 종료 옵션에서 현재 시작 노드를 제외(`startNode`)하여 동일 노드 동시 선택 차단.
4. 결과 카드의 시작/종료 표기는 id 대신 displayName 라벨로 표시(경로 테스트 실행 로직 자체는 기존과 동일하게 TODO 상태 유지).

### 변경 파일
- `app/components/panels/TopologyPanel.tsx`: 목업 상수 제거, `TestTab(editor)` 실제 노드 옵션 구독/상호 배제/placeholder 적용, 메인 패널에서 `TestTab`에 `editor` 전달.

### 진행 상황 (작업자: Claude)
- [x] `TestTab` 실제 노드 옵션 연계 및 `onNodesChanged` 구독
- [x] 시작/종료 상호 배제 및 삭제 노드 선택 해제 처리
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

### 테스트 체크리스트 (작업자: Claude)
- [x] 자동/Cell/수동 생성한 노드가 시작·종료 드롭다운에 모두 나타난다(연결/고립 무관).
- [x] 노드 displayName이 드롭다운 라벨로 표시된다.
- [x] 노드 제거 시 드롭다운에서도 사라지고, 선택 중이던 노드면 선택이 해제된다.
- [x] 시작 노드에서 고른 항목은 종료 드롭다운에 나타나지 않는다(반대도 동일).
- [x] 노드가 없거나 미선택일 때는 '노드 선택' placeholder가 보인다.