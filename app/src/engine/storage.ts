/**
 * storage — 컴파일된 SOPGraph의 localStorage persistence (1차 POC — 실제 DB 없음).
 * `sop-studio:graphs` 키에 graphId → SOPGraph 맵을 JSON으로 저장한다.
 * SSR/테스트 환경(window 부재)과 JSON 파손에 안전하도록 가드한다.
 */
import type { SOPGraph } from "../domain";

/** localStorage 키 — graphId → SOPGraph 맵을 담는다. */
export const STORAGE_KEY = "sop-studio:graphs";

/** 저장 형식 — graphId를 키로 하는 SOPGraph 맵. */
type StoredGraphMap = Record<string, SOPGraph>;

/** localStorage에서 그래프 맵을 읽는다 — window 부재/JSON 파손 시 빈 맵을 반환한다. */
function readGraphMap(): StoredGraphMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as StoredGraphMap;
  } catch {
    return {}; // JSON 파손 등 — 빈 맵으로 복구.
  }
}

/** 그래프 맵을 localStorage에 기록한다 — window 부재/quota 초과 시 조용히 무시(POC). */
function writeGraphMap(map: StoredGraphMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota 초과 등 저장 실패는 1차 POC에서 무시한다.
  }
}

/** 컴파일된 SOPGraph를 graphId 키로 저장(merge)한다. */
export function saveCompiledGraph(graph: SOPGraph): void {
  const map = readGraphMap();
  map[graph.graphId] = graph;
  writeGraphMap(map);
}

/** graphId로 저장된 SOPGraph를 불러온다. 없으면 null. */
export function loadCompiledGraph(graphId: string): SOPGraph | null {
  return readGraphMap()[graphId] ?? null;
}

/** 저장된 그래프 목록(요약)을 반환한다 — 툴바/불러오기 목록용. */
export function listCompiledGraphs(): {
  graphId: string;
  name: string;
  domain: string;
  updatedAt: string;
}[] {
  return Object.values(readGraphMap()).map((graph) => ({
    graphId: graph.graphId,
    name: graph.name,
    domain: graph.domain,
    updatedAt: graph.updatedAt,
  }));
}
