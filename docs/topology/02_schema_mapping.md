# 토폴로지 → 본 프로젝트 스키마 매핑 설계

> **원본**: `1. Reference data/workplans_webbuilder/` 분석([00_overview.md](./00_overview.md), [01_webbuilder_analysis.md](./01_webbuilder_analysis.md)) 및 본 프로젝트 공간 스키마(`app/src/domain/spatial`, [docs/spatial/06_schema_mapping.md](../spatial/06_schema_mapping.md))
> **작성일**: 2026-07-05
> **목적**: webbuilder가 export한 토폴로지 노드 JSON을 Visual SOP Graph Studio가 소비(임포트→공간 모델 뷰 오버레이→SOP 패트롤 임무→시뮬레이션/실행기)하기 위한 매핑 설계 결정과 근거를 기록한다 (Phase 7 / 4단계).

## 0. 매핑 요약

| webbuilder 개념 | 본 프로젝트 대응 | 비고 |
|---|---|---|
| `TopologyNode` export 9필드 ([01](./01_webbuilder_analysis.md) §1, 계약 A) | `TopologyNodeData` (`app/src/domain/topology/topologyTypes.ts`) | 필드 구조 그대로 수용 |
| `neighborIds`(링크의 직렬화 표현) | `TopologyLink` 도출(파생) — direction: both/one-way, vertical 여부 | 저장은 여전히 neighborIds, 링크는 렌더/분석용 파생 |
| 토폴로지 노드 전체(gltf 1회 export 분량) | `TopologySet` 컨테이너 (신규 도입 — §2) | webbuilder에는 없는 본 프로젝트 확장 |
| `floorName` | 공간 스키마 FLOOR 코드 (`B01B01` 등) | **가정** — §1.2 |
| `slabName` | 공간 기본키 `spaceId`(`SpatialSpace.primaryKey`) | **가정** — §1.2 |
| `worldPosition` (three.js Y-up) | 평면도 좌표 `{x, y}` 투영(`toPlanPoint`) | §1.1 |
| A* 경로 탐색 (`topologyPathFinder.ts`) | `findPath()` 순수 TS 자체 구현 (`app/src/domain/topology/pathFinder.ts`) | 신규 npm 의존성 없음 |
| 경로 테스트(시작/종료/경유 표시) | SOP 패트롤 임무(`sop_task` + `taskKind:"patrol"`) + 인스펙터 경로 미리보기 | §3 |

## 1. 좌표·식별자 매핑

### 1.1 좌표 변환 — three.js Y-up → 평면도 2D

webbuilder는 three.js 표준 **Y-up 좌표계**를 쓴다: XZ평면이 바닥(평면도), Y가 높이. 노드 `worldPosition`은 미터 단위 월드 좌표다 ([01](./01_webbuilder_analysis.md) §1, §6 — "월드 1unit = 1m").

본 프로젝트 공간 모델 뷰(`app/src/spatial/FloorPlanSvg.tsx`)와 공간 지오메트리(`SpaceGeometry.footprint`)는 2D 평면 좌표 `{x, y}`(m)를 쓴다. 토폴로지 노드를 평면도에 투영하는 변환은:

```
plan.x = world.x
plan.y = −world.z
```

**근거**: webbuilder 자신이 XZ 월드 좌표를 Slab의 2D Shape 평면과 비교할 때 **`(localPos.x, -localPos.z)`** 로 Z부호를 뒤집어 판정한다 (`TopologyPlans/topologyplan.md` 2026-06-25 Slab 이름 매핑 — "TopologyNode.worldPosition의 XZ좌표가 … `(localPos.x, -localPos.z)`가 해당 다각형 영역 내부에 존재하는지 검증"). 즉 webbuilder의 평면 Shape 관례가 `평면.y = −월드.z`이므로, 동일 변환을 쓰면 webbuilder에서 저작된 슬래브 도형과 토폴로지 노드가 본 프로젝트 평면도 위에서 정합된다.

- 높이(`world.y`)는 평면 투영에서 버려지되, **층 판별**(floorName)과 수직 노드 식별(nodeTypeCode stair/ramp/escalator)에 사용된다.
- 구현: `toPlanPoint(worldPosition) => { x: world.x, y: -world.z }` (`app/src/domain/topology/topologyTypes.ts`).

### 1.2 floorName ↔ FLOOR 코드, slabName ↔ 공간 기본키 (가정)

webbuilder에서 `floorName`은 `Floor.name`, `slabName`은 `Slab.name`이며 둘 다 **자유 문자열**이다 ([01](./01_webbuilder_analysis.md) §4). 본 프로젝트 공간 스키마는 「실내공간정보 구축 작업규정」 기반 코드 체계를 쓴다 (`app/src/domain/spatial/spatialTypes.ts`, [docs/spatial/03_naming_rules.md](../spatial/03_naming_rules.md)).

**가정(데이터 계약)**: webbuilder 측 저작 시 다음 명명을 사용해 전달된다고 가정하고, 본 프로젝트 샘플/시드 데이터도 이 가정으로 저작한다.

| webbuilder 필드 | 가정 값 | 예시 |
|---|---|---|
| `floorName` | 별표 5 **FLOOR 코드(CHAR 6)** = `SpatialFloor.floorCode` | `B01B01`(지하1층), `F01F01`(지상1층), `F02F02`(지상2층) |
| `slabName` | 별표 6 **공간 기본키** = `SpatialSpace.primaryKey`(spaceId) | `L_B00100000001AULW1_F01F01_BS_RM_00001` |

이 가정이 필요한 이유: 토폴로지 노드를 공간 모델 뷰의 층 탭(floorCode 필터)과 SOP Space Scope(공간 기본키 참조)에 **조인 키 변환 없이** 연결하기 위해서다. 실제 webbuilder 산출물이 다른 명명(예: "지상 1층", "복도A")을 쓰는 경우 임포트 시 매핑 테이블 한 겹(floorName→floorCode, slabName→spaceId)을 추가하면 되도록, 소비측 타입은 두 필드를 자유 문자열로 유지한다. **이 가정은 코드가 아닌 데이터 저작 규약이며, 검증 로직이 강제하지 않는다.**

수치 정합 참고: 검증용 건물(`app/src/domain/spatial/model/verificationBuilding.ts`)의 층 elevation은 B1=−3.5m/F1=0m/F2=4m이고, webbuilder 수동 생성 노드는 바닥 +0.2m 관례([01](./01_webbuilder_analysis.md) §2.3)를 따르므로 샘플 노드 Y는 B1=−3.3 / F1=0.2 / F2=4.2로 저작한다. floorName 판정 규칙(`floor.position.y ≤ y ≤ floor.position.y + FloorHeight`, [01](./01_webbuilder_analysis.md) §4.1)과도 일치한다.

## 2. TopologySet 컨테이너 도입

webbuilder의 export 단위는 "프로젝트(gltf) 1건에 노드 배열 1개"이며 별도 식별자가 없다 ([01](./01_webbuilder_analysis.md) §5). 본 프로젝트는 **`TopologySet`** 컨테이너를 신설한다:

```ts
interface TopologySet {
  setId: string;                     // 셋 식별자 — SOP 노드가 참조
  name: string;                      // 표시명
  siteUfid: string;                  // 소속 건물 UFID (SpatialSite.ufid)
  source: "sample" | "imported";     // 내장 샘플 / 사용자 임포트
  nodes: TopologyNodeData[];         // 계약 A 9필드 노드 배열
}
```

**도입 이유**:

1. **복수 셋 공존**: 한 건물에 층별/용도별(순찰용 성근 그래프 vs 대피용 조밀 Cell 그래프) 토폴로지가 여러 벌 존재할 수 있다. webbuilder도 자동/Cell/수동 3방식을 제공하므로 산출물이 단일하지 않다.
2. **SOP 그래프의 안정 참조**: 패트롤 노드(`topologySetId` + 노드 id)가 "어느 셋의 어느 노드"인지 가리켜야 재임포트·셋 교체 시 참조가 깨졌는지 검증할 수 있다. 노드 id(UUID)만으로는 소속 셋을 역추적할 수 없다.
3. **사이트 연동**: `siteUfid`로 공간 스키마(`SpatialSite`)와 조인해 공간 모델 뷰에서 해당 건물의 셋만 노출한다. webbuilder export에는 건물 식별자가 없으므로 임포트 시 사용자가 지정한다.
4. **영속/출처 구분**: `source`로 내장 샘플과 localStorage 영속 대상(imported)을 구분한다 — Mock API/localStorage 기반이라는 1차 POC 제약(CLAUDE.md) 준수.

구현 대상: `app/src/domain/topology/` (topologyTypes / importTopology / deriveLinks / pathFinder / registry / sample). 임포트 파서는 webbuilder 라운드트립 경로를 그대로 수용하기 위해 ① bare 배열 ② `{topologyNodes: [...]}` ③ `{extras|userData: {topologyNodes}}` 3형태를 받는다 ([01](./01_webbuilder_analysis.md) §5.2). `nodeTypeCode`는 webbuilder와 동일하게 자유 `string`으로 두고 알려진 값(`normal|stair|ramp|escalator|exit`)만 별도 유니온(`KnownNodeTypeCode`)으로 제공한다 — `slabTypeCode.md`의 "자유 문자열 + 기본 normal + 하위 호환 보정" 패턴을 따른 결정.

## 3. SOP 그래프 연동 — 신규 NodeType 없이 `sop_task` + `taskKind:"patrol"`

### 3.1 결정

토폴로지 경로를 SOP 그래프에 연결하는 방식으로 **신규 NodeType(예: "topology_patrol")을 추가하지 않고**, 기존 `sop_task` 노드의 신규 템플릿 `tpl-sop-patrol`(SOP 그룹, `taskKind: "patrol"`)을 추가한다.

```ts
defaultProperties: {
  title: "", assigneeRole: "로봇개", dueMinutes: 30, instructions: "",
  taskKind: "patrol",
  topologySetId: "",        // TopologySet.setId
  startNodeId: "",          // 토폴로지 노드 id (계약 A의 id)
  endNodeId: "",
  checkpointNodeIds: [],    // 점검 포인트 노드 id 배열
}
// ports: tpl-sop-task와 동일 — trigger_in: execution_flow(required) / mission_out: mission / status_out: mission_status
```

### 3.2 결정 근거

1. **파급 최소화**: `NodeType` 유니온 변경은 normalize → validate → compile 파이프라인, 포트 호환성 규칙, 노드 렌더러 전반에 파급된다(아키텍처 규칙: 편집기 레이어와 실행 로직 분리). 반면 템플릿 추가는 기존 계약 안의 확장이다.
2. **의미 일치**: `sop_task`는 이미 buildMissions → `RuntimeMission` → 실행기 상태 전이(임무 배정/진행/완료)가 완비되어 있다. "로봇개가 경로를 순찰하고 점검 포인트를 확인한다"는 것은 정확히 **임무(mission)** 이며, webbuilder의 경로 테스트(시작→종료 A* 경로, [01](./01_webbuilder_analysis.md) §6)가 임무의 이동 계획에 대응한다.
3. **선례**: `taskKind: "checklist"`가 동일 패턴(속성으로 임무 변형 구분)으로 이미 존재한다.

### 3.3 검증 규칙 (Validation)

패트롤 노드에 대해 규칙 "패트롤 토폴로지 참조"를 추가한다:

- (error) `topologySetId`/`startNodeId`/`endNodeId` 미지정 또는 레지스트리에 미존재
- (error) `findPath(set, startNodeId, endNodeId)`가 `null` — 도달 불가 경로 (webbuilder 경로 테스트의 실패 케이스와 동일 의미)
- (warning) `checkpointNodeIds` 중 미존재 노드 또는 산출 경로 밖 노드

## 4. 시뮬레이션 / 실행기 반영 개요

`RuntimeMission`에 선택 필드 `patrol`을 추가해(하위 호환 — 미지정 시 기존 동작 불변) 경로 계산 결과를 실어 나른다:

```ts
patrol?: {
  topologySetId: string;
  routeNodeIds: string[];      // findPath 산출 경로 (노드 id 순서열)
  checkpointNodeIds: string[];
  distanceM: number;           // 경로 총 거리(m) — 유클리드 합
}
```

- **시뮬레이션(buildMissions/buildTimeline)**: 패트롤 임무면 `findPath`로 경로를 계산해 `mission.patrol`을 채우고, 타임라인에 경로 노드별 "패트롤 이동 — {displayName}" / 점검 포인트별 "점검 수행 — {displayName}" 엔트리를 생성한다. webbuilder 경로 테스트의 "경유지점 노드 목록 표시"([01](./01_webbuilder_analysis.md) §6)를 SOP 타임라인 형태로 옮긴 것이다.
- **실행기(executor)**: START_MISSION 시 `patrol`이 있으면 경로 순서대로 `PATROL_WAYPOINT` / `PATROL_CHECKPOINT` 실행 로그를 남겨 실행이력·전자상황판에서 순찰 진행을 점검할 수 있게 한다.
- **공간 모델 뷰**: `toPlanPoint` 투영으로 층별 노드/링크를 오버레이하고, 링크는 방향성(one-way 표식)과 수직 연결(floorName이 다른 링크 — 점선 스터브)을 구분 표기한다. 방향성 판별은 webbuilder 속성창 규칙([01](./01_webbuilder_analysis.md) §1.1) 그대로다.

## 5. 범위 제외 (webbuilder 기능 중 미채택)

| webbuilder 기능 | 제외 이유 |
|---|---|
| 노드 생성 3방식·NavMesh 빌드 (recast-navigation) | 생산측 도구의 기능. 본 도구는 export 산출물만 소비 — 신규 npm 의존성 없음 결정과 일치 |
| 편집(선택/연결/해제/삭제/Undo·Redo) | 토폴로지 저작은 webbuilder 책임. 본 도구는 읽기 전용 오버레이 + 참조 선택만 제공 |
| 3D 경로 시각화(TubeGeometry/InstancedFlow), 시작/종료 콘 마커 | 3D 렌더는 Phase 9(WebGL 뷰어) 범위. Phase 7은 2D 평면 오버레이와 텍스트 미리보기로 대체 |
| POI export/import (`poiexportimport.md`) | 토폴로지 스키마 범위 밖. 점검 포인트는 노드 `metadata`(checkpoint 플래그)로 표현 |
| slabTypeCode (`slabTypeCode.md`) | 슬래브 속성은 공간 스키마(Phase 6) 소관. `nodeTypeCode` 수용 패턴의 참고로만 사용 |
