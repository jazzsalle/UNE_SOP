/**
 * 패트롤 경로 보간 — 로봇개 데모의 타임라인/포즈 계산 순수 모듈.
 * 경유점(waypoint) 목록으로 노드별 도착/출발 시각 타임라인을 만들고,
 * 경과 시간(초)을 넣으면 위치(lerp)와 진행 방향 yaw를 돌려준다.
 * explode 층 오프셋은 waypoint.position에 이미 구워져 들어온다 — 층간 이동 시
 * 두 노드의 오프셋 차이가 lerp로 자연히 보간된다(계획 명세).
 * React/WebGL에 의존하지 않는 순수 모듈(스크래치 실행 검증 대상).
 */

import type { Vec3 } from "./mat4";

/** 패트롤 경유점 — 토폴로지 노드의 월드 좌표(+explode 오프셋) + 체크포인트 여부. */
export interface PatrolWaypoint {
  nodeId: string;
  position: Vec3;
  checkpoint: boolean;
}

/** 노드 간 이동 시간(초) — 노드당 등속 구간 하나. */
export const PATROL_TRAVEL_SEC = 1.5;

/** 일반 노드 도착 시 정지 시간(초). */
export const PATROL_DWELL_SEC = 0.35;

/** 체크포인트 노드 정지 시간(초) — 점검 포인트는 더 길게 머문다. */
export const PATROL_CHECKPOINT_DWELL_SEC = 1.2;

/** 노드별 도착(arrive)/출발(depart) 시각(초) — buildPatrolTimeline 산출. */
export interface PatrolTimelineEntry {
  arriveSec: number;
  departSec: number;
}

/** 패트롤 전체 타임라인 — 경유점과 같은 길이의 entries + 총 소요 시간. */
export interface PatrolTimeline {
  entries: PatrolTimelineEntry[];
  totalSec: number;
}

/** 로봇 포즈 — 월드 위치 + Y축 회전(yaw, 라디안). 모델 forward = +X 기준. */
export interface PatrolPose {
  position: Vec3;
  yaw: number;
}

/**
 * 경유점 목록 → 타임라인. i번째 노드에 arrive[i] 도착, dwell(체크포인트는 길게)만큼
 * 머문 뒤 depart[i]에 출발, 다음 노드까지 PATROL_TRAVEL_SEC 이동한다.
 * totalSec = 마지막 노드 dwell 종료 시각.
 */
export function buildPatrolTimeline(waypoints: PatrolWaypoint[]): PatrolTimeline {
  const entries: PatrolTimelineEntry[] = [];
  let cursor = 0;
  for (let i = 0; i < waypoints.length; i++) {
    const dwell = waypoints[i].checkpoint ? PATROL_CHECKPOINT_DWELL_SEC : PATROL_DWELL_SEC;
    entries.push({ arriveSec: cursor, departSec: cursor + dwell });
    cursor += dwell;
    if (i < waypoints.length - 1) {
      cursor += PATROL_TRAVEL_SEC;
    }
  }
  return { entries, totalSec: cursor };
}

/**
 * a→b 수평(XZ) 진행 방향 yaw — 모델 forward(+X)가 mat4RotateY(yaw)로 (cosθ, 0, −sinθ)에
 * 사상되므로 yaw = atan2(−dz, dx). 수평 이동이 없으면(수직 링크) null.
 */
function headingBetween(a: Vec3, b: Vec3): number | null {
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  if (Math.hypot(dx, dz) < 1e-6) {
    return null;
  }
  return Math.atan2(-dz, dx);
}

/**
 * index→index+1 구간의 yaw — 수평 이동이 없는 구간(계단 등 수직 링크)은
 * 직전 구간 방향을 역방향 탐색으로 물려받는다. 전 구간 수직이면 0.
 */
function segmentYaw(waypoints: PatrolWaypoint[], index: number): number {
  for (let i = Math.min(index, waypoints.length - 2); i >= 0; i--) {
    const heading = headingBetween(waypoints[i].position, waypoints[i + 1].position);
    if (heading !== null) {
      return heading;
    }
  }
  return 0;
}

/** 선형 보간 — a + (b−a)·u. */
function lerp3(a: Vec3, b: Vec3, u: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

/**
 * 경과 시간 → 로봇 포즈. 시간은 totalSec으로 나눈 나머지로 순환(반복 재생).
 * 정지(dwell) 구간은 노드 위치 고정 + 다음 구간 방향, 이동 구간은 위치 lerp +
 * 해당 구간 진행 방향 yaw를 돌려준다. 경유점 0개는 원점 포즈(호출부 방어).
 */
export function samplePatrolPose(
  waypoints: PatrolWaypoint[],
  timeline: PatrolTimeline,
  timeSec: number,
): PatrolPose {
  if (waypoints.length === 0) {
    return { position: [0, 0, 0], yaw: 0 };
  }
  if (waypoints.length === 1 || timeline.totalSec <= 0) {
    return { position: waypoints[0].position, yaw: 0 };
  }
  // 반복 재생 — 음수 입력도 방어적으로 0..totalSec 범위로 정규화
  const t = ((timeSec % timeline.totalSec) + timeline.totalSec) % timeline.totalSec;

  for (let i = 0; i < waypoints.length; i++) {
    const entry = timeline.entries[i];
    // 노드 i에 머무는 중 — 다음 구간(마지막 노드는 직전 구간) 방향을 바라본다
    if (t <= entry.departSec) {
      return { position: waypoints[i].position, yaw: segmentYaw(waypoints, i) };
    }
    // 노드 i → i+1 이동 중 — 등속 lerp
    const next = timeline.entries[i + 1];
    if (next && t < next.arriveSec) {
      const u = (t - entry.departSec) / (next.arriveSec - entry.departSec);
      return {
        position: lerp3(waypoints[i].position, waypoints[i + 1].position, u),
        yaw: segmentYaw(waypoints, i),
      };
    }
  }
  // 수치 오차 방어 — 마지막 노드 포즈
  return {
    position: waypoints[waypoints.length - 1].position,
    yaw: segmentYaw(waypoints, waypoints.length - 2),
  };
}
