# 규정 → POC 공간 스키마 매핑 결정

> **원본**: 별표 2·3·5·6·10 종합 (개별 분석: [01](./01_layer_classification.md)·[02](./02_standard_data_spec.md)·[03](./03_naming_rules.md)·[04](./04_attribute_input.md)·[05](./05_quality_criteria.md))
> **작성일**: 2026-07-05
> **목적**: POC 공간 스키마(`app/src/domain/spatial`) 매핑을 위한 분석 — 무엇을 채택/단순화/제외했는지 근거와 함께 기록 (Phase 6 계획 `docs/plans/phase-6.md`의 "선행 설계 판단" 및 T2 명세 기준)

## 1. 매핑 원칙

1. **표준 코드 체계는 원문 그대로 채택**: DIVISION/CLASSIFY/시설구분/FLOOR/QAL·SLP·DIR·SKT·HCP 코드값과 명명규칙 패턴은 규정 원문을 따른다. POC의 모든 공간/시설물 id가 규정 형식으로 생성·역파싱 가능해야 한다(별표 10 "ID무결성·분류코드 무결성" 취지).
2. **CityGML 산출물은 비대상**: POC는 CityGML 2.0 XML을 생성·검수하지 않는다. 별표 3은 개념 모델(어떤 엔티티가 존재하고 어떤 제약을 갖는가)의 근거로만 사용한다.
3. **SOP 그래프가 소비하는 최소 엔티티만 유지**: Space Scope 노드가 참조할 건물/층/공간, Asset 노드가 참조할 시설물 — 4개 엔티티로 충분하다. 시각 표현(WebGL)은 Phase 9 산출물이므로 데이터에 3D 정보(footprint + baseElevation + height)만 포함한다.

## 2. 엔티티 매핑

| 규정 개념 | POC 타입 | 판단 |
|---|---|---|
| Building (별표 3) + UFID (별표 5·6 ④) | `SpatialSite` | 채택 |
| 층(FLOOR) 코드 (별표 5·6 ⑤) | `SpatialFloor` | **승격** — 규정에서 층은 코드값일 뿐이나 POC는 층 탭 UI·평면 뷰의 조회 단위이므로 엔티티로 승격 |
| Room (별표 3) + 공간 레이어 CLASSIFY=RM (별표 6) | `SpatialSpace` | 채택 (단순화) |
| IntBuildingInstallation (별표 3) + 시설물 CLASSIFY=FC | `SpatialFacility` | 채택 (단순화) |
| AbstractBuilding, BuildingPart | — | 제외 |
| BuildingFurniture | — | 제외 |
| _BoundarySurface 계열 (InteriorWallSurface/CeilingSurface/FloorSurface/ClosureSurface) | — | 제외 |
| _Opening / Door / Window | — | 제외 |
| 경로네트워크 레이어 (별표 6 나, LINE/POINT, FPOINT/SPOINT) | — | 이연 (Phase 7) |
| 3차원텍스쳐코드 (별표 5 다) | — | 제외 |

## 3. ID 체계 결정 (별표 5·6 근거)

| id | 형식 | 예시 |
|---|---|---|
| `siteId` | 건물 UFID(공간객체등록번호) CHAR(17) mock | `B00100000001AULW1` (별표 6 레이어정의서의 예시 UFID를 mock 형식의 전거로 사용) |
| `floorCode` | 별표 5 층 코드 CHAR(6) = 시작층(3)+끝층(3) | `F01F01`, `B01B01`, `B01F01` |
| `spaceId` | 별표 6 기본키 = 레이어코드 + `_` + 일련번호(5), CLASSIFY=RM | `L_B00100000001AULW1_F01F01_BS_RM_00001` |
| 시설물 id | 별표 5 나. 3차원객체코드 = `M_{UFID}{FLOOR}_{DIVISION}{CLASSIFY}_{시설구분2}{SERIAL5}` | `M_B00100000001AULW1F01F01_FFFC_0500001` (지상1층 소방 시설물, 소화기 05, 일련 00001) |

**근거**: 기존 시드의 자유 문자열 id(`SITE-LH2-PLANT`, `SPACE-STORAGE-ZONE`)를 표준 명명으로 전환(T4)하면, id 자체가 건물/층/분류/종류를 담아 파싱만으로 검증(validateGraph 규칙 8)과 표시(공간 상세 패널의 코드 분해)가 가능해진다.

## 4. 채택 항목 상세

### 4.1 `SpatialSite` ← Building (별표 3 §2.2)

- 채택 속성: ufid(=gmlID 대응, M), name, 지상층수/지하층수, 지상높이/지하높이 (별표 3 객체 속성 O 항목), 완공연도(O, optional 유지).
- POC 확장: `domainHint`(시드 4 도메인 연결용) — 규정 외 필드임을 doc comment로 명기.
- 단순화: 기능/사용 용도 코드(복수)는 제외 — 규정에서도 O(선택)이며 POC에서 소비처가 없음. 철거연도 제외(동일 근거).

### 4.2 `SpatialFloor` ← FLOOR 코드 (별표 5·6)

- floorCode(CHAR 6), name, elevation, height.
- elevation/height는 규정에 없는 POC 확장 — Room LOD0(바닥면 기하)을 3D로 확장(footprint의 baseElevation 기준면)하고 Phase 9 뷰어가 소비할 층고 정보. 별표 3 Building의 지상높이/지하높이와 정합하도록 샘플 데이터에서 층고 합계를 맞춘다(T3).

### 4.3 `SpatialSpace` ← Room + 별표 6 공간(면형) 레이어

- 채택 컬럼(별표 6 §3.2): primaryKey(기본키), layerCode, ufid, floorCode, division, classify(=`"RM"` 고정), kind, kindEng, serial, name, qal, slp, dir, skt.
- 추가 채택: handicap(HCP) — 별표 6 공간 레이어정의서에는 없으나 주요속성값 표(⑯)에 정의되어 있고, 재난 시 교통약자 대피 SOP(안전한국훈련 시드)에 유의미하여 optional로 채택.
- **지오메트리 단순화**: 규정의 LOD0(GM_MultiSurface, 바닥면 기하)/LOD2·3(GM_Solid)을 `footprint: {x,y}[]` + `baseElevation` + `height`(각기둥, prism)로 단순화. 근거:
  - Room 제약 10 "LOD0의 기하요소는 바닥면의 기하로 표현" → footprint가 곧 LOD0.
  - footprint + height는 LOD1 수준 Solid(수직 압출)로 복원 가능 — Phase 9 WebGL 뷰어의 최소 입력.
  - 경사 바닥·비수직 벽 등 LOD2·3 상세 기하는 검증 모델 범위 밖.
- **기하 제약 반영**(별표 3 Room 제약): 제약 6(볼록다각형 권장) → 검증용 샘플 footprint는 볼록다각형으로 작성. 제약 1(수직 홀 층별 분할) → 다층 공간도 층별 SpatialSpace로 분리. 제약 2·3(계단 공간과 계단 설치물의 구분) → 계단실은 MV_RM 공간, 계단은 MV/01 시설물로 이중 등록.

### 4.4 `SpatialFacility` ← IntBuildingInstallation + 별표 6 시설물(점형) 레이어

- 채택: objectCode(3차원객체코드 `M_...`), division, classify(=`"FC"` 고정), facilityCode(시설구분 2자리, 별표 5 라), kind, name.
- name은 별표 6 명칭 규칙 "현재층_공간(+_시설명)" 채택 — 예: `1층_복도_소화전`.
- POC 확장: 소속 `spaceId` — 별표 3 제약 1 "가능한 하나의 단위공간에 속하도록 권장"을 명시적 참조 필드로 구체화. 규정의 참조키(FOREIGN KEY)는 공간→객체 방향이지만 POC는 조회 편의상 시설물→공간 방향으로 보유.
- **지오메트리 단순화**: `position {x,y,z}` 점 하나 — IntBuildingInstallation LOD0 "위치를 표시할 수 있는 수준의 2D Geometry" + 높이. Implicit Geometry(3D 모델 재사용)는 제외.

### 4.5 코드 테이블 (별표 2·5·6)

- DIVISION 12종, CLASSIFY 8종(RM 포함 — 별표 5에는 7종뿐이고 RM은 별표 6이 추가함을 주석 명기), 시설구분코드 8개 division 전표, QAL/SLP/DIR/SKT/HCP 전체를 상수 테이블로 구현 (T2 `spatialCodes.ts`).
- QAL의 방화는 원문 `QALQ001`을 오탈자로 판단하고 `QAL001`로 정규화 ([04_attribute_input.md](./04_attribute_input.md) §2.1).
- 대분류(개방/고유/관리)→중분류 매핑도 상수로 유지 — 평면 뷰 범례·인스펙터 보조 텍스트에 사용.

## 5. 제외/이연 항목과 근거

| 항목 | 결정 | 근거 |
|---|---|---|
| 3차원텍스쳐코드 (`T_`, 별표 5 다) | 제외 | POC에 텍스처 없음. WebGL 뷰어(Phase 9)도 토큰 색상 기반 단색 렌더 계획. 원문 예시 자체에 `T_`/`L_` 접두 혼용 오탈자가 있음([03](./03_naming_rules.md) §1 주석) |
| _Opening / Door / Window | 제외 | 검증 모델 범위 밖 — POC의 SOP 실행은 공간 단위 참조(Scope)까지만 필요하고, 문/창문 수준 위상(개폐·통행)은 Phase 7 토폴로지(내비 메시 노드/링크)가 담당 |
| _BoundarySurface 계열 (실내벽면/천장면/바닥면/가상면) | 제외 | 규정 스스로 "단순 경계 표현만을 위해서는 정의하지 않음"(별표 3 §2.7 제약 2). POC 공간은 footprint prism으로 닫혀 있어 독립 경계면 객체가 불필요. 가상면의 공간 분할 취지는 footprint 분할로 흡수 |
| BuildingFurniture | 제외 | 움직일 수 있는 가구는 SOP Scope/Asset 참조 대상이 아님. Asset은 고정 시설물(IntBuildingInstallation)만 대상 |
| BuildingPart / AbstractBuilding | 제외 | 검증 모델은 단일 건물 규모. 부분건물 분할·추상 계층은 사이트 1:N 층 구조로 충분 |
| 경로네트워크 레이어 (LINE/POINT, FPOINT/SPOINT, HANDICAP 경로 속성) | 이연 (Phase 7) | 별표 6 나.의 경로/지점 레이어는 webbuilder 내비 메시 토폴로지(노드/링크)와 동일 구조 — Phase 7 토폴로지 스키마 연결 설계에서 다룸 |
| CityGML 2.0 XML 스키마 (별표 10 데이터스키마 무결성, 별표 12) | 제외 | POC 데이터는 TypeScript 모듈/JSON. XML 산출물 검수는 구축 사업 범위 |
| LOD1~3 상세 기하, 세밀도/가시화 일관성 (별표 1·7) | 제외 | 별표 1·7 자체가 참조 자료에 미포함이며, footprint prism(LOD0~1 상당)으로 Phase 6 합격 기준(샘플 데이터 + 평면 검증 뷰) 충족 |
| 위치정확성(기준좌표계, 별표 11) | 제외 | mock 건물은 실측 좌표 없음. 층 평면 로컬 좌표계(m 단위) 사용 |
| Door 분류(자유문/미세기문 등 6종), 객석번호 명칭 규칙 | 제외 | 대응 엔티티(Door/객석) 자체를 제외 |

## 6. 요약 다이어그램

```
별표 2 (분류)        별표 5 (명명)              별표 6 (속성)         별표 3 (개념 모델)
─────────────       ─────────────────────      ─────────────────     ──────────────────
대분류 3종     ──→   (상수 테이블)               DIVISION/CLASSIFY ──→ spatialCodes.ts
중분류 12종    ──→   DIVISION 2자                QAL/SLP/DIR/SKT/HCP ─→ spatialCodes.ts
소분류        ──→   CLASSIFY 2자 (+RM: 별표6)   기본키(38*)     ──→   SpatialSpace.id
시설구분코드   ──→   objectCode ⑤           ──→ 참조키(38)      ──→   SpatialFacility.id
                    레이어코드/객체코드 패턴 ──→ naming.ts             Building ──→ SpatialSite
                    FLOOR 6자             ──→  SpatialFloor          Room ──→ SpatialSpace (볼록 footprint)
                                                                     IntBuildingInstallation ──→ SpatialFacility
별표 10 (품질) ──→ ID·분류코드 무결성 취지 → naming 왕복 파싱 + validateGraph 규칙 8
```

> `*` 원문 별표 6은 기본키를 CHAR 41로 표기하나 POC의 UFID 17자 mock 기준 실제 길이는 38자 — [04_attribute_input.md](./04_attribute_input.md) §1 "원문 길이 표기 불일치 주석" 참조.
