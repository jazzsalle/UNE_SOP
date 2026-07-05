/**
 * 검증용 3D 공간 모델 샘플 데이터 — 「실내공간정보 구축 작업규정」 별표 3·5·6 준수 확인용 상세 건물 1동.
 * 지하 1층(B01B01) + 지상 1층(F01F01) + 지상 2층(F02F02) 3개 층, 공간 21개, 시설물 16개.
 * 모든 id(레이어코드·공간 기본키·3차원객체코드)는 리터럴 하드코딩 없이 T2 명명규칙 함수
 * (`buildFloorCode`/`buildLayerCode`/`buildSpacePrimaryKey`/`buildObjectCode`) 호출로 생성해
 * 명명규칙 준수를 기계적으로 보장한다.
 * footprint는 층 평면 40m×20m 안에서 서로 겹치지 않는 볼록 다각형(별표 3 Room 제약 "볼록다각형 권장")이며,
 * baseElevation은 소속 층 elevation, 층고는 3~4m다. React/xyflow에 의존하지 않는 순수 데이터 모듈.
 */

import { buildFloorCode, buildLayerCode, buildObjectCode, buildSpacePrimaryKey } from "../naming";
import { facilityKindLabel } from "../spatialCodes";
import type {
  DirCode,
  HcpCode,
  QalCode,
  SktCode,
  SlpCode,
  SpatialDivision,
  SpatialFacility,
  SpatialFloor,
  SpatialPoint2D,
  SpatialPoint3D,
  SpatialSite,
  SpatialSpace,
} from "../spatialTypes";

/** 검증용 건물 UFID(공간객체등록번호) — 별표 5, CHAR(17) mock. */
export const VERIFICATION_UFID = "B00100000001AULW1";

/** FLOOR 코드 3종 — buildFloorCode로 생성(지하1층 B01B01 / 지상1층 F01F01 / 지상2층 F02F02). */
const FLOOR_B1 = buildFloorCode("B", 1);
const FLOOR_F1 = buildFloorCode("F", 1);
const FLOOR_F2 = buildFloorCode("F", 2);

/** 검증용 건물(사이트) — 별표 3 Building. 지상 2층·지하 1층. */
export const VERIFICATION_SITE: SpatialSite = {
  ufid: VERIFICATION_UFID,
  name: "검증용 표준 건물",
  storeysAboveGround: 2,
  storeysBelowGround: 1,
  heightAboveGround: 7.5,
  heightBelowGround: 3.5,
  completionYear: 2024,
  domainHint: "verification",
};

/** 검증용 건물 층 3개 — 별표 3 BuildingPart. elevation/height는 공간 지오메트리의 기준. */
export const VERIFICATION_FLOORS: SpatialFloor[] = [
  { floorCode: FLOOR_B1, name: "지하 1층", elevation: -3.5, height: 3.5 },
  { floorCode: FLOOR_F1, name: "지상 1층", elevation: 0, height: 4 },
  { floorCode: FLOOR_F2, name: "지상 2층", elevation: 4, height: 3.5 },
];

/** FLOOR 코드 → 시설물 표시명("층_공간_시설명")의 층 라벨 — 별표 6 명명 규칙용. */
const FLOOR_LABELS: Readonly<Record<string, string>> = {
  [FLOOR_B1]: "지하1층",
  [FLOOR_F1]: "1층",
  [FLOOR_F2]: "2층",
};

/** 축정렬 사각형 footprint 꼭짓점 4개(CCW) — (x1,y1)-(x2,y2), 단위 m. */
function rect(x1: number, y1: number, x2: number, y2: number): SpatialPoint2D[] {
  return [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 },
    { x: x1, y: y2 },
  ];
}

/** 공간 속성(QAL/SLP/DIR/SKT/HANDICAP) 부분 지정 — 미지정 시 기본값 사용. */
interface SpaceAttrs {
  qal?: QalCode;
  slp?: SlpCode;
  dir?: DirCode;
  skt?: SktCode;
  handicap?: HcpCode;
}

/** 공간 생성 사양 — id 요소(층·division·일련번호)와 표시 정보·지오메트리. */
interface SpaceSpec {
  floor: SpatialFloor;
  division: SpatialDivision;
  /** 레이어코드(층×division) 내 일련번호 — 기본키 SERIAL(5)의 근원. */
  serial: number;
  kind: string;
  kindEng: string;
  name: string;
  footprint: SpatialPoint2D[];
  attrs?: SpaceAttrs;
}

/**
 * 공간 팩토리 — 레이어코드·기본키를 반드시 T2 naming 함수로 생성한다.
 * baseElevation은 소속 층 elevation, height는 층고를 그대로 사용한다.
 * 속성 기본값: 콘크리트(QAL005)·경사로없음(SLP001)·양방향(DIR003)·내부(SKT001)·이동가능(HCP000).
 */
function makeSpace(ufid: string, spec: SpaceSpec): SpatialSpace {
  const layerCode = buildLayerCode(ufid, spec.floor.floorCode, spec.division, "RM");
  return {
    primaryKey: buildSpacePrimaryKey(layerCode, spec.serial),
    layerCode,
    ufid,
    floorCode: spec.floor.floorCode,
    division: spec.division,
    classify: "RM",
    kind: spec.kind,
    kindEng: spec.kindEng,
    serial: String(spec.serial).padStart(5, "0"),
    name: spec.name,
    qal: spec.attrs?.qal ?? "QAL005",
    slp: spec.attrs?.slp ?? "SLP001",
    dir: spec.attrs?.dir ?? "DIR003",
    skt: spec.attrs?.skt ?? "SKT001",
    handicap: spec.attrs?.handicap ?? "HCP000",
    geometry: {
      footprint: spec.footprint,
      baseElevation: spec.floor.elevation,
      height: spec.floor.height,
    },
  };
}

const [floorB1, floorF1, floorF2] = VERIFICATION_FLOORS;

/**
 * 검증용 건물 공간 21개 — 층 평면 40m×20m 내 비중첩 볼록 다각형.
 * 공통 배치: 중앙 복도(y 8~12)가 남측 실(y 0~8)과 북측 실(y 12~20)을 가른다.
 * division 다양화: MV(복도·계단실)/BS(사무실·회의실·창고)/CV(화장실·휴게실)/MN(관리실·기계실·전기실)/
 * SF(방재실)/IF(안내데스크)/SL(매점)/MD(의무실).
 */
export const VERIFICATION_SPACES: SpatialSpace[] = [
  // ── 지하 1층 (B01B01) — 6개 ──
  makeSpace(VERIFICATION_UFID, {
    floor: floorB1,
    division: "MV",
    serial: 1,
    kind: "복도",
    kindEng: "Corridor",
    name: "지하1층 중앙 복도",
    footprint: rect(0, 8, 40, 12),
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorB1,
    division: "MV",
    serial: 2,
    kind: "계단실",
    kindEng: "Stairwell",
    name: "지하1층 계단실",
    footprint: rect(28, 0, 34, 8),
    attrs: { handicap: "HCP002" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorB1,
    division: "MN",
    serial: 1,
    kind: "기계실",
    kindEng: "Machine Room",
    name: "지하1층 기계실",
    footprint: rect(0, 0, 15, 8),
    attrs: { qal: "QAL003", handicap: "HCP002" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorB1,
    division: "MN",
    serial: 2,
    kind: "전기실",
    kindEng: "Electrical Room",
    name: "지하1층 전기실",
    footprint: rect(15, 0, 28, 8),
    attrs: { qal: "QAL003", handicap: "HCP002" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorB1,
    division: "BS",
    serial: 1,
    kind: "창고",
    kindEng: "Storage",
    name: "지하1층 창고",
    footprint: rect(0, 12, 20, 20),
    attrs: { dir: "DIR000" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorB1,
    division: "SF",
    serial: 1,
    kind: "방재실",
    kindEng: "Disaster Prevention Room",
    name: "지하1층 방재실",
    footprint: rect(20, 12, 40, 20),
    attrs: { qal: "QAL001" },
  }),
  // ── 지상 1층 (F01F01) — 8개 ──
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "MV",
    serial: 1,
    kind: "복도",
    kindEng: "Corridor",
    name: "1층 중앙 복도",
    footprint: rect(0, 8, 40, 12),
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "MV",
    serial: 2,
    kind: "계단실",
    kindEng: "Stairwell",
    name: "1층 계단실",
    footprint: rect(28, 0, 34, 8),
    attrs: { handicap: "HCP002" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "BS",
    serial: 1,
    kind: "사무실",
    kindEng: "Office",
    name: "1층 사무실 A",
    footprint: rect(0, 0, 12, 8),
    attrs: { qal: "QAL004", dir: "DIR000" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "BS",
    serial: 2,
    kind: "회의실",
    kindEng: "Meeting Room",
    name: "1층 회의실",
    footprint: rect(12, 0, 22, 8),
    attrs: { qal: "QAL002", dir: "DIR000" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "CV",
    serial: 1,
    kind: "화장실",
    kindEng: "Restroom",
    name: "1층 화장실",
    footprint: rect(22, 0, 28, 8),
    attrs: { qal: "QAL000", handicap: "HCP001" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "MN",
    serial: 1,
    kind: "관리실",
    kindEng: "Management Office",
    name: "1층 관리실",
    footprint: rect(34, 0, 40, 8),
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "SL",
    serial: 1,
    kind: "매점",
    kindEng: "Store",
    name: "1층 매점",
    footprint: rect(0, 12, 10, 20),
    attrs: { qal: "QAL007" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF1,
    division: "IF",
    serial: 1,
    kind: "안내데스크",
    kindEng: "Information Desk",
    name: "1층 안내데스크",
    // 사각형 외 볼록 다각형 검증용 오각형(볼록성 유지).
    footprint: [
      { x: 10, y: 12 },
      { x: 18, y: 12 },
      { x: 18, y: 20 },
      { x: 12, y: 20 },
      { x: 10, y: 17 },
    ],
  }),
  // ── 지상 2층 (F02F02) — 7개 ──
  makeSpace(VERIFICATION_UFID, {
    floor: floorF2,
    division: "MV",
    serial: 1,
    kind: "복도",
    kindEng: "Corridor",
    name: "2층 중앙 복도",
    footprint: rect(0, 8, 40, 12),
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF2,
    division: "MV",
    serial: 2,
    kind: "계단실",
    kindEng: "Stairwell",
    name: "2층 계단실",
    footprint: rect(28, 0, 34, 8),
    attrs: { handicap: "HCP002" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF2,
    division: "BS",
    serial: 1,
    kind: "사무실",
    kindEng: "Office",
    name: "2층 사무실 B",
    footprint: rect(0, 0, 14, 8),
    attrs: { qal: "QAL004", dir: "DIR000" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF2,
    division: "BS",
    serial: 2,
    kind: "대회의실",
    kindEng: "Conference Hall",
    name: "2층 대회의실",
    footprint: rect(14, 0, 28, 8),
    attrs: { qal: "QAL002", dir: "DIR000" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF2,
    division: "CV",
    serial: 1,
    kind: "화장실",
    kindEng: "Restroom",
    name: "2층 화장실",
    footprint: rect(34, 0, 40, 8),
    attrs: { qal: "QAL000", handicap: "HCP001" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF2,
    division: "CV",
    serial: 2,
    kind: "휴게실",
    kindEng: "Lounge",
    name: "2층 휴게실",
    footprint: rect(0, 12, 12, 20),
    attrs: { qal: "QAL004" },
  }),
  makeSpace(VERIFICATION_UFID, {
    floor: floorF2,
    division: "MD",
    serial: 1,
    kind: "의무실",
    kindEng: "Infirmary",
    name: "2층 의무실",
    footprint: rect(12, 12, 20, 20),
  }),
];

/** 공간을 표시명(name)으로 조회한다 — 시설물 소속 지정용. 미존재 시 Error(데이터 정합 보장). */
function spaceByName(name: string): SpatialSpace {
  const found = VERIFICATION_SPACES.find((space) => space.name === name);
  if (!found) {
    throw new Error(`검증용 건물에 존재하지 않는 공간입니다: "${name}"`);
  }
  return found;
}

/** 시설물 생성 사양 — 소속 공간 + division/시설구분코드/일련번호 + 배치 위치. */
interface FacilitySpec {
  space: SpatialSpace;
  division: SpatialDivision;
  /** 시설구분코드(별표 5 라, CHAR 2). */
  facilityCode: string;
  /** 층×division×시설구분코드 그룹 내 일련번호 — 3차원객체코드 SERIAL(5)의 근원. */
  serial: number;
  /** 배치 위치(m) — z는 층 elevation 기준 절대 고도. */
  position: SpatialPoint3D;
}

/**
 * 시설물 팩토리 — 3차원객체코드를 반드시 T2 buildObjectCode로 생성하고,
 * 표시명은 별표 6 명명 규칙 "층_공간_시설명"으로 조립한다.
 */
function makeFacility(ufid: string, spec: FacilitySpec): SpatialFacility {
  const kind = facilityKindLabel(spec.division, spec.facilityCode) ?? "기타";
  return {
    objectCode: buildObjectCode(
      ufid,
      spec.space.floorCode,
      spec.division,
      "FC",
      spec.facilityCode,
      spec.serial,
    ),
    spaceId: spec.space.primaryKey,
    division: spec.division,
    classify: "FC",
    facilityCode: spec.facilityCode,
    kind,
    name: `${FLOOR_LABELS[spec.space.floorCode]}_${spec.space.kind}_${kind}`,
    position: spec.position,
  };
}

/**
 * 검증용 건물 시설물 16개 — 소방(FF: 소화기05·소화전09·비상구07·심장제세동기08·비상조명06),
 * 안전(SF: CCTV02), 이동(MV: 계단01·엘리베이터04), 안내(IF: 안내도03)를 3개 층에 배치.
 */
export const VERIFICATION_FACILITIES: SpatialFacility[] = [
  // ── 지하 1층 ──
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("지하1층 중앙 복도"),
    division: "FF",
    facilityCode: "05",
    serial: 1,
    position: { x: 5, y: 10, z: -2.5 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("지하1층 계단실"),
    division: "MV",
    facilityCode: "01",
    serial: 1,
    position: { x: 31, y: 4, z: -3.5 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("지하1층 방재실"),
    division: "SF",
    facilityCode: "02",
    serial: 1,
    position: { x: 30, y: 16, z: -1 },
  }),
  // ── 지상 1층 ──
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 중앙 복도"),
    division: "FF",
    facilityCode: "05",
    serial: 1,
    position: { x: 5, y: 10, z: 1 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 관리실"),
    division: "FF",
    facilityCode: "05",
    serial: 2,
    position: { x: 37, y: 4, z: 1 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 중앙 복도"),
    division: "FF",
    facilityCode: "09",
    serial: 1,
    position: { x: 35, y: 10, z: 0.8 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 계단실"),
    division: "FF",
    facilityCode: "07",
    serial: 1,
    position: { x: 31, y: 7.5, z: 0 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 안내데스크"),
    division: "FF",
    facilityCode: "08",
    serial: 1,
    position: { x: 13, y: 14, z: 1.2 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 중앙 복도"),
    division: "SF",
    facilityCode: "02",
    serial: 1,
    position: { x: 20, y: 11.5, z: 3.5 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 계단실"),
    division: "MV",
    facilityCode: "01",
    serial: 1,
    position: { x: 31, y: 4, z: 0 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 중앙 복도"),
    division: "MV",
    facilityCode: "04",
    serial: 1,
    position: { x: 25, y: 10, z: 0 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("1층 안내데스크"),
    division: "IF",
    facilityCode: "03",
    serial: 1,
    position: { x: 16, y: 13, z: 1.5 },
  }),
  // ── 지상 2층 ──
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("2층 중앙 복도"),
    division: "FF",
    facilityCode: "05",
    serial: 1,
    position: { x: 5, y: 10, z: 5 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("2층 중앙 복도"),
    division: "FF",
    facilityCode: "06",
    serial: 1,
    position: { x: 20, y: 10, z: 6.8 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("2층 의무실"),
    division: "FF",
    facilityCode: "08",
    serial: 1,
    position: { x: 14, y: 14, z: 5.2 },
  }),
  makeFacility(VERIFICATION_UFID, {
    space: spaceByName("2층 계단실"),
    division: "MV",
    facilityCode: "01",
    serial: 1,
    position: { x: 31, y: 4, z: 4 },
  }),
];
