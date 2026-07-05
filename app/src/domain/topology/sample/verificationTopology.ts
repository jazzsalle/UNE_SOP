/**
 * 검증용 건물 샘플 토폴로지 셋 — verificationBuilding(40m×20m, B1/F1/F2 3개 층) 기반
 * 보행 노드 20개 + 계단 노드 6개(2세트×3체인). webbuilder 수동 생성 관례에 따라
 * 바닥 노드 y = 층 elevation + 0.2(m)이며, floorName은 FLOOR 코드·slabName은
 * 소속 공간 기본키(spaceId)로 매핑한다(계약 D). 좌표는 평면 footprint의 복도/공간
 * 중심을 경유하도록 배치하고 world.z = −plan.y로 역산한다(계약 A 좌표 변환).
 * 모든 slabName·시설물 objectCode는 리터럴이 아닌 실제 건물 데이터 조회로 생성해
 * 정합을 기계적으로 보장하며, 모듈 로드 시 이웃 참조 무결성(존재·상호성)을 검사한다.
 */

import {
  VERIFICATION_FACILITIES,
  VERIFICATION_FLOORS,
  VERIFICATION_SPACES,
  VERIFICATION_UFID,
  buildObjectCode,
} from "../../spatial";
import type { SpatialDivision } from "../../spatial";
import type { TopologyNodeData, TopologySet } from "../topologyTypes";

/** 샘플 셋 고정 id — 레지스트리·시드(로봇개 패트롤)가 참조한다. */
export const VERIFICATION_TOPOLOGY_SET_ID = "topo-verification-building";

const [floorB1, floorF1, floorF2] = VERIFICATION_FLOORS;

/** 바닥 노드 y(m) — webbuilder 수동 생성 관례: 층 elevation + 0.2 보정. */
const WALK_Y_B1 = floorB1.elevation + 0.2; // -3.3
const WALK_Y_F1 = floorF1.elevation + 0.2; // 0.2
const WALK_Y_F2 = floorF2.elevation + 0.2; // 4.2

/** 공간 표시명 → 기본키(spaceId) — slabName 정합 보장용. 미존재 시 Error. */
function spaceIdOf(name: string): string {
  const space = VERIFICATION_SPACES.find((candidate) => candidate.name === name);
  if (!space) {
    throw new Error(`검증용 건물에 존재하지 않는 공간입니다: "${name}"`);
  }
  return space.primaryKey;
}

/**
 * 점검 포인트 metadata — 실제 등록된 시설물의 3차원객체코드만 참조하도록
 * buildObjectCode로 재구성한 코드가 VERIFICATION_FACILITIES에 존재하는지 확인한다.
 */
function checkpointMeta(
  floorCode: string,
  division: SpatialDivision,
  facilityCode: string,
  serial: number,
): Record<string, unknown> {
  const objectCode = buildObjectCode(VERIFICATION_UFID, floorCode, division, "FC", facilityCode, serial);
  const facility = VERIFICATION_FACILITIES.find((candidate) => candidate.objectCode === objectCode);
  if (!facility) {
    throw new Error(`검증용 건물에 존재하지 않는 시설물입니다: "${objectCode}"`);
  }
  return { checkpoint: true, facilityObjectCode: facility.objectCode };
}

/** 노드 생성 사양 — 평면 좌표(plan)와 월드 y를 받아 world.z = −plan.y로 역산한다. */
interface NodeSpec {
  id: string;
  displayName: string;
  /** 평면 좌표(m) — footprint와 동일 좌표계. */
  plan: { x: number; y: number };
  /** 월드 y(높이, m). */
  y: number;
  floorName: string;
  /** 소속 공간 표시명 — spaceIdOf로 slabName(기본키) 해석. */
  spaceName: string;
  nodeTypeCode?: string;
  isExit?: boolean;
  metadata?: Record<string, unknown>;
  neighborIds: string[];
}

/** 노드 팩토리 — 계약 A 9필드를 채운다. 기본: normal / isExit false / metadata {}. */
function makeNode(spec: NodeSpec): TopologyNodeData {
  return {
    id: spec.id,
    displayName: spec.displayName,
    worldPosition: { x: spec.plan.x, y: spec.y, z: -spec.plan.y },
    metadata: spec.metadata ?? {},
    isExit: spec.isExit ?? false,
    floorName: spec.floorName,
    slabName: spaceIdOf(spec.spaceName),
    nodeTypeCode: spec.nodeTypeCode ?? "normal",
    neighborIds: spec.neighborIds,
  };
}

/**
 * 검증용 건물 토폴로지 노드 26개.
 * - B01B01 바닥 6개(y=-3.3) / F01F01 바닥 8개(y=0.2, 비상구 1) / F02F02 바닥 6개(y=4.2)
 * - 계단 2세트(각 p0 하층 진입/p1 중간/p2 상층 진출 체인, topologyplan.md 수직 연결 규칙):
 *   계단 A(B1↔F1, plan x=30)·계단 B(F1↔F2, plan x=32) — 계단실 footprint rect(28,0,34,8) 내부.
 * - 점검 포인트 4개: B1 방재실 CCTV, 1층 로비 심장제세동기, 1층 관리실 소화기, 2층 복도 비상조명.
 * 공통 배치: 중앙 복도(plan y 8~12) 노드 3개가 층을 관통하고 실 노드가 가지로 붙는다.
 */
const NODES: TopologyNodeData[] = [
  // ── 지하 1층 (B01B01) 바닥 6개 ──
  makeNode({
    id: "vt-b1-machine",
    displayName: "B1 기계실",
    plan: { x: 7, y: 4 }, // 기계실 rect(0,0,15,8) 중심부
    y: WALK_Y_B1,
    floorName: floorB1.floorCode,
    spaceName: "지하1층 기계실",
    neighborIds: ["vt-b1-corridor-w"],
  }),
  makeNode({
    id: "vt-b1-corridor-w",
    displayName: "B1 복도 서측",
    plan: { x: 5, y: 10 }, // 복도 rect(0,8,40,12) 중심선
    y: WALK_Y_B1,
    floorName: floorB1.floorCode,
    spaceName: "지하1층 중앙 복도",
    neighborIds: ["vt-b1-machine", "vt-b1-corridor-c"],
  }),
  makeNode({
    id: "vt-b1-corridor-c",
    displayName: "B1 복도 중앙",
    plan: { x: 15, y: 10 },
    y: WALK_Y_B1,
    floorName: floorB1.floorCode,
    spaceName: "지하1층 중앙 복도",
    neighborIds: ["vt-b1-corridor-w", "vt-b1-corridor-e"],
  }),
  makeNode({
    id: "vt-b1-corridor-e",
    displayName: "B1 복도 동측",
    plan: { x: 30, y: 10 },
    y: WALK_Y_B1,
    floorName: floorB1.floorCode,
    spaceName: "지하1층 중앙 복도",
    neighborIds: ["vt-b1-corridor-c", "vt-b1-disaster", "vt-b1-stair-entry"],
  }),
  makeNode({
    id: "vt-b1-disaster",
    displayName: "B1 방재실",
    plan: { x: 30, y: 16 }, // 방재실 rect(20,12,40,20) — CCTV 위치와 일치
    y: WALK_Y_B1,
    floorName: floorB1.floorCode,
    spaceName: "지하1층 방재실",
    metadata: checkpointMeta(floorB1.floorCode, "SF", "02", 1), // CCTV
    neighborIds: ["vt-b1-corridor-e"],
  }),
  makeNode({
    id: "vt-b1-stair-entry",
    displayName: "B1 계단실 입구",
    plan: { x: 31, y: 7 }, // 계단실 rect(28,0,34,8) 복도측
    y: WALK_Y_B1,
    floorName: floorB1.floorCode,
    spaceName: "지하1층 계단실",
    neighborIds: ["vt-b1-corridor-e", "vt-stair-a-p0"],
  }),
  // ── 계단 A (B1↔F1) — p0/p1/p2 체인, p0·p2는 최인접 바닥 노드(계단실 입구)와 양방향 ──
  makeNode({
    id: "vt-stair-a-p0",
    displayName: "계단 A 하부",
    plan: { x: 30, y: 5 },
    y: WALK_Y_B1, // p0은 하층 바닥과 같은 높이
    floorName: floorB1.floorCode,
    spaceName: "지하1층 계단실",
    nodeTypeCode: "stair",
    neighborIds: ["vt-b1-stair-entry", "vt-stair-a-p1"],
  }),
  makeNode({
    id: "vt-stair-a-p1",
    displayName: "계단 A 중간",
    plan: { x: 30, y: 3 },
    y: (WALK_Y_B1 + WALK_Y_F1) / 2, // 중점 -1.55 — B1 층고 범위라 floorName은 B01B01
    floorName: floorB1.floorCode,
    spaceName: "지하1층 계단실",
    nodeTypeCode: "stair",
    neighborIds: ["vt-stair-a-p0", "vt-stair-a-p2"],
  }),
  makeNode({
    id: "vt-stair-a-p2",
    displayName: "계단 A 상부",
    plan: { x: 30, y: 5 },
    y: WALK_Y_F1, // p2는 상층 바닥과 같은 높이
    floorName: floorF1.floorCode,
    spaceName: "1층 계단실",
    nodeTypeCode: "stair",
    neighborIds: ["vt-stair-a-p1", "vt-f1-stair-entry"],
  }),
  // ── 지상 1층 (F01F01) 바닥 8개 ──
  makeNode({
    id: "vt-f1-office",
    displayName: "1층 사무실 A",
    plan: { x: 6, y: 4 }, // 사무실 A rect(0,0,12,8)
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 사무실 A",
    neighborIds: ["vt-f1-corridor-w"],
  }),
  makeNode({
    id: "vt-f1-corridor-w",
    displayName: "1층 복도 서측",
    plan: { x: 5, y: 10 },
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 중앙 복도",
    neighborIds: ["vt-f1-office", "vt-f1-corridor-c"],
  }),
  makeNode({
    id: "vt-f1-corridor-c",
    displayName: "1층 복도 중앙",
    plan: { x: 15, y: 10 },
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 중앙 복도",
    neighborIds: ["vt-f1-corridor-w", "vt-f1-corridor-e", "vt-f1-lobby"],
  }),
  makeNode({
    id: "vt-f1-lobby",
    displayName: "1층 로비",
    plan: { x: 14, y: 14 }, // 안내데스크 오각형(10~18, 12~20) 내부 — AED 인접
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 안내데스크",
    metadata: checkpointMeta(floorF1.floorCode, "FF", "08", 1), // 심장제세동기
    neighborIds: ["vt-f1-corridor-c", "vt-f1-entrance"],
  }),
  makeNode({
    id: "vt-f1-entrance",
    displayName: "1층 정문 출입구",
    plan: { x: 14, y: 19 }, // 북측 외벽(plan y=20) 인접
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 안내데스크",
    nodeTypeCode: "exit",
    isExit: true,
    neighborIds: ["vt-f1-lobby"],
  }),
  makeNode({
    id: "vt-f1-corridor-e",
    displayName: "1층 복도 동측",
    plan: { x: 30, y: 10 },
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 중앙 복도",
    neighborIds: ["vt-f1-corridor-c", "vt-f1-mgmt", "vt-f1-stair-entry"],
  }),
  makeNode({
    id: "vt-f1-mgmt",
    displayName: "1층 관리실",
    plan: { x: 37, y: 4 }, // 관리실 rect(34,0,40,8) — 소화기 위치와 일치
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 관리실",
    metadata: checkpointMeta(floorF1.floorCode, "FF", "05", 2), // 소화기
    neighborIds: ["vt-f1-corridor-e"],
  }),
  makeNode({
    id: "vt-f1-stair-entry",
    displayName: "1층 계단실 입구",
    plan: { x: 31, y: 7 },
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 계단실",
    neighborIds: ["vt-f1-corridor-e", "vt-stair-a-p2", "vt-stair-b-p0"],
  }),
  // ── 계단 B (F1↔F2) — p0/p1/p2 체인 ──
  makeNode({
    id: "vt-stair-b-p0",
    displayName: "계단 B 하부",
    plan: { x: 32, y: 5 },
    y: WALK_Y_F1,
    floorName: floorF1.floorCode,
    spaceName: "1층 계단실",
    nodeTypeCode: "stair",
    neighborIds: ["vt-f1-stair-entry", "vt-stair-b-p1"],
  }),
  makeNode({
    id: "vt-stair-b-p1",
    displayName: "계단 B 중간",
    plan: { x: 32, y: 3 },
    y: (WALK_Y_F1 + WALK_Y_F2) / 2, // 중점 2.2 — F1 층고 범위라 floorName은 F01F01
    floorName: floorF1.floorCode,
    spaceName: "1층 계단실",
    nodeTypeCode: "stair",
    neighborIds: ["vt-stair-b-p0", "vt-stair-b-p2"],
  }),
  makeNode({
    id: "vt-stair-b-p2",
    displayName: "계단 B 상부",
    plan: { x: 32, y: 5 },
    y: WALK_Y_F2,
    floorName: floorF2.floorCode,
    spaceName: "2층 계단실",
    nodeTypeCode: "stair",
    neighborIds: ["vt-stair-b-p1", "vt-f2-stair-entry"],
  }),
  // ── 지상 2층 (F02F02) 바닥 6개 ──
  makeNode({
    id: "vt-f2-stair-entry",
    displayName: "2층 계단실 입구",
    plan: { x: 31, y: 7 },
    y: WALK_Y_F2,
    floorName: floorF2.floorCode,
    spaceName: "2층 계단실",
    neighborIds: ["vt-stair-b-p2", "vt-f2-corridor-e"],
  }),
  makeNode({
    id: "vt-f2-corridor-e",
    displayName: "2층 복도 동측",
    plan: { x: 30, y: 10 },
    y: WALK_Y_F2,
    floorName: floorF2.floorCode,
    spaceName: "2층 중앙 복도",
    neighborIds: ["vt-f2-stair-entry", "vt-f2-corridor-c"],
  }),
  makeNode({
    id: "vt-f2-corridor-c",
    displayName: "2층 복도 중앙",
    plan: { x: 20, y: 10 }, // 비상조명 위치와 일치
    y: WALK_Y_F2,
    floorName: floorF2.floorCode,
    spaceName: "2층 중앙 복도",
    metadata: checkpointMeta(floorF2.floorCode, "FF", "06", 1), // 비상조명
    neighborIds: ["vt-f2-corridor-e", "vt-f2-corridor-w", "vt-f2-infirmary"],
  }),
  makeNode({
    id: "vt-f2-corridor-w",
    displayName: "2층 복도 서측",
    plan: { x: 5, y: 10 },
    y: WALK_Y_F2,
    floorName: floorF2.floorCode,
    spaceName: "2층 중앙 복도",
    neighborIds: ["vt-f2-corridor-c", "vt-f2-office"],
  }),
  makeNode({
    id: "vt-f2-office",
    displayName: "2층 사무실 B",
    plan: { x: 7, y: 4 }, // 사무실 B rect(0,0,14,8)
    y: WALK_Y_F2,
    floorName: floorF2.floorCode,
    spaceName: "2층 사무실 B",
    neighborIds: ["vt-f2-corridor-w"],
  }),
  makeNode({
    id: "vt-f2-infirmary",
    displayName: "2층 의무실",
    plan: { x: 16, y: 16 }, // 의무실 rect(12,12,20,20)
    y: WALK_Y_F2,
    floorName: floorF2.floorCode,
    spaceName: "2층 의무실",
    neighborIds: ["vt-f2-corridor-c"],
  }),
];

// 모듈 로드 시 이웃 참조 무결성 검사 — 샘플 셋은 전 링크 양방향(존재 + 상호 참조)을 보장한다.
for (const node of NODES) {
  for (const neighborId of node.neighborIds) {
    const neighbor = NODES.find((candidate) => candidate.id === neighborId);
    if (!neighbor) {
      throw new Error(`샘플 토폴로지 이웃 참조 오류: "${node.id}" → 미존재 "${neighborId}"`);
    }
    if (!neighbor.neighborIds.includes(node.id)) {
      throw new Error(`샘플 토폴로지 상호 참조 오류: "${node.id}" ↔ "${neighborId}"`);
    }
  }
}

/** 검증용 건물 샘플 토폴로지 셋 — B1↔F1↔F2 왕복 경로가 계단 2세트로 연결된다. */
export const VERIFICATION_TOPOLOGY_SET: TopologySet = {
  setId: VERIFICATION_TOPOLOGY_SET_ID,
  name: "검증용 표준 건물 토폴로지",
  siteUfid: VERIFICATION_UFID,
  source: "sample",
  nodes: NODES,
};
