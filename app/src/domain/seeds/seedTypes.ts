/**
 * 도메인 시드 타입 모듈 — 도메인 템플릿 시드(완결된 SOPGraph + 샘플 EventContext) 정의와
 * 시드 노드 생성 헬퍼를 제공한다. 시드 데이터 근거: docs/design/06_seed_data.md §3~6.
 */
import type { EventContext, GraphNode, SOPGraph } from "../types";
import { createNodeFromTemplate } from "../factory";
import { getTemplate } from "../templates";

/** 시드가 지원하는 도메인 식별자 5종 — 액화수소/발전소/안전한국훈련/일반 사업장/로봇개 패트롤. */
export type SeedDomain =
  | "lh2_plant"
  | "power_plant"
  | "safety_korea_drill"
  | "general_workplace"
  | "robot_patrol";

/** 도메인 템플릿 시드 — 캔버스에 즉시 배치 가능한 SOPGraph와 시뮬레이션용 샘플 이벤트 묶음. */
export interface DomainTemplateSeed {
  seedId: string;
  name: string;
  domain: SeedDomain;
  description: string;
  graph: SOPGraph;
  sampleEvents: EventContext[];
}

/** 시드 노드 생성 시 템플릿 기본값 위에 덮어쓸 패치 — label/속성/자식/크기. */
export interface SeedNodePatch {
  label?: string;
  description?: string;
  properties?: Record<string, unknown>;
  children?: string[];
  size?: { width: number; height: number };
}

/** 모든 시드 그래프가 공유하는 고정 생성/수정 시각 — 시드 데이터 결정성을 위해 리터럴 사용. */
export const SEED_TIMESTAMP = "2026-07-05T00:00:00.000Z";

/**
 * 템플릿으로부터 시드용 GraphNode를 생성한다.
 * `createNodeFromTemplate(getTemplate(templateId)!, position, id)` 후 patch를 덮어쓴다.
 * 그룹 자식 노드의 position은 부모 그룹 기준 상대좌표로 지정한다.
 */
export function seedNode(
  templateId: string,
  id: string,
  position: { x: number; y: number },
  patch?: SeedNodePatch,
): GraphNode {
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`시드 노드 생성 실패 — 존재하지 않는 템플릿: ${templateId}`);
  }
  const node = createNodeFromTemplate(template, position, id);
  if (patch?.label !== undefined) {
    node.label = patch.label;
  }
  if (patch?.description !== undefined) {
    node.description = patch.description;
  }
  if (patch?.properties) {
    node.properties = { ...node.properties, ...patch.properties };
  }
  if (patch?.children) {
    node.children = [...patch.children];
  }
  if (patch?.size) {
    node.size = { ...patch.size };
  }
  return node;
}
