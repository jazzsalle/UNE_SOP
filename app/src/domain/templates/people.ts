/**
 * People 그룹 노드 템플릿 — 임무 수행 주체(역할/연락 그룹/유관기관)를 정의한다.
 * 사람 노드는 임무를 수신해 담당 주체를 지정한 뒤 다시 임무로 내보내는 배정점이다.
 */
import type { NodeTemplate } from "../types";

/** People 그룹 템플릿 3종 — Role / Contact Group / Agency. */
export const PEOPLE_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-people-role",
    nodeType: "role",
    group: "people",
    label: "Role",
    description: "부서 내 특정 직책(역할)에게 임무를 배정하는 수행 주체.",
    defaultProperties: {
      roleKind: "role",
      roleName: "",
      department: "",
    },
    ports: [
      { id: "mission_in", label: "Missions", direction: "input", dataType: "mission", required: true, multiple: true },
      { id: "mission_out", label: "Mission", direction: "output", dataType: "mission" },
    ],
    accentColorToken: "--color-bg-info",
  },
  {
    templateId: "tpl-people-contact-group",
    nodeType: "role",
    group: "people",
    label: "Contact Group",
    description: "여러 구성원을 하나의 연락 그룹으로 묶어 임무를 배정하는 수행 주체.",
    defaultProperties: {
      roleKind: "contact_group",
      groupName: "",
      members: [],
    },
    ports: [
      { id: "mission_in", label: "Missions", direction: "input", dataType: "mission", required: true, multiple: true },
      { id: "mission_out", label: "Mission", direction: "output", dataType: "mission" },
    ],
    accentColorToken: "--color-bg-info",
  },
  {
    templateId: "tpl-people-agency",
    nodeType: "role",
    group: "people",
    label: "Agency",
    description: "소방서·경찰 등 외부 유관기관에 임무를 배정하는 수행 주체.",
    defaultProperties: {
      roleKind: "agency",
      agencyName: "",
      contactNumber: "",
    },
    ports: [
      { id: "mission_in", label: "Missions", direction: "input", dataType: "mission", required: true, multiple: true },
      { id: "mission_out", label: "Mission", direction: "output", dataType: "mission" },
    ],
    accentColorToken: "--color-bg-info",
  },
];
