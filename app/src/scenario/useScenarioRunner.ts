/**
 * useScenarioRunner — 통합 시나리오 실행기의 단계 상태 머신 (Phase 9 T4).
 * ① 토폴로지 생성 → ② SOP 로드(패트롤 경로 치환) → ③ 검증·컴파일 → ④ 실행
 * → ⑤ 회신 → ⑥ 대시보드 6단계를 순차 활성화한다. 각 단계의 완료 여부는 별도
 * 플래그가 아니라 단계 산출물(토폴로지/로드/검증 요약, run 스냅샷)에서 파생하므로
 * 상태 불일치가 생기지 않는다. 이전 단계 미완료 시 "waiting"으로 실행이 차단된다.
 *
 * run 동시성(ExecutionPanel 관례): run은 runId만 확정하고 subscribeRuns →
 * loadRun(runId)로 최신본을 로컬 스냅샷에 반영한다 — Studio Execution 탭/현장 회신
 * 뷰가 같은 run을 saveRun해도 구버전 스냅샷 기반 액션이 외부 변경을 덮어쓰지 않는다.
 *
 * SOP 로드 단계는 2박자다: loadDomainTemplate()의 setNodes가 커밋된 **다음 렌더**에야
 * useStudio().nodes에 시드 노드가 반영되므로, 호출 시점엔 loadPhase="pending"만 세우고
 * nodes를 관찰하는 effect에서 패트롤 노드 탐색·경로 치환·요약 확정을 수행한다.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ALL_SAMPLE_EVENTS,
  deriveLinks,
  findContact,
  generateTopology,
  getFloors,
  getSeed,
  getSpaces,
  getTopologySet,
  pickPatrolEndpoints,
  registerGeneratedSet,
} from "../domain";
import type { PatrolEndpoints, ScenarioDefinition, TopologySet } from "../domain";
import { applyExecutorAction, createRun, loadRun, saveRun, subscribeRuns } from "../engine";
import type { ExecutionRun } from "../engine";
import { useStudio } from "../studio/state/GraphStudioContext";

/** 실행기 단계 식별자 — 카드 순서와 순차 활성화 판정에 공용. */
export type ScenarioStepId = "topology" | "load" | "validate" | "run" | "reply" | "dashboard";

/** 단계 표시 상태 — 대기(waiting) / 진행 가능(ready) / 완료(done). */
export type ScenarioStepStatus = "waiting" | "ready" | "done";

/** 단계 순서 — 이전 단계 완료 전에는 다음 단계가 waiting으로 차단된다. */
export const SCENARIO_STEP_ORDER: readonly ScenarioStepId[] = [
  "topology",
  "load",
  "validate",
  "run",
  "reply",
  "dashboard",
];

/** ① 토폴로지 단계 결과 요약 — 노드/링크/층별 수. */
export interface TopologySummary {
  mode: "generate" | "sample";
  setId: string;
  setName: string;
  nodeCount: number;
  linkCount: number;
  /** 층(floorName)별 노드 수 — 셋 등장 순서 유지. */
  floorCounts: { floorName: string; count: number }[];
}

/** ② SOP 로드 단계 결과 요약 — 패트롤 경로 치환 내역 포함. */
export interface LoadSummary {
  seedName: string;
  nodeCount: number;
  /** 캔버스에서 발견된 taskKind === "patrol" 노드 수. */
  patrolNodeCount: number;
  /** 생성 토폴로지로 패트롤 경로(topologySetId/start/end/checkpoints)를 치환했는지. */
  patrolAssigned: boolean;
  /** 치환된 시작/종료/점검 포인트 — patrolAssigned=true일 때만. */
  endpoints?: PatrolEndpoints;
}

/** ③ 검증·컴파일 단계 결과 요약 — error > 0이면 compiled=false로 진행 차단. */
export interface ValidateSummary {
  errorCount: number;
  warningCount: number;
  compiled: boolean;
}

/** useScenarioRunner 반환 API — ScenarioPage가 카드 6장을 구동하는 계약. */
export interface ScenarioRunnerApi {
  /** 단계별 표시 상태 — 산출물에서 파생(순차 활성화 반영). */
  statuses: Record<ScenarioStepId, ScenarioStepStatus>;
  topologySummary: TopologySummary | null;
  loadSummary: LoadSummary | null;
  validateSummary: ValidateSummary | null;
  /** 실행 run 최신 스냅샷 — subscribeRuns로 외부 갱신(회신 뷰 등)도 반영된다. */
  run: ExecutionRun | null;
  /** 단계별 오류 메시지 — 표시 후 재시도 가능. */
  errors: Partial<Record<ScenarioStepId, string>>;
  /** 자동 회신 명의 — 시나리오 첫 담당자 이름. */
  reporterName: string;
  runTopologyStep: () => void;
  runLoadStep: () => void;
  runValidateStep: () => void;
  runRunStep: () => void;
  /** 모든 미종결 임무에 REPORT_ACTION(DONE)을 dispatch당 saveRun으로 회신한다. */
  autoReply: () => void;
  /** "처음부터 다시" — 러너 상태만 초기화(저장된 실행이력·Studio 캔버스는 유지). */
  reset: () => void;
}

/** TopologySet → 단계 요약 — 링크 수는 deriveLinks(무방향 중복 제거) 기준. */
function summarizeSet(set: TopologySet, mode: TopologySummary["mode"]): TopologySummary {
  const floorCounts = new Map<string, number>();
  for (const node of set.nodes) {
    floorCounts.set(node.floorName, (floorCounts.get(node.floorName) ?? 0) + 1);
  }
  return {
    mode,
    setId: set.setId,
    setName: set.name,
    nodeCount: set.nodes.length,
    linkCount: deriveLinks(set.nodes).length,
    floorCounts: [...floorCounts].map(([floorName, count]) => ({ floorName, count })),
  };
}

/** 미종결(회신 가능) 임무 판정 — REPORT_ACTION 허용 출발 상태(executor 전이표)와 동일. */
function isReplyable(status: string): boolean {
  return status === "SENT" || status === "RUNNING" || status === "DELAYED";
}

export function useScenarioRunner(scenario: ScenarioDefinition): ScenarioRunnerApi {
  const { nodes, graphMeta, compiledGraph, loadDomainTemplate, updateNodeProperty, runValidate, runCompile } =
    useStudio();

  const [topologySummary, setTopologySummary] = useState<TopologySummary | null>(null);
  /** ①에서 등록한 생성 셋 id — ② 패트롤 치환이 pickPatrolEndpoints 입력으로 쓴다. */
  const [generatedSetId, setGeneratedSetId] = useState<string | null>(null);
  /** ② 2박자 처리 상태 — pending 동안 nodes 관찰 effect가 치환·요약을 수행한다. */
  const [loadPhase, setLoadPhase] = useState<"idle" | "pending" | "done">("idle");
  const [loadSummary, setLoadSummary] = useState<LoadSummary | null>(null);
  const [validateSummary, setValidateSummary] = useState<ValidateSummary | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<ExecutionRun | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ScenarioStepId, string>>>({});

  /** 단계 오류 기록/해제 — message 미지정 시 해당 단계 오류를 지운다. */
  const setStepError = useCallback((step: ScenarioStepId, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[step] = message;
      else delete next[step];
      return next;
    });
  }, []);

  /** 자동 회신 명의 — 시나리오 첫 담당자 이름(미존재 시 폴백). */
  const reporterName = useMemo(
    () => findContact(scenario.contactIds[0] ?? "")?.name ?? "현장 담당자",
    [scenario],
  );

  /** "처음부터 다시" — 러너 상태만 초기화. 실행이력(localStorage)/Studio 캔버스는 남긴다. */
  const reset = useCallback(() => {
    setTopologySummary(null);
    setGeneratedSetId(null);
    setLoadPhase("idle");
    setLoadSummary(null);
    setValidateSummary(null);
    setRunId(null);
    setRun(null);
    setErrors({});
  }, []);

  // 시나리오 전환 시 단계 상태 초기화 — 다른 시나리오의 산출물이 새 단계에 섞이지 않도록.
  useEffect(() => {
    reset();
  }, [scenario.scenarioId, reset]);

  // ── ① 토폴로지 생성 — generate면 생성·등록, sample이면 셋 실존 확인만 ──
  const runTopologyStep = useCallback(() => {
    const spec = scenario.topology;
    if (spec.mode === "sample") {
      const set = getTopologySet(spec.setId);
      if (!set) {
        setStepError("topology", `샘플 토폴로지 셋을 찾을 수 없습니다: ${spec.setId}`);
        return;
      }
      setStepError("topology");
      setGeneratedSetId(null);
      setTopologySummary(summarizeSet(set, "sample"));
      return;
    }
    const set = generateTopology({
      siteUfid: scenario.siteUfid,
      floors: getFloors(scenario.siteUfid),
      spaces: getSpaces(scenario.siteUfid),
      seed: spec.options?.seed ?? 42,
      // 시나리오 corridorSpacing(복도 백본 간격)은 생성기의 gridSpacing 옵션에 대응한다.
      options:
        spec.options?.corridorSpacing !== undefined
          ? { gridSpacing: spec.options.corridorSpacing }
          : undefined,
    });
    if (set.nodes.length === 0) {
      setStepError("topology", `사이트 공간에서 토폴로지를 생성하지 못했습니다: ${scenario.siteUfid}`);
      return;
    }
    registerGeneratedSet(set); // 동일 seed는 setId가 같아 중복 없이 교체 등록된다.
    setStepError("topology");
    setGeneratedSetId(set.setId);
    setTopologySummary(summarizeSet(set, "generate"));
  }, [scenario, setStepError]);

  // ── ② SOP 로드 — 템플릿 로드 지시 후 pending으로 전환(치환은 아래 effect) ──
  const runLoadStep = useCallback(() => {
    if (!topologySummary) return; // 순차 활성화 — 토폴로지 단계 완료 전 차단.
    loadDomainTemplate(scenario.seedId);
    setLoadPhase("pending");
  }, [topologySummary, scenario.seedId, loadDomainTemplate]);

  // ② 후반부: setNodes 커밋 후 useStudio().nodes에서 패트롤 노드를 찾아 경로를 치환한다.
  // updateNodeProperty가 다시 nodes를 바꿔 effect가 재실행되지만 loadPhase="done" 가드로 1회만 수행.
  useEffect(() => {
    if (loadPhase !== "pending") return;
    const seed = getSeed(scenario.seedId);
    if (!seed) {
      setStepError("load", `도메인 템플릿 시드를 찾을 수 없습니다: ${scenario.seedId}`);
      setLoadPhase("idle");
      return;
    }
    // loadDomainTemplate 커밋 확인 — graphMeta.graphId가 시드 graphId로 교체된 뒤에만 진행.
    if (graphMeta.graphId !== seed.graph.graphId || nodes.length === 0) return;

    const patrolNodes = nodes.filter(
      (node) => node.data.graphNode.properties.taskKind === "patrol",
    );

    // 생성 토폴로지 시나리오 + 패트롤 노드 존재 시에만 경로 치환. 없으면 생략(LH2 등).
    let patrolAssigned = false;
    let endpoints: PatrolEndpoints | null = null;
    if (scenario.topology.mode === "generate" && generatedSetId && patrolNodes.length > 0) {
      const set = getTopologySet(generatedSetId);
      endpoints = set ? pickPatrolEndpoints(set) : null;
      if (set && endpoints) {
        for (const node of patrolNodes) {
          updateNodeProperty(node.id, "topologySetId", set.setId);
          updateNodeProperty(node.id, "startNodeId", endpoints.startNodeId);
          updateNodeProperty(node.id, "endNodeId", endpoints.endNodeId);
          updateNodeProperty(node.id, "checkpointNodeIds", [...endpoints.checkpointNodeIds]);
        }
        patrolAssigned = true;
      }
    }

    setStepError("load");
    setLoadSummary({
      seedName: seed.name,
      nodeCount: nodes.length,
      patrolNodeCount: patrolNodes.length,
      patrolAssigned,
      endpoints: patrolAssigned && endpoints ? endpoints : undefined,
    });
    setLoadPhase("done");
  }, [
    loadPhase,
    nodes,
    graphMeta.graphId,
    scenario,
    generatedSetId,
    updateNodeProperty,
    setStepError,
  ]);

  // ── ③ 검증·컴파일 — error 0이면 즉시 컴파일, error > 0이면 요약만 남기고 차단 ──
  const runValidateStep = useCallback(() => {
    if (!loadSummary) return; // 순차 활성화 — SOP 로드 완료 전 차단.
    const result = runValidate();
    const errorCount = result.issues.filter((issue) => issue.level === "error").length;
    const warningCount = result.issues.filter((issue) => issue.level === "warning").length;
    if (errorCount > 0) {
      setValidateSummary({ errorCount, warningCount, compiled: false });
      return;
    }
    runCompile();
    setValidateSummary({ errorCount, warningCount, compiled: true });
  }, [loadSummary, runValidate, runCompile]);

  // ── ④ 실행 — createRun → saveRun. runId 확정 후 구독으로 최신 반영(아래 effect) ──
  const runRunStep = useCallback(() => {
    if (validateSummary?.compiled !== true) return; // 순차 활성화 — 컴파일 전 차단.
    const event = ALL_SAMPLE_EVENTS.find((sample) => sample.eventId === scenario.eventId);
    if (!event) {
      setStepError("run", `샘플 이벤트를 찾을 수 없습니다: ${scenario.eventId}`);
      return;
    }
    // runCompile()은 SOPGraph를 동기 반환하므로 compiledGraph 상태 갱신 타이밍과 무관하다.
    const graph = compiledGraph ?? runCompile();
    const result = createRun(graph, event);
    if (!result.run) {
      setStepError("run", result.reason ?? "실행을 생성할 수 없습니다.");
      return;
    }
    setStepError("run");
    saveRun(result.run);
    setRunId(result.run.runId);
    setRun(result.run);
  }, [validateSummary, scenario.eventId, compiledGraph, runCompile, setStepError]);

  // 외부(Execution 탭/현장 회신 뷰) saveRun 반영 — 자기 runId 최신본으로 스냅샷 교체.
  useEffect(() => {
    if (!runId) return;
    return subscribeRuns(() => {
      const latest = loadRun(runId);
      if (latest) setRun(latest);
    });
  }, [runId]);

  // ── ⑤ 자동 회신 — 미종결 임무 전부에 REPORT_ACTION(DONE), dispatch당 saveRun ──
  const autoReply = useCallback(() => {
    if (!runId) return;
    let current = loadRun(runId) ?? run;
    if (!current || current.status !== "RUNNING") return;
    const pendingIds = current.missions
      .filter((mission) => isReplyable(mission.status))
      .map((mission) => mission.missionId);
    for (const missionId of pendingIds) {
      const next = applyExecutorAction(current, {
        type: "REPORT_ACTION",
        missionId,
        result: "DONE",
        reporter: reporterName,
        note: "시나리오 자동 회신",
      });
      if (next === current) continue; // 전이표 밖(no-op)은 저장하지 않는다.
      saveRun(next); // 구독자(대시보드/회신 뷰/본 훅)에 동기 통지.
      current = next;
    }
    setRun(current); // 마지막 회신으로 전 임무 종결 시 executor가 run을 COMPLETED로 마감.
  }, [runId, run, reporterName]);

  // ── 단계 상태 파생 — done은 산출물 존재로, ready는 직전 단계 done으로 판정 ──
  const statuses = useMemo(() => {
    const settled = run !== null && run.status !== "RUNNING";
    const done: Record<ScenarioStepId, boolean> = {
      topology: topologySummary !== null,
      load: loadSummary !== null,
      validate: validateSummary?.compiled === true,
      run: run !== null,
      reply: settled, // 자동/수동 회신으로 전 임무 종결 → run COMPLETED.
      dashboard: settled, // run 종결 시 상황판 기록이 확정되므로 함께 완료 처리.
    };
    const result = {} as Record<ScenarioStepId, ScenarioStepStatus>;
    let prevDone = true;
    for (const id of SCENARIO_STEP_ORDER) {
      result[id] = done[id] ? "done" : prevDone ? "ready" : "waiting";
      prevDone = done[id];
    }
    return result;
  }, [topologySummary, loadSummary, validateSummary, run]);

  return {
    statuses,
    topologySummary,
    loadSummary,
    validateSummary,
    run,
    errors,
    reporterName,
    runTopologyStep,
    runLoadStep,
    runValidateStep,
    runRunStep,
    autoReply,
    reset,
  };
}
