/**
 * Record 그룹 노드 템플릿 — 실행 증적, 종료보고, 이력 보관을 담당한다.
 * 기록 노드는 `execution_flow` 또는 `record`를 받아 `record`를 출력한다.
 */
import type { NodeTemplate } from "../types";

/** Record 그룹 템플릿 3종 — Evidence / Report / History. */
export const RECORD_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-record-evidence",
    nodeType: "evidence",
    group: "record",
    label: "Evidence",
    description: "현장 조치 증적(사진 등)을 수집·기록하는 노드.",
    defaultProperties: {
      recordKind: "evidence",
      mediaTypes: ["photo"],
    },
    ports: [
      { id: "flow_in", label: "Flow", direction: "input", dataType: "execution_flow", multiple: true },
      { id: "record_out", label: "Record", direction: "output", dataType: "record" },
    ],
    accentColorToken: "--color-bg-neutral",
  },
  {
    templateId: "tpl-record-report",
    nodeType: "evidence",
    group: "record",
    label: "Report",
    description: "수집된 기록을 취합해 종료보고서를 생성하는 노드.",
    defaultProperties: {
      recordKind: "report",
      template: "종료보고",
    },
    ports: [
      { id: "record_in", label: "Record", direction: "input", dataType: "record", multiple: true },
      { id: "record_out", label: "Record", direction: "output", dataType: "record" },
    ],
    accentColorToken: "--color-bg-neutral",
  },
  {
    templateId: "tpl-record-history",
    nodeType: "evidence",
    group: "record",
    label: "History",
    description: "실행 이력을 보존 기간 동안 보관하는 이력 저장 노드.",
    defaultProperties: {
      recordKind: "history",
      retentionDays: 90,
    },
    ports: [
      { id: "record_in", label: "Record", direction: "input", dataType: "record", multiple: true },
      { id: "record_out", label: "Record", direction: "output", dataType: "record" },
    ],
    accentColorToken: "--color-bg-neutral",
  },
];
