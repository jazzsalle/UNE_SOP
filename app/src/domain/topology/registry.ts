/**
 * 토폴로지 조회·임포트 레지스트리 — 내장 샘플 셋 + 사용자 임포트 셋을 통합 조회한다.
 * 임포트 셋은 localStorage `sop-studio.topology-sets`에 setId → TopologySet 맵으로
 * 영속하며(engine/storage.ts와 동일한 window 부재/JSON 파손 방어 패턴), 모듈 로드 시 복원한다.
 * 공간 레지스트리(spatial/registry.ts)와 같은 규약: 미존재 단건 조회는 null, 목록은 빈 배열.
 */

import { isParseTopologyFailure, parseTopologyNodes } from "./importTopology";
import { VERIFICATION_TOPOLOGY_SET } from "./sample/verificationTopology";
import type { TopologyNodeData, TopologySet } from "./topologyTypes";

/** localStorage 키 — 임포트 셋(setId → TopologySet) 맵을 담는다. 샘플 셋은 저장하지 않는다. */
export const TOPOLOGY_STORAGE_KEY = "sop-studio.topology-sets";

/** 내장 샘플 셋 — 항상 목록에 포함된다. */
const SAMPLE_SETS: readonly TopologySet[] = [VERIFICATION_TOPOLOGY_SET];

/** 저장 형식 — setId를 키로 하는 TopologySet 맵. */
type StoredSetMap = Record<string, TopologySet>;

/** 복원된 값이 TopologySet 최소 형태(setId/name/nodes 배열)인지 검증한다. */
function isStoredSet(value: unknown): value is TopologySet {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<TopologySet>;
  return (
    typeof candidate.setId === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.nodes)
  );
}

/** localStorage에서 임포트 셋 맵을 읽는다 — window 부재/JSON 파손 시 빈 맵으로 복구. */
function readStoredSets(): StoredSetMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TOPOLOGY_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const map: StoredSetMap = {};
    for (const [setId, value] of Object.entries(parsed)) {
      if (isStoredSet(value)) {
        map[setId] = { ...value, source: "imported" }; // 저장분은 항상 임포트 출처로 강제.
      }
    }
    return map;
  } catch {
    return {}; // JSON 파손 등 — 빈 맵으로 복구.
  }
}

/** 임포트 셋 맵을 localStorage에 기록한다 — window 부재/quota 초과 시 조용히 무시(POC). */
function writeStoredSets(map: StoredSetMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOPOLOGY_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota 초과 등 저장 실패는 1차 POC에서 무시한다.
  }
}

/** 모듈 로드 시 저장된 임포트 셋을 복원하는 인메모리 인덱스. */
const importedSets = new Map<string, TopologySet>(Object.entries(readStoredSets()));

/** 인메모리 인덱스를 localStorage에 반영한다. */
function persistImportedSets(): void {
  writeStoredSets(Object.fromEntries(importedSets));
}

/** uuid 앞 8자리 — 임포트 셋 id 접미. crypto 부재 환경은 Math.random 폴백. */
function uuid8(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  }
  return Math.random().toString(16).slice(2, 10).padEnd(8, "0");
}

/** 등록된 전체 토폴로지 셋 목록(샘플 + 임포트)을 반환한다. */
export function getTopologySets(): TopologySet[] {
  return [...SAMPLE_SETS, ...importedSets.values()];
}

/** setId로 토폴로지 셋을 조회한다. 미등록 id는 null. */
export function getTopologySet(setId: string): TopologySet | null {
  return SAMPLE_SETS.find((set) => set.setId === setId) ?? importedSets.get(setId) ?? null;
}

/** 셋의 노드 목록을 반환한다. floorName 지정 시 해당 층만 필터. 미등록 셋은 빈 배열. */
export function getTopologyNodes(setId: string, floorName?: string): TopologyNodeData[] {
  const nodes = getTopologySet(setId)?.nodes ?? [];
  return floorName === undefined
    ? nodes.slice()
    : nodes.filter((node) => node.floorName === floorName);
}

/** 셋 안에서 노드를 id로 조회한다. 미등록 셋/미존재 노드는 null. */
export function findTopologyNode(setId: string, nodeId: string): TopologyNodeData | null {
  return getTopologySet(setId)?.nodes.find((node) => node.id === nodeId) ?? null;
}

/** importTopologySet 입력 — webbuilder export JSON 문자열과 표시 정보. */
export interface ImportTopologySetInput {
  name: string;
  siteUfid?: string;
  json: string;
}

/** importTopologySet 결과 — 성공 시 등록된 셋과 파서 경고, 실패 시 오류 목록. */
export type ImportTopologySetResult =
  | { set: TopologySet; warnings: string[] }
  | { errors: string[] };

/**
 * webbuilder export JSON을 파싱해 임포트 셋으로 등록·영속한다.
 * 파싱 실패 시 아무것도 등록하지 않고 `{ errors }`를 그대로 반환한다.
 */
export function importTopologySet(input: ImportTopologySetInput): ImportTopologySetResult {
  const parsed = parseTopologyNodes(input.json);
  if (isParseTopologyFailure(parsed)) {
    return { errors: parsed.errors };
  }
  const set: TopologySet = {
    setId: `topo-imported-${uuid8()}`,
    name: input.name.trim() || "이름 없는 토폴로지",
    siteUfid: input.siteUfid ?? "",
    source: "imported",
    nodes: parsed.nodes,
  };
  importedSets.set(set.setId, set);
  persistImportedSets();
  return { set, warnings: parsed.warnings };
}

/** 임포트 셋을 삭제·영속 반영한다. 샘플 셋/미등록 id는 false. */
export function removeImportedSet(setId: string): boolean {
  if (!importedSets.delete(setId)) return false;
  persistImportedSets();
  return true;
}
