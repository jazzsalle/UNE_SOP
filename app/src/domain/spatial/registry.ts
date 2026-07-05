/**
 * 공간 데이터 조회 레지스트리 — 검증용 건물 1동 + 시드 도메인 사이트 4동을 통합한
 * 정적 데이터 기반 순수 조회 함수를 제공한다. React/xyflow에 의존하지 않으며,
 * Space Scope/Asset Filter 노드(인스펙터·검증 규칙)가 이 API로 공간 id를 해석한다.
 * 미존재 조회는 naming.ts의 parse* 규약과 동일하게 null(단건) 또는 빈 배열(목록)을 반환한다.
 */

import type { SpatialFacility, SpatialFloor, SpatialSite, SpatialSpace } from "./spatialTypes";
import {
  VERIFICATION_FACILITIES,
  VERIFICATION_FLOORS,
  VERIFICATION_SITE,
  VERIFICATION_SPACES,
} from "./model/verificationBuilding";
import { SEED_SITE_BUNDLES, type SpatialSiteBundle } from "./model/seedSites";

/** 전체 사이트 번들 — 검증용 1 + 시드용 4 = 5개. */
const BUNDLES: readonly SpatialSiteBundle[] = [
  {
    site: VERIFICATION_SITE,
    floors: VERIFICATION_FLOORS,
    spaces: VERIFICATION_SPACES,
    facilities: VERIFICATION_FACILITIES,
  },
  ...SEED_SITE_BUNDLES,
];

/** UFID → 번들 인덱스. */
const BUNDLE_BY_UFID = new Map<string, SpatialSiteBundle>(
  BUNDLES.map((bundle) => [bundle.site.ufid, bundle]),
);

/** 공간 기본키 → 공간 인덱스(전 사이트 통합). */
const SPACE_BY_ID = new Map<string, SpatialSpace>(
  BUNDLES.flatMap((bundle) => bundle.spaces.map((space) => [space.primaryKey, space] as const)),
);

/** 3차원객체코드 → 시설물 인덱스(전 사이트 통합). */
const FACILITY_BY_CODE = new Map<string, SpatialFacility>(
  BUNDLES.flatMap((bundle) =>
    bundle.facilities.map((facility) => [facility.objectCode, facility] as const),
  ),
);

/** 등록된 전체 사이트 목록(검증용 1 + 시드용 4)을 반환한다. */
export function getSpatialSites(): SpatialSite[] {
  return BUNDLES.map((bundle) => bundle.site);
}

/** UFID로 사이트를 조회한다. 미등록 UFID는 null. */
export function getSite(ufid: string): SpatialSite | null {
  return BUNDLE_BY_UFID.get(ufid)?.site ?? null;
}

/** 사이트의 층 목록을 반환한다. 미등록 UFID는 빈 배열. */
export function getFloors(ufid: string): SpatialFloor[] {
  return BUNDLE_BY_UFID.get(ufid)?.floors.slice() ?? [];
}

/** 사이트의 공간 목록을 반환한다. floorCode 지정 시 해당 층만 필터. 미등록 UFID는 빈 배열. */
export function getSpaces(ufid: string, floorCode?: string): SpatialSpace[] {
  const spaces = BUNDLE_BY_UFID.get(ufid)?.spaces ?? [];
  return floorCode === undefined
    ? spaces.slice()
    : spaces.filter((space) => space.floorCode === floorCode);
}

/** 공간 기본키(spaceId)로 공간을 전 사이트에서 조회한다. 미등록 id는 null. */
export function findSpace(spaceId: string): SpatialSpace | null {
  return SPACE_BY_ID.get(spaceId) ?? null;
}

/** 사이트의 시설물 목록을 반환한다. spaceId 지정 시 소속 공간만 필터. 미등록 UFID는 빈 배열. */
export function getFacilities(ufid: string, spaceId?: string): SpatialFacility[] {
  const facilities = BUNDLE_BY_UFID.get(ufid)?.facilities ?? [];
  return spaceId === undefined
    ? facilities.slice()
    : facilities.filter((facility) => facility.spaceId === spaceId);
}

/** 3차원객체코드(objectCode)로 시설물을 전 사이트에서 조회한다. 미등록 코드는 null. */
export function findFacility(objectCode: string): SpatialFacility | null {
  return FACILITY_BY_CODE.get(objectCode) ?? null;
}
