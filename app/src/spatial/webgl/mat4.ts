/**
 * 4x4 행렬 최소 유틸 — Phase 9 순수 WebGL 뷰어(결정 1: 신규 의존성 0)용.
 * WebGL 관례에 따라 열 우선(column-major) Float32Array(16)를 사용한다.
 * 곱셈 규약: mat4Multiply(a, b) = a × b, 정점 변환은 (proj × view) × position 순서.
 * React/DOM/WebGL 컨텍스트에 의존하지 않는 순수 수학 모듈이다.
 */

/** 3차원 벡터 — [x, y, z]. */
export type Vec3 = readonly [number, number, number];

/** 단위 행렬을 생성한다. */
export function mat4Identity(): Float32Array {
  const out = new Float32Array(16);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

/** 행렬 곱 a × b — 결과를 새 Float32Array로 반환한다(입력 불변). */
export function mat4Multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

/**
 * 원근 투영 행렬 — fovY(라디안)/종횡비/near/far. WebGL 클립 공간(z −1..1) 기준.
 */
export function mat4Perspective(
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array {
  const f = 1 / Math.tan(fovY / 2);
  const rangeInv = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (near + far) * rangeInv;
  out[11] = -1;
  out[14] = 2 * near * far * rangeInv;
  return out;
}

/** 벡터 차 a − b. */
function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/** 외적 a × b. */
export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/** 정규화 — 영벡터는 그대로 반환(호출부가 방어). */
export function vec3Normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]);
  if (length < 1e-9) {
    return v;
  }
  return [v[0] / length, v[1] / length, v[2] / length];
}

/** 내적 a · b. */
function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * 뷰 행렬 — eye에서 target을 바라보는 카메라(lookAt)의 역변환.
 */
export function mat4LookAt(eye: Vec3, target: Vec3, up: Vec3): Float32Array {
  // 카메라 기저: zAxis = 시선 반대 방향(오른손 좌표계), xAxis = 우측, yAxis = 상단
  const zAxis = vec3Normalize(sub(eye, target));
  const xAxis = vec3Normalize(vec3Cross(up, zAxis));
  const yAxis = vec3Cross(zAxis, xAxis);
  const out = new Float32Array(16);
  out[0] = xAxis[0];
  out[1] = yAxis[0];
  out[2] = zAxis[0];
  out[4] = xAxis[1];
  out[5] = yAxis[1];
  out[6] = zAxis[1];
  out[8] = xAxis[2];
  out[9] = yAxis[2];
  out[10] = zAxis[2];
  out[12] = -dot(xAxis, eye);
  out[13] = -dot(yAxis, eye);
  out[14] = -dot(zAxis, eye);
  out[15] = 1;
  return out;
}

/** 평행이동 행렬. */
export function mat4Translate(x: number, y: number, z: number): Float32Array {
  const out = mat4Identity();
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

/** Y축 회전 행렬(라디안). */
export function mat4RotateY(radians: number): Float32Array {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const out = mat4Identity();
  out[0] = c;
  out[2] = -s;
  out[8] = s;
  out[10] = c;
  return out;
}

/** X축 회전 행렬(라디안). */
export function mat4RotateX(radians: number): Float32Array {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const out = mat4Identity();
  out[5] = c;
  out[6] = s;
  out[9] = -s;
  out[10] = c;
  return out;
}
