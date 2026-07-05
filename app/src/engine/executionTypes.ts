/**
 * 실행 도메인 타입 — SOP 실행기(executor)·실행이력 로그·전자상황판 대시보드가 공유하는 계약.
 * 컴파일된 ExecutionPlan을 입력으로 실행(run)을 생성·전이·기록하는 데 쓰인다.
 * 엔진 모듈은 React·@xyflow/react에 의존하지 않는 순수 모듈이며,
 * 도메인 타입은 `../domain`에서, 엔진 공유 타입은 `./types`에서 type-only import로만 가져온다.
 */
import type {
  EventContext,
  ExecutionPlan,
  RuntimeMission,
  RuntimeNotification,
} from "../domain";
import type { BoardRecordMock } from "./types";

/** 실행(run)의 전체 상태 — 진행 중 / 정상 종료 / 실패 종료. */
export type ExecutionRunStatus = "RUNNING" | "COMPLETED" | "FAILED";

/** 실행이력 로그 항목의 구분 — run 수명주기, 임무 전이, 패트롤 경유, 상황전파, 상황판 기록 13종. */
export type ExecutionLogKind =
  | "RUN_STARTED"
  | "MISSION_SENT"
  | "MISSION_RUNNING"
  | "MISSION_COMPLETED"
  | "MISSION_DELAYED"
  | "MISSION_FAILED"
  | "PATROL_WAYPOINT"
  | "PATROL_CHECKPOINT"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_ACKED"
  | "BOARD_RECORDED"
  | "RUN_COMPLETED"
  | "RUN_FAILED";

/**
 * 실행이력 로그의 한 항목 — 관리자 점검 화면(전자상황판)의 행 단위 데이터.
 *
 * **필수 채움 규칙**: `location`(장소) / `loggedAt`(시간) / `missionSummary`(임무내용) /
 * `notificationSummary`(상황전파) 4개 필드는 평가 기준 필수 항목이므로 모든 엔트리에서
 * 반드시 채운다. 해당 로그 항목과 직접 관련이 없는 필드는 run 수준 요약(예: 이벤트 발생
 * 장소, 전체 임무 title 조인)으로 폴백해 빈 값을 남기지 않는다.
 */
export interface ExecutionLogEntry {
  /** run 내 로그 순번 — 1부터 증가. */
  seq: number;
  /** 기록 시각(ISO, 모의 시각) — startedAt + elapsedMinutes로 계산한다. */
  loggedAt: string;
  /** run 시작 이후 경과 분(모의 시계). */
  elapsedMinutes: number;
  /** 로그 구분 — run 수명주기/임무 전이/상황전파/상황판 기록. */
  kind: ExecutionLogKind;
  /** 관련 그래프 노드 id — 해당되는 경우에만. */
  nodeId?: string;
  /** 관련 임무 id — 임무 전이 로그에만. */
  missionId?: string;
  /** 한국어 서술 메시지. */
  message: string;
  /** 장소 — 이벤트 spaceId/siteId 폴백 (필수 채움). */
  location: string;
  /** 임무내용 요약 — 해당 임무 title 또는 전체 임무 title 조인 (필수 채움). */
  missionSummary: string;
  /** 상황전파 요약 — `channel → targets (status)` 조인 (필수 채움). */
  notificationSummary: string;
}

/**
 * 하나의 SOP 실행(run) — 컴파일된 ExecutionPlan에서 생성되어 액션/틱으로 전이되는
 * 실행 상태 전체 스냅샷. localStorage(`sop-studio:runs`)에 runId 키로 영속화된다.
 */
export interface ExecutionRun {
  /** 실행 식별자 — 저장 맵의 키. */
  runId: string;
  /** 원본 SOPGraph 식별자. */
  graphId: string;
  /** 원본 SOPGraph 이름 — 대시보드 목록 표시용. */
  graphName: string;
  /** 원본 SOPGraph 도메인 — 대시보드 목록 표시용. */
  domain: string;
  /** 실행을 촉발한 이벤트 컨텍스트. */
  eventContext: EventContext;
  /** compileGraph() 산출 실행 계획 — 생성 시점의 원본. */
  plan: ExecutionPlan;
  /** 실행 경로로 방문한 노드 id 목록. */
  visitedNodeIds: string[];
  /** 실행 경로로 통과한 엣지 id 목록. */
  traversedEdgeIds: string[];
  /** 상태 전이되는 임무 사본 — plan.missions의 깊은 복제에서 시작한다. */
  missions: RuntimeMission[];
  /** 상태 전이되는 상황전파 사본 — plan.notifications의 깊은 복제에서 시작한다. */
  notifications: RuntimeNotification[];
  /** 전자상황판 기록 — run 종결 시 채워진다(장소/시간/임무내용/상황전파). */
  boardRecords: BoardRecordMock[];
  /** run 전체 상태. */
  status: ExecutionRunStatus;
  /** 실행 시작 시각(ISO, 모의 시계 기준점). */
  startedAt: string;
  /** 실행 종료 시각(ISO) — COMPLETED/FAILED 전이 시 설정. */
  endedAt?: string;
  /** 시작 이후 경과 분(모의 시계) — TICK으로 진행된다. */
  elapsedMinutes: number;
  /** 실행이력 로그 — seq 오름차순. */
  logs: ExecutionLogEntry[];
}

/**
 * 실행기 액션 (discriminated union) — `applyExecutorAction(run, action)`의 입력.
 * 임무 수동 전이 3종 + 상황전파 확인 + 모의 시간 진행(TICK).
 */
export type ExecutorAction =
  | { type: "START_MISSION"; missionId: string }
  | { type: "COMPLETE_MISSION"; missionId: string }
  | { type: "FAIL_MISSION"; missionId: string }
  | { type: "ACK_NOTIFICATION"; notificationId: string }
  | { type: "TICK"; minutes: number };
