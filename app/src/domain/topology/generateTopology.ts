/**
 * 토폴로지 임의 생성기 — 공간 스키마(층·공간 footprint)만으로 이동 가능한 토폴로지 셋을
 * 결정적으로 합성한다(Phase 9 시나리오 실행기의 "토폴로지 생성" 단계 근거).
 * 좌표 규약은 샘플 셋(verificationTopology)과 동일: plan.x = world.x, plan.y = −world.z,
 * 바닥 노드 y = 층 elevation + 0.2(m). floorName은 FLOOR 코드, slabName은 공간 기본키(spaceId).
 * 모든 난수는 시드된 mulberry32 PRNG만 경유하므로(Date.now/Math.random 미사용) 동일
 * seed → 동일 결과가 보장된다. React/xyflow에 의존하지 않는 순수 도메인 모듈.
 */

import type { SpatialFloor, SpatialPoint2D, SpatialSpace } from "../spatial";
import { findPath } from "./pathFinder";
import type { TopologyNodeData, TopologySet } from "./topologyTypes";

/** generateTopology 입력 — 사이트 UFID와 층/공간 목록(공간 레지스트리 조회 결과 그대로). */
export interface GenerateTopologyInput {
  siteUfid: string;
  floors: SpatialFloor[];
  spaces: SpatialSpace[];
  /** PRNG 시드 — 동일 seed는 동일 셋을 생성한다. 기본 1. */
  seed?: number;
  options?: {
    /** 셋 표시명 — 미지정 시 "임의 생성 토폴로지 (seed N)". */
    name?: string;
    /** 대형 공간 그리드 보간 간격(m) — 기본 8. */
    gridSpacing?: number;
  };
}

/** 이 면적(㎡)을 초과하는 공간은 노드 1개 대신 그리드 보간으로 2~4개를 배치한다. */
const LARGE_AREA_M2 = 80;

/** 기본 그리드 보간 간격(m). */
const DEFAULT_GRID_SPACING = 8;

/** 바닥 노드 y 보정(m) — webbuilder 수동 생성 관례(층 elevation + 0.2). */
const WALK_Y_OFFSET = 0.2;

/** mulberry32 시드 PRNG — [0,1) 균등 난수. 결정성을 위해 Math.random 대체로만 사용한다. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 다각형 면적(㎡) — shoelace 공식의 절댓값. */
function polygonArea(points: SpatialPoint2D[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/** 다각형 무게중심 — 면적 가중 공식, 퇴화(면적≈0) 시 꼭짓점 평균 폴백. */
function polygonCentroid(points: SpatialPoint2D[]): SpatialPoint2D {
  let areaSum = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const cross = a.x * b.y - b.x * a.y;
    areaSum += cross;
    cx += (a.x + b.x) * cross;
    cy += (a.y + b.y) * cross;
  }
  if (Math.abs(areaSum) < 1e-9) {
    const n = points.length;
    return {
      x: points.reduce((acc, p) => acc + p.x, 0) / n,
      y: points.reduce((acc, p) => acc + p.y, 0) / n,
    };
  }
  return { x: cx / (3 * areaSum), y: cy / (3 * areaSum) };
}

/** 볼록다각형 내부 판정 — 모든 변에 대한 외적 부호 일관성 검사(경계 포함). */
function insideConvexPolygon(point: SpatialPoint2D, polygon: SpatialPoint2D[]): boolean {
  let sign = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    if (Math.abs(cross) < 1e-9) continue;
    const current = cross > 0 ? 1 : -1;
    if (sign === 0) sign = current;
    else if (sign !== current) return false;
  }
  return true;
}

/** 평면 좌표 간 거리(m). */
function planDistance(a: SpatialPoint2D, b: SpatialPoint2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 두 노드 worldPosition 간 유클리드 거리(m) — 연결/컴포넌트 병합 비용. */
function worldDistance(a: TopologyNodeData, b: TopologyNodeData): number {
  return Math.hypot(
    a.worldPosition.x - b.worldPosition.x,
    a.worldPosition.y - b.worldPosition.y,
    a.worldPosition.z - b.worldPosition.z,
  );
}

/**
 * 공간 하나에 배치할 평면 좌표 목록을 정한다.
 * 면적 ≤ LARGE_AREA_M2 → 무게중심 1점. 초과 → gridSpacing 간격 그리드 후보 중 2~4점을
 * 균등 샘플하고, PRNG 지터로 무게중심 방향 0~10% 당긴다(볼록성 덕분에 내부 유지 보장).
 * 그리드 후보가 부족하면 최장 대각(꼭짓점 diameter)을 무게중심 쪽으로 축소한 선분 보간 폴백.
 */
function placementPoints(
  space: SpatialSpace,
  gridSpacing: number,
  rng: () => number,
): SpatialPoint2D[] {
  const footprint = space.geometry.footprint;
  const centroid = polygonCentroid(footprint);
  const area = polygonArea(footprint);
  if (area <= LARGE_AREA_M2) return [centroid];

  const count = Math.min(4, Math.max(2, Math.round(area / (gridSpacing * gridSpacing))));

  // 그리드 후보: bbox를 gridSpacing 간격으로 훑어 footprint 내부 점만 채집.
  const xs = footprint.map((p) => p.x);
  const ys = footprint.map((p) => p.y);
  const candidates: SpatialPoint2D[] = [];
  for (let x = Math.min(...xs) + gridSpacing / 2; x < Math.max(...xs); x += gridSpacing) {
    for (let y = Math.min(...ys) + gridSpacing / 2; y < Math.max(...ys); y += gridSpacing) {
      const point = { x, y };
      if (insideConvexPolygon(point, footprint)) candidates.push(point);
    }
  }

  let picked: SpatialPoint2D[];
  if (candidates.length >= count) {
    // 후보 중 균등 간격 인덱스 샘플 — 결정적.
    picked = Array.from({ length: count }, (_, i) => {
      const index = count === 1 ? 0 : Math.round((i * (candidates.length - 1)) / (count - 1));
      return candidates[index];
    });
  } else {
    // 폴백: 최장 꼭짓점 쌍을 무게중심 쪽으로 35% 축소한 선분 위 균등 보간(볼록 조합 → 내부).
    let v1 = footprint[0];
    let v2 = footprint[1];
    let best = -1;
    for (let i = 0; i < footprint.length; i += 1) {
      for (let j = i + 1; j < footprint.length; j += 1) {
        const d = planDistance(footprint[i], footprint[j]);
        if (d > best) {
          best = d;
          v1 = footprint[i];
          v2 = footprint[j];
        }
      }
    }
    const a = { x: v1.x + (centroid.x - v1.x) * 0.35, y: v1.y + (centroid.y - v1.y) * 0.35 };
    const b = { x: v2.x + (centroid.x - v2.x) * 0.35, y: v2.y + (centroid.y - v2.y) * 0.35 };
    picked = Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    });
  }

  // PRNG 지터 — 무게중심 방향으로 0~10% 당김. 내부 점끼리의 볼록 조합이라 내부가 유지된다.
  return picked.map((point) => {
    const pull = rng() * 0.1;
    return {
      x: point.x + (centroid.x - point.x) * pull,
      y: point.y + (centroid.y - point.y) * pull,
    };
  });
}

/** 두 노드를 양방향 이웃으로 연결한다(중복 방지). */
function connect(a: TopologyNodeData, b: TopologyNodeData): void {
  if (a.id === b.id) return;
  if (!a.neighborIds.includes(b.id)) a.neighborIds.push(b.id);
  if (!b.neighborIds.includes(a.id)) b.neighborIds.push(a.id);
}

/**
 * 최근접 이웃 체인 — 평면 좌표 최소(x+y) 노드에서 출발해 매번 가장 가까운 미방문 노드로
 * 이동하며 연결한다. 결과는 전 노드를 잇는 결정적 경로(백본/폴백 공용).
 */
function chainByNearest(nodes: TopologyNodeData[]): void {
  if (nodes.length < 2) return;
  const remaining = new Set(nodes);
  let current = nodes.reduce((best, node) =>
    node.worldPosition.x - node.worldPosition.z < best.worldPosition.x - best.worldPosition.z
      ? node
      : best,
  );
  remaining.delete(current);
  while (remaining.size > 0) {
    let nearest: TopologyNodeData | null = null;
    let bestDistance = Infinity;
    for (const candidate of remaining) {
      const d = worldDistance(current, candidate);
      if (d < bestDistance) {
        bestDistance = d;
        nearest = candidate;
      }
    }
    connect(current, nearest!);
    remaining.delete(nearest!);
    current = nearest!;
  }
}

/** BFS 연결 요소 분해 — neighborIds를 무방향 간선으로 취급한다. */
function connectedComponents(nodes: TopologyNodeData[]): TopologyNodeData[][] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visited = new Set<string>();
  const components: TopologyNodeData[][] = [];
  for (const start of nodes) {
    if (visited.has(start.id)) continue;
    const component: TopologyNodeData[] = [];
    const queue = [start];
    visited.add(start.id);
    while (queue.length > 0) {
      const node = queue.shift()!;
      component.push(node);
      for (const neighborId of node.neighborIds) {
        const neighbor = byId.get(neighborId);
        if (neighbor && !visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighbor);
        }
      }
    }
    components.push(component);
  }
  return components;
}

/** 계단실 판정 — kind에 "계단" 포함, 또는 MV 이동 공간 중 이름에 "계단" 포함. */
function isStairSpace(space: SpatialSpace): boolean {
  return space.kind.includes("계단") || (space.division === "MV" && space.name.includes("계단"));
}

/** 엘리베이터 판정 — kind에 "엘리베이터"/"승강기" 포함. */
function isElevatorSpace(space: SpatialSpace): boolean {
  return space.kind.includes("엘리베이터") || space.kind.includes("승강기");
}

/**
 * 공간 footprint 기반 토폴로지 임의 생성 — 결정적(동일 seed → 동일 결과).
 * (a) 공간별 무게중심 노드(>80㎡는 그리드 보간 2~4개), id는 `gen-{seed}-{floorCode}-{n}`
 * (b) 층 내: MV(이동) 공간 노드 백본을 최근접 체인으로 잇고 비-MV 노드는 최근접 MV 노드에 연결
 *     (MV 공간이 없는 층은 전 노드 최근접 체인)
 * (c) 인접 층 쌍의 계단실/엘리베이터 노드를 수직 연결(stair/elevator 승격 —
 *     간이 구현: 샘플 셋의 p0/p1/p2 3노드 체인은 생략하고 두 층 노드를 직접 연결)
 * (d) 1층(F01F01) 출입구 성격 공간(로비/현관, 없으면 첫 MV 공간)에 exit 노드 지정
 * (f) BFS 컴포넌트 검사 후 분리 컴포넌트를 최근접 노드 쌍으로 강제 연결 → 단일 연결 요소 보장.
 */
export function generateTopology(input: GenerateTopologyInput): TopologySet {
  const seed = input.seed ?? 1;
  const gridSpacing = input.options?.gridSpacing ?? DEFAULT_GRID_SPACING;
  const rng = mulberry32(seed);

  const nodes: TopologyNodeData[] = [];
  /** spaceId → 그 공간에 배치된 노드 목록. */
  const nodesBySpace = new Map<string, TopologyNodeData[]>();
  /** floorCode → 그 층의 노드 목록. */
  const nodesByFloor = new Map<string, TopologyNodeData[]>();
  /** floorCode → 그 층의 공간 목록(입력 순서 유지). */
  const spacesByFloor = new Map<string, SpatialSpace[]>();

  // ── (a) 노드 배치 — 층/공간 입력 순서대로 순회해 층별 일련번호를 결정적으로 부여 ──
  for (const floor of input.floors) {
    const floorSpaces = input.spaces.filter((space) => space.floorCode === floor.floorCode);
    spacesByFloor.set(floor.floorCode, floorSpaces);
    const floorNodes: TopologyNodeData[] = [];
    let serial = 0;
    for (const space of floorSpaces) {
      const points = placementPoints(space, gridSpacing, rng);
      const spaceNodes: TopologyNodeData[] = points.map((plan, index) => {
        serial += 1;
        return {
          id: `gen-${seed}-${floor.floorCode}-${serial}`,
          displayName:
            points.length > 1
              ? `${floor.name} ${space.name} ${index + 1}`
              : `${floor.name} ${space.name}`,
          worldPosition: { x: plan.x, y: floor.elevation + WALK_Y_OFFSET, z: -plan.y },
          metadata: {},
          isExit: false,
          floorName: floor.floorCode,
          slabName: space.primaryKey,
          nodeTypeCode: "normal",
          neighborIds: [],
        };
      });
      // 같은 공간의 보간 노드끼리는 배치 순서대로 이어 둔다.
      for (let i = 1; i < spaceNodes.length; i += 1) connect(spaceNodes[i - 1], spaceNodes[i]);
      nodesBySpace.set(space.primaryKey, spaceNodes);
      floorNodes.push(...spaceNodes);
    }
    nodesByFloor.set(floor.floorCode, floorNodes);
    nodes.push(...floorNodes);
  }

  // ── (b) 층 내 연결 — MV 백본 체인 + 비-MV 노드 → 최근접 MV 노드 ──
  for (const floor of input.floors) {
    const floorNodes = nodesByFloor.get(floor.floorCode) ?? [];
    const floorSpaces = spacesByFloor.get(floor.floorCode) ?? [];
    const mvSpaceIds = new Set(
      floorSpaces.filter((space) => space.division === "MV").map((space) => space.primaryKey),
    );
    const backbone = floorNodes.filter((node) => mvSpaceIds.has(node.slabName));
    if (backbone.length === 0) {
      chainByNearest(floorNodes); // MV 공간이 없는 층 — 전 노드 최근접 체인.
      continue;
    }
    chainByNearest(backbone);
    for (const node of floorNodes) {
      if (mvSpaceIds.has(node.slabName)) continue;
      let nearest: TopologyNodeData | null = null;
      let bestDistance = Infinity;
      for (const candidate of backbone) {
        const d = worldDistance(node, candidate);
        if (d < bestDistance) {
          bestDistance = d;
          nearest = candidate;
        }
      }
      connect(node, nearest!);
    }
  }

  // ── (c) 수직 연결 — elevation 오름차순 인접 층 쌍의 계단실/엘리베이터 노드를 직접 연결 ──
  const sortedFloors = [...input.floors].sort((a, b) => a.elevation - b.elevation);
  for (let i = 0; i + 1 < sortedFloors.length; i += 1) {
    const lower = sortedFloors[i];
    const upper = sortedFloors[i + 1];
    for (const matcher of [isStairSpace, isElevatorSpace] as const) {
      // 승격 코드 — 계단은 알려진 "stair", 엘리베이터는 전방 호환 string 필드에 "elevator".
      const typeCode = matcher === isStairSpace ? "stair" : "elevator";
      const lowerNodes = (spacesByFloor.get(lower.floorCode) ?? [])
        .filter(matcher)
        .flatMap((space) => nodesBySpace.get(space.primaryKey)?.slice(0, 1) ?? []);
      const upperNodes = (spacesByFloor.get(upper.floorCode) ?? [])
        .filter(matcher)
        .flatMap((space) => nodesBySpace.get(space.primaryKey)?.slice(0, 1) ?? []);
      if (lowerNodes.length === 0 || upperNodes.length === 0) continue;
      for (const lowerNode of lowerNodes) {
        // 평면 최근접 상층 노드와 짝짓는다(같은 수직 샤프트 가정).
        let nearest = upperNodes[0];
        let bestDistance = Infinity;
        for (const candidate of upperNodes) {
          const d = planDistance(
            { x: lowerNode.worldPosition.x, y: -lowerNode.worldPosition.z },
            { x: candidate.worldPosition.x, y: -candidate.worldPosition.z },
          );
          if (d < bestDistance) {
            bestDistance = d;
            nearest = candidate;
          }
        }
        lowerNode.nodeTypeCode = typeCode;
        nearest.nodeTypeCode = typeCode;
        connect(lowerNode, nearest);
      }
    }
  }

  // ── (d) 1층 출입구 — 로비/현관 kind 매칭, 없으면 첫 MV 공간의 첫 노드를 exit로 ──
  const groundSpaces = spacesByFloor.get("F01F01") ?? [];
  const entranceSpace =
    groundSpaces.find((space) => space.kind.includes("로비") || space.kind.includes("현관")) ??
    groundSpaces.find((space) => space.division === "MV");
  if (entranceSpace) {
    const candidates = nodesBySpace.get(entranceSpace.primaryKey) ?? [];
    // 계단/엘리베이터로 승격된 노드는 피하고, 없으면 첫 노드를 사용한다.
    const exitNode = candidates.find((node) => node.nodeTypeCode === "normal") ?? candidates[0];
    if (exitNode) {
      exitNode.isExit = true;
      exitNode.nodeTypeCode = "exit";
    }
  }

  // ── (f) 단일 연결 요소 보장 — 분리 컴포넌트를 최근접 노드 쌍으로 강제 연결 ──
  let components = connectedComponents(nodes);
  while (components.length > 1) {
    const [base, ...rest] = components;
    let bestPair: [TopologyNodeData, TopologyNodeData] | null = null;
    let bestDistance = Infinity;
    for (const component of rest) {
      for (const a of base) {
        for (const b of component) {
          const d = worldDistance(a, b);
          if (d < bestDistance) {
            bestDistance = d;
            bestPair = [a, b];
          }
        }
      }
    }
    connect(bestPair![0], bestPair![1]);
    components = connectedComponents(nodes);
  }

  return {
    setId: `topo-generated-${input.siteUfid}-${seed}`,
    name: input.options?.name ?? `임의 생성 토폴로지 (seed ${seed})`,
    siteUfid: input.siteUfid,
    source: "generated",
    nodes,
  };
}

/** pickPatrolEndpoints 결과 — 패트롤 노드 속성(start/end/checkpoints) 치환용. */
export interface PatrolEndpoints {
  startNodeId: string;
  endNodeId: string;
  checkpointNodeIds: string[];
}

/**
 * 패트롤 시작·종료·체크포인트 후보를 고른다 — 가능하면 서로 다른 층에서 가장 멀리 떨어진
 * 두 노드를 택하고, findPath 경로의 내부 노드를 균등 샘플해 체크포인트 2~3개(경로가 짧으면
 * 그 이하)로 삼는다. 경로 불가 쌍은 거리 내림차순으로 최대 50쌍까지 재시도. 노드 2개 미만
 * 또는 전 쌍 도달 불가면 null.
 */
export function pickPatrolEndpoints(set: TopologySet): PatrolEndpoints | null {
  if (set.nodes.length < 2) return null;

  const pairs: { a: TopologyNodeData; b: TopologyNodeData; distance: number }[] = [];
  for (let i = 0; i < set.nodes.length; i += 1) {
    for (let j = i + 1; j < set.nodes.length; j += 1) {
      pairs.push({
        a: set.nodes[i],
        b: set.nodes[j],
        distance: worldDistance(set.nodes[i], set.nodes[j]),
      });
    }
  }
  const crossFloor = pairs.filter((pair) => pair.a.floorName !== pair.b.floorName);
  const pool = (crossFloor.length > 0 ? crossFloor : pairs)
    .sort((x, y) => y.distance - x.distance)
    .slice(0, 50);

  for (const pair of pool) {
    const path = findPath(set, pair.a.id, pair.b.id);
    if (!path) continue;
    const interior = path.nodeIds.slice(1, -1);
    const wanted = Math.min(3, interior.length);
    const indices = new Set<number>();
    for (let k = 0; k < wanted; k += 1) {
      indices.add(Math.floor(((k + 1) * interior.length) / (wanted + 1)));
    }
    return {
      startNodeId: pair.a.id,
      endNodeId: pair.b.id,
      checkpointNodeIds: [...indices].sort((x, y) => x - y).map((index) => interior[index]),
    };
  }
  return null;
}
