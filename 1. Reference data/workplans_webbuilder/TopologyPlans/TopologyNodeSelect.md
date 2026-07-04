# Topology Node Select

## 목적
- 공간상에 생성되어 있는 토폴로지 노드를 선택가능하도록 구현

## 요구사항
- 토폴로지 노드가 클릭과 드래그의 두가지 동작에 대해 선택이 가능하도록 요청
- 토폴로지 노드를 TopologyManager클래스에서 InstancedMesh를 사용해서 가시화 하고 있는것으로 파악되고 있음
- 비슷한 경우로 인스턴스 형식으로 다수의 객체를 렌더링하면서 선택처리를 해놓은것이 Poi와 Library인데 토폴로지노드도 이와 비슷한 동작을 하면 될것으로 예상됨
- 현재 토폴로지노드의 기본 색상이 붉은색 계열인데 색상을 아래 내용대로 교체해주길 원함
  - 기본상태: 파란색계열
  - 선택대기상태: 연한 붉은색 계열
  - 선택상태: 진한 붉은색 계열
- 객체 선택 처리는 ObjectSelector 클래스를 사용하면 될것으로 보임

## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것

---

## 구현 계획 (작업자: Claude)

### 현황 분석
- `TopologyManager`(`topology/topologyManager.ts`)는 노드를 `InstancedMesh`(SphereGeometry 0.1) + 단일 `MeshStandardMaterial({ color: 0xff0000 })`로 렌더링하며, `rebuildMesh()` 호출 시마다 메시를 새로 생성한다. (topologyManager.ts:282-335)
- 노드는 `Map<string, TopologyNode>`로 보관되며 **Map의 삽입 순서 = 인스턴스 인덱스**로 1:1 매핑된다. (topologyManager.ts:266-267)
- `TopologyManager`는 `webEditor.ts:349`에서 생성되지만 **`ObjectSelector`에 등록되어 있지 않으며**, `SelectableObject` 인터페이스도 구현하지 않는다. (현재 선택 불가)
- 비교 대상 패턴:
  - `PoiManager`는 `EventDispatcher` 상속 + `SelectableObject` 구현. `poiSceneRoot`(안정적인 Group)를 `SelectRoot`로 노출하고, 내부적으로 `hoveringPoiId`/`dragSelectedPoiIds`/`poi.selected`로 상태를 관리. (poiManager.ts:41-242)
  - `ObjectSelector`는 각 객체의 `SelectRoot`를 WeakMap에 등록(objectSelector.ts:128-130)하고, 클릭 시 `setRaycastIntersection()`→`setMaterialSelected()`, 드래그 시 `collectDragSelectedInstanceIds()`→`setMaterialSelected()`를 호출한다. (objectSelector.ts:482-604, 218-370)

### 핵심 설계 결정
1. **`TopologyManager`가 `SelectableObject`를 구현**하도록 한다. (별도 컨테이너 클래스를 새로 만들지 않고 매니저에 직접 구현 — Poi 방식과 동일)
2. **안정적인 SelectRoot용 Group(`nodeSelectRoot`)을 신설**한다.
   - 생성자에서 `nodeSelectRoot`를 만들어 `systemObjectGroup`에 1회 추가하고, `instancedMesh`는 `systemObjectGroup`이 아닌 `nodeSelectRoot`의 자식으로 추가한다.
   - `rebuildMesh()`로 메시가 교체되어도 SelectRoot(Group) 자체는 유지되므로 WeakMap 등록이 깨지지 않는다.
   - 이웃 연결선(`neighborLineGroup`)은 `nodeSelectRoot`에 넣지 않고 기존처럼 `systemObjectGroup`에 직접 두어 **선은 raycast 대상에서 제외**한다.
3. **인스턴스별 색상은 `InstancedMesh.setColorAt()`** 사용 (Library 패턴과 동일, 셰이더 신설 불필요).
   - material `color`는 흰색(0xffffff)으로 두고 instanceColor로 실제 색을 표현.
   - 색상 상수 정의:
     - 기본(Default): 파란색 계열 — 예) `new Color(0.20, 0.50, 1.0)`
     - 선택대기(SelectReady, hover/드래그영역): 연한 붉은색 — 예) `new Color(1.0, 0.6, 0.6)`
     - 선택(Selected): 진한 붉은색 — 예) `new Color(0.8, 0.1, 0.1)`
4. **인스턴스 인덱스 ↔ 노드ID 매핑 배열(`instanceIndexToNodeId: string[]`)을 명시적으로 유지**한다. (raycast `instanceId`로 노드 역추적, 색상 갱신 시 인덱스 확보)
5. **선택 상태는 매니저 내부에 transient하게 보관**한다. (`selectedNodeIds: Set<string>`, `hoveringNodeId: string | null`, `dragSelectedNodeIds: string[]`)
   - `exportNodes()`/`importNodes()` 직렬화에는 영향을 주지 않도록 `TopologyNode` 인터페이스는 건드리지 않는다.

### 구현할 SelectableObject 인터페이스 멤버 (TopologyManager)
- `get/set IsSelected` — `selectedNodeIds.size > 0`. setter(false) 시 전체 선택 해제 후 색상 재적용.
- `get SelectRoot` — `nodeSelectRoot` 반환.
- `get isSelectAvailable` — `nodeSelectRoot.visible` 반환.
- `setRaycastIntersection(intersection)` — `intersection.instanceId`로 `instanceIndexToNodeId`에서 노드ID를 찾아 `hoveringNodeId`에 저장.
- `collectDragSelectedInstanceIds(frustum)` — 각 노드 `worldPosition`이 frustum에 포함되면 노드ID 수집.
- `setDragSelectedInstanceIds(ids)` — `dragSelectedNodeIds`에 저장.
- `setMaterialSelectReady()` — 드래그영역 노드 또는 hover 노드(미선택 시)를 연한 붉은색으로.
- `setMaterialSelected()` — hover/드래그영역 노드를 `selectedNodeIds`에 추가하고 진한 붉은색으로.
- `restoreMaterial()` — hover/드래그 하이라이트 해제. `IsSelected==false`면 전체를 기본 파란색으로, 아니면 미선택 노드만 파란색으로 복원.
- `toggleCurrentInstanceSelection()` (선택적) — Shift+클릭 시 hover 노드의 선택 토글. (Poi/Library와 동일하게 다중 인스턴스 토글 지원)

### 색상 적용 로직
- `rebuildMesh()`에서 활성 인스턴스마다 `setColorAt(i, color)` 호출. 색은 `selectedNodeIds` 포함 여부로 결정(선택=진한붉은, 그외=파란). `instanceColor.needsUpdate = true` 설정.
- 노드 인덱스 단위로 색을 바꾸는 헬퍼 `setNodeColor(nodeId, color)` 추가 (mapping 배열로 인덱스 조회 → `setColorAt`).
- 부분 추가 경로(`addNode`의 rebuild 미발생 분기, topologyManager.ts:213-220)에서도 `instanceIndexToNodeId` push 및 `setColorAt(index, 기본색)` 처리 추가.

### webEditor.ts 연동
- `topologyManager` 생성 직후 `this.objectSelector.addSelectableObject(this.topologyManager);` 추가. (webEditor.ts:353 부근)
- 프로젝트 리셋 경로에서 PoiManager를 재등록하는 부분(webEditor.ts:691 부근)에 토폴로지 매니저 재등록도 동일하게 추가 검토.

### 작업 단계
1. `topologyManager.ts`에 색상 상수/상태 필드/매핑 배열/`nodeSelectRoot` 추가, 생성자 수정.
2. `rebuildMesh()` 수정 — instanceColor 활성화, `nodeSelectRoot`에 메시 부착, 매핑 배열 재구성, 색상 적용.
3. `addNode`/`setPosition`/`removeNode`/`clear`/`importNodes` 의 매핑·색상 정합성 보정.
4. `SelectableObject` 인터페이스 멤버 구현.
5. `webEditor.ts`에 ObjectSelector 등록(및 리셋 시 재등록).
6. 빌드/타입체크 후 동작 테스트(클릭 선택, Shift 다중선택, 드래그 박스 선택, 색상 3단계 확인).

### 확정 사항 (사용자 확인 완료)
- 색상 RGB는 계획서의 예시값으로 진행하고 화면 확인 후 조정.
- Shift+클릭 다중 토글 선택 **포함** (Poi/Library와 동일).

---

## 진행 상황 (작업자: Claude)

### 구현 완료 내역
1. **`topology/topologyManager.ts`** — `SelectableObject` 인터페이스 구현
   - 색상 상수 추가: `COLOR_DEFAULT`(파란 `0.20,0.50,1.0`) / `COLOR_SELECT_READY`(연한붉은 `1.0,0.6,0.6`) / `COLOR_SELECTED`(진한붉은 `0.8,0.1,0.1`).
   - 안정적 선택 루트 `nodeSelectRoot: Group` 신설 → 생성자에서 `systemObjectGroup`에 1회 추가. `instancedMesh`는 이 그룹의 자식으로 부착하여 `rebuildMesh` 시에도 ObjectSelector의 WeakMap 등록이 유지되도록 함. (이웃 연결선은 그룹 밖 → raycast 제외)
   - 상태 필드: `instanceIndexToNodeId[]`(인덱스↔노드ID 매핑), `selectedNodeIds:Set`, `hoveringNodeId`, `dragSelectedNodeIds[]`, `hoverColoredNodeId`(호버 이동 시 이전 노드 색 복원용).
   - `rebuildMesh()`: 베이스 material 색상을 흰색(0xffffff)으로 변경, `setColorAt`으로 인스턴스별 색상 적용(`instanceColor`), 매핑 배열 재구성.
   - `addNode` 부분갱신 분기에 매핑/색상 갱신 추가. `removeNode`/`clear`/`importNodes`에 선택상태 정리 추가.
   - 인터페이스 멤버: `IsSelected`, `SelectRoot`, `isSelectAvailable`, `setRaycastIntersection`(클릭/호버 hover 식별), `collectDragSelectedInstanceIds`/`setDragSelectedInstanceIds`(드래그 박스), `setMaterialSelectReady`/`setMaterialSelected`/`restoreMaterial`, `toggleCurrentInstanceSelection`(Shift 다중 토글).
   - 헬퍼: `setNodeColor`, `refreshAllColors`.
2. **`webEditor.ts`**
   - `topologyManager` 생성 직후 `objectSelector.addSelectableObject(this.topologyManager)` 등록.
   - `reset()`의 ObjectSelector 재등록 구간에 토폴로지 매니저 재등록 추가.

### 동작 흐름 검증 (코드 레벨)
- **클릭 선택**: onPointerUp(이동<5px) → `setRaycastIntersection`(instanceId→hoveringNodeId) → `setMaterialSelected`(진한붉은) / Shift 시 `toggleCurrentInstanceSelection`. (objectSelector.ts:494-548)
- **호버**: onPointerMove → `setRaycastIntersection` → `setMaterialSelectReady`(연한붉은), 이전 호버 노드는 `hoverColoredNodeId` 추적으로 기본색 복원. 매니저 밖으로 벗어나면 `restoreMaterial`. (objectSelector.ts:427-474)
- **드래그 박스**: getSelectedObjectFromDrag → `collectDragSelectedInstanceIds`(frustum.containsPoint) → `setDragSelectedInstanceIds` → 이동중 `setMaterialSelectReady`, 종료 시 `setMaterialSelected`. (objectSelector.ts:291-296, 565-601)

### 테스트 결과
- `npx tsc --noEmit` 타입체크 **통과**(오류 없음).
- 런타임(브라우저) 동작 확인: **완료** — 아래 항목 모두 정상 동작 확인.
  - [x] 노드 기본 색상이 파란색으로 표시되는지
  - [x] 마우스 호버 시 연한 붉은색으로 바뀌는지
  - [x] 클릭 시 진한 붉은색 선택 상태가 되는지
  - [x] 드래그 박스로 다중 노드가 선택되는지
  - [x] Shift+클릭으로 개별 노드 토글이 되는지
  - [x] 빈 공간 클릭 시 선택 해제가 되는지

### 색상 조정 이력 (작업자: Claude)
- 런타임 확인 후 사용자 요청으로 '일반'·'선택대기' 색상을 조금 더 진하게 조정. '선택됨'은 유지.

| 상태 | 변수 | 초기값 (R,G,B) | 조정값 (R,G,B) |
|------|------|----------------|----------------|
| 일반 (파란색) | `COLOR_DEFAULT` | `0.20, 0.50, 1.0` | `0.10, 0.35, 0.85` |
| 선택대기 (연한 붉은색) | `COLOR_SELECT_READY` | `1.0, 0.6, 0.6` | `0.9, 0.45, 0.45` |
| 선택됨 (진한 붉은색) | `COLOR_SELECTED` | `0.8, 0.1, 0.1` | `0.8, 0.1, 0.1` (유지) |

- 정의 위치: `topology/topologyManager.ts` 클래스 상단 색상 상수.

---
## 2026-06-25 수정사항(백인선)
- 현재 구현되어 있는 선택 동작을 특정 조건하에서만 수행하도록 수정 요청
- 조건: 토폴로지 탭메뉴-토폴로지 패널 메뉴의 '노드 편집'->'선택' 이 활성화 되어있는 경우에만 선택 동작을 수행
- 평상시에 벽체나 기둥등을 선택할 수 있는 상황에서 토폴로지 노드는 선택 동작이 작동하지 않도록 처리 요청
- '선택'버튼이 비뢀성화 상태로 전환될때 토폴로지 노드의 선택상태를 모두 해제 처리 할것

---

## 수정 계획: 선택 모드 게이팅 (작업자: Claude)

### 현황 분석
- 현재 `TopologyManager`는 `webEditor.ts`에서 `objectSelector.addSelectableObject()`로 항상 등록되어 있어, 일반 객체(벽/기둥 등)와 **동시에 상시 선택 가능**한 상태다.
- `ObjectSelector`는 등록된 모든 `SelectableObject`를 `isSelectAvailable`로만 필터링하여 raycast/드래그/호버 대상으로 사용한다. (objectSelector.ts:286, 429-432, 497-499)
- `TopologyPanel.tsx`의 '노드 편집' 도구는 `EDIT_TOOLS = ["생성","선택","초기화","연결","연결 해제"]`이며, `activeTool` 로컬 상태로만 관리된다. '생성'만 `editor.ActiveCreatorKey`로 WebEditor에 전달되고 **'선택'은 WebEditor로 전달되지 않는다.** (TopologyPanel.tsx:27, 180-203)
- `editor.ActiveCreatorKey` 설정 시 `EditorStateManager`가 생성기 활성화 + `objectSelector.unregisterEvents()`로 일반 선택을 끄거나, 생성기 해제 + `objectSelector.registerEvents()`로 일반 선택을 켠다. (editorStateManager.ts:57-68)

### 확정된 동작 (사용자 확인)
- **배타적 모드**: '선택' 모드가 켜지면 **토폴로지 노드만** 선택 가능하고 벽/기둥 등 일반 객체는 선택 불가.
- '선택' 모드가 꺼지면(다른 도구 전환/토글 해제/패널 이탈) 일반 객체 선택이 복귀하고, **토폴로지 노드 선택 상태는 모두 해제**된다.

### 설계 (두 가지 플래그 조합)
1. **`TopologyManager.SelectEnabled` 플래그 추가** — 토폴로지가 선택에 "참여"하는지 결정.
   - `private selectEnabled = false;` + `get/set SelectEnabled`.
   - `isSelectAvailable` 게터를 `return this.selectEnabled && this.nodeSelectRoot.visible;`로 변경 → 평상시(false)엔 토폴로지가 raycast/드래그 대상에서 제외됨.
   - setter가 `false`로 바뀔 때 선택 상태 전체 해제(`selectedNodeIds.clear()` + hovering/drag 초기화 + `refreshAllColors()`).
2. **`ObjectSelector`에 배타 대상(exclusive) 개념 추가** — '선택' 모드일 때 토폴로지 "외" 객체를 제외.
   - `private exclusiveTarget: SelectableObject | null = null;`
   - `public setExclusiveSelectable(target | null)`: 모드 전환이므로 호출 시 `deselectAll()` 후 대상 설정.
   - 내부 헬퍼 `getActiveSelectables()`: `exclusiveTarget`이 있으면 그 대상만, 없으면 전체 `selectableObjects` 반환(여전히 `isSelectAvailable`로 추가 필터).
   - raycast 대상 생성 3곳에서 `Array.from(this.selectableObjects)`/`forEach`를 `getActiveSelectables()` 기반으로 교체: onPointerMove(호버), onPointerUp(클릭), getSelectedObjectFromDrag(드래그). (objectSelector.ts:429-432, 497-499, 286)

   조합 결과:
   - 평상시: SelectEnabled=false(토폴로지 제외) + exclusive=null(일반 객체 포함) → **일반 객체만 선택**.
   - 선택 모드: SelectEnabled=true(토폴로지 포함) + exclusive=TopologyManager(나머지 제외) → **토폴로지 노드만 선택**.

3. **WebEditor에 단일 진입점 추가** — 패널이 한 번의 호출로 두 플래그를 일관되게 제어.
   - `public setTopologyNodeSelectEnabled(enabled: boolean)`:
     ```
     this.topologyManager.SelectEnabled = enabled;
     this.objectSelector.setExclusiveSelectable(enabled ? this.topologyManager : null);
     ```

4. **TopologyPanel 연동** — `renderEditTool` onClick에서 '선택' 상태를 WebEditor로 전달.
   - 기존 '생성' 토글 처리 뒤에 한 줄 추가: `if (editor) editor.setTopologyNodeSelectEnabled(nextTool === "선택");`
   - 어떤 편집 도구를 눌러도 이 한 줄이 실행되어, 새 활성 도구가 '선택'이 아니면 자동으로 비활성화·해제되므로 모든 전환 케이스를 커버.
   - 패널 언마운트/탭 이탈 시 안전하게 끄도록 `useEffect` cleanup에서 `editor?.setTopologyNodeSelectEnabled(false)` 호출 추가(패널이 탭 전환 시 언마운트되는지 확인 후 적용).

### 작업 단계
1. `topologyManager.ts`: `selectEnabled` 필드 + `SelectEnabled` 게터/세터(해제 처리 포함), `isSelectAvailable` 수정.
2. `objectSelector.ts`: `exclusiveTarget` 필드 + `setExclusiveSelectable` + `getActiveSelectables`, 3개 지점 적용.
3. `webEditor.ts`: `setTopologyNodeSelectEnabled` 메서드 추가. (reset 시 false 보장 검토)
4. `TopologyPanel.tsx`: '선택' 도구 클릭 시 전달 + 언마운트 cleanup.
5. 타입체크(`npx tsc --noEmit`) 및 동작 테스트.

### 테스트 체크리스트 (런타임)
- [ ] 평상시(노드 편집 '선택' OFF): 벽/기둥 선택 가능, 토폴로지 노드 선택 불가(호버 색 변화도 없음)
- [ ] '선택' ON: 토폴로지 노드 클릭/드래그/Shift 토글 선택 가능, 벽/기둥은 선택 불가
- [ ] '선택' ON → 다른 도구(생성/초기화/연결/연결해제)로 전환 시 토폴로지 선택 전부 해제
- [ ] '선택' ON → 같은 버튼 재클릭(토글 OFF) 시 토폴로지 선택 전부 해제, 일반 선택 복귀
- [ ] '선택' ON 상태에서 다른 탭/패널로 이동 시 선택 해제 및 일반 선택 복귀

### 확인 필요 사항 (사용자 확인 완료)
- 탭 언마운트 동작과 무관하게 **'선택' 버튼의 활성화 상태만 감지**하도록 처리(언마운트 cleanup 불필요).
- '생성' 모드에서는 `ObjectSelector` 자체가 비활성(`unregisterEvents`)되어 선택 불가 — 정상 동작으로 확정.

---

## 진행 상황: 선택 모드 게이팅 (작업자: Claude)

### 구현 완료 내역
1. **`topology/topologyManager.ts`**
   - `selectEnabled: boolean = false` 필드 + `SelectEnabled` 게터/세터 추가. 세터가 `false`로 전환될 때 `selectedNodeIds`/`hoveringNodeId`/`dragSelectedNodeIds`/`hoverColoredNodeId` 초기화 후 `refreshAllColors()`로 기본색 복원.
   - `isSelectAvailable`를 `this.selectEnabled && this.nodeSelectRoot.visible`로 변경 → 평상시 토폴로지가 raycast/드래그/호버 대상에서 제외.
   - `clear()`에 `selectEnabled = false` 및 `hoverColoredNodeId = null` 초기화 추가(리셋 시 stale 방지).
2. **`objectSelector.ts`**
   - `exclusiveTarget: SelectableObject | null` 필드 추가.
   - `setExclusiveSelectable(target | null)`: 모드 전환 시 `deselectAll()` + `prevHoveringTargets.clear()` 후 대상 설정.
   - `getActiveSelectables()`: 배타 대상이 있으면 그 대상만, 없으면 전체 반환.
   - 클릭(onPointerUp)/호버(onPointerMove)/드래그(getSelectedObjectFromDrag) 3개 지점에서 `Array.from(this.selectableObjects)`·`forEach`를 `getActiveSelectables()` 기반으로 교체.
   - `clear()`에 `exclusiveTarget = null` 추가.
3. **`webEditor.ts`**
   - `setTopologyNodeSelectEnabled(enabled)` 추가: `topologyManager.SelectEnabled = enabled` + `objectSelector.setExclusiveSelectable(enabled ? topologyManager : null)`.
4. **`app/components/panels/TopologyPanel.tsx`**
   - `renderEditTool` onClick에 `if (editor) editor.setTopologyNodeSelectEnabled(nextTool === "선택");` 추가. 어떤 편집 도구를 눌러도 새 활성 도구가 '선택'이 아니면 자동으로 비활성화·선택 해제.

### 동작 정리
| 상황 | SelectEnabled | exclusiveTarget | 결과 |
|------|---------------|-----------------|------|
| 평상시 | false | null | 일반 객체(벽/기둥)만 선택 |
| '선택' 모드 ON | true | TopologyManager | 토폴로지 노드만 선택 |
| '선택' OFF/다른 도구 | false | null | 일반 객체 선택 복귀 + 토폴로지 선택 해제 |
| '생성' 모드 | false | null | ObjectSelector 비활성 → 선택 자체 불가 |

### 테스트 결과
- `npx tsc --noEmit` 타입체크 **통과**(오류 없음).
- 런타임(브라우저) 동작 확인: **대기** — 아래 체크리스트 확인 필요.
  - [ ] 평상시('선택' OFF): 벽/기둥 선택 가능, 토폴로지 노드 호버/선택 모두 작동 안 함
  - [ ] '선택' ON: 토폴로지 노드 클릭/드래그/Shift 토글 선택, 벽/기둥 선택 불가
  - [ ] '선택' ON → 다른 편집 도구 전환 시 토폴로지 선택 전부 해제
  - [ ] '선택' 재클릭(토글 OFF) 시 토폴로지 선택 해제 + 일반 선택 복귀
  - [ ] '생성' 모드에서는 선택 자체가 동작하지 않음