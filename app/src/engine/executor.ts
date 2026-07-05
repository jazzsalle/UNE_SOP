/**
 * executor — SOP 실행기 상태 머신 (2단계 핵심 엔진).
 * compileGraph()가 산출한 ExecutionPlan으로부터 ExecutionRun을 생성(createRun)하고,
 * 불변(immutable) 리듀서 방식(`applyExecutorAction(run, action) → new run`)으로
 * 임무/상황전파 상태 전이와 실행이력 로그를 기록한다.
 *
 * 임무 상태 전이표 (docs/plans/phase-5.md "선행 판단 4" 고정 규칙):
 * - START_MISSION:    SENT → RUNNING
 * - COMPLETE_MISSION: RUNNING | DELAYED → COMPLETED (지연 완료 허용)
 * - FAIL_MISSION:     SENT | RUNNING | DELAYED → FAILED
 * - ACK_NOTIFICATION: SENT → ACKED
 * - TICK:             elapsedMinutes 증가 + dueMinutes < elapsed인 SENT/RUNNING 임무 → DELAYED
 * 허용 전이표 밖의 액션은 no-op(입력 run 동일 참조 반환)이다.
 *
 * React·@xyflow/react 무의존 순수 모듈. localStorage 접근 금지 —
 * 영속화는 UI 레이어가 runStorage로 수행한다(순수성 유지).
 */
import type { EventContext, RuntimeMission, SOPGraph } from "../domain";
import type { BoardRecordMock, SimulateOptions } from "./types";
import type {
  ExecutionLogKind,
  ExecutionRun,
  ExecutorAction,
} from "./executionTypes";
import { compileGraph } from "./compileGraph";

/** createRun() 결과 — 트리거 미매칭 시 run 대신 사유(reason)를 담는다. */
export interface CreateRunResult {
  run: ExecutionRun | null;
  reason?: string;
}

/* ------------------------------------------------------------------ */
/* 내부 헬퍼 — 모의 시계 / 요약 / 복제                                    */
/* ------------------------------------------------------------------ */

/** ExecutionRun은 localStorage 직렬화 대상(JSON-safe)이므로 JSON 왕복으로 깊은 복제한다. */
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 모의 시계 — startedAt(ISO) 기준 경과 분을 더한 기록 시각을 계산한다. */
function loggedAtOf(startedAt: string, elapsedMinutes: number): string {
  const base = Date.parse(startedAt);
  const baseMs = Number.isFinite(base) ? base : Date.now();
  return new Date(baseMs + elapsedMinutes * 60_000).toISOString();
}

/** 실행 시작 시각 — ctx.occurredAt이 유효한 ISO면 그대로, 아니면 현재 시각. */
function resolveStartedAt(occurredAt: string | undefined): string {
  return occurredAt && Number.isFinite(Date.parse(occurredAt))
    ? occurredAt
    : new Date().toISOString();
}

/** 장소 폴백 — 이벤트 spaceId → siteId → "-" (buildBoardRecords와 동일 규칙). */
function locationOf(ctx: EventContext): string {
  return ctx.spaceId ?? ctx.siteId ?? "-";
}

/** run 수준 임무내용 요약 — 전체 임무 title 조인(로그 필수 채움 폴백). */
function summarizeMissions(missions: ExecutionRun["missions"]): string {
  return missions.map((mission) => mission.title).join(", ") || "-";
}

/** 임무내용 최종 요약 — 종결 시 상황판 기록용으로 임무별 최종 상태를 함께 표기한다. */
function summarizeMissionsWithStatus(missions: ExecutionRun["missions"]): string {
  return missions.map((mission) => `${mission.title}(${mission.status})`).join(", ") || "-";
}

/** run 수준 상황전파 요약 — `channel → targets (status)` 조인(로그 필수 채움 폴백). */
function summarizeNotifications(notifications: ExecutionRun["notifications"]): string {
  return (
    notifications
      .map((noti) => `${noti.channel} → ${noti.targets.join(", ")} (${noti.status})`)
      .join(" / ") || "-"
  );
}

/** runId 조립 — `RUN-{eventId}-{uuid 앞 8자}`. crypto 부재 환경은 난수 폴백. */
function makeRunId(eventId: string): string {
  const uuid =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(16).slice(2, 10).padEnd(8, "0");
  return `RUN-${eventId}-${uuid.slice(0, 8)}`;
}

/** 로그 추가 입력 — missionSummary/notificationSummary 미지정 시 run 수준 요약으로 폴백. */
interface LogInput {
  kind: ExecutionLogKind;
  message: string;
  nodeId?: string;
  missionId?: string;
  missionSummary?: string;
  notificationSummary?: string;
}

/**
 * draft(복제본)에 로그를 추가한다 — seq는 1부터 증가, loggedAt은 모의 시계로 계산.
 * location/loggedAt/missionSummary/notificationSummary 4필드는 항상 채운다(평가 기준 필수).
 */
function pushLog(draft: ExecutionRun, input: LogInput): void {
  draft.logs.push({
    seq: draft.logs.length + 1,
    loggedAt: loggedAtOf(draft.startedAt, draft.elapsedMinutes),
    elapsedMinutes: draft.elapsedMinutes,
    kind: input.kind,
    nodeId: input.nodeId,
    missionId: input.missionId,
    message: input.message,
    location: locationOf(draft.eventContext),
    missionSummary: input.missionSummary ?? summarizeMissions(draft.missions),
    notificationSummary: input.notificationSummary ?? summarizeNotifications(draft.notifications),
  });
}

/* ------------------------------------------------------------------ */
/* createRun — 컴파일 → 실행(run) 생성                                   */
/* ------------------------------------------------------------------ */

/**
 * SOPGraph + EventContext를 컴파일해 실행(run)을 생성한다.
 * - 트리거 미매칭이면 `{ run: null, reason }`.
 * - 성공 시 plan의 missions/notifications를 **깊은 복제**해 run에 담는다.
 *   임무는 전부 SENT에서 시작하고, 상황전파는 Mock 시나리오 상태(responded면 ACKED)와
 *   무관하게 **발송 직후(SENT)로 초기화**한다 — 실제 확인은 ACK_NOTIFICATION 전이로 기록.
 * - boardRecords: 실행기는 graph를 보관하지 않으므로(run은 JSON 직렬화 대상) 종결 시점에
 *   buildBoardRecords를 재호출할 수 없다. 대신 컴파일 산출 기록을 생성 시점에 담아
 *   boardNodeId를 보존하고, run 종결 시 최종 임무/전파 상태로 필드를 갱신한다.
 *   단, 컴파일 산출 필드는 Mock 시나리오 상태(예: responded면 ACKED)를 담고 있어
 *   run 초기 상태(전부 SENT)와 어긋나므로, 생성 시점에 run 초기 상태 기준으로 재기입한다.
 * - 모의 시계: startedAt = ctx.occurredAt(없으면 현재 시각), elapsedMinutes = 0.
 */
export function createRun(
  graph: SOPGraph,
  ctx: EventContext,
  opts?: SimulateOptions,
): CreateRunResult {
  const result = compileGraph(graph, ctx, opts ?? { branchOutcome: "responded" });
  if (!result.matched || !result.plan) {
    return {
      run: null,
      reason:
        result.reason ??
        `실행을 생성할 수 없습니다 — 트리거 미매칭 (eventType: ${ctx.eventType}).`,
    };
  }

  const startedAt = resolveStartedAt(ctx.occurredAt);
  const run: ExecutionRun = {
    runId: makeRunId(ctx.eventId),
    graphId: graph.graphId,
    graphName: graph.name,
    domain: graph.domain,
    eventContext: deepClone(ctx),
    plan: deepClone(result.plan),
    visitedNodeIds: [...result.visitedNodeIds],
    traversedEdgeIds: [...result.traversedEdgeIds],
    missions: deepClone(result.plan.missions).map((mission) => ({
      ...mission,
      status: "SENT" as const,
    })),
    notifications: deepClone(result.plan.notifications).map((noti) => ({
      ...noti,
      status: "SENT" as const,
    })),
    boardRecords: deepClone(result.boardRecords),
    status: "RUNNING",
    startedAt,
    endedAt: undefined,
    elapsedMinutes: 0,
    logs: [],
  };

  // 상황판 기록을 run 초기 상태(임무/전파 전부 SENT) 기준으로 재기입한다 — JSDoc 참조.
  // 종결 시 finalizeIfSettled가 최종 상태로 다시 갱신한다.
  for (const record of run.boardRecords) {
    record.fields = {
      장소: locationOf(run.eventContext),
      시간: startedAt,
      임무내용: summarizeMissions(run.missions),
      상황전파: summarizeNotifications(run.notifications),
    };
  }

  pushLog(run, {
    kind: "RUN_STARTED",
    nodeId: run.plan.triggerNodeId,
    message: `실행 시작 — "${run.graphName}" (이벤트 ${ctx.eventId}: ${ctx.eventType}/${ctx.severity})`,
  });
  for (const mission of run.missions) {
    pushLog(run, {
      kind: "MISSION_SENT",
      nodeId: mission.nodeId,
      missionId: mission.missionId,
      message: `임무 전송 — ${mission.title} (${mission.assigneeRole ?? "담당 미지정"})`,
      missionSummary: mission.title,
    });
  }
  for (const noti of run.notifications) {
    pushLog(run, {
      kind: "NOTIFICATION_SENT",
      nodeId: noti.nodeId,
      message: `상황 전파 발송 — [${noti.channel}] ${noti.message} → ${noti.targets.join(", ")}`,
      notificationSummary: `${noti.channel} → ${noti.targets.join(", ")} (SENT)`,
    });
  }

  return { run };
}

/* ------------------------------------------------------------------ */
/* applyExecutorAction — 불변 리듀서                                     */
/* ------------------------------------------------------------------ */

/**
 * 실행기 액션을 적용해 **새 ExecutionRun**을 반환한다(입력 run은 절대 변경하지 않음).
 * 허용 전이표(모듈 헤더 참조) 밖의 액션과 종결된 run(status !== RUNNING)에 대한
 * 액션은 no-op — 입력 run을 동일 참조로 반환한다.
 */
export function applyExecutorAction(run: ExecutionRun, action: ExecutorAction): ExecutionRun {
  if (run.status !== "RUNNING") return run; // 종결된 run은 모든 액션 no-op.
  switch (action.type) {
    case "START_MISSION":
      return transitionMission(run, action.missionId, ["SENT"], "RUNNING");
    case "COMPLETE_MISSION":
      return transitionMission(run, action.missionId, ["RUNNING", "DELAYED"], "COMPLETED");
    case "FAIL_MISSION":
      return transitionMission(run, action.missionId, ["SENT", "RUNNING", "DELAYED"], "FAILED");
    case "ACK_NOTIFICATION":
      return ackNotification(run, action.notificationId);
    case "TICK":
      return applyTick(run, action.minutes);
    default:
      return run;
  }
}

/** 임무 전이 목표 상태 → 로그 kind 매핑. */
const MISSION_KIND_BY_STATUS: Partial<Record<RuntimeMission["status"], ExecutionLogKind>> = {
  RUNNING: "MISSION_RUNNING",
  COMPLETED: "MISSION_COMPLETED",
  FAILED: "MISSION_FAILED",
};

/**
 * 단일 임무 전이 — 허용 출발 상태가 아니면 no-op(동일 참조 반환).
 * 전이 성공 시 해당 kind 로그를 남기고, COMPLETED/FAILED 도달 시 종결 판정을 시도한다.
 */
function transitionMission(
  run: ExecutionRun,
  missionId: string,
  allowedFrom: RuntimeMission["status"][],
  nextStatus: RuntimeMission["status"],
): ExecutionRun {
  const current = run.missions.find((mission) => mission.missionId === missionId);
  if (!current || !allowedFrom.includes(current.status)) return run; // 전이표 밖 — no-op.

  const draft = deepClone(run);
  const mission = draft.missions.find((m) => m.missionId === missionId)!;
  const wasDelayed = mission.status === "DELAYED";
  mission.status = nextStatus;

  const assignee = mission.assigneeRole ?? "담당 미지정";
  const message =
    nextStatus === "RUNNING"
      ? `임무 착수 — ${mission.title} (${assignee})`
      : nextStatus === "COMPLETED"
        ? `임무 ${wasDelayed ? "지연 완료" : "완료"} — ${mission.title} (${assignee})`
        : `임무 실패 — ${mission.title} (${assignee})`;

  pushLog(draft, {
    kind: MISSION_KIND_BY_STATUS[nextStatus] ?? "MISSION_RUNNING",
    nodeId: mission.nodeId,
    missionId: mission.missionId,
    message,
    missionSummary: mission.title,
  });

  if (nextStatus === "COMPLETED" || nextStatus === "FAILED") {
    finalizeIfSettled(draft);
  }
  return draft;
}

/** 상황전파 확인 전이 — SENT → ACKED. 그 외 상태는 no-op(동일 참조 반환). */
function ackNotification(run: ExecutionRun, notificationId: string): ExecutionRun {
  const current = run.notifications.find((noti) => noti.notificationId === notificationId);
  if (!current || current.status !== "SENT") return run;

  const draft = deepClone(run);
  const noti = draft.notifications.find((n) => n.notificationId === notificationId)!;
  noti.status = "ACKED";
  pushLog(draft, {
    kind: "NOTIFICATION_ACKED",
    nodeId: noti.nodeId,
    message: `상황 전파 확인 — [${noti.channel}] ${noti.targets.join(", ")} 수신 확인`,
    notificationSummary: `${noti.channel} → ${noti.targets.join(", ")} (ACKED)`,
  });
  return draft;
}

/**
 * 모의 시간 진행(TICK) — elapsedMinutes를 증가시키고, dueMinutes를 초과한
 * SENT/RUNNING 임무를 DELAYED로 자동 전이한다(임무별 MISSION_DELAYED 로그).
 * minutes가 양의 유한수가 아니면 no-op.
 */
function applyTick(run: ExecutionRun, minutes: number): ExecutionRun {
  if (!Number.isFinite(minutes) || minutes <= 0) return run;

  const draft = deepClone(run);
  draft.elapsedMinutes += minutes;
  for (const mission of draft.missions) {
    const overdue =
      typeof mission.dueMinutes === "number" && mission.dueMinutes < draft.elapsedMinutes;
    if (!overdue || (mission.status !== "SENT" && mission.status !== "RUNNING")) continue;
    mission.status = "DELAYED";
    pushLog(draft, {
      kind: "MISSION_DELAYED",
      nodeId: mission.nodeId,
      missionId: mission.missionId,
      message: `임무 지연 — ${mission.title} (제한 ${mission.dueMinutes}분 초과, 경과 ${draft.elapsedMinutes}분)`,
      missionSummary: mission.title,
    });
  }
  return draft;
}

/* ------------------------------------------------------------------ */
/* 종결 판정                                                            */
/* ------------------------------------------------------------------ */

/**
 * 종결 판정 — 모든 임무가 COMPLETED/FAILED에 도달하면 run을 종결한다.
 * ① 상황판 기록(boardRecords) 필드를 최종 임무/전파 상태로 갱신(임무내용은 최종 상태 표기)
 *    + 기록별 BOARD_RECORDED 로그, ② status = COMPLETED, endedAt = 종결 시점 모의 시각,
 *    ③ RUN_COMPLETED 로그.
 *
 * **run 상태 COMPLETED 근거**: 임무 일부가 FAILED여도 실행 절차 자체는 끝까지 진행되어
 * 종결되었으므로 run은 COMPLETED로 마감하고, 실패 건수를 RUN_COMPLETED 메시지에 명시한다.
 * ExecutionRunStatus.FAILED는 실행 절차 자체가 진행 불능으로 중단되는 경우(향후 확장)를
 * 위해 예약한다.
 */
function finalizeIfSettled(draft: ExecutionRun): void {
  const settled =
    draft.missions.length > 0 &&
    draft.missions.every(
      (mission) => mission.status === "COMPLETED" || mission.status === "FAILED",
    );
  if (!settled) return;

  const endedAt = loggedAtOf(draft.startedAt, draft.elapsedMinutes);
  const missionFinalSummary = summarizeMissionsWithStatus(draft.missions);
  const notificationFinalSummary = summarizeNotifications(draft.notifications);

  // 상황판 기록 갱신 — situation_board 노드가 없는 그래프는 기록 없이 종결한다.
  const location = locationOf(draft.eventContext);
  for (const record of draft.boardRecords as BoardRecordMock[]) {
    record.fields = {
      장소: location,
      시간: endedAt,
      임무내용: missionFinalSummary,
      상황전파: notificationFinalSummary,
    };
    pushLog(draft, {
      kind: "BOARD_RECORDED",
      nodeId: record.boardNodeId,
      message: `상황판 기록 — 장소/시간/임무내용/상황전파 기재 (${record.boardNodeId})`,
      missionSummary: missionFinalSummary,
      notificationSummary: notificationFinalSummary,
    });
  }

  const total = draft.missions.length;
  const failedCount = draft.missions.filter((mission) => mission.status === "FAILED").length;
  pushLog(draft, {
    kind: "RUN_COMPLETED",
    message:
      failedCount > 0
        ? `실행 종결 — 임무 ${total}건 중 완료 ${total - failedCount}건, 실패 ${failedCount}건`
        : `실행 종결 — 전 임무(${total}건) 완료`,
    missionSummary: missionFinalSummary,
    notificationSummary: notificationFinalSummary,
  });

  draft.status = "COMPLETED";
  draft.endedAt = endedAt;
}
