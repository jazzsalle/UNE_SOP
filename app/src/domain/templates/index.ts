/**
 * 노드 템플릿 레지스트리 — 9개 그룹 템플릿을 단일 목록으로 집계하고 조회 헬퍼를 제공한다.
 * 그룹 순서는 팔레트 표시 순서(Trigger → Scope → Object → Logic → SOP → People → Action → Runtime → Record)를 따른다.
 */
import type { NodeTemplate, NodeTemplateGroup, NodeType } from "../types";
import { TRIGGER_TEMPLATES } from "./trigger";
import { SCOPE_TEMPLATES } from "./scope";
import { OBJECT_TEMPLATES } from "./object";
import { LOGIC_TEMPLATES } from "./logic";
import { SOP_TEMPLATES } from "./sop";
import { PEOPLE_TEMPLATES } from "./people";
import { ACTION_TEMPLATES } from "./action";
import { RUNTIME_TEMPLATES } from "./runtime";
import { RECORD_TEMPLATES } from "./record";

export {
  TRIGGER_TEMPLATES,
  SCOPE_TEMPLATES,
  OBJECT_TEMPLATES,
  LOGIC_TEMPLATES,
  SOP_TEMPLATES,
  PEOPLE_TEMPLATES,
  ACTION_TEMPLATES,
  RUNTIME_TEMPLATES,
  RECORD_TEMPLATES,
};

/** 전체 노드 템플릿 28종 — 팔레트 표시 순서대로 평탄화한 단일 레지스트리. */
export const NODE_TEMPLATES: NodeTemplate[] = [
  ...TRIGGER_TEMPLATES,
  ...SCOPE_TEMPLATES,
  ...OBJECT_TEMPLATES,
  ...LOGIC_TEMPLATES,
  ...SOP_TEMPLATES,
  ...PEOPLE_TEMPLATES,
  ...ACTION_TEMPLATES,
  ...RUNTIME_TEMPLATES,
  ...RECORD_TEMPLATES,
];

/** 팔레트 그룹 단위 목록 — 그룹 식별자, 표시 라벨, 소속 템플릿을 묶어 제공한다. */
export const TEMPLATE_GROUPS: {
  group: NodeTemplateGroup;
  label: string;
  templates: NodeTemplate[];
}[] = [
  { group: "trigger", label: "Trigger", templates: TRIGGER_TEMPLATES },
  { group: "scope", label: "Scope", templates: SCOPE_TEMPLATES },
  { group: "object", label: "Object", templates: OBJECT_TEMPLATES },
  { group: "logic", label: "Logic", templates: LOGIC_TEMPLATES },
  { group: "sop", label: "SOP", templates: SOP_TEMPLATES },
  { group: "people", label: "People", templates: PEOPLE_TEMPLATES },
  { group: "action", label: "Action", templates: ACTION_TEMPLATES },
  { group: "runtime", label: "Runtime", templates: RUNTIME_TEMPLATES },
  { group: "record", label: "Record", templates: RECORD_TEMPLATES },
];

/** templateId로 템플릿을 조회한다. 없으면 undefined. */
export function getTemplate(templateId: string): NodeTemplate | undefined {
  return NODE_TEMPLATES.find((template) => template.templateId === templateId);
}

/** 특정 NodeType에 해당하는 템플릿 목록을 조회한다. */
export function getTemplatesByType(type: NodeType): NodeTemplate[] {
  return NODE_TEMPLATES.filter((template) => template.nodeType === type);
}
