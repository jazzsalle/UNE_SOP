/**
 * Action 그룹 노드 템플릿 — 임무를 받아 상황전파(SMS/App Push/Broadcast)를 수행한다.
 * 액션 노드는 `mission` 입력을 받아 `notification_payload`와 `response`를 출력한다. (1차 POC에서는 Mock 전파)
 */
import type { NodeTemplate, NodePort } from "../types";

/** Action 그룹 공통 포트 — mission 입력 1개, payload/response 출력 2개. */
const ACTION_PORTS: NodePort[] = [
  { id: "mission_in", label: "Mission", direction: "input", dataType: "mission", required: true, multiple: true },
  { id: "payload_out", label: "Payload", direction: "output", dataType: "notification_payload" },
  { id: "response_out", label: "Response", direction: "output", dataType: "response" },
];

/** Action 그룹 템플릿 3종 — SMS / App Push / Broadcast. */
export const ACTION_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-action-sms",
    nodeType: "notification",
    group: "action",
    label: "SMS",
    description: "지정 대상에게 SMS 문자로 상황을 전파하는 액션(Mock 전파).",
    defaultProperties: {
      channel: "sms",
      messageTemplate: "",
      requireAck: true,
    },
    ports: [...ACTION_PORTS],
    accentColorToken: "--color-bg-info",
  },
  {
    templateId: "tpl-action-app-push",
    nodeType: "notification",
    group: "action",
    label: "App Push",
    description: "모바일 앱 푸시 알림으로 상황을 전파하는 액션.",
    defaultProperties: {
      channel: "app_push",
      messageTemplate: "",
      requireAck: true,
    },
    ports: [...ACTION_PORTS],
    accentColorToken: "--color-bg-info",
  },
  {
    templateId: "tpl-action-broadcast",
    nodeType: "notification",
    group: "action",
    label: "Broadcast",
    description: "구내방송 등 일괄 방송 채널로 상황을 전파하는 액션.",
    defaultProperties: {
      channel: "broadcast",
      messageTemplate: "",
      requireAck: false,
    },
    ports: [...ACTION_PORTS],
    accentColorToken: "--color-bg-info",
  },
];
