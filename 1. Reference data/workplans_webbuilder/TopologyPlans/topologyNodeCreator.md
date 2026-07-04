# Topology Node Creator

## 목적
- TopologyNode를 수동으로 생성하고 노드 생성에 대한 Undo/Redo 구현

## 사용자 입력 동작 및 기능동작 예시
1. 좌측 탭 메뉴 '토폴로지' 클릭
2. 화면 좌측에 나타난 '토폴로지' 패널에서 '노드 편집'->'생성' 버튼 클릭
3. TopologyNodeCreator 기능 시작
4. 사용자가 three.js 3d 뷰화면에서 마우스를 이동하면 붉은계열 색상의 구체가 따라다님
5. 좌클릭을 하면 토폴로지 노드가 생성(생성된 노드는 이웃노드가 없는상태로 생성)
6. Esc키나 별도로 TopologyNodeCreator의 기능 종료가 실행되지 않으면 좌클릭 할때마다 노드 생성

## 요청사항
- 'src/WebEditor/objectCreator/' 폴더내에 topologyNodeCreator.ts 파일을 생성(TopologyNodeCreator)하여 작업
- 'src/WebEditor/undoredo/' 폴더네 undoRedoTopologyCommands.ts 파일에 생성에 대한 Undo/Redo 관련 클래스(CreateTopologyNodeCommand) 구현
- 필요한 항목 (TopologyNodeCreator)
  - ObjectCreatorBase를 상속받도록 하고, WebEditor클래스내에 initObjectCreators 함수내에서 다른 생성기와 함꼐 초기화 되도록함
  - 마우스 이동시 따라다니는 구체는 TopologyManager클래스의 rebuildMesh함수내 instanceMesh에서 사용하는 geometry와 material을 최대한 비슷하도록 요청
  - geometry, material, mesh 등은 TopologyNodeCreator내에서만 사용하므로 생성자나 registerEvents에서 초기화, dispose나 unRegisterEvents에서 메모리 해제 되도록함
  - 좌클릭 생성시 좌클릭다운(pointerdown)과 좌클릭업(pointerup)을 할때의 화면상 마우스 픽셀좌표값 차이가 5px이하일경우만 생성으로 판단할것
  - 생성으로 판단될때 'onTopologyNodeCreated' 이벤트를 통지(dispatch)하고 관련 Undo/Redo 커맨드를 통하여 생성 처리
- 필요한 항목 (CreateTopologyNodeCommand)
  - execute시에 생성, undo시에 제거, redo시에 다시 생성
  - TopologyManager클래스 addNode 함수와 removeNode 함수를 사용하도록 하되 addNode함수와 removeNode함수가 수정할 필요성이 있다면 수정 요청(generate, generateCell이 최신이므로 이부분 참고)
  - 노드 생성시에는 generate, generateCell과 마찬가지로 노드가 위치한 층정보 및 nodeTypeCode, slabName등이 결정되어야함(Undo/Redo시에도 생성시점의 데이터 유지)

## 지침사항
- public 및 override 표기 가능한 함수들은 최대한 표기하여 외부호출 가능한것을 알 수 있도록 할것
- private 및 protected 표기 가능한 함수들도 최대한 표기하여 내부함수임을 알 수 있도록 할것

---

## 구현 계획 (작업자: Claude Opus 4.8 / 작성일: 2026-06-25)

### 조사 결과 핵심 사실
- `ObjectCreatorBase`(`objectCreator/objectCreatorBase.ts`): `getPlanePickPoint()`로 groundPlane 레이캐스트, `registerEvents/unregisterEvents/dispose` 가상 메서드, `targetFloorKey/Height/LocationY` 필드 보유. 포인터/키 핸들러는 모두 `protected` virtual.
- 활성화 메커니즘: `EditorStateManager.ActiveCreatorKey = 'xxx'` setter가 모든 creator의 `unregisterEvents()` 후 해당 creator만 `registerEvents()` 호출. 즉 map에 등록만 하면 활성/비활성·snap·floor·camera가 자동 처리됨(webEditor.ts 256/314/695/798/977~980).
- `TopologyManager`: `generate()`/`generateCell()`이 노드의 `floorName`(Y좌표로 floor 탐색) + `slabName`(`findSlabNameByWorldPosition`) + `nodeTypeCode`(수동은 `'normal'`)를 결정하는 정본. `addNode(node)`/`removeNode(id)` 존재. 생성자에서 `floorManager` 보유 → 명령이 floorManager를 따로 받을 필요 없음.
- 명령 패턴: `UndoRedoItemBase { execute/undo/getWorkDescription }`, `undoRedoManager.executeCommand(cmd)`로 실행. `CreateColumnCommand`가 참조 모델.
- UI: `TopologyPanel.tsx`의 "노드 편집 → 생성" 버튼(`renderEditTool`)은 현재 `console.log` TODO 상태. `editor` prop 보유.

### 1. `definitions.ts` 수정
- `ObjectCreatorTypes` 유니온에 `"topologyNode"` 추가.
- `TopologyNodeCreatorEvents` 인터페이스 추가:
  ```ts
  export interface TopologyNodeCreatorEvents extends ObjectCreatorEvents {
      onTopologyNodeCreated: { position: Vector3; targetFloorKey: string; };
  }
  ```

### 2. `TopologyManager` 소폭 리팩터링 (중복 제거 + 명령용 진입점)
- `generate()`/`generateCell()`에 중복된 floor 탐색 + slab 결정 로직을 `private resolveFloorAndSlab(worldPos): { floorName, slabName }`로 추출하고 양쪽에서 호출(동작 동일, 위험 최소).
- 신규 `public createNodeData(worldPos: Vector3, nodeTypeCode = 'normal'): TopologyNode` 추가 — 새 UUID `id`/`displayName`, `resolveFloorAndSlab()`로 floor/slab 결정, 완성된 `TopologyNode` 반환(추가는 하지 않음). 명령이 이걸로 생성시점 데이터를 1회 확정.

### 3. `objectCreator/topologyNodeCreator.ts` 신규 (`TopologyNodeCreator`)
- `extends ObjectCreatorBase<TopologyNodeCreatorEvents>`.
- 생성자: `(_dom, _camera, _sysObjGroup: Group)` — 그룹 저장, `SphereGeometry(0.1,16,16)` + 붉은 `MeshStandardMaterial`(미리보기 식별 위해 반투명 살짝) 생성자에서 초기화.
- `public override registerEvents()`: super 호출 후 preview `Mesh` 생성·그룹에 add.
- `public override unregisterEvents()`: preview 제거.
- `public override dispose()`: geometry/material/mesh 메모리 해제.
- `protected override onPointerDown(evt)`: 좌클릭 시 `leftMouseDownPos(clientX,clientY)` 기록.
- `protected override onPointerMove(evt)`: `getPlanePickPoint()`(+ snapManager 있으면 스냅)로 preview 위치 갱신.
- `protected override onPointerUp(evt)`: down↔up 픽셀거리 `< 5`이고 좌클릭이면 `onTopologyNodeCreated`(preview.position clone + targetFloorKey) dispatch. 종료는 별도 안 하므로 클릭마다 반복 생성(Esc는 ActiveCreatorKey='none' 처리로 위임).
- private 헬퍼 `createPreviewMesh()` / `disposePreviewMesh()`. (지침대로 접근제어자 명시)

### 4. `undoredo/undoRedoTopologyCommands.ts` 신규 (`CreateTopologyNodeCommand implements UndoRedoItemBase`)
- 생성자: `(_topologyManager, _worldPosition)` → 생성자에서 `this.node = topologyManager.createNodeData(worldPos)` 1회 확정(id·floor·slab·nodeType 고정 → undo/redo 데이터 유지).
- `execute()`: `topologyManager.addNode(this.node)`.
- `undo()`: `topologyManager.removeNode(this.node.id)`.
- redo는 `executeCommand`가 `execute()` 재호출 → 동일 노드 재추가.
- `getWorkDescription()`: `` `TopologyNode 생성 [${this.node.id}]` ``.

### 5. `webEditor.ts` `initObjectCreators()` 배선
- `this.objectCreators.set('topologyNode', new TopologyNodeCreator(this.rendererMgr.Dom, this.camera, this.sceneMgr.SystemObjectGroup));`
- 이벤트 배선:
  ```ts
  const topologyNodeCreator = this.objectCreators.get('topologyNode') as TopologyNodeCreator;
  topologyNodeCreator.addEventListener('onTopologyNodeCreated', (evt) => {
      this.undoRedoManager.executeCommand(
          new CreateTopologyNodeCommand(this.topologyManager, evt.position));
  });
  ```
  (snap/floor/camera/update/unregister는 기존 `forEach` 루프가 자동 처리)

### 6. UI 연동 — `TopologyPanel.tsx` (워크플랜 동작 예시 충족용)
- "노드 편집 → 생성" 버튼에서 `editor.ActiveCreatorKey = 'topologyNode'` 토글(다시 누르면 `'none'`).
- 워크플랜 "요청사항"엔 미명시이고 "동작 예시(1~6번)"에만 등장 → **사용자 결정으로 작업 범위 포함 확정(2026-06-25)**.

---

## 진행 상황 (작업자: Claude Opus 4.8 / 갱신일: 2026-06-25)

| # | 작업 항목 | 상태 | 비고 |
|---|-----------|------|------|
| 1 | `definitions.ts` 타입/이벤트 추가 | ✅ 완료 | `ObjectCreatorTypes`에 `"topologyNode"` 추가, `TopologyNodeCreatorEvents` 추가 |
| 2 | `TopologyManager` 리팩터링 | ✅ 완료 | `resolveFloorAndSlab()` 추출(generate/generateCell 공통화), `createNodeData()` 추가 |
| 3 | `objectCreator/topologyNodeCreator.ts` 신규 | ✅ 완료 | `TopologyNodeCreator` 구현 |
| 4 | `undoredo/undoRedoTopologyCommands.ts` 신규 | ✅ 완료 | `CreateTopologyNodeCommand` 구현 |
| 5 | `webEditor.ts` 배선 | ✅ 완료 | creator 등록 + `onTopologyNodeCreated` → 명령 연결 |
| 6 | `TopologyPanel.tsx` 생성 버튼 연동 | ✅ 완료 | "생성" 버튼 ↔ `ActiveCreatorKey` 토글 |

### 실제 구현 세부 (계획 대비 변경/확정 사항)
- **미리보기 구체 사양**: `SphereGeometry(0.1, 16, 16)` + `MeshStandardMaterial({ color: 0xff3333, transparent: true, opacity: 0.7 })`. `rebuildMesh`의 `0xff0000`과 유사한 붉은계열이되, 미리보기 식별을 위해 반투명 처리.
- **자원 수명주기**: geometry/material 은 생성자에서 1회 생성하여 `dispose()`에서 해제, 미리보기 `Mesh`는 `registerEvents()`에서 생성하여 `unregisterEvents()`/`dispose()`에서 그룹에서 제거(공유 자원인 geometry/material은 메시 제거 시 dispose 하지 않음).
- **노드 데이터 확정 시점**: `CreateTopologyNodeCommand` 생성자에서 `topologyManager.createNodeData()`를 1회 호출하여 `id`/`floorName`/`slabName`/`nodeTypeCode`를 고정 → Undo/Redo 반복 시에도 동일 데이터 유지.
- **명령의 의존성 축소**: `TopologyManager`가 내부에 `floorManager`를 보유하므로 명령은 `floorManager`를 별도로 받지 않고 `(topologyManager, worldPosition)`만 받음.
- **활성/비활성 자동 처리**: creator를 `objectCreators` 맵에 등록하는 것만으로 camera 갱신/`setSnapManager`/target floor 주입/update 구독/`unregisterEvents` 정리가 기존 `forEach` 루프로 자동 적용됨.
- **클릭 판정**: pointerdown↔pointerup 픽셀 거리 `< 5`이고 좌클릭일 때만 생성 통지(드래그 회전과 구분). 기능 종료 전까지 좌클릭마다 반복 생성.

### 테스트 결과
- **타입체크**: `npx tsc --noEmit` → **통과 (exit 0, 오류 없음)** (2026-06-25). `build` 스크립트의 1단계(`tsc`)와 동일.
- **런타임/수동 클릭 테스트**: 미실시. 권장 시나리오 — ① 토폴로지 패널 → 노드 편집 → "생성" 클릭 후 3D 뷰에서 붉은 구체가 커서를 따라오는지, ② 좌클릭 시 노드(붉은 구체) 생성, ③ Undo/Redo 시 동일 위치·동일 데이터로 제거/재생성, ④ "생성" 재클릭 또는 다른 도구 전환 시 미리보기 사라짐(자원 해제) 확인.

---

## 추가 작업 내역 (작업자: Claude Opus 4.8 / 작성일: 2026-06-25)

### A. 미리보기 구체 Y높이 +0.2 보정
- **요청**: 마우스 이동 시 미리보기 구체의 Y높이를 레이캐스트된 좌표에서 0.2만큼 더함.
- **변경 파일**: `objectCreator/topologyNodeCreator.ts` — `onPointerMove()`.
- **구현**: `getPlanePickPoint()`(+ 스냅 적용) 결과 좌표에 `mouseMovePickPoint.y += 0.2` 후 미리보기 메시 위치에 반영. 바닥(슬라브)보다 살짝 띄워 노드가 면에 묻히지 않도록 처리.
- **부수 효과(의도된 동작)**: `onPointerUp()`이 `previewMesh.position`을 그대로 사용해 노드를 생성하므로, **실제 생성되는 노드의 Y좌표에도 +0.2가 반영**됨. (미리보기만 띄우고 노드는 원래 바닥 Y로 생성하려면 dispatch 시 Y에서 0.2를 다시 빼는 분리 처리 필요 — 현재는 미적용.)

### B. 토폴로지 일괄 생성 시 Undo/Redo 이력 초기화
- **요청**: 토폴로지 패널에서 '자동 생성' 또는 'Cell 생성' 선택 후 '토폴로지 생성 실행' 클릭 시 `UndoRedoManager.clear()` 호출하여 이력 제거.
- **변경 파일**: `app/components/panels/TopologyPanel.tsx` — `handleOnGenerateTopology()`.
- **구현**: `generate()` / `generateCell()` 실행 후, `auto`/`cell` 공통으로 `editor.UndoRedoManager.clear()` 호출(분기 바깥에서 1회). `editor` null 가드는 기존 `if (!editor) return;`로 처리됨.
- **근거**: 토폴로지를 일괄 재생성하면 기존 명령들이 참조하던 노드/상태와 정합성이 깨지므로 이력 초기화가 안전함. (`UndoRedoManager.clear()` 메서드 기존 존재, `WebEditor.UndoRedoManager` getter로 접근.)

### 추가 작업 테스트 결과
- **타입체크**: `npx tsc --noEmit` → **통과 (exit 0, 오류 없음)** (작업 A·B 반영 상태 기준).
- **런타임/수동 테스트**: 미실시. 권장 시나리오 — ① 미리보기 구체가 바닥에서 0.2만큼 떠서 따라오는지, ② '토폴로지 생성 실행' 후 Undo가 동작하지 않는지(이력 비워짐) 확인.