/**
 * Object 그룹 노드 템플릿 — 스코프 내 대상 자산(센서/설비/CCTV/밸브)을 필터링한다.
 * 객체 노드는 `scoped_event`를 입력받아 스코프 흐름을 통과시키고 `asset` 목록을 출력한다.
 */
import type { NodeTemplate } from "../types";

/** Object 그룹 템플릿 4종 — Sensor / Equipment / CCTV / Valve. */
export const OBJECT_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-object-sensor",
    nodeType: "asset_filter",
    group: "object",
    label: "Sensor",
    description: "스코프 내 센서 자산을 조건식으로 필터링하는 객체 노드.",
    defaultProperties: {
      assetKind: "sensor",
      assetIds: [],
      filterExpression: "",
    },
    ports: [
      { id: "scoped_in", label: "Scoped Event", direction: "input", dataType: "scoped_event", required: true },
      { id: "scoped_out", label: "Scoped Event", direction: "output", dataType: "scoped_event" },
      { id: "assets_out", label: "Assets", direction: "output", dataType: "asset", multiple: true },
    ],
    accentColorToken: "--color-bg-neutral",
  },
  {
    templateId: "tpl-object-equipment",
    nodeType: "asset_filter",
    group: "object",
    label: "Equipment",
    description: "스코프 내 설비 자산을 조건식으로 필터링하는 객체 노드.",
    defaultProperties: {
      assetKind: "equipment",
      assetIds: [],
      filterExpression: "",
    },
    ports: [
      { id: "scoped_in", label: "Scoped Event", direction: "input", dataType: "scoped_event", required: true },
      { id: "scoped_out", label: "Scoped Event", direction: "output", dataType: "scoped_event" },
      { id: "assets_out", label: "Assets", direction: "output", dataType: "asset", multiple: true },
    ],
    accentColorToken: "--color-bg-neutral",
  },
  {
    templateId: "tpl-object-cctv",
    nodeType: "asset_filter",
    group: "object",
    label: "CCTV",
    description: "스코프 내 CCTV 자산을 선택하고 스트림 URL을 연결하는 객체 노드.",
    defaultProperties: {
      assetKind: "cctv",
      assetIds: [],
      streamUrl: "",
    },
    ports: [
      { id: "scoped_in", label: "Scoped Event", direction: "input", dataType: "scoped_event", required: true },
      { id: "scoped_out", label: "Scoped Event", direction: "output", dataType: "scoped_event" },
      { id: "assets_out", label: "Assets", direction: "output", dataType: "asset", multiple: true },
    ],
    accentColorToken: "--color-bg-neutral",
  },
  {
    templateId: "tpl-object-valve",
    nodeType: "asset_filter",
    group: "object",
    label: "Valve",
    description: "스코프 내 밸브 자산을 선택하고 기본 동작(차단 등)을 지정하는 객체 노드.",
    defaultProperties: {
      assetKind: "valve",
      assetIds: [],
      defaultAction: "close",
    },
    ports: [
      { id: "scoped_in", label: "Scoped Event", direction: "input", dataType: "scoped_event", required: true },
      { id: "scoped_out", label: "Scoped Event", direction: "output", dataType: "scoped_event" },
      { id: "assets_out", label: "Assets", direction: "output", dataType: "asset", multiple: true },
    ],
    accentColorToken: "--color-bg-neutral",
  },
];
