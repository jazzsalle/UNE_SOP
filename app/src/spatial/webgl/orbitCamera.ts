/**
 * 궤도(orbit) 카메라 — Phase 9 순수 WebGL 뷰어의 시점 상태 모듈.
 * 상태 {target, distance, yaw, pitch}를 뮤테이션하는 순수 함수 집합으로,
 * 포인터 드래그 orbit / 휠 zoom / 우클릭(또는 Shift 드래그) pan 델타를 받아
 * view matrix(mat4LookAt)를 산출한다. React/DOM에 의존하지 않는다.
 * 좌표계는 토폴로지 worldPosition과 동일한 three.js Y-up(y=높이).
 */

import { mat4LookAt, type Vec3 } from "./mat4";

/** 궤도 카메라 상태 — yaw/pitch는 라디안, distance는 target까지의 거리(m). */
export interface OrbitCameraState {
  /** 시선이 향하는 월드 좌표(회전·줌 중심). */
  target: [number, number, number];
  /** eye→target 거리(m). */
  distance: number;
  /** 수평 방위각 — 0이면 +Z 방향에서 target을 바라본다. */
  yaw: number;
  /** 고도각 — 양수면 위에서 내려다본다. ±(π/2−ε)로 클램프. */
  pitch: number;
}

/** pitch 클램프 한계 — 천정/바닥 뒤집힘(짐벌) 방지 여유각. */
const PITCH_LIMIT = Math.PI / 2 - 0.05;

/** distance 클램프 범위(m) — 모델 내부 파묻힘/과도 축소 방지. */
const MIN_DISTANCE = 2;
const MAX_DISTANCE = 400;

/** 초기 상태를 생성한다(입력 방어 복사). */
export function createOrbitCamera(init: OrbitCameraState): OrbitCameraState {
  return {
    target: [...init.target],
    distance: clampDistance(init.distance),
    yaw: init.yaw,
    pitch: clampPitch(init.pitch),
  };
}

function clampPitch(pitch: number): number {
  return Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, pitch));
}

function clampDistance(distance: number): number {
  return Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, distance));
}

/** 드래그 orbit — 픽셀 델타를 각도 델타로 반영한다(감도는 호출부 상수). */
export function orbitBy(camera: OrbitCameraState, deltaYaw: number, deltaPitch: number): void {
  camera.yaw += deltaYaw;
  camera.pitch = clampPitch(camera.pitch + deltaPitch);
}

/** 휠 zoom — factor > 1 축소(멀어짐), < 1 확대(가까워짐). */
export function zoomBy(camera: OrbitCameraState, factor: number): void {
  camera.distance = clampDistance(camera.distance * factor);
}

/** 카메라 eye 월드 좌표 — target에서 yaw/pitch/distance만큼 물러난 지점. */
export function cameraEye(camera: OrbitCameraState): Vec3 {
  const horizontal = Math.cos(camera.pitch) * camera.distance;
  return [
    camera.target[0] + Math.sin(camera.yaw) * horizontal,
    camera.target[1] + Math.sin(camera.pitch) * camera.distance,
    camera.target[2] + Math.cos(camera.yaw) * horizontal,
  ];
}

/**
 * pan — 화면 픽셀 델타를 카메라 평면(우측/상단 벡터) 이동으로 변환해 target을 옮긴다.
 * 이동량은 현재 distance·fov에 비례시켜 어느 줌에서도 손맛이 일정하게 유지된다.
 */
export function panBy(
  camera: OrbitCameraState,
  deltaXPixels: number,
  deltaYPixels: number,
  viewportHeightPixels: number,
  fovY: number,
): void {
  if (viewportHeightPixels <= 0) {
    return;
  }
  // 화면 1px이 target 평면에서 차지하는 월드 길이
  const worldPerPixel = (2 * camera.distance * Math.tan(fovY / 2)) / viewportHeightPixels;
  // 카메라 우측/상단 단위 벡터 (Y-up 기준, roll 없음)
  const rightX = Math.cos(camera.yaw);
  const rightZ = -Math.sin(camera.yaw);
  const upX = -Math.sin(camera.pitch) * Math.sin(camera.yaw);
  const upY = Math.cos(camera.pitch);
  const upZ = -Math.sin(camera.pitch) * Math.cos(camera.yaw);
  // 드래그 방향과 반대로 target을 옮겨 "장면을 끌어오는" 조작감을 만든다
  camera.target[0] += (-deltaXPixels * rightX + deltaYPixels * upX) * worldPerPixel;
  camera.target[1] += deltaYPixels * upY * worldPerPixel;
  camera.target[2] += (-deltaXPixels * rightZ + deltaYPixels * upZ) * worldPerPixel;
}

/** 현재 상태의 view matrix를 산출한다. */
export function cameraViewMatrix(camera: OrbitCameraState): Float32Array {
  return mat4LookAt(cameraEye(camera), camera.target, [0, 1, 0]);
}
