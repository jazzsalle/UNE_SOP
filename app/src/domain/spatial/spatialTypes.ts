/**
 * 공간 스키마 코어 타입 모듈 — 「실내공간정보 구축 작업규정」 별표 2(레이어 분류체계),
 * 별표 3(표준데이터 사양), 별표 5(레이어 명명규칙), 별표 6(속성입력)을 근거로 한다.
 * React/xyflow에 의존하지 않는 순수 도메인 모델이며, 제품 데이터 모델(`SOPGraph`)의
 * Space Scope / Asset Filter 노드가 참조하는 공간 식별 체계를 제공한다.
 */

/** 레이어 대분류(주체) — 별표 2: 개방(open)/고유(private)/관리(management) 3종. */
export type SpatialDivisionMajor = "open" | "private" | "management";

/**
 * 레이어 중분류(용도) DIVISION 코드 — 별표 5·6, CHAR(2) 12종.
 * MV이동·IF안내·CV편의·TP운수·SF안전·FF소방·SL판매·MD의료·HS주거·BS업무·MN관리·IS구조.
 * 대분류→중분류 매핑(별표 2): 개방={MV,IF,CV,TP,SF,FF,SL,MD}, 고유={HS,BS}, 관리={MN,IS}.
 */
export type SpatialDivision =
  | "MV"
  | "IF"
  | "CV"
  | "TP"
  | "SF"
  | "FF"
  | "SL"
  | "MD"
  | "HS"
  | "BS"
  | "MN"
  | "IS";

/**
 * 레이어 소분류(구조) CLASSIFY 코드 — 별표 6 기준 8종, CHAR(2).
 * RM공간·FC시설물·CL천정·WL벽·FL바닥·DR문·WD창문·PL기둥.
 * 주의: 별표 5 레이어코드에는 RM을 제외한 7종만 등장하며, 별표 6(속성입력)이 공간(RM)을 추가한다.
 */
export type SpatialClassify =
  | "RM"
  | "FC"
  | "CL"
  | "WL"
  | "FL"
  | "DR"
  | "WD"
  | "PL";

/**
 * FLOOR 코드 접두 문자 — 별표 5: B(지하)/F(지상)/L(로비).
 * FLOOR 코드(CHAR 6)는 시작층(3)+끝층(3) 결합. 예: 지하1층 `B01B01`, 지상1층 `F01F01`,
 * 로비층 `L01L01`, 지하1층~지상1층 `B01F01`.
 */
export type FloorPrefix = "B" | "F" | "L";

/** 재질(QAL) 속성 코드 — 별표 6, CHAR(6). 000미분류~007플라스틱, 999기타. */
export type QalCode =
  | "QAL000"
  | "QAL001"
  | "QAL002"
  | "QAL003"
  | "QAL004"
  | "QAL005"
  | "QAL006"
  | "QAL007"
  | "QAL999";

/** 경사(SLP) 속성 코드 — 별표 6, CHAR(6). 000미분류·001경사로없음~004통합, 999기타. */
export type SlpCode =
  | "SLP000"
  | "SLP001"
  | "SLP002"
  | "SLP003"
  | "SLP004"
  | "SLP999";

/** 진행방향(DIR) 속성 코드 — 별표 6, CHAR(6). 000미분류·001상행·002하행·003양방향, 999기타. */
export type DirCode = "DIR000" | "DIR001" | "DIR002" | "DIR003" | "DIR999";

/** 내외부(SKT) 속성 코드 — 별표 6, CHAR(6). 000미분류·001내부·002외부, 999기타. */
export type SktCode = "SKT000" | "SKT001" | "SKT002" | "SKT999";

/** 장애인 이동(HANDICAP) 속성 코드 — 별표 6, CHAR(6). 000이동가능·001전용·002이동불가. */
export type HcpCode = "HCP000" | "HCP001" | "HCP002";

/** 평면 좌표(m) — 공간 footprint 꼭짓점. Phase 9 WebGL 뷰어가 그대로 소비한다. */
export interface SpatialPoint2D {
  x: number;
  y: number;
}

/** 3차원 좌표(m) — 시설물 배치 위치. */
export interface SpatialPoint3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 공간의 3D 지오메트리 — 별표 3 Room의 LOD4 Solid를 단순화한 표현.
 * footprint(볼록다각형 권장, 별표 3 Room 제약) + 바닥 고도 + 층고(압출 높이).
 */
export interface SpaceGeometry {
  /** 층 평면 위 다각형 꼭짓점 목록(m) — 별표 3 Room 제약상 볼록다각형 권장. */
  footprint: SpatialPoint2D[];
  /** 바닥 기준 고도(m) — 소속 층 elevation과 일치하는 것이 원칙. */
  baseElevation: number;
  /** 공간 높이(m) — 층고 기반 압출 높이. */
  height: number;
}

/**
 * 사이트(건물) — 별표 3 Building 객체유형에 대응.
 * 본 프로젝트에서 `siteId` = 건물 UFID(공간객체등록번호)로 사용한다.
 */
export interface SpatialSite {
  /** 공간객체등록번호(UFID) — 별표 5, CHAR(17) mock. 예: `B00100000001AULW1`. */
  ufid: string;
  /** 건물명 — 별표 3 Building name. */
  name: string;
  /** 지상 층수 — 별표 3 Building storeysAboveGround. */
  storeysAboveGround: number;
  /** 지하 층수 — 별표 3 Building storeysBelowGround. */
  storeysBelowGround: number;
  /** 지상 높이(m) — 별표 3 Building measuredHeight(지상부). */
  heightAboveGround: number;
  /** 지하 깊이(m) — 별표 3 Building 지하부 높이. */
  heightBelowGround: number;
  /** 완공 연도 — 별표 3 Building yearOfConstruction. */
  completionYear?: number;
  /** 시드 도메인 힌트(lh2/power/school/workplace 등) — 규정 외 본 프로젝트 확장 필드. */
  domainHint?: string;
}

/**
 * 층 — 별표 3 BuildingPart(층 단위 분할)에 대응.
 * 층 식별은 별표 5 FLOOR 코드(CHAR 6)를 사용한다.
 */
export interface SpatialFloor {
  /** FLOOR 코드(CHAR 6) — 별표 5: 시작층(3)+끝층(3). 예: `F01F01`, `B01B01`. */
  floorCode: string;
  /** 층 명칭 — 예: "지상 1층". */
  name: string;
  /** 층 바닥 고도(m) — 별표 3 LOD 기하 배치 기준. */
  elevation: number;
  /** 층고(m). */
  height: number;
}

/**
 * 공간 — 별표 3 Room 객체유형에 대응. CLASSIFY는 항상 RM(별표 6).
 * `primaryKey`가 본 프로젝트의 `spaceId`다.
 */
export interface SpatialSpace {
  /** 공간 기본키 — 별표 6: 레이어코드 + "_" + 일련번호(5). 예: `L_B00100000001AULW1_F01F01_BS_RM_00001`. */
  primaryKey: string;
  /** 레이어코드 — 별표 5: `L_` + UFID(17) + `_` + FLOOR(6) + `_` + DIVISION(2) + `_` + CLASSIFY(2). */
  layerCode: string;
  /** 소속 건물 UFID(CHAR 17) — 별표 5. */
  ufid: string;
  /** 소속 층 FLOOR 코드(CHAR 6) — 별표 5. */
  floorCode: string;
  /** 중분류(용도) DIVISION 코드 — 별표 5·6, CHAR(2). */
  division: SpatialDivision;
  /** 소분류(구조) CLASSIFY 코드 — 공간은 항상 RM(별표 6). */
  classify: "RM";
  /** 공간 종류 국문명 — 별표 6 속성컬럼(공간명). 예: "사무실". */
  kind: string;
  /** 공간 종류 영문명 — 별표 6 속성컬럼(공간영문명). 예: "Office". */
  kindEng: string;
  /** 일련번호 — 별표 5·6, 5자리 zero-pad 문자열. 예: "00001". */
  serial: string;
  /** 개별 공간 표시명 — 예: "1층 사무실 A". */
  name: string;
  /** 재질 코드 — 별표 6 QAL. */
  qal: QalCode;
  /** 경사 코드 — 별표 6 SLP. */
  slp: SlpCode;
  /** 진행방향 코드 — 별표 6 DIR. */
  dir: DirCode;
  /** 내외부 코드 — 별표 6 SKT. */
  skt: SktCode;
  /** 장애인 이동 코드 — 별표 6 HANDICAP. */
  handicap: HcpCode;
  /** 3D 지오메트리 — 별표 3 Room LOD4 Solid의 단순화(footprint + baseElevation + height). */
  geometry: SpaceGeometry;
}

/**
 * 시설물 — 별표 3 IntBuildingInstallation 객체유형에 대응. CLASSIFY는 항상 FC.
 * `objectCode`(3차원객체코드)가 본 프로젝트의 시설물(asset) id다.
 */
export interface SpatialFacility {
  /** 3차원객체코드 — 별표 5 나: `M_` + UFID(17)+FLOOR(6) + `_` + DIVISION(2)+CLASSIFY(2) + `_` + 시설구분(2)+일련번호(5). */
  objectCode: string;
  /** 소속 공간의 기본키(spaceId) — 별표 6 공간-시설물 소속 관계. */
  spaceId: string;
  /** 중분류(용도) DIVISION 코드 — 별표 5·6, CHAR(2). */
  division: SpatialDivision;
  /** 소분류(구조) CLASSIFY 코드 — 시설물은 항상 FC(별표 6). */
  classify: "FC";
  /** 시설구분코드 — 별표 5 라, division별 CHAR(2). 예: 소방(FF)의 소화기 "05". */
  facilityCode: string;
  /** 시설물 종류 국문명 — 별표 5 라 시설구분코드 전표의 명칭. 예: "소화기". */
  kind: string;
  /** 시설물 표시명 — 별표 6 명명 규칙 "층_공간_시설명". 예: `1층_복도_소화전`. */
  name: string;
  /** 배치 위치(m) — 별표 3 IntBuildingInstallation 기하의 단순화(점 위치). */
  position: SpatialPoint3D;
}
