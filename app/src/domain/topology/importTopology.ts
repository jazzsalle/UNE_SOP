/**
 * 토폴로지 JSON 임포트 파서 — webbuilder export 3형태(① 노드 bare 배열,
 * ② `{ topologyNodes: [...] }`, ③ gltf 직렬화 `{ extras: { topologyNodes } }` /
 * `{ userData: { topologyNodes } }`)를 수용해 `TopologyNodeData[]`로 정규화한다.
 * 필수 필드(id/worldPosition/neighborIds) 위반과 중복 id는 errors로 거부하고,
 * 미존재 노드를 가리키는 neighborIds는 경고(warnings)와 함께 제거한다.
 */

import type { TopologyNodeData, TopologyWorldPosition } from "./topologyTypes";

/** 파싱 성공 결과 — 정규화된 노드와 비치명 경고(제거된 이웃 참조 등). */
export interface ParseTopologySuccess {
  nodes: TopologyNodeData[];
  warnings: string[];
}

/** 파싱 실패 결과 — JSON 파손·필수 필드 위반·중복 id 등 치명 오류 목록. */
export interface ParseTopologyFailure {
  errors: string[];
}

export type ParseTopologyResult = ParseTopologySuccess | ParseTopologyFailure;

/** 파싱 결과가 실패인지 판별하는 타입 가드. */
export function isParseTopologyFailure(
  result: ParseTopologyResult,
): result is ParseTopologyFailure {
  return "errors" in result;
}

/** 값이 plain object(배열 제외)인지 판정한다. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** 유한 숫자인지 판정한다 — worldPosition 좌표 검증용. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * 파싱된 JSON에서 노드 배열 후보를 추출한다 — 3형태 수용.
 * ① bare 배열 ② `{topologyNodes}` ③ `{extras:{topologyNodes}}` / `{userData:{topologyNodes}}`.
 * 어느 형태에도 해당하지 않으면 null.
 */
function extractNodeArray(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (!isRecord(parsed)) return null;
  if (Array.isArray(parsed.topologyNodes)) return parsed.topologyNodes;
  for (const key of ["extras", "userData"] as const) {
    const nested = parsed[key];
    if (isRecord(nested) && Array.isArray(nested.topologyNodes)) return nested.topologyNodes;
  }
  return null;
}

/**
 * 원시 항목 1건을 TopologyNodeData로 정규화한다 — 필수 필드 위반 시 errors에 축적하고 null.
 * 선택 필드 기본값: displayName=id, metadata={}, isExit=false, floorName/slabName="",
 * nodeTypeCode="normal"(webbuilder 수동 생성 관례).
 */
function normalizeNode(raw: unknown, index: number, errors: string[]): TopologyNodeData | null {
  const label = `노드[${index}]`;
  if (!isRecord(raw)) {
    errors.push(`${label}: 객체가 아닙니다.`);
    return null;
  }
  const id = raw.id;
  if (typeof id !== "string" || id.trim() === "") {
    errors.push(`${label}: 필수 필드 id가 비어 있거나 문자열이 아닙니다.`);
    return null;
  }
  const pos = raw.worldPosition;
  if (!isRecord(pos) || !isFiniteNumber(pos.x) || !isFiniteNumber(pos.y) || !isFiniteNumber(pos.z)) {
    errors.push(`${label}(id="${id}"): 필수 필드 worldPosition{x,y,z}가 유효한 숫자가 아닙니다.`);
    return null;
  }
  const neighborIds = raw.neighborIds;
  if (!Array.isArray(neighborIds) || neighborIds.some((n) => typeof n !== "string")) {
    errors.push(`${label}(id="${id}"): 필수 필드 neighborIds가 문자열 배열이 아닙니다.`);
    return null;
  }
  const worldPosition: TopologyWorldPosition = { x: pos.x, y: pos.y, z: pos.z };
  return {
    id,
    displayName: typeof raw.displayName === "string" && raw.displayName !== "" ? raw.displayName : id,
    worldPosition,
    metadata: isRecord(raw.metadata) ? raw.metadata : {},
    isExit: typeof raw.isExit === "boolean" ? raw.isExit : false,
    floorName: typeof raw.floorName === "string" ? raw.floorName : "",
    slabName: typeof raw.slabName === "string" ? raw.slabName : "",
    nodeTypeCode: typeof raw.nodeTypeCode === "string" && raw.nodeTypeCode !== "" ? raw.nodeTypeCode : "normal",
    neighborIds: neighborIds as string[],
  };
}

/**
 * webbuilder export JSON 문자열을 파싱해 토폴로지 노드 목록으로 정규화한다.
 * 치명 오류(파손 JSON/형태 불일치/필수 필드 위반/중복 id)가 하나라도 있으면 `{ errors }`,
 * 아니면 `{ nodes, warnings }`를 반환한다(미존재 neighborIds 제거는 경고).
 */
export function parseTopologyNodes(json: string): ParseTopologyResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (cause) {
    return { errors: [`JSON 파싱 실패: ${cause instanceof Error ? cause.message : String(cause)}`] };
  }

  const rawNodes = extractNodeArray(parsed);
  if (rawNodes === null) {
    return {
      errors: [
        "지원하지 않는 형태입니다 — 노드 배열, {topologyNodes}, {extras|userData:{topologyNodes}} 중 하나여야 합니다.",
      ],
    };
  }
  if (rawNodes.length === 0) {
    return { errors: ["토폴로지 노드가 0개입니다."] };
  }

  const errors: string[] = [];
  const nodes: TopologyNodeData[] = [];
  const seenIds = new Set<string>();
  rawNodes.forEach((raw, index) => {
    const node = normalizeNode(raw, index, errors);
    if (!node) return;
    if (seenIds.has(node.id)) {
      errors.push(`노드[${index}]: 중복 id "${node.id}" — id는 셋 안에서 유일해야 합니다.`);
      return;
    }
    seenIds.add(node.id);
    nodes.push(node);
  });
  if (errors.length > 0) return { errors };

  // 미존재 노드를 가리키는 이웃 참조는 경고와 함께 제거한다(부분 export 허용).
  const warnings: string[] = [];
  const idSet = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    const kept = node.neighborIds.filter((neighborId) => {
      if (idSet.has(neighborId)) return true;
      warnings.push(`노드 "${node.id}": 존재하지 않는 이웃 "${neighborId}" 참조를 제거했습니다.`);
      return false;
    });
    node.neighborIds = kept;
  }
  return { nodes, warnings };
}
