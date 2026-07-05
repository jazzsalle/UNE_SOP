/**
 * runStorage — 실행이력(ExecutionRun)의 localStorage persistence (1차 POC — 실제 DB 없음).
 * `sop-studio:runs` 키에 runId → ExecutionRun 맵을 JSON으로 저장한다.
 * SSR/테스트 환경(window 부재)과 JSON 파손에 안전하도록 가드한다(storage.ts와 동일 패턴).
 * localStorage `storage` 이벤트는 same-tab에서 발화하지 않으므로,
 * Studio(실행기 UI)→Dashboard 실시간 반영용 in-app 구독(subscribeRuns)을 함께 제공한다.
 */
import type { ExecutionRun } from "./executionTypes";

/** localStorage 키 — runId → ExecutionRun 맵을 담는다. */
export const RUNS_STORAGE_KEY = "sop-studio:runs";

/** 저장 형식 — runId를 키로 하는 ExecutionRun 맵. */
type StoredRunMap = Record<string, ExecutionRun>;

/** localStorage에서 run 맵을 읽는다 — window 부재/JSON 파손 시 빈 맵을 반환한다. */
function readRunMap(): StoredRunMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RUNS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as StoredRunMap;
  } catch {
    return {}; // JSON 파손 등 — 빈 맵으로 복구.
  }
}

/** run 맵을 localStorage에 기록한다 — window 부재/quota 초과 시 조용히 무시(POC). */
function writeRunMap(map: StoredRunMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota 초과 등 저장 실패는 1차 POC에서 무시한다.
  }
}

/** in-app 구독 리스너 집합 — save/delete 후 동기 notify (React 무의존, 콜백만). */
const listeners = new Set<() => void>();

/** 등록된 모든 리스너에 변경을 동기 통지한다. */
function notifyRuns(): void {
  listeners.forEach((listener) => listener());
}

/** ExecutionRun을 runId 키로 저장(merge)하고 구독자에게 통지한다. */
export function saveRun(run: ExecutionRun): void {
  const map = readRunMap();
  map[run.runId] = run;
  writeRunMap(map);
  notifyRuns();
}

/** runId로 저장된 ExecutionRun을 불러온다. 없으면 null. */
export function loadRun(runId: string): ExecutionRun | null {
  return readRunMap()[runId] ?? null;
}

/** 저장된 실행이력 전체를 startedAt 내림차순(최신 우선)으로 반환한다 — 대시보드 목록용. */
export function listRuns(): ExecutionRun[] {
  return Object.values(readRunMap()).sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
}

/** runId의 실행이력을 삭제하고 구독자에게 통지한다. */
export function deleteRun(runId: string): void {
  const map = readRunMap();
  delete map[runId];
  writeRunMap(map);
  notifyRuns();
}

/** run 변경 구독 — saveRun/deleteRun 직후 동기 호출된다. 반환값은 구독 해제 함수. */
export function subscribeRuns(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
