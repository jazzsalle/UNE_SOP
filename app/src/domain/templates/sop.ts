/**
 * SOP 그룹 노드 템플릿 — 개별 임무(SOP Task), 임무 묶음(SOP Group), 점검표(Checklist)를 정의한다.
 * SOP 노드는 실행 흐름/조건 결과를 받아 임무와 임무 상태를 산출하는 그래프의 실행 단위다.
 */
import type { NodeTemplate } from "../types";

/** SOP 그룹 템플릿 3종 — SOP Task / SOP Group / Checklist. */
export const SOP_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-sop-task",
    nodeType: "sop_task",
    group: "sop",
    label: "SOP Task",
    description: "담당 역할에게 지시사항과 제한 시간을 부여하는 개별 임무 단위.",
    defaultProperties: {
      title: "",
      assigneeRole: "",
      dueMinutes: 10,
      instructions: "",
      taskKind: "task",
    },
    ports: [
      { id: "trigger_in", label: "Trigger", direction: "input", dataType: "execution_flow", required: true },
      { id: "mission_out", label: "Mission", direction: "output", dataType: "mission" },
      { id: "status_out", label: "Status", direction: "output", dataType: "mission_status" },
    ],
    accentColorToken: "--color-bg-brand",
  },
  {
    templateId: "tpl-sop-group",
    nodeType: "sop_group",
    group: "sop",
    label: "SOP Group",
    description: "여러 SOP 임무를 접기/펼치기 가능한 하나의 절차 묶음으로 관리한다.",
    defaultProperties: {
      name: "",
      domain: "generic_safety",
      taskIds: [],
    },
    ports: [
      { id: "trigger_in", label: "Trigger", direction: "input", dataType: "condition_result", required: true },
      { id: "missions_out", label: "Missions", direction: "output", dataType: "mission", multiple: true },
      { id: "flow_out", label: "Flow", direction: "output", dataType: "execution_flow" },
      { id: "status_out", label: "Status", direction: "output", dataType: "mission_status" },
    ],
    accentColorToken: "--color-bg-brand",
    defaultSize: { width: 320, height: 220 },
  },
  {
    templateId: "tpl-sop-checklist",
    nodeType: "sop_task",
    group: "sop",
    label: "Checklist",
    description: "항목별 확인 결과를 기록으로 남기는 점검표형 임무 단위.",
    defaultProperties: {
      title: "",
      items: [],
      assigneeRole: "",
      taskKind: "checklist",
    },
    ports: [
      { id: "trigger_in", label: "Trigger", direction: "input", dataType: "execution_flow", required: true },
      { id: "status_out", label: "Status", direction: "output", dataType: "mission_status" },
      { id: "record_out", label: "Record", direction: "output", dataType: "record" },
    ],
    accentColorToken: "--color-bg-brand",
  },
];
