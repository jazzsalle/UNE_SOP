/**
 * Logic 그룹 노드 템플릿 — 조건 판정(Condition), 논리 결합(AND/OR), 응답 분기(Branch)를 정의한다.
 * 논리 노드는 이벤트/조건 결과를 받아 실행 흐름을 결정하는 그래프의 판단점이다.
 */
import type { NodeTemplate } from "../types";

/** Logic 그룹 템플릿 3종 — Condition / AND-OR / Branch. */
export const LOGIC_TEMPLATES: NodeTemplate[] = [
  {
    templateId: "tpl-logic-condition",
    nodeType: "condition",
    group: "logic",
    label: "Condition",
    description: "이벤트 필드를 연산자·기준값과 비교해 True/False 조건 결과를 산출한다.",
    defaultProperties: {
      field: "severity",
      operator: ">=",
      value: "WARNING",
      expression: "",
    },
    ports: [
      { id: "in", label: "Scoped Event", direction: "input", dataType: "scoped_event", required: true },
      { id: "true_out", label: "True", direction: "output", dataType: "condition_result" },
      { id: "false_out", label: "False", direction: "output", dataType: "condition_result" },
    ],
    accentColorToken: "--color-bg-warning",
  },
  {
    templateId: "tpl-logic-and-or",
    nodeType: "condition",
    group: "logic",
    label: "AND / OR",
    description: "여러 조건 결과를 AND/OR 연산자로 결합해 하나의 조건 결과로 만든다.",
    defaultProperties: {
      compositeOperator: "AND",
    },
    ports: [
      { id: "conditions_in", label: "Conditions", direction: "input", dataType: "condition_result", required: true, multiple: true },
      { id: "result_out", label: "Result", direction: "output", dataType: "condition_result" },
    ],
    accentColorToken: "--color-bg-warning",
  },
  {
    templateId: "tpl-logic-branch",
    nodeType: "branch",
    group: "logic",
    label: "Branch",
    description: "응답 수신 여부(제한 시간 내 응답/미응답)에 따라 실행 흐름을 분기한다.",
    defaultProperties: {
      branchKind: "response",
      timeoutMinutes: 5,
    },
    ports: [
      { id: "response_in", label: "Response", direction: "input", dataType: "response", required: true },
      { id: "responded_out", label: "응답", direction: "output", dataType: "execution_flow" },
      { id: "timeout_out", label: "미응답", direction: "output", dataType: "execution_flow" },
    ],
    accentColorToken: "--color-bg-warning",
  },
];
