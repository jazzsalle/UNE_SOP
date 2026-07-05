/**
 * WebGL 메시 빌더 — Phase 9 순수 WebGL 뷰어의 지오메트리 생성 모듈.
 * 공간 스키마 footprint(볼록 다각형, 별표 3 Room 제약)를 fan triangulation으로 압출한
 * 프리즘, 토폴로지 노드 마커(옥타헤드론), 링크 GL_LINES 정점, 층 슬래브를 만든다.
 * 좌표계: world.x = plan.x, world.z = −plan.y, world.y = elevation(높이) —
 * 토폴로지 worldPosition(three.js Y-up, plan.y = −world.z)과 동일 공간이다.
 * React/WebGL 컨텍스트에 의존하지 않는 순수 모듈(비인덱스 삼각형 + 명시 법선).
 */

import type { Vec3 } from "./mat4";

/** 평면 좌표(m) — 공간 스키마 SpatialPoint2D와 동일 형태(y축 위 방향). */
export interface PlanPoint {
  x: number;
  y: number;
}

/** 솔리드 메시 — 비인덱스 삼각형 정점 위치 + 정점 법선(둘 다 xyz 연속 배열). */
export interface SolidMesh {
  positions: Float32Array;
  normals: Float32Array;
}

/** 평면 좌표 + 고도 → 월드 좌표. plan.y가 −z로 사상된다(계약 A 역변환). */
export function planToWorld(point: PlanPoint, elevation: number): Vec3 {
  return [point.x, elevation, -point.y];
}

/** 신발끈 공식 부호 면적 — 양수면 plan 좌표계(y↑) 기준 CCW. */
function signedArea(footprint: PlanPoint[]): number {
  let area = 0;
  for (let i = 0; i < footprint.length; i++) {
    const p = footprint[i];
    const q = footprint[(i + 1) % footprint.length];
    area += p.x * q.y - q.x * p.y;
  }
  return area / 2;
}

/** 삼각형 1개를 위치/법선 배열에 추가한다(법선은 세 정점 공유). */
function pushTriangle(
  positions: number[],
  normals: number[],
  a: Vec3,
  b: Vec3,
  c: Vec3,
  normal: Vec3,
): void {
  positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  for (let i = 0; i < 3; i++) {
    normals.push(normal[0], normal[1], normal[2]);
  }
}

/**
 * 볼록 footprint를 baseElevation부터 height만큼 압출한 프리즘 메시.
 * 바닥/천장은 fan triangulation(볼록 보장 전제), 측벽은 변마다 사각형 2삼각형.
 * 법선은 면 단위 명시값 — 천장 +Y, 바닥 −Y, 측벽은 CCW 정규화 기준 바깥 방향.
 */
export function buildPrism(
  footprint: PlanPoint[],
  baseElevation: number,
  height: number,
): SolidMesh {
  const positions: number[] = [];
  const normals: number[] = [];
  if (footprint.length >= 3 && height > 0) {
    // 측벽 바깥 법선 계산을 단순화하기 위해 CCW로 정규화
    const ccw = signedArea(footprint) >= 0 ? footprint : [...footprint].reverse();
    const top = baseElevation + height;
    const bottomRing = ccw.map((p) => planToWorld(p, baseElevation));
    const topRing = ccw.map((p) => planToWorld(p, top));

    // 천장/바닥 — 첫 꼭짓점 기준 fan triangulation
    for (let i = 1; i < ccw.length - 1; i++) {
      pushTriangle(positions, normals, topRing[0], topRing[i], topRing[i + 1], [0, 1, 0]);
      pushTriangle(positions, normals, bottomRing[0], bottomRing[i + 1], bottomRing[i], [0, -1, 0]);
    }

    // 측벽 — 변(p→q)마다 사각형. CCW 다각형에서 plan 바깥 법선은 (dy, −dx)
    for (let i = 0; i < ccw.length; i++) {
      const j = (i + 1) % ccw.length;
      const dx = ccw[j].x - ccw[i].x;
      const dy = ccw[j].y - ccw[i].y;
      const length = Math.hypot(dx, dy);
      if (length < 1e-9) {
        continue; // 중복 꼭짓점 방어
      }
      // plan 법선 (dy,−dx) → 월드 법선 (n.x, 0, −n.y)
      const normal: Vec3 = [dy / length, 0, dx / length];
      pushTriangle(positions, normals, bottomRing[i], bottomRing[j], topRing[j], normal);
      pushTriangle(positions, normals, bottomRing[i], topRing[j], topRing[i], normal);
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
}

/**
 * 노드/시설물 마커 — 중심 기준 옥타헤드론(8면). 정점 6개(±x/±y/±z 축 끝)를
 * 면 단위 법선으로 조립해 작은 보석 형태로 보인다.
 */
export function buildNodeMarker(center: Vec3, radius: number): SolidMesh {
  const [cx, cy, cz] = center;
  const xp: Vec3 = [cx + radius, cy, cz];
  const xn: Vec3 = [cx - radius, cy, cz];
  const yp: Vec3 = [cx, cy + radius, cz];
  const yn: Vec3 = [cx, cy - radius, cz];
  const zp: Vec3 = [cx, cy, cz + radius];
  const zn: Vec3 = [cx, cy, cz - radius];
  // 상/하 각 4면 — (적도 정점 2개 + 극점) 조합, 법선은 면 무게중심 방향
  const faces: Array<[Vec3, Vec3, Vec3]> = [
    [xp, zp, yp],
    [zp, xn, yp],
    [xn, zn, yp],
    [zn, xp, yp],
    [zp, xp, yn],
    [xn, zp, yn],
    [zn, xn, yn],
    [xp, zn, yn],
  ];
  const positions: number[] = [];
  const normals: number[] = [];
  for (const [a, b, c] of faces) {
    const mx = (a[0] + b[0] + c[0]) / 3 - cx;
    const my = (a[1] + b[1] + c[1]) / 3 - cy;
    const mz = (a[2] + b[2] + c[2]) / 3 - cz;
    const length = Math.hypot(mx, my, mz) || 1;
    pushTriangle(positions, normals, a, b, c, [mx / length, my / length, mz / length]);
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
}

/** 축 정렬 박스 1개를 위치/법선 배열에 추가한다 — 6면 × 2삼각형, 면 단위 법선. */
function pushBox(
  positions: number[],
  normals: number[],
  center: Vec3,
  size: Vec3,
): void {
  const [cx, cy, cz] = center;
  const [hx, hy, hz] = [size[0] / 2, size[1] / 2, size[2] / 2];
  // 면 정의 — [법선, 사각형 네 꼭짓점(법선 기준 CCW)]
  const faces: Array<[Vec3, Vec3, Vec3, Vec3, Vec3]> = [
    // +X / −X
    [[1, 0, 0], [cx + hx, cy - hy, cz - hz], [cx + hx, cy + hy, cz - hz], [cx + hx, cy + hy, cz + hz], [cx + hx, cy - hy, cz + hz]],
    [[-1, 0, 0], [cx - hx, cy - hy, cz + hz], [cx - hx, cy + hy, cz + hz], [cx - hx, cy + hy, cz - hz], [cx - hx, cy - hy, cz - hz]],
    // +Y / −Y
    [[0, 1, 0], [cx - hx, cy + hy, cz - hz], [cx - hx, cy + hy, cz + hz], [cx + hx, cy + hy, cz + hz], [cx + hx, cy + hy, cz - hz]],
    [[0, -1, 0], [cx - hx, cy - hy, cz + hz], [cx - hx, cy - hy, cz - hz], [cx + hx, cy - hy, cz - hz], [cx + hx, cy - hy, cz + hz]],
    // +Z / −Z
    [[0, 0, 1], [cx - hx, cy - hy, cz + hz], [cx + hx, cy - hy, cz + hz], [cx + hx, cy + hy, cz + hz], [cx - hx, cy + hy, cz + hz]],
    [[0, 0, -1], [cx + hx, cy - hy, cz - hz], [cx - hx, cy - hy, cz - hz], [cx - hx, cy + hy, cz - hz], [cx + hx, cy + hy, cz - hz]],
  ];
  for (const [normal, a, b, c, d] of faces) {
    pushTriangle(positions, normals, a, b, c, normal);
    pushTriangle(positions, normals, a, c, d, normal);
  }
}

/**
 * 로봇개 메시 — 박스 조합 로우폴리(몸통 + 머리 + 다리 4 + 꼬리, 총 길이 ~0.8m).
 * 원점 기준: 발바닥 y=0(노드 위치에 얹힘), forward = +X — 이동 방향 yaw는
 * patrolPath.samplePatrolPose(atan2(−dz, dx))와 mat4RotateY 규약에 맞춘다.
 * 색은 렌더 아이템 색(디자인 토큰 해석 RGB)으로 호출부가 공급한다.
 */
export function buildRobotDog(): SolidMesh {
  const positions: number[] = [];
  const normals: number[] = [];
  // 몸통 — X축 길이 방향
  pushBox(positions, normals, [0, 0.42, 0], [0.52, 0.2, 0.24]);
  // 머리 — 전방(+X) 위쪽
  pushBox(positions, normals, [0.33, 0.56, 0], [0.18, 0.16, 0.16]);
  // 주둥이 — 머리 앞 작은 박스(방향 식별용)
  pushBox(positions, normals, [0.45, 0.52, 0], [0.08, 0.06, 0.08]);
  // 다리 4개 — 발바닥 y=0
  for (const legX of [0.18, -0.18]) {
    for (const legZ of [0.09, -0.09]) {
      pushBox(positions, normals, [legX, 0.16, legZ], [0.07, 0.32, 0.07]);
    }
  }
  // 꼬리 — 후방(−X) 위쪽
  pushBox(positions, normals, [-0.32, 0.55, 0], [0.14, 0.05, 0.05]);
  return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
}

/**
 * 링크 선분 — 월드 좌표 끝점 쌍 목록을 GL_LINES 정점 배열로 직렬화한다.
 * 층간(수직) 링크도 끝점 y가 다른 선분으로 자연히 표현된다.
 */
export function buildLinkLines(segments: Array<[Vec3, Vec3]>): Float32Array {
  const positions = new Float32Array(segments.length * 6);
  segments.forEach(([a, b], index) => {
    positions.set(a, index * 6);
    positions.set(b, index * 6 + 3);
  });
  return positions;
}

/** 평면 바운딩 사각형 — buildFloorSlab 입력. */
export interface PlanBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * 층 슬래브 — 층 바운딩 사각형을 elevation 아래로 thickness만큼 깐 얇은 판.
 * 슬래브 상면이 층 elevation과 일치해 공간 프리즘이 그 위에 얹힌다.
 */
export function buildFloorSlab(
  bounds: PlanBounds,
  elevation: number,
  thickness: number,
): SolidMesh {
  const footprint: PlanPoint[] = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ];
  return buildPrism(footprint, elevation - thickness, thickness);
}
