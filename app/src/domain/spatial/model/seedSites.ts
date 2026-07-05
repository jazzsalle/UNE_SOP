/**
 * 시드 4 도메인용 사이트 데이터 — Phase 4 시드(액화수소/발전소/안전한국훈련/일반 사업장)가 참조하는
 * 공간을 「실내공간정보 구축 작업규정」 표준 명명 체계로 재정의한다. 모든 id는 T2 naming 함수 호출로 생성.
 *
 * ## 시드 참조용 id 대응표 (T4가 그대로 사용할 것)
 *
 * 구 id(자유 문자열)        → 신 id(표준 명명)
 * ─ 액화수소 플랜트 (`app/src/domain/seeds/lh2Plant.ts`)
 *   SITE-LH2-PLANT          → `B00200000001AULH2` (UFID)
 *   SPACE-STORAGE-ZONE      → `L_B00200000001AULH2_F01F01_BS_RM_00001` (공간 기본키: 저장구역)
 *   ASSET-H2-SENSOR-001     → `M_B00200000001AULH2F01F01_SFFC_9900001` (수소센서 — 시설구분코드
 *                              전표에 없어 안전(SF) "기타(99)"로 표현)
 * ─ 발전소 (`powerPlant.ts`)
 *   SITE-POWER-PLANT        → `B00300000001AUPWR` (UFID)
 *   SPACE-TURBINE-HALL      → `L_B00300000001AUPWR_F01F01_BS_RM_00001` (공간 기본키: 터빈홀)
 *   ASSET-TURBINE-01        → `M_B00300000001AUPWRF01F01_MNFC_9900001` (터빈 — 관리(MN) "기타(99)")
 * ─ 학교/안전한국훈련 (`safetyKoreaDrill.ts`)
 *   SITE-SCHOOL             → `B00400000001AUSCH` (UFID)
 *   SPACE-PLAYGROUND        → `L_B00400000001AUSCH_F01F01_CV_RM_00001` (공간 기본키: 운동장 — 대피영역, 외부)
 * ─ 일반 사업장 (`generalWorkplace.ts`)
 *   SITE-WORKPLACE          → `B00500000001AUWRK` (UFID)
 *   SPACE-WORK-ZONE-A       → `L_B00500000001AUWRK_F01F01_BS_RM_00001` (공간 기본키: 작업구역 A)
 *   ASSET-CCTV-07           → `M_B00500000001AUWRKF01F01_SFFC_0200001` (CCTV — 안전(SF) "02")
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

/** 사이트 1개의 전체 데이터 묶음 — 레지스트리 통합 단위. */
export interface SpatialSiteBundle {
  site: SpatialSite;
  floors: SpatialFloor[];
  spaces: SpatialSpace[];
  facilities: SpatialFacility[];
}

/** 시드 사이트 UFID 4종 — 별표 5, CHAR(17) mock. 서로 다른 값. */
export const LH2_PLANT_UFID = "B00200000001AULH2";
export const POWER_PLANT_UFID = "B00300000001AUPWR";
export const SCHOOL_UFID = "B00400000001AUSCH";
export const WORKPLACE_UFID = "B00500000001AUWRK";

/** 지상 1·2층 FLOOR 코드 — buildFloorCode로 생성. */
const FLOOR_F1 = buildFloorCode("F", 1);
const FLOOR_F2 = buildFloorCode("F", 2);

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

/** 공간 생성 사양 — verificationBuilding.ts와 동일한 로컬 팩토리 규약. */
interface SpaceSpec {
  floor: SpatialFloor;
  division: SpatialDivision;
  serial: number;
  kind: string;
  kindEng: string;
  name: string;
  footprint: SpatialPoint2D[];
  attrs?: SpaceAttrs;
}

/** 공간 팩토리 — 레이어코드·기본키를 T2 naming 함수로 생성한다. */
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

/** 시설물 생성 사양 — kindOverride는 "기타(99)" 코드에 실제 종류명을 부여할 때 사용. */
interface FacilitySpec {
  space: SpatialSpace;
  division: SpatialDivision;
  facilityCode: string;
  serial: number;
  position: SpatialPoint3D;
  /** 층 라벨("1층" 등) — 별표 6 표시명 "층_공간_시설명" 조립용. */
  floorLabel: string;
  /**
   * 전표 명칭 대체 종류명 — 시설구분코드 전표에 없는 시설(수소센서·터빈 등)을
   * "기타(99)" 코드로 표현할 때 실제 종류명을 지정한다.
   */
  kindOverride?: string;
}

/** 시설물 팩토리 — 3차원객체코드를 T2 buildObjectCode로 생성한다. */
function makeFacility(ufid: string, spec: FacilitySpec): SpatialFacility {
  const kind = spec.kindOverride ?? facilityKindLabel(spec.division, spec.facilityCode) ?? "기타";
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
    name: `${spec.floorLabel}_${spec.space.kind}_${kind}`,
    position: spec.position,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 액화수소 플랜트 — 저장구역·펌프실·통제실 (단층, 층고 6m)
// ─────────────────────────────────────────────────────────────────────────────

const lh2Floors: SpatialFloor[] = [{ floorCode: FLOOR_F1, name: "지상 1층", elevation: 0, height: 6 }];

const lh2StorageZone = makeSpace(LH2_PLANT_UFID, {
  floor: lh2Floors[0],
  division: "BS",
  serial: 1,
  kind: "저장구역",
  kindEng: "Storage Zone",
  name: "액화수소 저장구역",
  footprint: rect(0, 0, 30, 30),
  attrs: { qal: "QAL003", skt: "SKT002", handicap: "HCP002" },
});
const lh2PumpRoom = makeSpace(LH2_PLANT_UFID, {
  floor: lh2Floors[0],
  division: "MN",
  serial: 1,
  kind: "펌프실",
  kindEng: "Pump Room",
  name: "펌프실",
  footprint: rect(30, 0, 45, 15),
  attrs: { qal: "QAL003", handicap: "HCP002" },
});
const lh2ControlRoom = makeSpace(LH2_PLANT_UFID, {
  floor: lh2Floors[0],
  division: "MN",
  serial: 2,
  kind: "통제실",
  kindEng: "Control Room",
  name: "통제실",
  footprint: rect(30, 15, 45, 30),
});

const lh2Bundle: SpatialSiteBundle = {
  site: {
    ufid: LH2_PLANT_UFID,
    name: "액화수소 플랜트",
    storeysAboveGround: 1,
    storeysBelowGround: 0,
    heightAboveGround: 6,
    heightBelowGround: 0,
    completionYear: 2023,
    domainHint: "lh2",
  },
  floors: lh2Floors,
  spaces: [lh2StorageZone, lh2PumpRoom, lh2ControlRoom],
  facilities: [
    // 수소센서 — 시설구분코드 전표(별표 5 라)에 없어 안전(SF) "기타(99)"로 표현.
    makeFacility(LH2_PLANT_UFID, {
      space: lh2StorageZone,
      division: "SF",
      facilityCode: "99",
      serial: 1,
      position: { x: 15, y: 15, z: 2 },
      floorLabel: "1층",
      kindOverride: "수소센서",
    }),
    makeFacility(LH2_PLANT_UFID, {
      space: lh2ControlRoom,
      division: "SF",
      facilityCode: "02",
      serial: 1,
      position: { x: 37, y: 22, z: 2.5 },
      floorLabel: "1층",
    }),
    makeFacility(LH2_PLANT_UFID, {
      space: lh2PumpRoom,
      division: "FF",
      facilityCode: "05",
      serial: 1,
      position: { x: 32, y: 5, z: 1 },
      floorLabel: "1층",
    }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 발전소 — 터빈홀·제어실 (단층, 층고 12m)
// ─────────────────────────────────────────────────────────────────────────────

const powerFloors: SpatialFloor[] = [
  { floorCode: FLOOR_F1, name: "지상 1층", elevation: 0, height: 12 },
];

const powerTurbineHall = makeSpace(POWER_PLANT_UFID, {
  floor: powerFloors[0],
  division: "BS",
  serial: 1,
  kind: "터빈홀",
  kindEng: "Turbine Hall",
  name: "터빈홀",
  footprint: rect(0, 0, 50, 25),
  attrs: { qal: "QAL003", handicap: "HCP002" },
});
const powerControlRoom = makeSpace(POWER_PLANT_UFID, {
  floor: powerFloors[0],
  division: "MN",
  serial: 1,
  kind: "제어실",
  kindEng: "Control Room",
  name: "중앙 제어실",
  footprint: rect(50, 0, 65, 12),
});

const powerBundle: SpatialSiteBundle = {
  site: {
    ufid: POWER_PLANT_UFID,
    name: "발전소",
    storeysAboveGround: 1,
    storeysBelowGround: 0,
    heightAboveGround: 12,
    heightBelowGround: 0,
    completionYear: 2010,
    domainHint: "power",
  },
  floors: powerFloors,
  spaces: [powerTurbineHall, powerControlRoom],
  facilities: [
    // 터빈 — 시설구분코드 전표에 없어 관리(MN) "기타(99)"로 표현.
    makeFacility(POWER_PLANT_UFID, {
      space: powerTurbineHall,
      division: "MN",
      facilityCode: "99",
      serial: 1,
      position: { x: 25, y: 12, z: 0 },
      floorLabel: "1층",
      kindOverride: "터빈",
    }),
    makeFacility(POWER_PLANT_UFID, {
      space: powerControlRoom,
      division: "SF",
      facilityCode: "02",
      serial: 1,
      position: { x: 57, y: 6, z: 3 },
      floorLabel: "1층",
    }),
    makeFacility(POWER_PLANT_UFID, {
      space: powerTurbineHall,
      division: "FF",
      facilityCode: "05",
      serial: 1,
      position: { x: 5, y: 3, z: 1 },
      floorLabel: "1층",
    }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 학교(안전한국훈련) — 운동장(대피영역·외부)·강당·교실 (단층)
// ─────────────────────────────────────────────────────────────────────────────

const schoolFloors: SpatialFloor[] = [
  { floorCode: FLOOR_F1, name: "지상 1층", elevation: 0, height: 4 },
];

const schoolPlayground = makeSpace(SCHOOL_UFID, {
  floor: schoolFloors[0],
  division: "CV",
  serial: 1,
  kind: "운동장",
  kindEng: "Playground",
  name: "운동장(대피영역)",
  footprint: rect(0, 0, 60, 40),
  attrs: { qal: "QAL000", skt: "SKT002" },
});
const schoolAuditorium = makeSpace(SCHOOL_UFID, {
  floor: schoolFloors[0],
  division: "CV",
  serial: 2,
  kind: "강당",
  kindEng: "Auditorium",
  name: "강당",
  footprint: rect(60, 0, 90, 20),
});
const schoolClassroom = makeSpace(SCHOOL_UFID, {
  floor: schoolFloors[0],
  division: "BS",
  serial: 1,
  kind: "교실",
  kindEng: "Classroom",
  name: "교실 3-1",
  footprint: rect(60, 20, 90, 32),
  attrs: { qal: "QAL004", dir: "DIR000" },
});

const schoolBundle: SpatialSiteBundle = {
  site: {
    ufid: SCHOOL_UFID,
    name: "학교(안전한국훈련장)",
    storeysAboveGround: 1,
    storeysBelowGround: 0,
    heightAboveGround: 4,
    heightBelowGround: 0,
    completionYear: 1998,
    domainHint: "school",
  },
  floors: schoolFloors,
  spaces: [schoolPlayground, schoolAuditorium, schoolClassroom],
  facilities: [
    makeFacility(SCHOOL_UFID, {
      space: schoolPlayground,
      division: "IF",
      facilityCode: "03",
      serial: 1,
      position: { x: 5, y: 35, z: 1.5 },
      floorLabel: "1층",
    }),
    makeFacility(SCHOOL_UFID, {
      space: schoolAuditorium,
      division: "FF",
      facilityCode: "05",
      serial: 1,
      position: { x: 62, y: 2, z: 1 },
      floorLabel: "1층",
    }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 일반 사업장 — 작업구역 A(1층)·사무실(2층)
// ─────────────────────────────────────────────────────────────────────────────

const workplaceFloors: SpatialFloor[] = [
  { floorCode: FLOOR_F1, name: "지상 1층", elevation: 0, height: 4 },
  { floorCode: FLOOR_F2, name: "지상 2층", elevation: 4, height: 3.5 },
];

const workplaceZoneA = makeSpace(WORKPLACE_UFID, {
  floor: workplaceFloors[0],
  division: "BS",
  serial: 1,
  kind: "작업구역",
  kindEng: "Work Zone",
  name: "작업구역 A",
  footprint: rect(0, 0, 30, 20),
  attrs: { qal: "QAL003" },
});
const workplaceOffice = makeSpace(WORKPLACE_UFID, {
  floor: workplaceFloors[1],
  division: "BS",
  serial: 1,
  kind: "사무실",
  kindEng: "Office",
  name: "사무동 사무실",
  footprint: rect(0, 0, 30, 20),
  attrs: { qal: "QAL004", dir: "DIR000" },
});

const workplaceBundle: SpatialSiteBundle = {
  site: {
    ufid: WORKPLACE_UFID,
    name: "일반 사업장",
    storeysAboveGround: 2,
    storeysBelowGround: 0,
    heightAboveGround: 7.5,
    heightBelowGround: 0,
    completionYear: 2018,
    domainHint: "workplace",
  },
  floors: workplaceFloors,
  spaces: [workplaceZoneA, workplaceOffice],
  facilities: [
    makeFacility(WORKPLACE_UFID, {
      space: workplaceZoneA,
      division: "SF",
      facilityCode: "02",
      serial: 1,
      position: { x: 15, y: 18, z: 3.5 },
      floorLabel: "1층",
    }),
    makeFacility(WORKPLACE_UFID, {
      space: workplaceZoneA,
      division: "FF",
      facilityCode: "05",
      serial: 1,
      position: { x: 2, y: 2, z: 1 },
      floorLabel: "1층",
    }),
    makeFacility(WORKPLACE_UFID, {
      space: workplaceOffice,
      division: "FF",
      facilityCode: "05",
      serial: 1,
      position: { x: 2, y: 2, z: 5 },
      floorLabel: "2층",
    }),
  ],
};

/** 시드 4 도메인 사이트 번들 — 레지스트리에서 검증용 건물과 통합된다. */
export const SEED_SITE_BUNDLES: readonly SpatialSiteBundle[] = [
  lh2Bundle,
  powerBundle,
  schoolBundle,
  workplaceBundle,
];
