/**
 * 토폴로지 조회·임포트 레지스트리 — 내장 샘플 셋 + 사용자 셋(임포트/임의 생성)을 통합 조회한다.
 * 사용자 셋은 localStorage `sop-studio.topology-sets`에 setId → TopologySet 맵으로
 * 영속하며(engine/storage.ts와 동일한 window 부재/JSON 파손 방어 패턴), 모듈 로드 시
 * source("imported"|"generated")를 보존해 복원한다 — 생성 셋도 영속해 새로고침 후
 * 데모 연속성을 유지한다. 등록/임포트/삭제 변경은 subscribeTopologySets 리스너에 동기 통지.
 * 공간 레지스트리(spatial/registry.ts)와 같은 규약: 미존재 단건 조회는 null, 목록은 빈 배열.
 */

import { isParseTopologyFailure, parseTopologyNodes } from "./importTopology";
import { VERIFICATION_TOPOLOGY_SET } from "./sample/verificationTopology";
import type { TopologyNodeData, TopologySet } from "./topologyTypes";

/** localStorage 키 — 사용자 셋(setId → TopologySet) 맵을 담는다. 샘플 셋은 저장하지 않는다. */
export const TOPOLOGY_STORAGE_KEY = "sop-studio.topology-sets";

/** 내장 샘플 셋 — 항상 목록에 포함된다. */
const SAMPLE_SETS: readonly TopologySet[] = [VERIFICATION_TOPOLOGY_SET];

/** 저장 형식 — setId를 키로 하는 TopologySet 맵. */
type StoredSetMap = Record<string, TopologySet>;

/** 셋 목록 변경 리스너 — register/import/remove 직후 동기 호출된다. */
type TopologySetsListener = () => void;

/** 구독 리스너 집합 — 모듈 스코프에 유지한다. */
const listeners = new Set<TopologySetsListener>();

/** 전체 리스너에 변경을 동기 통지한다. 리스너 예외는 다른 리스너에 전파하지 않는다. */
function notifyTopologySetsChanged(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // 리스너 개별 오류는 무시 — 나머지 통지를 계속한다.
    }
  }
}

/**
 * 토폴로지 셋 목록 변경을 구독한다(register/import/remove 후 동기 통지).
 * 반환 함수를 호출하면 구독이 해제된다.
 */
export function subscribeTopologySets(listener: TopologySetsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

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

/** localStorage에서 사용자 셋 맵을 읽는다 — window 부재/JSON 파손 시 빈 맵으로 복구. */
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
        // 저장분 source는 "imported"|"generated"만 보존 — 그 외(파손·sample 위장)는 임포트로 보정.
        map[setId] = { ...value, source: value.source === "generated" ? "generated" : "imported" };
      }
    }
    return map;
  } catch {
    return {}; // JSON 파손 등 — 빈 맵으로 복구.
  }
}

/** 사용자 셋 맵을 localStorage에 기록한다 — window 부재/quota 초과 시 조용히 무시(POC). */
function writeStoredSets(map: StoredSetMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOPOLOGY_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota 초과 등 저장 실패는 1차 POC에서 무시한다.
  }
}

/** 모듈 로드 시 저장된 사용자 셋(임포트+생성)을 복원하는 인메모리 인덱스. */
const userSets = new Map<string, TopologySet>(Object.entries(readStoredSets()));

/** 인메모리 인덱스를 localStorage에 반영한다. */
function persistUserSets(): void {
  writeStoredSets(Object.fromEntries(userSets));
}

/** uuid 앞 8자리 — 임포트 셋 id 접미. crypto 부재 환경은 Math.random 폴백. */
function uuid8(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  }
  return Math.random().toString(16).slice(2, 10).padEnd(8, "0");
}

/** 등록된 전체 토폴로지 셋 목록(샘플 + 임포트 + 생성)을 반환한다. */
export function getTopologySets(): TopologySet[] {
  return [...SAMPLE_SETS, ...userSets.values()];
}

/** setId로 토폴로지 셋을 조회한다. 미등록 id는 null. */
export function getTopologySet(setId: string): TopologySet | null {
  return SAMPLE_SETS.find((set) => set.setId === setId) ?? userSets.get(setId) ?? null;
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
  userSets.set(set.setId, set);
  persistUserSets();
  notifyTopologySetsChanged();
  return { set, warnings: parsed.warnings };
}

/**
 * 임의 생성 셋(generateTopology 결과)을 등록·영속한다 — 같은 setId는 교체(replace).
 * 동일 seed 재생성 시 setId가 같아 중복 누적 없이 갱신된다.
 */
export function registerGeneratedSet(set: TopologySet): void {
  userSets.set(set.setId, set);
  persistUserSets();
  notifyTopologySetsChanged();
}

/** 사용자 셋(임포트/생성)을 삭제·영속 반영한다. 샘플 셋/미등록 id는 false. */
export function removeImportedSet(setId: string): boolean {
  if (!userSets.delete(setId)) return false;
  persistUserSets();
  notifyTopologySetsChanged();
  return true;
}
