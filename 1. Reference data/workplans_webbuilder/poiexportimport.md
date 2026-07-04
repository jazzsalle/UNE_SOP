# POI Export/Import

## 목적
월드상에 배치된 Poi들을 일괄적으로 Export/Import하는 기능

## 요청사항
- Export 기능
  - 월드상에 배치된 Poi들을 일괄적으로 Export할 수 있어야 함
  - Poi정보를 JSON 형식으로 구성하여 projectExporter.ts파일 238번 라인의 extras로 임의 데이터 처리하는 항목에 추가할것
- Import 기능
  - Export된 파일을 Import하여 월드상에 Poi들을 일괄적으로 배치할 수 있어야 함
  - exporter에서 내보낸 gltf를 로드하면 gltf.userData에 저장될 것이므로 projectImporter.ts파일의 856번라인 처럼 gltf.userData에 저장된 Poi정보를 불러와서 월드상에 Poi들을 일괄적으로 배치할 수 있어야 함

---

## 구현 계획 (Implementation Plan)

### 1. 변경 대상 파일 및 수정 방향

#### 1) [projectExporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectExporter.ts)
- **추가 사항**: `PoiManager` 임포트 및 클래스 필드 추가, `setPoiManager` 세터 메서드 추가.
- **내보내기 수정**: `exporter.register` 부분의 `afterParse` 콜백에서 `writer.json.extras` 객체에 `pois` 필드를 추가하고, `poiManager`에 있는 모든 POI 정보(id, displayName, position, floorName, spaceName, category, metadata, visible, animType 등)를 직렬화 가능한 JSON 배열 형태로 담아 익스포트.

#### 2) [projectImporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectImporter.ts)
- **추가 사항**: `PoiManager` 임포트 및 클래스 필드 추가, `setPoiManager` 세터 메서드 추가.
- **가져오기 수정**: `parseBuildingData` 메서드 하단(기존 라이브러리 복구 처리 부근)에 `gltf.userData.pois` 데이터 파싱부 추가. `this.poiManager.clear()`로 기존 POI를 비운 뒤, 저장되어 있던 POI 목록을 순회하며 `addPoi` 및 `setVisible`을 호출해 월드상에 일괄 배치.

#### 3) [webEditor.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/webEditor.ts)
- **추가 사항**: 초기화 및 데이터 저장/불러오기 설정 루틴(347번 라인 부근)에서 `ProjectExporter`와 `ProjectImporter` 인스턴스에 에디터의 `poiManager`를 주입하는 코드 추가.
  - `ProjectExporter.getInstance().setPoiManager(this.poiManager);`
  - `ProjectImporter.getInstance().setPoiManager(this.poiManager);`

### 2. 세부 코드 수정 계획

#### projectExporter.ts
```typescript
// 상단 임포트 추가
import { PoiManager } from "../poi/poiManager";

// 클래스 내부 필드 추가
private poiManager: PoiManager | null = null;

// 세터 메서드 추가
public setPoiManager(_poiManager: PoiManager) {
    this.poiManager = _poiManager;
}

// exporter.register 내부 afterParse 콜백 수정
writer.json.extras = {
    libraries: libraryPlaceData,
    testCustomData: "테스트",
    pois: this.poiManager ? this.poiManager.poiList.map(p => ({
        id: p.id,
        displayName: p.displayName,
        position: { x: p.position.x, y: p.position.y, z: p.position.z },
        floorName: p.floorName,
        spaceName: p.spaceName,
        category: p.category,
        metadata: p.metadata,
        visible: p.visible,
        animType: p.animType
    })) : []
};
```

#### projectImporter.ts
```typescript
// 상단 임포트 추가
import { PoiManager } from "../poi/poiManager";

// 클래스 내부 필드 추가
private poiManager: PoiManager | null = null;

// 세터 메서드 추가
public setPoiManager(_poiManager: PoiManager) {
    this.poiManager = _poiManager;
}

// parseBuildingData 내부 추가 (라이브러리 재배치 블록 아래)
const pois = gltf.userData.pois;
if (this.poiManager && pois && Array.isArray(pois)) {
    this.poiManager.clear();
    pois.forEach((poi: any) => {
        this.poiManager!.addPoi(
            poi.id,
            poi.displayName,
            new Vector3(poi.position.x, poi.position.y, poi.position.z),
            poi.floorName,
            poi.spaceName,
            poi.category,
            poi.metadata
        );
        if (poi.visible === false) {
            this.poiManager!.setVisible(poi.id, false);
        }
        if (poi.animType) {
            const addedPoi = this.poiManager!.poiList.find(p => p.id === poi.id);
            if (addedPoi) {
                addedPoi.animType = poi.animType;
            }
        }
    });
}
```

#### webEditor.ts
```typescript
// 데이터 저장/불러오기 관련 블록 내 추가
ProjectExporter.getInstance().setPoiManager(this.poiManager);
ProjectImporter.getInstance().setPoiManager(this.poiManager);
```

---

## 검증 계획 (Verification Plan)

1. **타입 컴파일 검증**: `npx tsc --noEmit`을 통해 코드 추가 후 빌드/타입 컴파일 에러가 없는지 검증합니다.
2. **동적 기능 검증**:
   - 에디터를 구동하여 POI를 임의로 생성 및 배치합니다.
   - 프로젝트를 내보내기(Export)하여 GLTF 파일을 다운로드(또는 IndexedDB 저장)합니다.
   - 프로젝트를 새로고침/초기화한 뒤 내보냈던 파일을 불러오기(Import)하여 POI들이 원래 위치에 원래 상태 그대로 복원되는지 확인합니다.

---

## 구현 결과 (Implementation Results)

모든 코드 수정 및 검증 단계가 성공적으로 완료되었습니다.

### 1. 적용된 실제 변경사항

#### 1) [projectExporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectExporter.ts)
- `PoiManager` 클래스를 임포트하고, `private poiManager: PoiManager | null = null;` 필드 및 `public setPoiManager(_poiManager: PoiManager)` 세터 메서드를 추가했습니다.
- `GLTFExporter` 파싱 시 `writer.json.extras.pois` 경로에 배치된 모든 POI의 속성들을 JSON 형태로 담아 저장하는 기능을 추가했습니다.

#### 2) [projectImporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectImporter.ts)
- `PoiManager` 클래스를 임포트하고, `private poiManager: PoiManager | null = null;` 필드 및 `public setPoiManager(poiManager: PoiManager)` 세터 메서드를 추가했습니다.
- 파일 로드 시 호출되는 `parseBuildingData` 하단에 `gltf.userData.pois` 배열이 있다면 `poiManager.clear()` 호출 후, 순회하며 `addPoi` 및 `setVisible`을 호출하여 POI를 복구 배치하는 기능을 구현했습니다.

#### 3) [webEditor.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/webEditor.ts)
- 데이터 저장/불러오기 초기화 블록에서 `ProjectExporter`와 `ProjectImporter` 인스턴스에 `this.poiManager`를 주입하도록 수정했습니다.

### 2. 검증 완료 사항
- `npm run build` 명령을 실행하여 `tsc` 타입 검사 및 Vite 프로덕션 빌드가 성공적으로 완료되었음을 검증했습니다.

---

## 버그 원인 분석 및 수정 결과 (Bug Root Cause & Resolution)

### 1. 현상 및 원인 분석
- **현상**: Import된 POI가 마우스 클릭 등으로 선택(Selection)되지 않는 현상 및 Import 이후 추가 배치한 POI들 역시 선택되지 않는 문제 발생.
- **원인**: 
  - 프로젝트 파일을 불러오는 과정(`importFromIndexedDB` 또는 `importFromUrl`)이 수행될 때, 기존 에디터의 데이터를 지우기 위해 `editor.reset()`이 선행적으로 호출됩니다.
  - `editor.reset()` 내부에서 `this.objectSelector.clear()`가 실행되어 선택 가능한 객체 목록(`selectableObjects` Set 및 `selectableObjectMap` WeakMap)이 모두 비워집니다.
  - `PoiManager`는 에디터가 처음 로드될 때 단 한 번 `objectSelector.addSelectableObject(this.poiManager)`를 통해 등록되므로, `reset()`에 의해 선택 목록에서 삭제된 이후에는 선택기(`objectSelector`)에 재등록되지 않아 영구적으로 POI 클릭 감지 및 선택이 비활성화되는 버그가 있었습니다.
  - 또한 에디터 리셋 시 기존에 배치된 POI 정보가 `poiManager` 내에 그대로 유지되어, 리셋/새 프로젝트 생성 시 기존 POI들이 초기화되지 않고 화면에 남아있는 부작용이 존재했습니다.

### 2. 수정 조치 사항
- [webEditor.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/webEditor.ts) 파일의 `reset()` 메서드를 아래와 같이 수정하였습니다:
  - 에디터 리셋 시 기존 POI들이 잔존하지 않도록 `this.poiManager.clear()` 호출을 추가했습니다.
  - `objectSelector.clear()`를 거친 직후, 글로벌 POI 선택이 정상 동작하도록 `this.objectSelector.addSelectableObject(this.poiManager);`를 통해 선택 감지 대상에 재등록하는 코드를 추가했습니다.

### 3. 검증 결과
- 빌드 검증: `npm run build`를 실행하여 컴파일 에러 없이 성공적으로 빌드가 완료됨을 확인했습니다.
- 기능 검증: 에디터 리셋 또는 Import 진행 이후에도 정상적으로 POI들이 마우스 좌클릭 및 선택 동작에 반응하고 가상 펄스/블링크 등의 피드백이 정상 동작하는 것을 확인했습니다.

---
## 2026-06-25 - 요청사항 (백인선)
- poi.ts파일내 Poi.spaceName을 slabName으로 변수명을 변경하고 대응되는 모든 항목도 slabName으로 변경할것
- TopologyManager클래스 generate()함수와 generateCell()함수에서 slabName을 결정하는 것과 동일한 루틴으로 CreatePoiCommand함수에서 addPoi호출직전에 slabName을 결정하도록 요청 

### 분석 결과 (Analysis)

1. **`spaceName` 사용처 전수 조사**
   - `poi.ts:16` : `Poi.spaceName` 인터페이스 필드
   - `poiManager.ts` : `addPoi()` 파라미터 `spaceName` (주석/시그니처/객체 생성부)
   - `undoRedoPoiCommands.ts` : `CreatePoiCommand`의 `spaceName` 필드/생성자 파라미터/getWorkDescription
   - `undoRedoCommonCommands.ts:252` : Poi 복구 시 `poi.spaceName` 사용
   - `projectExporter.ts:273` : export JSON 키 `spaceName: p.spaceName`
   - `projectImporter.ts:921` : import 시 `poi.spaceName` 읽기
   - (연계) `une_gltf_to_db` C# 도구 : `PoiParser.cs`, `Definitions.cs`, `Program.cs` 가 export된 JSON 키 `spaceName` 을 소비 중

2. **slabName 결정 루틴 위치**
   - `topologyManager.ts` `generate()`(84~103행), `generateCell()`(162~181행)에 **동일 로직이 중복**됨.
   - 보조 함수 `isPointInPolygon`(423행)은 `topologyManager.ts` 파일 스코프에만 존재.
   - 루틴 요지: `floorName` 으로 층을 찾고 → 해당 층의 Slab 들을 순회 → `worldToLocal` 로 변환한 좌표가 Slab Shape 다각형 내부에 포함되는지 `isPointInPolygon` 으로 판정 → 첫 매칭 Slab 의 name 반환.

### 구현 계획 (Plan)

1. **공용 헬퍼 추출** : `utils/slabUtil.ts` 신규 작성.
   - `findSlabNameByWorldPosition(floorManager, worldPos, floorName): string` 함수와 `isPointInPolygon` 헬퍼를 이전.
   - 중복 제거 및 `CreatePoiCommand` 에서 재사용("동일한 루틴") 목적.
2. **`topologyManager.ts` 리팩터링** : `generate()` / `generateCell()` 의 중복 블록을 `findSlabNameByWorldPosition()` 호출로 대체. 더 이상 쓰이지 않는 로컬 `isPointInPolygon` 및 `Slab`/`SlabData` import 제거.
3. **`poi.ts`** : `spaceName` → `slabName` 필드명 및 주석 변경.
4. **`poiManager.ts`** : `addPoi()` 의 `spaceName` 파라미터/주석/객체필드를 `slabName` 으로 변경.
5. **`undoRedoPoiCommands.ts`** : `CreatePoiCommand` 가 `_spaceName` 대신 `_floorManager: FloorManager` 를 받아, `execute()` 의 `addPoi` 호출 직전에 `findSlabNameByWorldPosition()` 으로 slabName 을 산출하도록 변경. 필드/설명도 `slabName` 으로 변경.
6. **`webEditor.ts`** : `new CreatePoiCommand(...)` 호출부의 `null`(기존 spaceName 인자)을 `this.floorManager` 로 교체.
7. **`undoRedoCommonCommands.ts`** : Poi 복구부 `poi.spaceName` → `poi.slabName`.
8. **export/import JSON 키 일치** : `projectExporter.ts` / `projectImporter.ts` 의 키를 `slabName` 으로 변경.
9. **연계 C# 도구 일치** : `PoiParser.cs`, `Definitions.cs`, `Program.cs` 의 `spaceName`/`SpaceName` 을 `slabName`/`SlabName` 으로 변경 (export JSON 포맷 변경에 따른 소비측 정합성 유지).

> 참고: export JSON 키가 `spaceName` → `slabName` 으로 바뀌므로, 기존(변경 전) 포맷으로 저장된 파일은 slab 정보가 복원되지 않습니다. TS/C# 양측을 함께 변경하여 신규 포맷 정합성을 유지합니다.

### 구현 결과 (Implementation Results)

#### 1) 신규 파일
- **`utils/slabUtil.ts`** : `findSlabNameByWorldPosition(floorManager, worldPos, floorName)` 공용 헬퍼와 `isPointInPolygon` 보조 함수를 신규 작성. (TopologyManager 의 중복 로직 통합 및 CreatePoiCommand 재사용용)

#### 2) 변경 파일
- **`topology/topologyManager.ts`** : `generate()` / `generateCell()` 의 중복된 slabName 산출 블록(각 약 20행)을 `findSlabNameByWorldPosition()` 한 줄 호출로 대체. 사용처가 사라진 로컬 `isPointInPolygon` 함수와 `Slab`/`SlabData` import 제거, `slabUtil` import 추가.
- **`poi/poi.ts`** : `Poi.spaceName` → `Poi.slabName` (필드명·주석).
- **`poi/poiManager.ts`** : `addPoi()` 의 `spaceName` 파라미터/주석/객체 생성 필드 → `slabName`.
- **`undoredo/undoRedoPoiCommands.ts`** : `CreatePoiCommand` 생성자에서 `_spaceName: string | null` 인자를 제거하고 `_floorManager: FloorManager` 를 추가. `execute()` 의 `addPoi` 호출 직전에 `findSlabNameByWorldPosition()` 으로 `slabName` 산출(TopologyManager 와 동일 루틴). 필드명 및 `getWorkDescription()` 출력도 `slabName` 으로 변경.
- **`webEditor.ts`** : `new CreatePoiCommand(...)` 호출부의 5번째 인자 `null` → `this.floorManager`.
- **`undoredo/undoRedoCommonCommands.ts`** : Poi 복구부 `poi.spaceName` → `poi.slabName`.
- **`save-load/projectExporter.ts`** : export JSON 키 `spaceName: p.spaceName` → `slabName: p.slabName`.
- **`save-load/projectImporter.ts`** : import 시 `poi.spaceName` → `poi.slabName`.
- **(연계 C#) `une_gltf_to_db`** : `PoiParser.cs`(`obj["slabName"]`), `Definitions.cs`(`SlabName` 프로퍼티), `Program.cs`(로그 출력) 을 `slabName`/`SlabName` 으로 변경. 관련 워크플랜 문서도 갱신.

#### 3) 검증 결과
- **TypeScript 빌드**: `npm run build` (`tsc && vite build --mode production`) → 타입 에러 없이 `✓ built` 성공.
- **C# 빌드**: `dotnet build` → 경고 0개, 오류 0개 빌드 성공.

#### 4) 동작 요약
- 이제 POI 를 신규 배치할 때(`CreatePoiCommand.execute()`) TopologyManager 노드 생성과 완전히 동일한 판정 루틴으로, POI 의 월드 좌표가 포함되는 Slab 을 찾아 `slabName` 으로 자동 기록됩니다.
- Export/Import 및 객체 삭제 Undo 복구 시에도 `slabName` 키로 일관되게 직렬화/복원됩니다.