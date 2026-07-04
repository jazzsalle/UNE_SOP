# 토폴로지 속성창

## 개요
- 토폴로지 선택 모드에서 선택한 토폴로지의 속성을 확인할 수 있는 UI를 가시화함
- 토폴로지 속성을 보기 위한 UI는 이미 만들어져있으며 상황에 따라 보여주어야함

## 요청사항
- RightPanel(RightPanel.tsx) 컴포넌트에서 토폴로지 속성을 보기위한 TopologyProperties(TopologyProperties.tsx) 컴포넌트를 조건이 맞으면 보여주도록 하고 있으니 여기에 맞게끔 토폴로지를 선택하면 해당 조건 구문이 맞아서 토폴로지 속성창이 보일 수 있는 방안 제시 요청
- 토폴로지 속성창에 실제 연계는 먼저 TopologyProperties 컴포넌트가 상황에 맞게 표출되는지 확인한 후에 진행할 예정임

## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것

---

## 계획 (작업자: Claude)

### 현황 분석 (왜 지금은 안 보이는가)
- `RightPanel.tsx`는 `useObjectSelector(editor)`의 `selectedObjects[0].type === "topology"`일 때 `<TopologyProperties />`를 렌더한다. (이미 `switch case "topology"`, 뱃지 스타일(purple), 라벨('노드')까지 준비되어 있음 → **패널/케이스는 손댈 필요 없음**)
- `useObjectSelector.syncSelection()`은 `editor.ObjectSelector.SelectedObjects`를 순회하며 **구조물(`SelectRoot instanceof StructureObjectBase`)** 또는 **`LibraryObject`** 만 `selectedObjects`로 수집한다.
- `ObjectSelector.SelectedObjects`는 "등록된 selectable 중 `IsSelected`인 것 전체"를 반환하므로, 토폴로지 노드를 선택하면 `TopologyManager`(IsSelected = `selectedNodeIds.size>0`)도 포함된다. **그러나 syncSelection의 분기(구조물/라이브러리)에 해당하지 않아 누락** → type "topology" 항목이 만들어지지 않아 패널이 표시되지 않는다. (이것이 핵심 원인)
- 이벤트 측면: 뷰포트 클릭/드래그/Shift 선택은 `ObjectSelector.onObjectSelectionChanged`를 발행 → syncSelection이 트리거된다. 반면 패널 노드목록 클릭(`selectNodesByIds`)·선택모드 해제는 `TopologyManager.onSelectionChanged`만 발행(ObjectSelector 이벤트 아님) → syncSelection이 트리거되지 않는다.

### 해결 방안 (표출 단계)
1. **`useObjectSelector.syncSelection()`에 TopologyManager 분기 추가**
   - 순회 중 `obj instanceof TopologyManager && obj.IsSelected`이면
     `{ id: editor.TopologyManager.getSelectedNodeIds()[0], type: "topology", data: null }` 를 `selectedObjects`에 추가.
   - 표출 확인 단계이므로 `data`는 null 유지(실제 속성 연계는 다음 단계).
2. **토폴로지 선택 변경 동기화 보강**
   - `useObjectSelector`의 useEffect에 `editor.TopologyManager.addEventListener("onSelectionChanged", syncSelection)` 추가(+cleanup). → 패널 목록 클릭·선택모드 해제 등 모든 경로에서 패널이 갱신된다.
   - 노드 삭제로 선택이 사라지는 경우까지 대비해 `onNodesChanged`도 함께 구독(권장).
3. **RightPanel / TopologyProperties 변경 없음** — 이미 type "topology" 케이스 처리, 컴포넌트는 props 없이 렌더.

### 변경 파일(예정)
- `app/hooks/useObjectSelector.ts` — TopologyManager 수집 분기 + `onSelectionChanged`(+`onNodesChanged`) 구독
- (RightPanel.tsx / TopologyProperties.tsx 는 변경 없음)

### 주의/메모
- `SelectedObjects`에는 노드를 몇 개 선택하든 `TopologyManager` 1개만 들어온다. 따라서 수집 분기에서 **선택 노드가 정확히 1개일 때만** type "topology" 항목을 추가한다(2개 이상이면 추가하지 않음 → 속성창 미표시). 다중 선택에서의 노드 속성창 처리는 후속.
- 선택모드 해제/노드 삭제 시 `IsSelected=false` → `SelectedObjects`에서 빠짐 → 패널이 자동으로 층 속성(FloorProperties)으로 복귀.
- 우측 액션바 '삭제'는 기존 `editor.deleteSelection()`이 토폴로지 분기를 이미 처리(선택모드 시 `DeleteTopologyNodeCommand`).
- 토폴로지 노드는 '선택' 모드에서만 선택 가능하므로, 패널 표출 조건도 자연히 '선택 모드 + 노드 선택'과 일치(요청서 개요와 부합).

### 진행 상황 (작업자: Claude)
- [x] `useObjectSelector`에 TopologyManager 수집 분기 추가
- [x] `onSelectionChanged`(+`onNodesChanged`) 구독 추가
- [x] 노드 "정확히 1개" 선택 시에만 표출하도록 조건 적용(다중 선택 시 미표시)
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저에서 토폴로지 노드 선택 시 속성창(노드) 표출 확인 (사용자 확인)

### 테스트 체크리스트 (작업자: Claude)
- [x] '선택' 모드에서 노드를 1개 클릭하면 우측 속성 패널이 '노드'(TopologyProperties)로 바뀐다.
- [x] 패널 노드 목록에서 1개 클릭해도 동일하게 속성 패널이 '노드'로 바뀐다.
- [x] **노드를 2개 이상 선택하면 노드 속성창이 표시되지 않는다.**
- [x] 다중 선택 → 단일 선택으로 줄어들면 다시 노드 속성창이 표시된다.
- [x] 선택 해제/선택모드 종료/노드 삭제 시 속성 패널이 층 속성으로 복귀한다.
- [x] 다른 객체(벽/기둥 등) 선택과 토폴로지 선택이 서로 간섭하지 않는다.
---
## 2026-06-26 토폴로지 데이터 실제 연계(백인선)

## 요청사항
- 속성 패널 항목별 연계 포인트
  - 노드 유형
    - 출구 노드 Switch 상태가 On이면 TopologyNode.isExit를 true로 설정하고 nodeTypeCode변수의 문자열 값을 'exit'로 설정
    - 출구 노드 Switch 상태가 On상태에서 Off상태로 되돌아 간다면, isExit가 true로 되기직전의 nodeTypeCode로 되돌릴것, 이와 관련하여 상태를 저장할 변수가 추가되어야 할 것으로 예상됨
  - 연결된 노드
    - id대신에 TopologyNode.displayName을 보여주도록 할것
    - 목록은 TopologyNodes.neighbors에 해당하는 노드들의 displayName을 보여주도록 할것
    - 노드간 연결을 보여주는 부분은 TopologyProperties컴포넌트에서 both, one-way에 따라 달라질 것인데 연결된 노드에 대해서 연결된 노드가 현재 선택되어 보여지고 있는 노드를 인접 이웃 노드(neighbors)로 서로 가지고 있다면 both로 판단하고 없다면 one-way로 판단할것
    - 우측 해제 버튼을 누르면 현재 선택되어 보여지고 있는 토폴로지 노드의 TopologyNode.neighbors에서 해당 노드를 제거할 것
  - 상세 메모
    - 사용자 속성 JSON에 보여지는 텍스트입력창에 원하는 텍스트 내용을 입력하고 저장 버튼을 클릭하면 TopologyNode.metadata에 저장되도록 할 것

### 계획/구현 (작업자: Claude)

#### 데이터/매니저
- `TopologyNode`에 `nodeTypeCodeBeforeExit?: string` 추가 — 출구 전환 직전 nodeTypeCode 보관용.
- `TopologyManager` 속성 패널 연계 메서드 추가:
  - `getNodePropertyInfo(nodeId)` → `{ id, displayName, isExit, nodeTypeCode, metadata, neighbors:[{id, displayName, direction}] }`. direction은 상대 노드도 이 노드를 이웃으로 가지면 `both`, 아니면 `one-way`.
  - `setNodeExit(nodeId, isExit)` → On: 현재 코드 보관 후 `nodeTypeCode='exit'`, `isExit=true` / Off: 보관 코드로 복원(없으면 'normal'), `isExit=false`.
  - `removeNeighbor(nodeId, neighborId)` → **현재 노드의 neighbors에서만**(단방향) 제거 후 rebuildMesh.
  - `setNodeMetadata(nodeId, metadata)` → metadata 저장.

#### UI 연계
- `RightPanel.tsx`: `<TopologyProperties editor={editor} nodeId={firstObj.id} />`로 props 전달.
- `TopologyProperties.tsx`: 목업 제거, 실제 데이터 연계.
  - 노드 변경 시 출구/이웃/메타데이터 초기화. `onNodesChanged` 구독으로 출구·이웃만 재갱신(메타데이터 입력은 보존).
  - 출구 Switch → `setNodeExit`. 연결 목록은 `displayName` 표시 + both(↔)/one-way(→) 뱃지. '해제' → `removeNeighbor`(단방향). 메모 '저장' → `setNodeMetadata`.

### 변경/추가 파일
- `topology/topologyNode.ts`(필드 추가), `topology/topologyManager.ts`(연계 메서드), `app/pages/main/RightPanel.tsx`(props 전달), `app/components/properties/TopologyProperties.tsx`(실제 연계)

### 진행 상황 (작업자: Claude)
- [x] `TopologyNode.nodeTypeCodeBeforeExit` 추가
- [x] `TopologyManager` 연계 메서드 4종 추가
- [x] `RightPanel`에서 props 전달
- [x] `TopologyProperties` 실제 데이터 연계
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [ ] 브라우저 런타임 동작 확인 (사용자 확인 대기)

### 테스트 체크리스트 (작업자: Claude)
- [ ] 출구 노드 Switch On → isExit=true, nodeTypeCode='exit'로 설정된다.
- [ ] Switch Off → 직전 nodeTypeCode로 복원되고 isExit=false가 된다.
- [ ] 연결된 노드 목록이 id가 아닌 displayName으로 표시된다.
- [ ] 상호 연결은 both(↔), 단방향은 one-way(→)로 올바르게 표시된다.
- [ ] '해제' 클릭 시 현재 노드의 neighbors에서 해당 노드가 제거되고 목록이 갱신된다.
- [ ] 메모 입력 후 '저장' → metadata에 반영되며, 다른 작업(해제 등)으로 입력이 사라지지 않는다.
- [ ] 다른 노드 선택 시 해당 노드의 출구/이웃/메모로 패널이 갱신된다.