/**
 * Scope 그룹 노드 템플릿 — 이벤트가 적용되는 공간 범위(시설/구역/대피영역)를 정의한다.
 * 스코프 노드는 `event`를 입력받아 공간 범위가 부여된 `scoped_event`를 출력한다.
 */
import type { NodeTemplate } from "../types";

/** Scope 그룹 템플릿 3종 — Facility / Zone / Evacuation Area. */
export const SCOPE_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-scope-facility",
    nodeType: "space_scope",
    group: "scope",
    label: "Facility",
    description: "이벤트 적용 범위를 시설(건물) 단위로 한정하는 공간 스코프.",
    defaultProperties: {
      scopeKind: "facility",
      siteId: "",
      spaceIds: [],
    },
    ports: [
      { id: "event_in", label: "Event", direction: "input", dataType: "event", required: true },
      { id: "scoped_out", label: "Scoped Event", direction: "output", dataType: "scoped_event" },
    ],
    accentColorToken: "--color-bg-brand",
  },
  {
    templateId: "tpl-scope-zone",
    nodeType: "space_scope",
    group: "scope",
    label: "Zone",
    description: "이벤트 적용 범위를 시설 내 특정 구역 단위로 한정하는 공간 스코프.",
    defaultProperties: {
      scopeKind: "zone",
      siteId: "",
      spaceIds: [],
    },
    ports: [
      { id: "event_in", label: "Event", direction: "input", dataType: "event", required: true },
      { id: "scoped_out", label: "Scoped Event", direction: "output", dataType: "scoped_event" },
    ],
    accentColorToken: "--color-bg-brand",
  },
  {
    templateId: "tpl-scope-evacuation-area",
    nodeType: "space_scope",
    group: "scope",
    label: "Evacuation Area",
    description: "수용 인원을 갖는 대피 영역으로 이벤트 적용 범위를 한정하는 공간 스코프.",
    defaultProperties: {
      scopeKind: "evacuation_area",
      siteId: "",
      spaceIds: [],
      capacity: 0,
    },
    ports: [
      { id: "event_in", label: "Event", direction: "input", dataType: "event", required: true },
      { id: "scoped_out", label: "Scoped Event", direction: "output", dataType: "scoped_event" },
    ],
    accentColorToken: "--color-bg-brand",
  },
];
