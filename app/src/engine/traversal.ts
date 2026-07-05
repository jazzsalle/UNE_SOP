/**
 * 그래프 순회 유틸 — SOPGraph의 인접 리스트 구성, 도달 가능 집합, 순환 탐지를 제공한다.
 * validateGraph(도달 불가/순환 참조)와 compileGraph(경로 계산)가 공유하는 순수 함수 모음.
 */
import type { GraphEdge, SOPGraph } from "../domain";

/** 정방향 인접 리스트를 만든다 — nodeId → 해당 노드에서 나가는(outgoing) 엣지 목록. */
export function buildAdjacency(graph: SOPGraph): Map<string, GraphEdge[]> {
  const adjacency = new Map<string, GraphEdge[]>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const outgoing = adjacency.get(edge.sourceNodeId);
    if (outgoing) {
      outgoing.push(edge);
    } else {
      adjacency.set(edge.sourceNodeId, [edge]);
    }
  }
  return adjacency;
}

/** 역방향 인접 리스트를 만든다 — nodeId → 해당 노드로 들어오는(incoming) 엣지 목록. */
export function buildReverseAdjacency(graph: SOPGraph): Map<string, GraphEdge[]> {
  const reverse = new Map<string, GraphEdge[]>();
  for (const node of graph.nodes) {
    reverse.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const incoming = reverse.get(edge.targetNodeId);
    if (incoming) {
      incoming.push(edge);
    } else {
      reverse.set(edge.targetNodeId, [edge]);
    }
  }
  return reverse;
}

/** startId에서 엣지를 따라 도달 가능한 노드 id 집합을 반환한다(시작 노드 포함, BFS). */
export function reachableFrom(graph: SOPGraph, startId: string): Set<string> {
  const adjacency = buildAdjacency(graph);
  const visited = new Set<string>([startId]);
  const queue: string[] = [startId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of adjacency.get(current) ?? []) {
      if (!visited.has(edge.targetNodeId)) {
        visited.add(edge.targetNodeId);
        queue.push(edge.targetNodeId);
      }
    }
  }
  return visited;
}

/**
 * 순환 참조를 탐지한다 — DFS 3색 마킹(white/gray/black).
 * gray(방문 중) 노드로 되돌아오는 back-edge를 발견하면 현재 DFS 스택에서 순환 구간을 잘라
 * 순환에 포함된 노드 id 배열로 반환한다. 서로 다른 back-edge마다 하나의 순환을 보고한다.
 */
export function findCycles(graph: SOPGraph): string[][] {
  const adjacency = buildAdjacency(graph);
  // 0=white(미방문), 1=gray(방문 중), 2=black(완료)
  const color = new Map<string, 0 | 1 | 2>();
  for (const node of graph.nodes) {
    color.set(node.id, 0);
  }

  const cycles: string[][] = [];
  const stack: string[] = [];

  const dfs = (nodeId: string): void => {
    color.set(nodeId, 1);
    stack.push(nodeId);
    for (const edge of adjacency.get(nodeId) ?? []) {
      const targetId = edge.targetNodeId;
      const targetColor = color.get(targetId);
      if (targetColor === 1) {
        // back-edge: 스택에서 targetId 이후 구간이 순환이다.
        const startIndex = stack.indexOf(targetId);
        if (startIndex >= 0) {
          cycles.push(stack.slice(startIndex));
        }
      } else if (targetColor === 0) {
        dfs(targetId);
      }
    }
    stack.pop();
    color.set(nodeId, 2);
  };

  for (const node of graph.nodes) {
    if (color.get(node.id) === 0) {
      dfs(node.id);
    }
  }
  return cycles;
}
