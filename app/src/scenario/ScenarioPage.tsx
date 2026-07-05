/**
 * ScenarioPage — 통합 시나리오 실행기 뷰 (Phase 9 T4).
 * 좌측: 시나리오 선택(data-tutorial-id="scenario-select") + 개요/메타 + 리셋 +
 * 담당자 명단(ContactRoster). 우측: 단계 카드 6장(ScenarioStepCard) —
 * ① 토폴로지 생성 → ② SOP 로드 → ③ 검증·컴파일 → ④ 실행 → ⑤ 회신 → ⑥ 대시보드.
 * 단계 상태 머신·산출물은 useScenarioRunner가 소유하고, 이 페이지는 카드 구성과
 * 뷰 전환(useAppView)만 담당한다. 카드 서술은 시나리오 정의의 steps(개요 1 + 실행 6)가
 * 단계 수와 맞으면 그대로 쓰고, 아니면 아래 기본 서술로 폴백한다.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useState } from "react";
import { findContact, getSeed, getSite, INTEGRATED_SCENARIOS } from "../domain";
import type { ContactPerson, RuntimeMission } from "../domain";
import type { ExecutionRun } from "../engine";
import { useAppView } from "../shell/AppViewContext";
import ContactRoster from "./ContactRoster";
import ScenarioStepCard from "./ScenarioStepCard";
import { SCENARIO_STEP_ORDER, useScenarioRunner } from "./useScenarioRunner";
import type { ScenarioStepId } from "./useScenarioRunner";
import "./scenario.css";

/** 단계별 기본 제목/서술 — 시나리오 steps 서술이 단계 수와 안 맞을 때 폴백. */
const STEP_FALLBACK: Record<ScenarioStepId, { title: string; description: string }> = {
  topology: {
    title: "토폴로지 생성",
    description: "사이트 공간 footprint에서 내비 토폴로지(노드·링크)를 준비합니다.",
  },
  load: {
    title: "SOP 로드",
    description: "도메인 템플릿 시드를 Graph Studio에 로드합니다.",
  },
  validate: {
    title: "검증·컴파일",
    description: "그래프를 검증하고 오류가 없으면 ExecutionPlan으로 컴파일합니다.",
  },
  run: {
    title: "실행",
    description: "시나리오 이벤트로 실행(run)을 시작하고 임무를 전송합니다.",
  },
  reply: {
    title: "조치결과 회신",
    description: "현장 담당자가 전파를 수신하고 조치결과를 회신합니다.",
  },
  dashboard: {
    title: "대시보드 점검",
    description: "전자상황판에서 장소·시간·임무내용·상황전파 이력을 점검합니다.",
  },
};

/** run 상태 → 뱃지 클래스/라벨 (ExecutionPanel 관례). */
const RUN_STATUS_BADGE: Record<ExecutionRun["status"], string> = {
  RUNNING: "scenario-badge--brand",
  COMPLETED: "scenario-badge--success",
  FAILED: "scenario-badge--danger",
};
const RUN_STATUS_LABEL: Record<ExecutionRun["status"], string> = {
  RUNNING: "실행 중",
  COMPLETED: "실행 완료",
  FAILED: "실행 실패",
};

/** 임무 상태 → 뱃지 클래스/라벨 (대시보드 임무 현황 관례). */
const MISSION_STATUS_BADGE: Record<RuntimeMission["status"], string> = {
  SENT: "scenario-badge--info",
  RUNNING: "scenario-badge--brand",
  COMPLETED: "scenario-badge--success",
  DELAYED: "scenario-badge--warning",
  FAILED: "scenario-badge--danger",
};
const MISSION_STATUS_LABEL: Record<RuntimeMission["status"], string> = {
  SENT: "전송됨",
  RUNNING: "진행 중",
  COMPLETED: "완료",
  DELAYED: "지연",
  FAILED: "실패",
};

function ScenarioPage() {
  const { setActiveView } = useAppView();
  const [scenarioId, setScenarioId] = useState(INTEGRATED_SCENARIOS[0].scenarioId);
  const scenario =
    INTEGRATED_SCENARIOS.find((candidate) => candidate.scenarioId === scenarioId) ??
    INTEGRATED_SCENARIOS[0];
  const runner = useScenarioRunner(scenario);

  const contacts = scenario.contactIds
    .map((contactId) => findContact(contactId))
    .filter((contact): contact is ContactPerson => contact !== undefined);

  // 시나리오 steps = [개요 1] + [실행 단계 6]이면 카드 서술로 그대로 쓴다(아니면 폴백).
  const narrativeAligned = scenario.steps.length === SCENARIO_STEP_ORDER.length + 1;
  const stepText = (id: ScenarioStepId): { title: string; description: string } => {
    if (!narrativeAligned) return STEP_FALLBACK[id];
    const index = SCENARIO_STEP_ORDER.indexOf(id);
    return scenario.steps[index + 1] ?? STEP_FALLBACK[id];
  };

  const { statuses, topologySummary, loadSummary, validateSummary, run, errors } = runner;
  const runSettled = run !== null && run.status !== "RUNNING";
  const sentCount = run?.missions.filter((mission) => mission.status === "SENT").length ?? 0;

  return (
    <section className="scenario">
      <header className="scenario__header">
        <h2 className="scenario__title typo-title-sm font-bold">시나리오 실행기</h2>
        <p className="scenario__subtitle typo-text-sm">
          공간·토폴로지·SOP·실행·회신·상황판을 잇는 엔드투엔드 데모
        </p>
      </header>

      <div className="scenario__body">
        {/* ── 좌측: 시나리오 선택 + 개요 + 담당자 ── */}
        <aside className="scenario__side">
          <div className="scenario-picker">
            <label className="scenario-picker__label typo-text-sm" htmlFor="scenario-select">
              시나리오 선택
            </label>
            <select
              id="scenario-select"
              data-tutorial-id="scenario-select"
              className="scenario-select typo-text-md"
              value={scenario.scenarioId}
              onChange={(event) => setScenarioId(event.target.value)}
            >
              {INTEGRATED_SCENARIOS.map((candidate) => (
                <option key={candidate.scenarioId} value={candidate.scenarioId}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </div>

          <div className="scenario-overview">
            <h3 className="scenario-overview__name typo-text-md font-bold">{scenario.name}</h3>
            <p className="scenario-overview__desc typo-text-sm">{scenario.description}</p>
            <dl className="scenario-kv typo-text-sm">
              <dt>사이트</dt>
              <dd>{getSite(scenario.siteUfid)?.name ?? scenario.siteUfid}</dd>
              <dt>SOP 시드</dt>
              <dd>{getSeed(scenario.seedId)?.name ?? scenario.seedId}</dd>
              <dt>이벤트</dt>
              <dd>{scenario.eventId}</dd>
              <dt>토폴로지</dt>
              <dd>{scenario.topology.mode === "generate" ? "임의 생성" : "샘플 셋"}</dd>
            </dl>
            <button
              type="button"
              className="scenario-btn scenario-btn--outline typo-text-sm"
              onClick={runner.reset}
            >
              처음부터 다시
            </button>
          </div>

          <ContactRoster contacts={contacts} />
        </aside>

        {/* ── 우측: 단계 카드 6장 ── */}
        <div className="scenario__steps">
          {/* ① 토폴로지 생성 */}
          <ScenarioStepCard
            index={1}
            title={stepText("topology").title}
            description={stepText("topology").description}
            status={statuses.topology}
            tutorialId="scenario-step-topology"
            actionLabel={scenario.topology.mode === "generate" ? "토폴로지 생성" : "샘플 셋 확인"}
            onAction={runner.runTopologyStep}
            actionDisabled={statuses.topology === "done"}
            error={errors.topology}
          >
            {topologySummary && (
              <div className="scenario-step__result">
                <p className="scenario-step__summary typo-text-sm">
                  {topologySummary.setName} — 노드 {topologySummary.nodeCount}개 · 링크{" "}
                  {topologySummary.linkCount}개 · 층별{" "}
                  {topologySummary.floorCounts
                    .map((floor) => `${floor.floorName} ${floor.count}개`)
                    .join(" / ")}
                </p>
                <button
                  type="button"
                  className="scenario-btn scenario-btn--outline typo-text-sm"
                  onClick={() => setActiveView("spatial")}
                >
                  공간 모델에서 보기
                </button>
              </div>
            )}
          </ScenarioStepCard>

          {/* ② SOP 로드 */}
          <ScenarioStepCard
            index={2}
            title={stepText("load").title}
            description={stepText("load").description}
            status={statuses.load}
            tutorialId="scenario-step-load"
            actionLabel="SOP 로드"
            onAction={runner.runLoadStep}
            actionDisabled={statuses.load === "done"}
            error={errors.load}
          >
            {loadSummary && (
              <div className="scenario-step__result">
                <p className="scenario-step__summary typo-text-sm">
                  {loadSummary.seedName} — 노드 {loadSummary.nodeCount}개 로드 ·{" "}
                  {loadSummary.patrolAssigned && loadSummary.endpoints
                    ? `패트롤 경로 배정: ${loadSummary.endpoints.startNodeId} → ${loadSummary.endpoints.endNodeId} (점검 포인트 ${loadSummary.endpoints.checkpointNodeIds.length}개)`
                    : loadSummary.patrolNodeCount > 0
                      ? "패트롤 경로는 시드 기본값을 사용합니다"
                      : "패트롤 노드 없음 — 경로 치환 생략"}
                </p>
                <button
                  type="button"
                  className="scenario-btn scenario-btn--outline typo-text-sm"
                  onClick={() => setActiveView("studio")}
                >
                  Studio에서 보기
                </button>
              </div>
            )}
          </ScenarioStepCard>

          {/* ③ 검증·컴파일 */}
          <ScenarioStepCard
            index={3}
            title={stepText("validate").title}
            description={stepText("validate").description}
            status={statuses.validate}
            actionLabel="검증·컴파일"
            onAction={runner.runValidateStep}
            actionDisabled={statuses.validate === "done"}
            error={errors.validate}
          >
            {validateSummary && (
              <div className="scenario-step__result">
                <p className="scenario-step__summary typo-text-sm">
                  오류 {validateSummary.errorCount}건 · 경고 {validateSummary.warningCount}건 —{" "}
                  {validateSummary.compiled
                    ? "컴파일 완료 (ExecutionPlan 생성)"
                    : "오류가 있어 컴파일을 진행할 수 없습니다"}
                </p>
                {!validateSummary.compiled && (
                  <p className="scenario-step__hint typo-text-sm">
                    Graph Studio의 Validation 패널에서 오류를 수정한 뒤 다시 실행하세요.
                  </p>
                )}
              </div>
            )}
          </ScenarioStepCard>

          {/* ④ 실행 */}
          <ScenarioStepCard
            index={4}
            title={stepText("run").title}
            description={stepText("run").description}
            status={statuses.run}
            tutorialId="scenario-step-run"
            actionLabel="실행 시작"
            onAction={runner.runRunStep}
            actionDisabled={statuses.run === "done"}
            error={errors.run}
          >
            {run && (
              <div className="scenario-step__result">
                <p className="scenario-step__summary typo-text-sm">
                  임무 {run.missions.length}건 전송
                  {sentCount > 0 && sentCount < run.missions.length
                    ? ` (SENT ${sentCount}건)`
                    : ""}{" "}
                  — {run.runId}{" "}
                  <span
                    className={`scenario-badge ${RUN_STATUS_BADGE[run.status]} typo-text-sm font-bold`}
                  >
                    {RUN_STATUS_LABEL[run.status]}
                  </span>
                </p>
                <ul className="scenario-missions">
                  {run.missions.map((mission) => (
                    <li key={mission.missionId} className="scenario-missions__item">
                      <span
                        className={`scenario-badge ${MISSION_STATUS_BADGE[mission.status]} typo-text-sm font-bold`}
                      >
                        {MISSION_STATUS_LABEL[mission.status]}
                      </span>
                      <span className="scenario-missions__title typo-text-sm">
                        {mission.title}
                      </span>
                      <span className="scenario-missions__meta typo-text-sm">
                        {mission.assigneeRole ?? "담당 미지정"}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="scenario-step__hint typo-text-sm">
                  임무 착수/완료/모의 시간(TICK) 세부 조작은 Graph Studio 하단 Execution
                  탭에서 할 수 있습니다.
                </p>
                <button
                  type="button"
                  className="scenario-btn scenario-btn--outline typo-text-sm"
                  onClick={() => setActiveView("studio")}
                >
                  Execution 탭에서 조작
                </button>
              </div>
            )}
          </ScenarioStepCard>

          {/* ⑤ 회신 */}
          <ScenarioStepCard
            index={5}
            title={stepText("reply").title}
            description={stepText("reply").description}
            status={statuses.reply}
            tutorialId="scenario-step-reply"
            actionLabel="자동 회신"
            onAction={runner.autoReply}
            actionDisabled={statuses.reply === "done" || !run || run.status !== "RUNNING"}
          >
            <div className="scenario-step__result">
              <p className="scenario-step__hint typo-text-sm">
                자동 회신은 미종결 임무 전체를 {runner.reporterName} 명의 조치 완료(DONE)로
                회신합니다. 수동 회신은 현장 회신 뷰에서 진행하세요.
              </p>
              {runSettled && run && (
                <p className="scenario-step__summary typo-text-sm">
                  회신 {run.actionReports?.length ?? 0}건 —{" "}
                  <span
                    className={`scenario-badge ${RUN_STATUS_BADGE[run.status]} typo-text-sm font-bold`}
                  >
                    {RUN_STATUS_LABEL[run.status]}
                  </span>
                </p>
              )}
              {run && (
                <button
                  type="button"
                  className="scenario-btn scenario-btn--outline typo-text-sm"
                  onClick={() => setActiveView("responder")}
                >
                  현장 회신 뷰로 이동
                </button>
              )}
            </div>
          </ScenarioStepCard>

          {/* ⑥ 대시보드 */}
          <ScenarioStepCard
            index={6}
            title={stepText("dashboard").title}
            description={stepText("dashboard").description}
            status={statuses.dashboard}
            actionLabel="전자상황판에서 확인"
            onAction={() => setActiveView("dashboard")}
          >
            {runSettled && (
              <p className="scenario-step__summary typo-text-sm">
                실행이 종결되어 상황판 기록(장소·시간·임무내용·상황전파)이 확정되었습니다.
              </p>
            )}
          </ScenarioStepCard>
        </div>
      </div>
    </section>
  );
}

export default ScenarioPage;
