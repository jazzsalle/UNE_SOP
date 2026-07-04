# Topology Node Delete

## 목적
- 토폴로지 선택 모드에서 노드들을 선택하고 Delete키를 누르면 선택한 토폴로지 노드들을 제거하는 기능 구현

## 요청사항
- 제거한 토폴로지 노드는 Undo/Redo가 가능해야 하며 Undo/Redo Histroy가 없어지기 전까지는 정보를 유지하고 Undo로 복구시에 유지한 정보로 재생성 되어야함
- 제거커맨드는 src/WebEditor/undoredo/undoRedoTopologyCommands.ts 파일 하단에 DeleteTopologyNodeCommand 클래스로 구현할것

## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것
---

## 구현 계획 (작업자: Claude)

### 현황 분석
- Delete 키 → `InputBindingManager`(inputBindingManager.ts:82) → `onDeleteSelection` 콜백 → `WebEditor.deleteSelection()`(webEditor.ts:1067)에서 `DeleteObjectCommand`로 일반 객체를 제거한다.
- `DeleteObjectCommand`는 `StructureObjectBase`/`LibraryObject`/`PoiManager`만 분기 처리하며 **`TopologyManager`는 처리하지 않는다.**
- 토폴로지 '선택' 모드는 배타 모드라 활성 시 선택 가능한 대상이 `TopologyManager` 뿐이다. (`isSelectAvailable = selectEnabled && visible`)
- `TopologyManager.selectedNodeIds`(Set)는 private → 선택 노드 ID를 외부에서 얻을 API 필요.
- 노드 이웃관계(`neighbors`)는 객체참조 배열이며 방향성이 보장되지 않으므로, Undo 복원 시 **나가는 엣지(neighborIds)와 들어오는 엣지(incoming)** 를 모두 캡처해 양방향으로 재연결해야 한다. (단순 addNode로는 다른 노드가 가리키던 참조가 복원되지 않음)

### 설계
1. **`TopologyManager`에 API 추가**
   - `getSelectedNodeIds(): string[]` — 선택된 노드 ID 반환.
   - `removeNodes(nodeIds: string[]): void` — 다중 제거(맵 삭제 + 잔존 노드의 이웃참조 정리 + 선택/호버 상태 정리) 후 메시 1회 재구축.
   - `restoreNodes(snapshots): void` — 스냅샷으로 노드 객체 재생성 후 이웃관계(나가는/들어오는 엣지)를 재연결, 메시 1회 재구축.
2. **`undoRedoTopologyCommands.ts` 하단에 `DeleteTopologyNodeCommand` 추가** (요청사항)
   - 생성자에서 선택 노드별로 복원 스냅샷 캡처: 노드 데이터 복제 + `neighborIds`(나가는) + `incomingIds`(이 노드를 이웃으로 가진 노드들).
   - `execute()`: `topologyManager.removeNodes(ids)` — redo에서도 동일하게 재실행 안전.
   - `undo()`: `topologyManager.restoreNodes(snapshots)` — 캡처 데이터로 재생성·이웃 재연결.
   - 스냅샷은 생성자에서 1회 확정하여 Undo/Redo 반복 시에도 동일 데이터 유지(요청사항 충족). worldPosition은 복원 시마다 clone.
3. **`webEditor.deleteSelection()` 분기 추가**
   - `topologyManager.SelectEnabled`가 true면 선택된 노드 ID로 `DeleteTopologyNodeCommand` 실행 후 return.
   - 아니면 기존 일반 객체 제거 로직 수행.

### 작업 단계
1. `topology/topologyManager.ts`: `getSelectedNodeIds`/`removeNodes`/`restoreNodes` 추가.
2. `undoredo/undoRedoTopologyCommands.ts`: `DeleteTopologyNodeCommand` + 복원 스냅샷 타입 추가.
3. `webEditor.ts`: `deleteSelection()` 토폴로지 분기 + import 추가.
4. 타입체크 및 동작 테스트.

### 테스트 체크리스트 (런타임)
- [x] '선택' 모드에서 노드 1개/여러개 선택 후 Delete로 제거
- [x] Undo로 제거 노드 + 이웃 연결선까지 원상복구
- [x] Redo로 다시 제거
- [x] Undo/Redo 반복 시 동일하게 동작
- [x] '선택' 모드가 아닐 때 Delete가 토폴로지 노드에 영향 없음(일반 객체 제거 정상)

---

## 진행 상황 (작업자: Claude)

### 구현 완료 내역
1. **`topology/topologyNode.ts`**
   - `TopologyNodeRestoreData` 인터페이스 추가: 노드 데이터 + `neighborIds`(나가는 엣지) + `incomingIds`(들어오는 엣지)를 ID 기반으로 보관.
2. **`topology/topologyManager.ts`**
   - `getSelectedNodeIds(): string[]` 추가.
   - `removeNodes(nodeIds)` 추가: 다중 제거 + 잔존 노드 이웃참조 정리 + 선택/호버 상태 정리, 메시 1회 재구축.
   - `restoreNodes(snapshots)` 추가: 노드 객체 재생성(1차) 후 나가는/들어오는 엣지 양방향 재연결(2차), 메시 1회 재구축. worldPosition은 복원 시마다 clone.
3. **`undoredo/undoRedoTopologyCommands.ts`**
   - 하단에 `DeleteTopologyNodeCommand` 추가. 생성자에서 선택 노드별 스냅샷(데이터+양방향 엣지) 1회 캡처. `execute()`→`removeNodes`, `undo()`→`restoreNodes`. redo는 execute 재호출로 안전.
4. **`webEditor.ts`**
   - `deleteSelection()` 선두에 토폴로지 분기 추가: `topologyManager.SelectEnabled`가 true면 선택 노드로 `DeleteTopologyNodeCommand` 실행 후 return. 아니면 기존 일반 객체 제거.
   - `DeleteTopologyNodeCommand` import 추가.

### 설계 핵심 (이웃 복원)
- 단순 `addNode`로는 "다른 노드가 제거 노드를 가리키던 참조"(들어오는 엣지)가 복원되지 않으므로, 제거 전 시점에 들어오는/나가는 엣지를 모두 캡처하여 undo 시 양방향으로 재연결. 다중 삭제 시 노드 간 엣지 중복은 `includes` 가드로 방지.

### 테스트 결과
- `npx tsc --noEmit` 타입체크 **통과**(오류 없음).
- 런타임(브라우저) 동작 확인: **대기** — 상단 체크리스트 확인 필요.