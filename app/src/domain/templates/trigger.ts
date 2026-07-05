/**
 * Trigger 그룹 노드 템플릿 — 이벤트 발생원(센서/수동 신고/AI 탐지)을 정의한다.
 * 트리거 노드는 입력 포트 없이 `event` 출력 포트만 갖는 그래프의 시작점이다.
 */
import type { NodeTemplate } from "../types";

/** Trigger 그룹 템플릿 3종 — Sensor Event / Manual Report / AI Detection. */
export const TRIGGER_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-trigger-sensor-event",
    nodeType: "event",
    group: "trigger",
    label: "Sensor Event",
    description: "센서 계측값 기반으로 발생하는 이벤트 트리거.",
    defaultProperties: {
      source: "sensor",
      eventType: "",
      severityMin: "INFO",
    },
    ports: [
      { id: "event_out", label: "Event", direction: "output", dataType: "event" },
    ],
    accentColorToken: "--color-bg-danger",
  },
  {
    templateId: "tpl-trigger-manual-report",
    nodeType: "event",
    group: "trigger",
    label: "Manual Report",
    description: "현장 인원의 수동 신고로 발생하는 이벤트 트리거.",
    defaultProperties: {
      source: "manual",
      eventType: "",
      reporterChannel: "phone",
    },
    ports: [
      { id: "event_out", label: "Event", direction: "output", dataType: "event" },
    ],
    accentColorToken: "--color-bg-danger",
  },
  {
    templateId: "tpl-trigger-ai-detection",
    nodeType: "event",
    group: "trigger",
    label: "AI Detection",
    description: "AI 모델 탐지 결과(신뢰도 임계값 이상)로 발생하는 이벤트 트리거.",
    defaultProperties: {
      source: "ai",
      eventType: "",
      model: "",
      confidenceThreshold: 0.8,
    },
    ports: [
      { id: "event_out", label: "Event", direction: "output", dataType: "event" },
    ],
    accentColorToken: "--color-bg-danger",
  },
];
