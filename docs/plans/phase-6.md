# Phase 6 계획 — 실내공간정보 작업규정 기반 공간 스키마 + 검증용 3D 공간 모델 (3단계)

> planner subagent 산출물 (2026-07-05). `/phase-run 6` 실행 기록. planner가 별표 2·3·5·6 PDF를 직접 읽고 코드/명명/속성 체계를 추출해 인라인함.

## 선행 설계 판단 (모든 태스크 공통 전제)

1. **three.js 등 새 의존성 미도입.** 근거: Phase 6 합격 기준은 "샘플 건물/층/공간 **데이터** 구축"이고, WebGL 뷰어는 Phase 9 산출물로 명시됨(evaluation_criteria.md 75행). 대신 데이터에 3D 정보(footprint polygon + baseElevation + height)를 포함해 Phase 9 뷰어가 그대로 소비하게 하고, 검증 가시화는 의존성 없는 **SVG 층 평면 뷰**(T7)로 충족한다.
2. **ID 체계 결정** (별표 5·6 근거):
   - `siteId` = 건물 UFID(공간객체등록번호, CHAR(17) mock, 예: `B00100000001AULW1`)
   - `spaceId` = 별표 6 기본키 형식 = `레이어코드 + "_" + 일련번호(5)` (CLASSIFY=RM), 예: `L_B00100000001AULW1_F01F01_BS_RM_00001`
   - 시설물(asset) id = 별표 5 나. 3차원객체코드 형식 `M_{UFID}{FLOOR}_{DIVISION}{CLASSIFY}_{시설구분2}{SERIAL5}`, 예: `M_B00100000001AULW1F01F01_FFFC_0500001` (소화기)
3. UI 신규 컴포넌트는 기존 앱 관례(인라인 스타일 + `var(--color-*)` 토큰 + `typo-text-*` 클래스, hex 하드코딩 금지)를 따르고, 컴포넌트 관례는 `1. Reference data/디자인 시스템 가이드`의 `COMPONENT_CATALOG.md`·`docs/component-state-rules.md`를 참조한다.

---

### Task T1: 실내공간정보 구축 작업규정 분석 문서 작성 [PARALLEL]
- **목표**: 별표 2·3·5·6(+품질기준 별표 10)을 분석해 `docs/spatial/` 마크다운 문서로 정리하고, 본 프로젝트 공간 스키마로의 매핑 결정을 기록한다.
- **대상 파일** (신규):
  - `docs/spatial/00_overview.md` (문서 목적·원본 출처·스키마 매핑 요약)
  - `docs/spatial/01_layer_classification.md` (별표 2)
  - `docs/spatial/02_standard_data_spec.md` (별표 3)
  - `docs/spatial/03_naming_rules.md` (별표 5)
  - `docs/spatial/04_attribute_input.md` (별표 6)
  - `docs/spatial/05_quality_criteria.md` (별표 10)
  - `docs/spatial/06_schema_mapping.md` (규정 → `app/src/domain/spatial` 타입 매핑 결정·단순화 근거)
- **완료 기준**: 합격 기준 1(분석 문서 존재) 충족 — 별표 2 대/중/소분류 표 전체, 별표 3 객체유형 11종(AbstractBuilding/Building/BuildingPart/Room/IntBuildingInstallation/BuildingFurniture/_BoundarySurface/InteriorWallSurface·CeilingSurface·FloorSurface·ClosureSurface/_Opening/Door/Window)과 LOD 규칙, 별표 5 레이어코드·3차원객체코드·텍스쳐코드 패턴과 시설구분코드 전표, 별표 6 컬럼 18종·코드값(QAL/SLP/DIR/SKT/HCP) 전체가 문서에 수록됨. 06에는 "무엇을 채택/단순화/제외했는지"가 근거와 함께 기술됨.
- **구현 세부사항**: **generator가 아래 PDF 5개를 Read 도구(pages 파라미터)로 직접 읽고 작성할 것**:
  - `1. Reference data/실내공간정보 구축 작업규정/[별표 2] 실내공간정보 레이어 분류체계(실내공간정보 구축 작업규정).pdf` (1쪽)
  - `[별표 3] ...표준데이터 사양....pdf` (18쪽)
  - `[별표 5] ...레이어 명명규칙....pdf` (2쪽)
  - `[별표 6] ...속성입력....pdf` (3쪽)
  - `[별표 10] ...품질기준 및 품질검사표....pdf`
  - 별표 6의 "방화 → QALQ001" 표기는 6자리 체계(QAL001)와 불일치하는 원문 오탈자로 판단됨 — 분석 문서에 주석으로 남기고 QAL001로 정규화할 것.

### Task T2: 공간 스키마 코어 — 타입·코드 테이블·명명규칙 함수 [PARALLEL]
- **목표**: 규정 기반 공간 스키마 타입, 분류 코드 상수 테이블, 레이어/객체 코드 생성·파싱 순수 함수를 `app/src/domain/spatial/`에 구현한다. (T1 문서와 병렬 — 아래 인라인 명세만으로 구현 가능)
- **대상 파일**:
  - 신규 `app/src/domain/spatial/spatialTypes.ts`, `spatialCodes.ts`, `naming.ts`, `index.ts`
  - 수정 `app/src/domain/index.ts` (spatial 재수출 추가)
- **완료 기준**: `cd app && npm run build` 성공. `buildLayerCode`/`buildObjectCode`/`buildSpacePrimaryKey`/`parseLayerCode`가 예시를 정확히 생성·파싱: `buildLayerCode(ufid, "F01F01", "SL", "FC")` → `L_{UFID}_F01F01_SL_FC`, `M_{UFID}B01B01_ISCL_0000001` 파싱 시 division="IS", classify="CL", facilityCode="01", serial="00001".
- **구현 세부사항** (별표 2·5·6에서 추출 — PDF 재독 불필요):
  - **레이어 분류(별표 2)**: 대분류(주체) `개방(open)/고유(private)/관리(management)` · 중분류(용도) 12종 · 소분류(구조) `공간/시설물` (관리 하위에 `구조` 중분류: 벽·바닥·천정·기둥·문·창문). 대분류→중분류 매핑: 개방={이동,안내,편의,운수,안전,소방,판매,의료}, 고유={주거,업무}, 관리={관리,구조}.
  - **DIVISION 코드(별표 5·6, CHAR(2))**: `MV`이동, `IF`안내, `CV`편의, `TP`운수, `SF`안전, `FF`소방, `SL`판매, `MD`의료, `HS`주거, `BS`업무, `MN`관리, `IS`구조.
  - **CLASSIFY 코드(별표 6 기준 8종, CHAR(2))**: `RM`공간, `FC`시설물, `CL`천정, `WL`벽, `FL`바닥, `DR`문, `WD`창문, `PL`기둥. (별표 5 레이어코드에는 RM 제외 7종만 등장 — 별표 6이 RM을 추가함을 주석으로 명시)
  - **FLOOR 코드(CHAR(6))**: 시작층(3)+끝층(3) 결합. 지하1층 `B01B01`, 지상1층 `F01F01`, 로비층 `L01L01`, 지하1층~지상1층 `B01F01`. `buildFloorCode(prefix:"B"|"F"|"L", n)` 및 단일층은 동일 코드 반복.
  - **명명규칙(별표 5)**: ①레이어코드 `"L_"+UFID(17)+"_"+FLOOR+"_"+DIVISION+"_"+CLASSIFY` ②3차원객체코드 `"M_"+UFID+FLOOR+"_"+DIVISION+CLASSIFY+"_"+시설구분(2)+SERIAL(5)` ③3차원텍스쳐코드 `"T_"+...+"_"+텍스처번호(2)` ④공간 기본키(별표 6) `레이어코드+"_"+SERIAL(5)` (CHAR 41).
  - **시설구분코드(별표 5 라, division별)**: 이동: 계단01·에스컬레이터02·무빙워크03·엘리베이터04·펜스05·개찰구06·장애인보도블럭07·휠체어리프트08·경사로09·기타99 / 안내: 점자길01·표지판02·안내도03·전광판04·디지털뷰05·게시판06·시각장애인용안내장치07·지하철승하차위치08·기타99 / 편의: 공중전화01·사물함02·즉석사진기03·생수대04·정수기05·현금인출기06·휴지통07·벤치08·체육시설09·물품보관함10·기타99 / 운수: 입국심사대01·출국심사대02·개찰구03·스크린도어04·안전선05·기타99 / 안전: 보안검색대01·CCTV02·기타99 / 소방: 구호물품보관함01·긴급전화02·비상벨03·비상용모래함04·소화기05·비상조명06·비상구07·심장제세동기08·소화전09·방화셔터10·완강기11·기타99 / 판매: 자판기01·매표기02·기타99 / 관리: 보일러01·변전기02·기타99.
  - **속성 코드(별표 6, CHAR(6))**: QAL(재질) `QAL000`미분류·`QAL001`방화·`QAL002`유리·`QAL003`철재·`QAL004`나무·`QAL005`콘크리트·`QAL006`종이·`QAL007`플라스틱·`QAL999`기타 / SLP(경사) `SLP000/001경사로없음/002휠체어/003자전거/004통합/999` / DIR(진행방향) `DIR000/001상행/002하행/003양방향/999` / SKT(내외부) `SKT000/001내부/002외부/999` / HANDICAP `HCP000`이동가능·`HCP001`전용·`HCP002`이동불가.
  - **엔티티 타입(별표 3 매핑)**: `SpatialSite`(=Building: ufid CHAR17, name, 지상/지하층수, 지상/지하높이, 완공연도?, domainHint?) / `SpatialFloor`(floorCode, name, elevation, height) / `SpatialSpace`(=Room: primaryKey, layerCode, ufid, floorCode, division, classify:"RM", kind, kindEng, serial, name, qal·slp·dir·skt·handicap, **geometry: footprint `{x,y}[]` + baseElevation + height**) / `SpatialFacility`(=IntBuildingInstallation: objectCode(M_...), 소속 spaceId, division, classify:"FC", facilityCode, kind, name(별표6 규칙 "층_공간_시설명" 예 `1층_복도_소화전`), position `{x,y,z}`). 각 필드에 별표 근거를 doc comment로 명기.

### Task T3: 검증용 3D 공간 모델 샘플 데이터 + 조회 레지스트리 [AFTER: T2]
- **목표**: T2 타입으로 검증용 샘플 건물 데이터(건물≥1, 층≥2, 공간 다수, 시설물 포함, 지오메트리 포함)와 시드 도메인용 사이트를 구축하고, 조회 API(레지스트리)를 제공한다.
- **대상 파일**:
  - 신규 `app/src/domain/spatial/model/verificationBuilding.ts` — 검증용 상세 건물 1동: UFID 17자 mock, 지하1층+지상2층(층≥2 충족), 층당 공간 5~8개(복도 MV_RM, 사무실 BS_RM, 회의실 BS_RM, 화장실 CV_RM, 계단실 MV_RM, 관리실 MN_RM 등 division 다양화), 시설물 10개 이상(소화기 FF/05, 소화전 FF/09, 비상구 FF/07, CCTV SF/02, 계단 MV/01, 엘리베이터 MV/04, 심장제세동기 FF/08 등). 모든 id는 T2 naming 함수로 생성. footprint는 층 평면(예: 40m×20m) 안에서 겹치지 않는 볼록 다각형(별표 3 Room 제약 "볼록다각형 권장" 반영), 층고 3~4m.
  - 신규 `app/src/domain/spatial/model/seedSites.ts` — 기존 시드 4 도메인용 사이트: LH2 플랜트(저장구역 등 공간 2~4), 발전소(터빈홀 등), 학교(운동장/강당 — 대피영역), 일반 사업장(작업구역 A 등). 각각 UFID mock + 층 1~2 + 공간 2~4 + 지오메트리 간략.
  - 신규 `app/src/domain/spatial/registry.ts` — `getSpatialSites()`, `getSite(ufid)`, `getFloors(ufid)`, `getSpaces(ufid, floorCode?)`, `findSpace(spaceId)`, `getFacilities(ufid, spaceId?)`, `findFacility(objectCode)`. 정적 데이터 기반 순수 함수.
  - 수정 `app/src/domain/spatial/index.ts` (모델·레지스트리 재수출)
- **완료 기준**: 빌드 성공, 레지스트리에서 사이트 5개(검증용 1 + 시드용 4), 검증용 건물의 층 3개·공간 15개 이상·시설물 10개 이상 조회 가능, 모든 spaceId/objectCode가 T2 `parseLayerCode`/`parseObjectCode`로 역파싱 가능.
- **구현 세부사항**: 시드 4종이 참조할 정확한 id를 이 태스크가 확정하므로, 파일 상단 doc comment에 "시드 참조용 id 대응표"(구 `SITE-LH2-PLANT`/`SPACE-STORAGE-ZONE` → 신 UFID/기본키)를 명시해 T4가 그대로 사용하게 할 것.

### Task T4: 시드 4종 공간 id 표준 명명 전환 [AFTER: T3]
- **대상 파일** (수정): `app/src/domain/seeds/lh2Plant.ts`, `powerPlant.ts`, `safetyKoreaDrill.ts`, `generalWorkplace.ts` (필요 시 `seedTypes.ts` doc comment)
- **완료 기준**: 4개 시드 전부에서 `SITE-*`/`SPACE-*` 자유 문자열이 사라지고, 모든 siteId가 `getSite()`로, 모든 spaceId가 `findSpace()`로 해석됨. 빌드 성공, 시드 로드→Validate→Simulate 회귀 없음.
- **구현 세부사항**: T3의 id 대응표 사용. `asset_filter`의 `assetIds`도 시설물 objectCode(M_...)가 존재하는 경우 교체(없으면 유지). EventContext의 `spaceId`는 대표 공간 기본키 1개.

### Task T5: Space Scope/Asset 노드 — Property Inspector 공간 피커 연동 [AFTER: T3]
- **대상 파일**:
  - 신규 `app/src/studio/panels/inspector/SpaceScopeFields.tsx` (siteId 셀렉트 + 층 필터 + spaceIds 체크리스트; division/kind 보조 텍스트)
  - 신규 `app/src/studio/panels/inspector/AssetPickerField.tsx` (siteId 문맥 기반 시설물 다중 선택, 자유 입력 폴백)
  - 수정 `app/src/studio/panels/PropertyInspector.tsx` (space_scope/asset_filter 키 라우팅)
  - 수정 `app/src/studio/panels/SimulateDialog.tsx` (siteId/spaceId 레지스트리 기반 선택)
- **완료 기준**: Scope 노드 선택 시 사이트 드롭다운·공간 체크리스트가 레지스트리 데이터로 채워지고 결과가 properties에 저장. 기존 값이 레지스트리에 없으면 "미등록 id" 경고 표시 + 값 보존. 빌드 성공.
- **구현 세부사항**: 기존 인스펙터 관례(inspector-input, var() 토큰, typo-*), 경고는 `--color-text-danger` 계열.

### Task T6: validateGraph 공간 참조 검증 규칙 추가 [AFTER: T3]
- **대상 파일**: 수정 `app/src/engine/validateGraph.ts`
- **완료 기준**: (a) `space_scope.siteId` 비어있지 않은데 `getSite()`에 없으면 warning, (b) `spaceIds` 원소가 `findSpace()`에 없으면 warning, (c) spaceId 존재하나 소속 UFID가 siteId와 불일치하면 warning, (d) `asset_filter.assetIds`의 `M_` 접두 id가 `findFacility()`에 없으면 info. 기존 규칙 1~7 회귀 없음. 빌드 성공.
- **구현 세부사항**: "규칙 8 — 공간 스키마 참조" 섹션 추가 + 헤더 주석 갱신. warning 레벨 근거(범용 도구, Phase 4 호환) 주석 명기.

### Task T7: 공간 모델 검증 뷰 — SVG 층 평면 미리보기 [AFTER: T3]
- **대상 파일**:
  - 신규 `app/src/spatial/SpatialModelPage.tsx` (사이트 셀렉트 + 층 탭 + 좌: 평면, 우: 상세)
  - 신규 `app/src/spatial/FloorPlanSvg.tsx` (footprint polygon 렌더, division별 토큰 채움색, 시설물 점 마커, hover/선택)
  - 신규 `app/src/spatial/SpaceDetailPanel.tsx` (기본키/레이어코드 분해: UFID·FLOOR·DIVISION·CLASSIFY·SERIAL, QAL/SLP/DIR/SKT/HCP 라벨, 높이/층고)
  - 수정 `app/src/App.tsx` (뷰 탭에 "공간 모델" 추가 — 기존 동시 마운트+display:none 패턴 유지)
- **완료 기준**: 검증용 건물 3개 층 각각 모든 공간 폴리곤·시설물 마커 렌더, 클릭 시 표준 명명 분해·속성 표시. 토큰만 사용. Studio/Dashboard 회귀 없음, 빌드 성공.
- **구현 세부사항**: SVG viewBox는 층 평면 크기(m) 기반. division 색: 소방=danger·안전=warning·이동=brand·업무=neutral 등 status 토큰. App.tsx 수정은 이 태스크만.

### Task T8: 통합 마감 — 빌드·회귀·문서 기록 [AFTER: T1, T4, T5, T6, T7]
- **대상 파일**: 수정 `단계별 개발내용.txt` (3단계 조치 내역 기록), 필요 시 통합 버그 수정(어느 파일이든).
- **완료 기준**:
  - `cd app && npm run build` 성공(타입 에러 0)
  - Phase 6 체크 4항목 충족: 분석 문서(T1), 스키마 타입·데이터(T2·T3), 검증 모델(T3·T7), Space/Asset 노드 연동(T4·T5·T6)
  - Phase 1~5 회귀 스모크: 시드 로드→편집→Validate(기존 7규칙+신규)→Compile→Simulate→실행기→대시보드 정상, 시드 4종 공간 참조 이슈 0건
  - 신규 UI(T5·T7) hex/rgb 하드코딩 0건
- **구현 세부사항**: 시드 갱신(T4)×검증 규칙(T6) 교차 확인이 핵심. localStorage 구버전 그래프(`SITE-*`)가 warning을 내는 것은 정상 동작임을 기록.

---

**의존성 요약**: T1 ∥ T2 → T3 → (T4 ∥ T5 ∥ T6 ∥ T7) → T8. T4~T7은 수정 파일이 서로 겹치지 않아(시드 / 인스펙터+SimulateDialog / validateGraph / App+신규 spatial 뷰) 동시 실행 가능.
