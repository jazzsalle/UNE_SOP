/**
 * 토폴로지 도메인 타입 — webbuilder(3D 웹 저작도구) 토폴로지 노드 export 포맷(계약 A) 호환.
 * 링크는 별도 엔티티가 아니라 각 노드의 `neighborIds`로 표현된다(순환참조 방지 직렬화 관례).
 * React/xyflow에 의존하지 않는 순수 도메인 모듈이며, 본 도구는 export된 JSON을 소비만 한다
 * (생성은 webbuilder 측 — recast-navigation 등 신규 의존성 없음, 계약 C).
 */

/** webbuilder 좌표계(three.js Y-up)의 월드 좌표 — XZ평면이 평면도, Y가 높이(m). */
export interface TopologyWorldPosition {
  x: number;
  y: number;
  z: number;
}

/** webbuilder가 정의한 노드 유형 코드 5종 — topologyplan.md 수직 연결 규칙 근거. */
export const KNOWN_NODE_TYPE_CODES = ["normal", "stair", "ramp", "escalator", "exit"] as const;

/** 알려진 노드 유형 코드 유니온 — `TopologyNodeData.nodeTypeCode`는 전방 호환을 위해 string. */
export type KnownNodeTypeCode = (typeof KNOWN_NODE_TYPE_CODES)[number];

/**
 * 토폴로지 노드 — webbuilder `exportNodes()` 출력(계약 A) 9필드.
 * floorName은 본 프로젝트 FLOOR 코드(`B01B01` 등), slabName은 공간 기본키(spaceId)로
 * 매핑한다는 가정을 따른다(계약 D).
 */
export interface TopologyNodeData {
  /** 노드 식별자 — webbuilder는 uuid, 샘플 셋은 가독 id 사용. */
  id: string;
  /** 노드 표시명(한국어). */
  displayName: string;
  /** three.js Y-up 월드 좌표(m). */
  worldPosition: TopologyWorldPosition;
  /** 자유 메타데이터 — 점검 포인트는 `{ checkpoint: true, facilityObjectCode }`. */
  metadata: Record<string, unknown>;
  /** 비상구 여부. */
  isExit: boolean;
  /** 소속 층 이름 — 노드 y가 층 elevation~elevation+층고 범위면 그 층(계약 A 층 매핑). */
  floorName: string;
  /** 소속 슬래브 이름 — 계약 D에 따라 공간 기본키(spaceId)로 매핑. */
  slabName: string;
  /** 노드 유형 코드 — `KnownNodeTypeCode` 권장, 미래 코드 수용을 위해 string. */
  nodeTypeCode: string;
  /** 이웃 노드 id 목록 — 상호 포함이면 양방향(both), 한쪽만이면 one-way. */
  neighborIds: string[];
}

/**
 * 토폴로지 셋 — 한 사이트(건물)의 노드 집합 컨테이너.
 * webbuilder export에는 셋 개념이 없어 본 프로젝트가 임포트 단위로 도입했다.
 */
export interface TopologySet {
  /** 셋 식별자 — 샘플은 고정 id, 임포트는 `topo-imported-{uuid8}`, 생성은 `topo-generated-{siteUfid}-{seed}`. */
  setId: string;
  /** 셋 표시명. */
  name: string;
  /** 대상 사이트 UFID(공간객체등록번호) — 미상이면 빈 문자열. */
  siteUfid: string;
  /** 출처 — 내장 샘플 / 사용자 임포트 / 임의 생성기(generateTopology). */
  source: "sample" | "imported" | "generated";
  /** 노드 목록. */
  nodes: TopologyNodeData[];
}

/** 노드 간 링크 — `neighborIds`에서 도출되는 파생 엔티티(deriveLinks 참조). */
export interface TopologyLink {
  sourceId: string;
  targetId: string;
  /** 상호 이웃이면 both(↔), 한쪽만 참조하면 one-way(→). */
  direction: "both" | "one-way";
  /** 두 노드의 floorName이 다르면 true — 계단/램프 등 수직 연결. */
  vertical: boolean;
}

/** 평면도 좌표(m) — 공간 스키마 footprint와 동일 좌표계. */
export interface TopologyPlanPoint {
  x: number;
  y: number;
}

/**
 * 월드 좌표 → 평면도 좌표 변환 — 계약 A: plan.x = world.x, plan.y = −world.z.
 * three.js는 Y-up 우수 좌표계라 평면도는 XZ평면이고, +Y(위)에서 내려다볼 때
 * 평면 북쪽(+plan.y)이 −Z 방향이므로 z 부호를 반전한다.
 */
export function toPlanPoint(worldPosition: TopologyWorldPosition): TopologyPlanPoint {
  return { x: worldPosition.x, y: -worldPosition.z };
}
