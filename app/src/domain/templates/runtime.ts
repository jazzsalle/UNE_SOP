/**
 * Runtime 그룹 노드 템플릿 — 실행 중 상황판 기록, 타이머 대기, 에스컬레이션을 담당한다.
 * 런타임 노드는 `execution_flow`를 받아 기록/경과/재전파 흐름을 만들어낸다.
 */
import type { NodeTemplate } from "../types";

/** Runtime 그룹 템플릿 3종 — Situation Board / Timer / Escalation. */
export const RUNTIME_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-runtime-situation-board",
    nodeType: "situation_board",
    group: "runtime",
    label: "Situation Board",
    description: "장소·시간·임무내용·상황전파를 기록하는 전자상황판 노드.",
    defaultProperties: {
      boardId: "",
      recordFields: ["장소", "시간", "임무내용", "상황전파"],
    },
    ports: [
      { id: "flow_in", label: "Flow", direction: "input", dataType: "execution_flow", multiple: true },
      { id: "record_in", label: "Record", direction: "input", dataType: "record", multiple: true },
      { id: "record_out", label: "Record", direction: "output", dataType: "record" },
    ],
    accentColorToken: "--color-bg-warning",
  },
  {
    templateId: "tpl-runtime-timer",
    nodeType: "timer",
    group: "runtime",
    label: "Timer",
    description: "지정 시간(분)만큼 대기하거나 타임아웃을 감시하는 타이머 노드.",
    defaultProperties: {
      durationMinutes: 5,
      mode: "timeout",
    },
    ports: [
      { id: "flow_in", label: "Flow", direction: "input", dataType: "execution_flow", required: true },
      { id: "elapsed_out", label: "경과", direction: "output", dataType: "execution_flow" },
    ],
    accentColorToken: "--color-bg-warning",
  },
  {
    templateId: "tpl-runtime-escalation",
    nodeType: "escalation",
    group: "runtime",
    label: "Escalation",
    description: "미조치 시 상위 역할에게 지정 채널로 재전파(에스컬레이션)하는 노드.",
    defaultProperties: {
      escalateToRole: "",
      channel: "sms",
      maxRetries: 1,
    },
    ports: [
      { id: "flow_in", label: "Flow", direction: "input", dataType: "execution_flow", required: true },
      { id: "payload_out", label: "Payload", direction: "output", dataType: "notification_payload" },
      { id: "flow_out", label: "Flow", direction: "output", dataType: "execution_flow" },
    ],
    accentColorToken: "--color-bg-warning",
  },
];
