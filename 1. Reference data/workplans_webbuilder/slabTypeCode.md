# Slab Type Code

## 목적
- SlabData에 string 자료형의 slabTypeCode 필드를 추가하고 관련 처리

## 2026-06-25 요청사항(백인선)
- 기본적으로는 초기화시 'normal'로 설정되도록 하고 생성, 제거, 편집, undo/redo 및 import/export시에 slabTypeCode값이 유실되지 않도록 유지 처리
- slabTypeCode는 추후 값을 수정할 수 있게 할 예정이며 수정한 값이 slabTypeCode코드를 수정하지 않는한 생성, 제거등의 작업에서도 유실되지 않아야함

---
## 구현 계획 (slabTypeCode 필드 추가 및 유지 처리 - 작업자: Claude Code)

### 사전 분석 (코드 흐름 조사 결과)
- **타입/기본값**: `SlabData`(`definitions.ts:278`)에 필드가 없음. 기본 데이터는 `SlabModel.createDefaultSlabData()`(`slabModel.ts:16`)에서 생성. 복제는 `SlabModel.cloneSlabData()`(`slabModel.ts:38`)가 `...source`로 전체 복사 → slabTypeCode 자동 보존됨.
- **생성**: `slabCreator.ts:340`의 `onSlabCreated` 이벤트 data 리터럴이 SlabData 형태를 요구. 실제 수동 생성 커맨드(`undoRedoSlabCommands.ts:61`)는 `new Slab()`이 기본 데이터('normal')를 가지므로 별도 처리 불필요.
- **편집**: `SlabShapeChangeCommand`(shape), `ExtrudeSlabCommand`(thickness), `SetSlabDisplayNameCommand`(displayName) 모두 해당 필드만 변경하고 slabTypeCode는 건드리지 않음 → 자동 보존됨.
- **삭제/undo (단일/사이드이펙트)**: `DeleteObjectCommand`(`undoRedoCommonCommands.ts`)는 삭제 시 `data: obj.StructureData`(라이브 참조)를 저장하나, undo 재생성(`:316` slab case)에서 `setSlabData(thickness, shape)`만 호출 → slabTypeCode 미복원. 벽 제거로 인한 슬랩 병합 사이드이펙트(`:546/:559` 리터럴 + `:610` recover)도 thickness/shape만 적용.
- **층 삭제/undo**: `undoRedoFloorCommand.ts:495` 복구도 `setSlabData`만 적용. 저장된 `slabDataMap.data`는 SlabData 참조라 slabTypeCode 보유.
- **벽 생성/이동 reshape**: `undoRedoWallCommands.ts` / `undoRedoObjectTransformCommands.ts`의 `updateSlab`이 `{shape,name,thickness,workType}` 최소 데이터만 보유. delete 캡처 시 원본 슬랩의 slabTypeCode를 담지 않아, undo로 원본 슬랩을 같은 이름으로 재생성할 때 slabTypeCode 유실.
- **import/export**: 내보내기는 `setStructureData()`가 `structureObjectData` 전체를 `userData`에 넣고 scene 직렬화하므로 필드 추가만으로 자동 저장됨. 가져오기는 `projectImporter.ts:421` 리터럴이 명시 필드만 읽고 `:604`에서 적용 → 두 곳 모두 처리 필요.

### 설계 결정
- slabTypeCode 기본값은 `'normal'`. 과거 데이터/누락 시에도 `'normal'`로 보정(하위 호환).
- **기존 슬랩의 라운드트립(삭제→undo, 층 삭제→undo, import/export, 편집)에서는 slabTypeCode를 완전히 보존**한다.
- 벽 reshape의 **forward(정방향) 동작으로 새 UUID 슬랩이 생성**되는 경우는 형상이 바뀐 새 슬랩이므로 `'normal'`로 둔다(원본→분할/병합 슬랩의 출처 추적은 범위 외). 단, undo로 원본 슬랩을 되돌릴 때는 캡처해 둔 slabTypeCode를 복원한다.

### 작업 항목
1. **`definitions.ts`**: `SlabData`에 `slabTypeCode: string;` 추가.
2. **`slabModel.ts`**: `createDefaultSlabData()` 반환 객체에 `slabTypeCode: "normal"` 추가. (`cloneSlabData`는 `...source`로 자동 보존, 변경 불필요)
3. **`slabCreator.ts`**: `onSlabCreated` dispatch data 리터럴에 `slabTypeCode: "normal"` 추가(타입 충족 및 의미 명확화).
4. **`undoRedoCommonCommands.ts`**:
   - 삭제 undo의 slab case(`:316`)에서 `setSlabData` 후 `(slab.StructureData as SlabData).slabTypeCode = slabData.slabTypeCode` 적용.
   - 병합 사이드이펙트 리터럴(`:546`, `:559`)에 `slabTypeCode: (matchedSlabs[0].StructureData as SlabData).slabTypeCode` 추가, recover(`:610`)에서 적용.
5. **`undoRedoFloorCommand.ts`**: 슬랩 복구(`:495`)에서 `setSlabData` 후 `slabData.data.slabTypeCode` 적용.
6. **`undoRedoWallCommands.ts`**: `shapesAtExecute/Undo` 및 `updateSlab` 데이터 타입에 `slabTypeCode?: string` 추가. delete 캡처 시 원본 slabTypeCode 기록, undo 미러 복사 시 전파, `updateSlab` create 시 값이 있으면 적용.
7. **`undoRedoObjectTransformCommands.ts`**: 6번과 동일 패턴 적용.
8. **`projectImporter.ts`**: 리터럴(`:421`)에 `slabTypeCode: child.userData['structureObjectData']['slabTypeCode'] || 'normal'` 추가, 적용부(`:604`)에서 `(slab.StructureData as SlabData).slabTypeCode = data.slabData.slabTypeCode` 적용. (Exporter는 자동 직렬화로 수정 불필요)
9. **빌드 검증**: `cmd.exe /c npx tsc --noEmit`.

### 진행 상황
- [x] 코드 흐름 조사 및 계획 수립
- [x] 구현
- [x] tsc 컴파일 검증

## 구현 결과 (slabTypeCode 필드 추가 및 유지 처리 - 작업자: Claude Code)

### 타입 / 기본값
- **[definitions.ts]**: `SlabData` 인터페이스에 `slabTypeCode: string` 필드를 추가했습니다.
- **[slabModel.ts]**: `createDefaultSlabData()`에 `slabTypeCode: "normal"`을 추가하여 초기화 시 기본값이 `'normal'`이 되도록 했습니다. `cloneSlabData()`는 `...source`로 전체를 복사하므로 별도 수정 없이 slabTypeCode가 자동 보존됨을 확인했습니다.

### 생성
- **[slabCreator.ts]**: `onSlabCreated` 이벤트 dispatch 데이터 리터럴에 `slabTypeCode: "normal"`을 추가했습니다(SlabData 타입 충족). 실제 수동 생성 커맨드는 `new Slab()`의 기본 데이터를 사용하므로 'normal'이 자동 적용됩니다.

### 편집
- `SlabShapeChangeCommand`(shape), `ExtrudeSlabCommand`(thickness), `SetSlabDisplayNameCommand`(displayName)는 각 해당 필드만 변경하고 slabTypeCode는 건드리지 않으므로 편집 작업에서 값이 자동 유지됨을 확인했습니다(수정 불필요).

### 제거 / undo·redo
- **[undoRedoCommonCommands.ts]**:
  - 삭제 undo의 slab 재생성부에서 저장된 `StructureData`의 slabTypeCode를 복원하도록 처리했습니다.
  - 벽 제거로 인한 슬랩 병합 사이드이펙트의 SlabData 리터럴 2곳에 `matchedSlabs[0]`의 slabTypeCode를 담고, recover 재생성부에서 적용하도록 처리했습니다.
- **[undoRedoFloorCommand.ts]**: 층 삭제 undo의 슬랩 복구부에서 저장된 `slabDataMap.data`의 slabTypeCode를 복원하도록 처리했습니다.
- **[undoRedoWallCommands.ts]** / **[undoRedoObjectTransformCommands.ts]**: 벽 생성·이동에 따른 슬랩 reshape 처리에서, 슬랩 데이터 구조체(`shapesAtExecute/Undo`, `floorExecuteShapes/UndoShapes`, `updateSlab` 파라미터)에 `slabTypeCode?: string`를 추가했습니다. delete 캡처 시 원본 슬랩의 slabTypeCode를 기록하고, undo 미러 데이터로 전파한 뒤, `updateSlab`의 create 분기에서 값이 있으면 복원(없으면 'normal')하도록 처리했습니다. → 원본 슬랩을 같은 이름으로 되돌리는 undo 시 slabTypeCode가 보존됩니다(정방향 reshape로 생기는 신규 UUID 슬랩은 새 형상이므로 'normal').

### import / export
- **[projectImporter.ts]**: 슬랩 파싱 리터럴에 `slabTypeCode: userData['structureObjectData']['slabTypeCode'] || 'normal'`(하위 호환)을 추가하고, 슬랩 생성부에서 `(slab.StructureData as SlabData).slabTypeCode`로 적용했습니다.
- **[projectExporter.ts]**: 내보내기는 `setStructureData()`가 `structureObjectData` 전체를 `userData`에 넣고 `GLTFExporter`가 이를 `extras`로 직렬화하므로, 문자열 slabTypeCode가 자동 저장됨을 확인했습니다(수정 불필요).

### 테스트 결과
- `npx tsc --noEmit` 실행 결과 출력 없이 정상 종료되어 타입/컴파일 오류가 없음을 확인했습니다.