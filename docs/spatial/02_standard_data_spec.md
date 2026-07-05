# 별표 3 — 실내공간정보 표준데이터 사양

> **원본**: `1. Reference data/실내공간정보 구축 작업규정/[별표 3] 실내공간정보 표준데이터 사양(실내공간정보 구축 작업규정).pdf` (18쪽)
> **작성일**: 2026-07-05
> **목적**: POC 공간 스키마(`app/src/domain/spatial`) 매핑을 위한 분석

CityGML 2.0 Building 모듈 기반의 객체유형 11종 사양이다. 각 객체유형은 정의 / 상위 객체유형 / 연계된 객체유형 / 기하요소(LOD별) / 객체 속성(M=필수, O=선택) / 제약조건으로 기술된다.

## 1. 객체유형 계층 구조

```
core::_Site
└─ _AbstractBuilding (추상건물)          ← 추상, 객체화 불가
   ├─ Building (건물)
   └─ BuildingPart (부분건물)

GML::_Feature
├─ Room (단위공간)
├─ IntBuildingInstallation (실내설치물)
├─ BuildingFurniture (실내가구)
├─ _BoundarySurface (경계면)             ← 추상
│  ├─ InteriorWallSurface (실내벽면)
│  ├─ CeilingSurface (천장면)
│  ├─ FloorSurface (바닥면)
│  └─ ClosureSurface (가상면)
└─ _Opening (개폐)                        ← 추상
   ├─ Door (문)
   └─ Window (창문)
```

> 원문은 _BoundarySurface 하위 4종(실내벽면/천장면/바닥면/가상면)과 _Opening 하위 2종(문/창문)을 각각 별도 표로 기술하므로, 추상유형을 포함하면 총 14개 표(구체 유형 기준 11종 분류: AbstractBuilding / Building / BuildingPart / Room / IntBuildingInstallation / BuildingFurniture / _BoundarySurface 계열 4종 / _Opening / Door / Window)이다.

## 2. 객체유형별 사양

### 2.1 추상건물 (AbstractBuilding)

| 항목 | 내용 |
|---|---|
| 정의 | 건물의 다양한 요소로 이루어진 집합체. 추상객체 타입이므로 자체로는 객체화될 수 없고, 건물(Building) 또는 부분건물(BuildingPart)로만 객체화 |
| 상위 객체유형 | `core::_Site` |
| 연계된 객체유형 | IntBuildingInstallation, BuildingFurniture, Room, _BoundarySurface |
| 기하요소 | 추상객체 타입이므로 자체 기하요소 없음 |
| 객체 속성 | 객체 ID(gmlID) (M), 분류 코드 (M), 기능코드(복수 가능) (O), 사용 용도 코드(복수 가능) (O), 완공연도 (O), 철거연도 (O), 지하층수 (O), 지상층수 (O), 지상높이 (O), 지하높이 (O) |
| 제약조건 | 추상건물은 객체화되지 않으므로 상세도(LOD)와 관계없이 표현 |

### 2.2 건물 (Building)

| 항목 | 내용 |
|---|---|
| 정의 | 다양한 건물 구성요소로 된 집합체. 추상건물 타입이 구체화된 건물타입 |
| 상위 객체유형 | _AbstractBuilding |
| 연계된 객체유형 | 추상건물에 연계된 객체유형 |
| 기하요소 | LOD0: `GM_MultiSurface` / LOD2, 3: `GM_Solid` |
| 객체 속성 | 추상건물과 동일 (gmlID/분류 M, 기능/사용/완공연도/철거연도/지하층수/지상층수/지상높이/지하높이 O) |
| 제약조건 | 1. 건물은 외벽을 포함. 외벽은 LOD2로 표현하면 되며, 지하 설치로 외벽이 물리적으로 없으면 생략 가능. 2. LOD0의 기하요소는 지상층의 평면도에 따름. 3. LOD2, 3의 기하요소는 외벽 기준 GM_Solid — 외벽이 있으면 외벽 조합, 없으면 가상 외벽 제작 |

### 2.3 부분건물 (BuildingPart)

| 항목 | 내용 |
|---|---|
| 정의 | 추상건물 유형이 구체화된 건물로, 하나의 건물이 한 개 이상의 부분 건물로 나누어질 때 각 부분건물을 표현하는 객체타입 |
| 상위 객체유형 | _AbstractBuilding |
| 연계된 객체유형 / 기하요소 / 객체 속성 / 제약조건 | Building과 동일 |

### 2.4 단위공간 (Room)

| 항목 | 내용 |
|---|---|
| 정의 | 벽으로 둘러싸여 일정한 공간을 이루는 실내의 기본 공간. 활동·이동이 가능하거나 특별한 기능을 수행하거나 다른 객체를 위치시킬 수 있는 공간(방뿐 아니라 복도 등 모든 공간) |
| 상위 객체유형 | GML::_Feature |
| 연계된 객체유형 | _BoundarySurface(가상면), BuildingFurniture, IntBuildingInstallation |
| 기하요소 | LOD0: `GM_MultiSurface` / LOD2, 3: `GM_Solid` |
| 객체 속성 | 객체 ID(gmlID) (M), 분류 코드 (M), 층 (O), 기능코드(복수 가능) (O), 사용 용도 코드(복수 가능) (O) |

**Room 제약조건 (11항)** — POC 지오메트리 규칙의 핵심 근거:

1. 여러 층에 걸친 수직 홀은 **층별로 구별하여 단위공간을 구성** (그림 1).
2. 계단/에스컬레이터/엘리베이터만을 위해 존재하는 공간은 **별도의 단위공간**으로 정의. 계단 자체는 실내설치물로 정의. 층별 분할(2-a) 또는 전체를 하나의 단위공간(2-b)으로 표현 가능(분할 시 가상면 이용 가능).
3. 단위공간 안에 계단·에스컬레이터가 있으면 그 단위공간(또는 Building)에 설치된 **실내설치물로 간주**하고 별도 공간을 만들지 않음.
4. 계단으로 다른 공간과 연결되는 경계면은 Door(문)로 정의하며 경우에 따라 가상면으로 정의 가능 (그림 2-c).
5. 플랫폼에서 기차 선로영역과 보행 가능 영역이 구별되도록 단위공간을 만들며, 구별은 가상면 이용.
6. 교차로나 'ㄱ'자 형태의 복도는 분할하여 **단위공간이 볼록다각형이 되도록** 하며 분할은 가상면 이용. 1) 가능하면 볼록다각형 또는 볼록 다면체가 되도록, 2) 가능하면 단위공간의 크기가 작아지도록 분할.
7. 공간의 특징이 분명하게 구별되는 경우(전철역 개찰구, 공항 탑승구·보안검사·여권검사, 복도-구름다리 연결부 등) 가상면으로 공간 분할.
8. 나선형 다층 복도처럼 공간·층 구별이 명확하지 않으면 두 층이 겹치지 않는 방법으로 분할하여 단위공간 제작.
9. 단위공간 안에 단위공간이 있는 것으로 판단되면 무리하게 분할하지 않고 **단위공간 안의 단위공간**으로 표현 (그림 4-a).
10. LOD0의 기하요소는 **바닥면의 기하**로 표현.
11. LOD2, 3의 기하요소는 바닥면, 실내벽면, 천정면, 가상면으로 제작.

### 2.5 실내설치물 (IntBuildingInstallation)

| 항목 | 내용 |
|---|---|
| 정의 | 실내에 설치된 **움직일 수 없는** 실내객체 |
| 상위 객체유형 | GML::_Feature |
| 연계된 객체유형 | 없음 |
| 기하요소 | LOD0: 2D implicit Geometry, GM_MultiSurface, GM_MultiCurve / LOD2, 3: 3D implicit Geometry, GM_MultiSurface, GM_Solid |
| 객체 속성 | 객체 ID(gmlID) (M), 분류 코드 (M), 기능코드(복수 가능) (O), 사용 용도 코드(복수 가능) (O) |
| 제약조건 | 1. 하나 이상의 단위공간에 설치될 수 있으나 **가능한 하나의 단위공간에 속하도록 권장**. 2. 공간 내 설치물(예: 벽면의 보조 기둥)은 단위공간 벽면과 분리하여 표현. 3. 미리 정의한 객체 모델 재사용을 위해 Implicit Geometry 사용 권장. 4. LOD0: 위치 표시 수준의 2D Geometry. 5. LOD1: 위치·형태를 간단한 기하(상자·선 등)로 표현. 6. LOD2: 위치·형태를 상세하게 표현. 7. LOD3: texture(사진 등 상세 수준) 표현 |

### 2.6 실내가구 (BuildingFurniture)

| 항목 | 내용 |
|---|---|
| 정의 | 실내에 설치된 **움직일 수 있는** 실내객체 |
| 상위 객체유형 | GML::_Feature |
| 연계된 객체유형 | 해당 없음 |
| 기하요소 | LOD0: 2D implicit Geometry, GM_MultiSurface, GM_MultiCurve / LOD2, 3: 3D implicit Geometry, GM_MultiSurface, GM_Solid |
| 객체 속성 | 객체 ID(gmlID) (M), 분류 코드 (M), 기능코드 (O), 사용 용도 코드 (O) |
| 제약조건 | LOD0: 위치 표시 수준의 2D 기하 / LOD2: 위치·형태 상세 표현 / LOD3: 텍스쳐 표현 |

### 2.7 경계면 (_BoundarySurface) — 추상

| 항목 | 내용 |
|---|---|
| 정의 | 독립적인 객체로 정의되는 단위공간의 경계면 |
| 상위 객체유형 | GML::_Feature |
| 연계된 객체유형 | _Opening |
| 기하요소 | 추상 객체유형이므로 없음(하부 객체유형이 가짐) |
| 객체 속성 | 객체 ID(gmlID) (M) |
| 제약조건 | 1. 경계면은 단위공간의 경계 생성. 2. 단위공간의 기하요소인 Solid와는 **중복적으로 정의** — 벽면이 중요한 피처 객체로 정의될 필요가 있을 때만(예: 벽면 전등 설치물과의 관계 표시) 정의하며, 단순 경계 표현만을 위해서는 정의하지 않음. 3. 하나의 경계면은 반드시 하나의 단위공간에만 소속(여러 방을 통과하는 경계면 불허 — 단위공간별로 나누어 정의). 4. 객체화되지 않으므로 LOD와 관계없이 표현 |

#### 2.7.1 실내벽면 (InteriorWallSurface)

- 정의: 단위공간의 측면 벽. 정확히 수직이 아니어도 기능적으로 측면 벽이면 실내벽으로 간주.
- 기하요소: LOD0: GM_MultiCurve / LOD1–3: GM_MultiSurface. 속성: gmlID (M).
- 제약: 벽면 다각형 내부에 개폐가 있으면 구멍 있는 다각형으로 표현 — 외부 경계는 외부링(Outer Ring, 반시계 방향), 구멍 경계는 내부링(Inner Ring, 시계 방향). 엘리베이터 문이 있는 복도 쪽 실내벽은 여러 개의 문을 가짐. LOD0: 바닥면에 선으로 / LOD2, 3: 면으로 표현.

#### 2.7.2 천장면 (CeilingSurface)

- 정의: 단위공간의 천정을 나타내는 면. 정확히 수평이 아니어도 기능적으로 천정이면 천정으로 간주.
- 기하요소: LOD0: 표현하지 않음 / LOD2, 3: GM_MultiSurface. 속성: gmlID (M).
- 제약: 방 안에 계단·에스컬레이터가 있으면 천정·바닥에 해당 공간과 방을 연결하는 가상면이나 문을 정의.

#### 2.7.3 바닥면 (FloorSurface)

- 정의: 단위공간의 바닥을 이루는 면. 정확히 수평이 아니어도 기능적으로 바닥이면 바닥으로 간주.
- 기하요소: LOD0: GM_MultiCurve 또는 GM_MultiSurface / LOD2, 3: GM_MultiSurface. 속성: gmlID (M).
- 제약: LOD0은 평면도의 해당 층 바닥면으로 표현. 계단 관련 가상면 규칙은 천장면과 동일.

#### 2.7.4 가상면 (ClosureSurface)

- 정의: 물리적 객체 없이 단위공간을 나누는 가상의 벽 (예: 큰 전시공간을 여러 부스로 구분).
- 기하요소: LOD0: GM_MultiCurve / LOD2, 3: GM_MultiSurface. 속성: gmlID (M).
- 제약: 하나의 가상면은 하나의 단위공간에만 소속. 가상면은 대부분 두께가 없으므로 **두 개의 가상면이 쌍**을 이루어 방향을 서로 다르게 하여 각각 다른 단위공간에 소속 (그림 10).

### 2.8 개폐 (_Opening) — 추상

| 항목 | 내용 |
|---|---|
| 정의 | 두 개의 단위공간 또는 단위공간과 외부공간을 이동하거나 연결하는 실내공간 객체유형 |
| 상위 객체유형 | GML::_Feature |
| 연계된 객체유형 | _BoundarySurface |
| 기하요소 | 추상객체이므로 없음(하부객체유형에서 정의) |
| 객체 속성 | 객체 ID(gmlID) (M) |
| 제약조건 | 실내벽에 두께가 있으면 개폐도 두께를 가지며, 개폐가 속한 가상면은 두 개까지 가능(각각 다른 단위공간 소속). 이 경우 각 개폐 면의 방향은 서로 반대로 정의. LOD와 관계없이 표현 |

#### 2.8.1 문 (Door)

- 정의: 두 단위공간 또는 단위공간-외부공간을 **이동**하기 위한 실내객체.
- 기하요소: LOD0: GM_MultiCurve / LOD2, 3: GM_MultiSurface.
- 속성: gmlID (M), 분류 (M) — 자유문, 미세기문, 미닫이문, 들문, 접이문, 회전문.
- 제약: 문의 한 면은 실내 단위공간의 추상벽에, 다른 면은 실외 외부벽에 소속(외부벽은 본 사양에서 정의하지 않으므로 외부참조 또는 실내 추상벽에만 소속). LOD0: 바닥면 위 선 / LOD2, 3: 면.

#### 2.8.2 창문 (Window)

- 정의: 두 단위공간 또는 단위공간-외부공간을 **연결하지만 이동이 목적이 아닌** 실내객체.
- 기하요소: LOD0: GM_MultiCurve / LOD2, 3: GM_MultiSurface. 속성: gmlID (M).
- 제약: LOD0: 바닥면 위 선 / LOD2, 3: 면.

## 3. LOD 규칙 요약표

| 객체유형 | LOD0 | LOD1 | LOD2, 3 |
|---|---|---|---|
| AbstractBuilding | (추상 — LOD 무관) | — | — |
| Building / BuildingPart | GM_MultiSurface (지상층 평면도) | — | GM_Solid (외벽 기준) |
| Room | GM_MultiSurface (바닥면 기하) | — | GM_Solid (바닥·벽·천정·가상면) |
| IntBuildingInstallation | 2D implicit / MultiSurface / MultiCurve (위치 수준) | 간단한 기하(상자·선) | 3D implicit / MultiSurface / Solid (LOD3은 텍스쳐) |
| BuildingFurniture | 2D implicit / MultiSurface / MultiCurve | — | 3D implicit / MultiSurface / Solid (LOD3은 텍스쳐) |
| InteriorWallSurface | GM_MultiCurve (바닥 선) | GM_MultiSurface | GM_MultiSurface (면) |
| CeilingSurface | 표현 안 함 | — | GM_MultiSurface |
| FloorSurface | GM_MultiCurve 또는 GM_MultiSurface | — | GM_MultiSurface |
| ClosureSurface | GM_MultiCurve (바닥 선) | — | GM_MultiSurface |
| _Opening / Door / Window | GM_MultiCurve (바닥 위 선) | — | GM_MultiSurface (개폐 자체는 LOD 무관 표현) |

## 4. POC 매핑 관련 메모

- POC는 Building→`SpatialSite`, Room→`SpatialSpace`, IntBuildingInstallation→`SpatialFacility`만 채택하고, Room의 LOD0 규칙("바닥면의 기하")을 footprint 다각형 + baseElevation + height로 단순화한다.
- Room 제약 6(볼록다각형 권장)은 검증용 샘플 데이터(T3)의 footprint 설계 규칙으로 반영한다.
- 상세 채택/제외 근거는 [06_schema_mapping.md](./06_schema_mapping.md) 참조.
