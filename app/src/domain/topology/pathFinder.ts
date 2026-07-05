/**
 * 토폴로지 경로 탐색 — webbuilder `topologyPathFinder.ts`(Summary.md §8)와 동일한 A* 방식.
 * 그래프는 각 노드의 neighborIds(a→b 간선은 b∈a.neighborIds일 때만 — one-way 방향 존중),
 * 비용·휴리스틱은 worldPosition 유클리드 거리(m)를 사용한다. 순수 TS 자체 구현(계약 C).
 */

import type { TopologyNodeData, TopologySet } from "./topologyTypes";

/** 경로 탐색 결과 — 시작~종료 노드 id 체인(양 끝 포함)과 총 이동 거리(m). */
export interface TopologyPath {
  nodeIds: string[];
  distanceM: number;
}

/** 두 노드 worldPosition 간 유클리드 거리(m) — cost와 휴리스틱에 공용. */
function distanceBetween(a: TopologyNodeData, b: TopologyNodeData): number {
  return Math.hypot(
    a.worldPosition.x - b.worldPosition.x,
    a.worldPosition.y - b.worldPosition.y,
    a.worldPosition.z - b.worldPosition.z,
  );
}

/**
 * A*로 startId → endId 최단 경로를 찾는다.
 * 시작/종료 노드 미존재 또는 도달 불가면 null. startId===endId면 거리 0의 단일 노드 경로.
 * 노드 수가 작은 POC 규모라 open set은 선형 최소 탐색으로 충분하다.
 */
export function findPath(set: TopologySet, startId: string, endId: string): TopologyPath | null {
  const nodeById = new Map(set.nodes.map((node) => [node.id, node]));
  const start = nodeById.get(startId);
  const end = nodeById.get(endId);
  if (!start || !end) return null;
  if (startId === endId) return { nodeIds: [startId], distanceM: 0 };

  const gScore = new Map<string, number>([[startId, 0]]);
  const fScore = new Map<string, number>([[startId, distanceBetween(start, end)]]);
  const cameFrom = new Map<string, string>();
  const open = new Set<string>([startId]);
  const closed = new Set<string>();

  while (open.size > 0) {
    // open set에서 f = g + h 최소 노드를 꺼낸다.
    let currentId = "";
    let bestF = Infinity;
    for (const id of open) {
      const f = fScore.get(id) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentId = id;
      }
    }
    if (currentId === endId) {
      // cameFrom 역추적으로 경로를 복원한다.
      const nodeIds = [endId];
      let cursor = endId;
      while (cameFrom.has(cursor)) {
        cursor = cameFrom.get(cursor)!;
        nodeIds.unshift(cursor);
      }
      return { nodeIds, distanceM: gScore.get(endId)! };
    }
    open.delete(currentId);
    closed.add(currentId);

    const current = nodeById.get(currentId)!;
    for (const neighborId of current.neighborIds) {
      const neighbor = nodeById.get(neighborId);
      if (!neighbor || closed.has(neighborId)) continue;
      const tentativeG = gScore.get(currentId)! + distanceBetween(current, neighbor);
      if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentativeG);
        fScore.set(neighborId, tentativeG + distanceBetween(neighbor, end));
        open.add(neighborId);
      }
    }
  }
  return null;
}
