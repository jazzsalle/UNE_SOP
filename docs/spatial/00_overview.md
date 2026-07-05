# 실내공간정보 구축 작업규정 분석 — 개요

> **원본**: `1. Reference data/실내공간정보 구축 작업규정/` 하위 별표 PDF 5종
> **작성일**: 2026-07-05
> **목적**: POC 공간 스키마(`app/src/domain/spatial`) 매핑을 위한 분석 (Phase 6 / 3단계)

## 1. 문서 구성

| 문서 | 원본 별표 | 내용 |
|---|---|---|
| [01_layer_classification.md](./01_layer_classification.md) | 별표 2 | 레이어 분류체계 (대/중/소분류 전표) |
| [02_standard_data_spec.md](./02_standard_data_spec.md) | 별표 3 | 표준데이터 사양 (CityGML 기반 객체유형 11종 + LOD 규칙) |
| [03_naming_rules.md](./03_naming_rules.md) | 별표 5 | 레이어코드·3차원객체코드·텍스쳐코드 명명규칙 + 시설구분코드 전표 |
| [04_attribute_input.md](./04_attribute_input.md) | 별표 6 | 속성 컬럼 목록 + 코드값(QAL/SLP/DIR/SKT/HCP) 전체 |
| [05_quality_criteria.md](./05_quality_criteria.md) | 별표 10 | 품질기준(품질요소/검사항목) 및 품질검사표 |
| [06_schema_mapping.md](./06_schema_mapping.md) | (종합) | 규정 → `app/src/domain/spatial` 타입 매핑 결정 (채택/단순화/제외 근거) |

## 2. 원본 파일 목록

- `[별표 2] 실내공간정보 레이어 분류체계(실내공간정보 구축 작업규정).pdf` (1쪽)
- `[별표 3] 실내공간정보 표준데이터 사양(실내공간정보 구축 작업규정).pdf` (18쪽)
- `[별표 5] 실내공간정보 레이어 명명규칙(실내공간정보 구축 작업규정).pdf` (2쪽)
- `[별표 6] 실내공간정보 속성입력(실내공간정보 구축 작업규정).pdf` (3쪽)
- `[별표 10] 실내공간정보 품질기준 및 품질검사표(실내공간정보 구축 작업규정).pdf` (2쪽)

## 3. 규정 체계 요약

실내공간정보 구축 작업규정은 CityGML 2.0 LOD 개념을 기반으로 실내공간을 표준화한다.

- **별표 2 — 분류체계**: 대분류(주체: 개방/고유/관리) → 중분류(용도: 12종) → 소분류(구조: 공간/시설물/구조).
- **별표 3 — 데이터 사양**: AbstractBuilding부터 Window까지 객체유형 11종의 정의·상위유형·기하요소(LOD별)·속성·제약조건. Room(단위공간)의 볼록다각형 분할 권장 등 기하 제약 포함.
- **별표 5 — 명명규칙**: `L_`(레이어코드) / `M_`(3차원객체코드) / `T_`(텍스쳐코드) 3종 코드 패턴과 division별 시설구분코드(2자리).
- **별표 6 — 속성입력**: 기본키(원문 표기 CHAR 41, POC UFID 17자 mock 기준 실제 38자 — [04](./04_attribute_input.md) §1 주석) = 레이어코드 + `_` + 일련번호(5) 등 컬럼 사양과 재질(QAL)/경사(SLP)/진행방향(DIR)/내외부(SKT)/교통약자(HANDICAP) 코드값.
- **별표 10 — 품질기준**: 완전성/논리일관성/위치정확성/주제정확성/기타 5개 품질요소, 19개 검사항목.

## 4. POC 스키마 매핑 요약 (상세: 06_schema_mapping.md)

| 규정 개념 | POC 타입 | 비고 |
|---|---|---|
| Building (별표 3) + UFID (별표 5·6) | `SpatialSite` | siteId = UFID CHAR(17) mock |
| 층(FLOOR) 코드 (별표 5·6) | `SpatialFloor` | floorCode CHAR(6), 예: `F01F01` |
| Room (별표 3) + 공간 레이어(CLASSIFY=RM, 별표 6) | `SpatialSpace` | spaceId = 별표 6 기본키 형식 (레이어코드+`_`+일련번호 5) |
| IntBuildingInstallation (별표 3) + 시설물(CLASSIFY=FC) | `SpatialFacility` | id = 별표 5 3차원객체코드 (`M_...`) |
| 텍스쳐코드, _Opening/Door/Window, _BoundarySurface 계열, BuildingFurniture, BuildingPart | (제외) | POC 검증 모델 범위 밖 — 근거는 06 문서 |
