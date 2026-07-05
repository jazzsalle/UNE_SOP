# webbuilder 토폴로지 상세 분석 — 데이터 구조·알고리즘·포맷

> **원본**: `1. Reference data/workplans_webbuilder/TopologyPlans/` 12개 문서 + 루트 `poiexportimport.md`, `slabTypeCode.md`
> **작성일**: 2026-07-05
> **목적**: 본 프로젝트가 소비할 webbuilder 토폴로지 데이터 계약(노드 9필드), 생성/연결 알고리즘, export/import 포맷, A* 경로 탐색 방식을 원본 근거와 함께 정리한다.

## 1. 노드 데이터 구조 — 직렬화 계약 (계약 A)

`TopologyPlans/topologyexportimport.md`의 `exportNodes()` 기본 5필드(id/displayName/worldPosition/metadata/isExit + neighborIds)에, 이후 이력에서 직렬화 대상으로 추가된 `floorName`(`topologyplan.md` 2026-06-25 층 이름 매핑), `slabName`(같은 문서 Slab 이름 매핑), `nodeTypeCode`(같은 문서 nodeTypeCode 값 입력 처리)를 합친 **9필드**가 최종 export 포맷이다.

```json
{
  "id": "uuid",
  "displayName": "노드 표시명",
  "worldPosition": { "x": 0, "y": 0.2, "z": 0 },
  "metadata": {},
  "isExit": false,
  "floorName": "층 이름",
  "slabName": "슬래브 이름",
  "nodeTypeCode": "normal | stair | ramp | escalator | exit",
  "neighborIds": ["uuid", "..."]
}
```

| # | 필드 | 타입 | 의미 | 결정 방식 / 근거 |
|---|---|---|---|---|
| 1 | `id` | string(UUID) | 노드 고유 식별자 | 생성 시 UUID 발급. Undo/Redo에서도 유지 (`topologyNodeCreator.md`) |
| 2 | `displayName` | string | 노드 표시명 — 목록/드롭다운/경로 결과에 노출 | `TopologyNodeList.md` (id 대신 displayName 표시 요청) |
| 3 | `worldPosition` | {x,y,z} | three.js 월드 좌표(m, Y-up). 런타임은 `Vector3`, 직렬화는 plain 객체 | `topologyexportimport.md` `exportNodes()` |
| 4 | `metadata` | object | 사용자 정의 속성(JSON). 속성창 '상세 메모'로 저장 | `TopologyPropertyPanel.md` (2026-06-26 실제 연계) |
| 5 | `isExit` | boolean | 출구 노드 여부. 속성창 Switch On 시 true + nodeTypeCode='exit' | `TopologyPropertyPanel.md` |
| 6 | `floorName` | string | 소속 층 이름 — Y좌표 층 범위 판정으로 자동 결정(미매칭 시 `""`) | `topologyplan.md` 2026-06-25 층 이름 매핑 |
| 7 | `slabName` | string | 소속 슬래브 이름 — 층의 Slab Shape 다각형 포함 판정으로 자동 결정 | `topologyplan.md` 2026-06-25 Slab 이름 매핑 |
| 8 | `nodeTypeCode` | string | `normal`(바닥) / `stair` / `ramp` / `escalator`(수직 체인) / `exit`(출구 전환). 타입은 자유 문자열, 하위 호환 기본값 `'normal'` | `topologyplan.md` 2026-06-25 nodeTypeCode 처리, `TopologyPropertyPanel.md`(exit) |
| 9 | `neighborIds` | string[] | 이웃 노드 id 목록 — **링크의 직렬화 표현**. 런타임 `neighbors`(객체 참조 배열)를 순환참조 방지를 위해 id 배열로 변환 | `topologyexportimport.md` |

보조 사실:

- `nodeTypeCodeBeforeExit`(출구 Switch Off 시 복원용)는 런타임 전용 필드로 export 계약에 포함되지 않는다 (`TopologyPropertyPanel.md`).
- 선택 상태(`selectedNodeIds` 등)는 매니저 내부 transient로 직렬화에 영향을 주지 않는다 (`TopologyNodeSelect.md`).

### 1.1 링크 방향성 규칙

링크는 별도 엔티티가 없으므로 방향성은 **이웃 참조의 상호성**으로 판별한다 (`TopologyPropertyPanel.md` 2026-06-26 연계 요청사항):

> "연결된 노드가 현재 선택되어 보여지고 있는 노드를 인접 이웃 노드(neighbors)로 서로 가지고 있다면 both로 판단하고 없다면 one-way로 판단할것"

- A.neighborIds ∋ B **그리고** B.neighborIds ∋ A → **both (↔, 양방향)**
- 한쪽만 참조 → **one-way (→, 단방향)** — 속성창의 '해제' 버튼이 현재 노드의 neighbors에서만(단방향) 제거하므로 발생 가능
- '연결' 도구는 항상 상호 추가(both), '연결 해제(단일)'는 상호 제거 (`TopologyNodeConnect.md`, `TopologyNodeDisconnectSingle.md`)

## 2. 노드 생성 방식 3종

### 2.1 NavMesh Convex 병합 (자동 생성) — `topologyplan.md`

recast-navigation(`@recast-navigation/core`)으로 빌드한 NavMesh에서:

1. `getNavMeshPositionsAndIndices(navMesh)`로 삼각형 목록 추출.
2. **삼각형 반복 병합**: 0번째 삼각형에서 시작해, 한 변 이상 맞닿아 있으면서 병합 후에도 XZ평면 외적 부호 검사로 **볼록(Convex)이 유지되는** 삼각형을 흡수 반복 → Convex 폴리곤 영역(`NavMeshConvexRegionData`, center + polygonPoints) 집합 생성.
3. **이웃 연결(`connectNeighbors`)**: 모든 영역 쌍에 대해 경계 선분 맞닿음 판정(`segmentsTouch`: XZ 투영 collinear overlap + Y오차 0.1 이내) → 맞닿은 영역끼리 서로의 neighbors에 상호 추가.
4. 영역 center가 노드 `worldPosition`이 되고 `nodeTypeCode: 'normal'`.

### 2.2 Cell(Grid) 생성 — `topologyplan.md` (Cell(Grid) 기반 생성 절)

1. NavMesh 월드 바운딩을 구해 XZ평면을 `_cellInterval` 간격 격자로 이중 루프 순회.
2. 각 격자점 (x,z)에 대해 NavMesh 모든 삼각형을 무게중심 좌표(Barycentric)로 검사 — 삼각형 위에 있으면 보간된 Y로 3D 격자점 (x,y,z) 확정. **다층 구조(1층/2층)는 Y가 다른 독립 노드로 모두 생성**된다.
3. 동일 (x,z)에서 Y차 0.1 이내 중복 노드는 제거(dedup).
4. 셀 크기의 사각형 폴리곤을 부여하고 `connectNeighbors`로 맞닿은 셀끼리 이웃 연결. `nodeTypeCode: 'normal'`.

### 2.3 수동 생성 — `topologyNodeCreator.md`

- 토폴로지 패널 '노드 편집 → 생성' 모드에서 3D 뷰 좌클릭으로 생성(붉은 미리보기 구체가 커서 추종).
- 클릭 판정: pointerdown↔pointerup 픽셀 거리 5px 미만일 때만 생성(드래그 회전과 구분).
- **Y +0.2m 보정**: 레이캐스트 바닥 좌표에 `y += 0.2`를 더해 노드가 슬래브 면에 묻히지 않게 배치하며, **실제 생성 노드의 Y에도 +0.2가 반영**된다 (추가 작업 내역 A).
- 생성 시점에 `floorName`/`slabName`/`nodeTypeCode('normal')`를 확정(`createNodeData()`)하고 Undo/Redo에도 동일 데이터 유지. 생성 직후 이웃 없음(고립 노드).
- '자동 생성'/'Cell 생성' 일괄 실행 시에는 Undo/Redo 이력을 초기화한다 (추가 작업 내역 B).

## 3. 수직 연결 알고리즘 (Stair / Ramp / Escalator) — `topologyplan.md`

수직 이동 시설 1개당 **노드 3개 체인**을 생성해 층간 경로를 만든다.

### 3.1 3노드 체인 (p0 / p1 / p2)

Stair 기준(로컬 좌표, 월드 행렬로 변환 후 사용):

- **p0 (하층 진입점)**: `[0, stepHeight, stepWidth * 0.5]`
- **p2 (상층 진출점)**: `[geometryBoundingSize.x - stepDepth, geometryBoundingSize.y, stepWidth * 0.5]`
- **p1 (중점)**: p0와 p2의 중점
- 체인 내부는 순차 이웃 연결(p0↔p1↔p2). `nodeTypeCode`는 `stair`/`ramp`/`escalator`.
- Ramp는 `RampData`의 stepWidth/stepDepth(기본 0.3)를 기하 기준으로 동일 구조 적용.
- Escalator는 미리 계산된 `Escalator.topologyNodePoints`(로컬) 배열을 월드로 변환 — 0번째=p0, 마지막=p2에 대응하고 내부 점들을 순차 체인 연결.

### 3.2 바닥 노드와의 접속 — 폴리곤 외곽선 투영 최단거리

p0/p2를 기존 바닥 영역(노드)과 양방향 연결하는 규칙 (3회 개정된 최종안, `topologyplan.md` "계산조건수정" 및 "투영 최단 거리" 절):

1. **Y오차 필터**: 바닥 영역 중 `|region.center.y − p.y|`가 허용 오차 이내인 것만 후보.
   - p0: **≤ 0.1**, p2: **≤ 0.2** (종료점 오차 상향 개정), Escalator 양끝: **≤ 0.5**
2. **투영 최단거리 선정**: 각 후보 영역의 **폴리곤 외곽선(선분들)에 p를 투영**(`distancePointToPolygonBoundary` — 점-선분 최단거리 전수 조사)해 최단거리를 계산하고, 거리가 가장 가까운 영역 1개를 선정.
   - (개정 이력: ①center와의 3D 거리 → ②폴리곤 외곽선 투영 거리로 변경 — center 거리로는 크고 납작한 영역에서 오판되기 때문)
3. 선정된 바닥 영역과 p0(또는 p2)를 서로의 neighbors에 **상호 등록(양방향)**.

## 4. 층(floorName) / 슬래브(slabName) 매핑 규칙 — `topologyplan.md` 2026-06-25

### 4.1 floorName

노드 `worldPosition.y`가 어떤 층의 높이 범위에 들어가는지로 결정:

```
floor.position.y <= node.y <= floor.position.y + floor.FloorHeight
```

조건을 만족하는 **첫 번째** `Floor`의 `name`을 `floorName`으로 할당. 매칭 없으면 빈 문자열 `""`.

### 4.2 slabName

1. `floorName`으로 소속 `Floor`를 찾고 그 층의 `Slab` 인스턴스들을 수집.
2. 각 Slab에 대해 노드 월드 좌표를 `slab.worldToLocal()`로 로컬 변환.
3. Slab Shape의 2D 경계점들에 대해 **`(localPos.x, -localPos.z)`** 좌표가 다각형 내부인지 레이 캐스팅(`isPointInPolygon`)으로 판정 (Hole 미검사).
4. 포함되는 첫 번째 Slab의 `name`을 `slabName`으로 저장.

이 판정 루틴은 이후 `utils/slabUtil.ts`의 `findSlabNameByWorldPosition()`으로 추출되어 **POI의 slabName 결정에도 동일하게 재사용**된다 (`poiexportimport.md` 2026-06-25).

> 참고: 3단계에서 Shape 판정 좌표가 `(x, -z)`인 것은 three.js Y-up 월드의 XZ평면을 2D 평면도로 투영할 때 **Z축 부호를 뒤집는** webbuilder의 관례를 보여준다. 본 프로젝트 좌표 변환 결정([02_schema_mapping.md](./02_schema_mapping.md) §1)의 직접 근거다.

## 5. Export / Import 포맷 — `topologyexportimport.md`

### 5.1 Export

- `TopologyManager.exportNodes(): any[]` — `Map<string, TopologyNode>`를 §1의 9필드 plain 객체 배열로 직렬화. `neighbors`(객체 참조)는 **순환 참조 방지를 위해 `neighborIds: string[]`로 변환**.
- gltf 내보내기 시 `GLTFExporter`의 `afterParse` 콜백에서 **`writer.json.extras.topologyNodes`** 에 이 배열을 기입:

```typescript
writer.json.extras = {
    libraries: ...,
    pois: ...,                       // poiexportimport.md — POI도 같은 extras에 병기
    topologyNodes: this.topologyManager.exportNodes()
};
```

### 5.2 Import

- export된 gltf를 로드하면 extras가 **`gltf.userData.topologyNodes`** 로 읽힌다 → `TopologyManager.importNodes(importedNodes)` 호출.
- 복원 절차: ① 기존 노드 전부 제거 → ② **1차 패스**: 노드 객체 생성·Map 등록(worldPosition은 `Vector3` 재구성) → ③ **2차 패스**: `neighborIds`를 순회하며 존재하는 노드만 `neighbors`에 참조 연결 → ④ `rebuildMesh()`로 노드 구체·연결선 비주얼 갱신.
- 하위 호환: `nodeTypeCode` 누락 시 `'normal'` 보정 (`topologyplan.md` nodeTypeCode 절).

**본 프로젝트 수용 형태**: 소비측 파서는 ① bare 배열, ② `{topologyNodes: [...]}`, ③ `{extras: {topologyNodes}}` / `{userData: {topologyNodes}}` 래핑 3형태를 모두 수용하도록 설계한다 ([02_schema_mapping.md](./02_schema_mapping.md) §3).

## 6. A* 경로 탐색 — `TopologyTest.md`, `Summary.md` §8

`topology/topologyPathFinder.ts` (webbuilder 신규 모듈):

- **그래프**: 노드의 `neighbors`(이웃 참조)를 간선으로 사용.
- **비용(cost)과 휴리스틱**: 노드 간 `worldPosition` **유클리드 거리** (월드 1unit = 1m).
- **시그니처**: `findPath(nodes, startId, endId)` → 시작→종료 순서의 `TopologyNode[]`, 실패 시 `null`.
- UI: 시작/종료 노드는 드롭다운(모든 노드, 상호 배제) 또는 3D 클릭 pick(`pathPick` 모드)으로 지정. 성공 시 경유 노드 displayName 목록 + `CatmullRomCurve3`+`TubeGeometry` 경로 + `InstancedFlow` 콘 흐름(기본 1.5m/s 일정 속도, `flowObjectCount`개 균등 배치). 실패 시 "경로찾기에 실패하였습니다." 표기.

본 프로젝트는 이 방식(이웃 그래프 + 유클리드 cost/휴리스틱 A*)을 순수 TS로 자체 구현해 소비한다 — recast-navigation 등 신규 의존성 불필요.

## 7. (참고) POI 포맷과 slabTypeCode

토폴로지와 같은 gltf extras 채널로 함께 내보내지는 인접 데이터. 본 프로젝트 토폴로지 스키마의 직접 대상은 아니나, 점검 포인트 메타데이터·공간 연동 설계 시 참고했다.

### 7.1 POI export 포맷 — `poiexportimport.md`

`extras.pois` / `userData.pois` 배열, 항목당:

| 필드 | 의미 |
|---|---|
| `id`, `displayName` | 식별자, 표시명 |
| `position` {x,y,z} | 월드 좌표 |
| `floorName` | 소속 층 이름 |
| `slabName` | 소속 슬래브 이름 — **토폴로지 노드와 동일한 `findSlabNameByWorldPosition()` 루틴으로 결정** (2026-06-25에 `spaceName`에서 개명) |
| `category` | POI 분류 (목록 팝업의 그룹 기준 — `testpoilistview.md`) |
| `metadata` | 사용자 정의 속성 (`testpoimetadata.md`) |
| `visible`, `animType` | 가시성, 애니메이션 타입 |

### 7.2 slabTypeCode — `slabTypeCode.md`

- `SlabData.slabTypeCode: string`, 기본값 `'normal'`. 슬래브(바닥판)의 유형 코드로, 생성/편집/삭제 undo/층 삭제 undo/import·export 전 구간에서 유실되지 않도록 유지 처리됨(과거 데이터 누락 시 `'normal'` 보정).
- 토폴로지 노드의 `nodeTypeCode`와 동일한 "자유 문자열 + 기본 normal + 하위 호환 보정" 패턴 — 본 프로젝트도 `nodeTypeCode`를 닫힌 유니온이 아닌 `string`으로 수용하고 알려진 값만 별도 유니온으로 둔다([02](./02_schema_mapping.md) §3).
