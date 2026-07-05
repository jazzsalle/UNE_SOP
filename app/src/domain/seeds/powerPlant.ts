/**
 * 발전소 모니터링 시드 — 터빈 진동 이상 대응 SOPGraph (docs/design/06_seed_data.md §4).
 * 플로우: Event → Facility(터빈실) → Equipment(터빈) → Condition(진동 임계치)
 * → SOP Group(점검/부하조정) → Role(발전부 책임자) → App Push 보고 + Board 기록.
 */
import type { SOPGraph } from "../types";
import { SEED_TIMESTAMP, seedNode, type DomainTemplateSeed } from "./seedTypes";

/** 발전소 터빈 진동 이상 대응 시드 그래프 — 노드 10개, 엣지 7개. */
const POWER_PLANT_GRAPH: SOPGraph = {
  graphId: "graph-seed-power-plant",
  name: "발전소 — 터빈 진동 이상 대응",
  description:
    "터빈 진동 이상 → 터빈실 범위 → 터빈 설비 필터 → 진동 임계치 조건 → 점검/부하조정 SOP → 책임자 보고 → 상황판 기록.",
  domain: "power_plant",
  version: "0.1.0",
  nodes: [
    seedNode("tpl-trigger-sensor-event", "seed-pp-event", { x: 0, y: 200 }, {
      label: "터빈 진동 이상",
      properties: { eventType: "TURBINE_VIBRATION", severityMin: "WARNING" },
    }),
    seedNode("tpl-scope-facility", "seed-pp-facility", { x: 280, y: 200 }, {
      label: "터빈실",
      properties: { siteId: "B00300000001AUPWR", spaceIds: ["L_B00300000001AUPWR_F01F01_BS_RM_00001"] },
    }),
    seedNode("tpl-object-equipment", "seed-pp-equipment", { x: 560, y: 200 }, {
      label: "터빈",
      properties: { assetIds: ["M_B00300000001AUPWRF01F01_MNFC_9900001"] },
    }),
    seedNode("tpl-logic-condition", "seed-pp-cond", { x: 840, y: 200 }, {
      label: "진동 임계치 초과",
      properties: { field: "vibration_mm_s", operator: ">=", value: 7.1 },
    }),
    seedNode("tpl-sop-group", "seed-pp-sop", { x: 1120, y: 120 }, {
      label: "터빈 점검/부하조정",
      properties: {
        name: "터빈 점검/부하조정",
        domain: "power_plant",
        taskIds: ["seed-pp-task-1", "seed-pp-task-2"],
      },
      children: ["seed-pp-task-1", "seed-pp-task-2"],
    }),
    // 그룹 자식 — position은 부모(seed-pp-sop) 기준 상대좌표.
    seedNode("tpl-sop-task", "seed-pp-task-1", { x: 24, y: 56 }, {
      label: "터빈 상태 점검",
      properties: {
        title: "터빈 상태 점검",
        assigneeRole: "발전운전원",
        dueMinutes: 10,
        instructions: "터빈 베어링 진동·온도를 현장 계측하고 이상 여부를 보고한다.",
      },
    }),
    seedNode("tpl-sop-task", "seed-pp-task-2", { x: 24, y: 136 }, {
      label: "부하 조정",
      properties: {
        title: "부하 조정",
        assigneeRole: "운전제어 담당",
        dueMinutes: 15,
        instructions: "진동 저감을 위해 발전 부하를 단계적으로 낮춘다.",
      },
    }),
    seedNode("tpl-people-role", "seed-pp-role", { x: 1520, y: 200 }, {
      label: "발전부 책임자",
      properties: { roleName: "발전부 책임자", department: "발전부" },
    }),
    seedNode("tpl-action-app-push", "seed-pp-push", { x: 1800, y: 200 }, {
      label: "책임자 보고",
      properties: { messageTemplate: "[발전소] 터빈 진동 이상 — 점검/부하조정 진행 중" },
    }),
    seedNode("tpl-runtime-situation-board", "seed-pp-board", { x: 1520, y: 400 }, {
      label: "전자상황판",
      properties: { boardId: "BOARD-PP-MAIN" },
    }),
  ],
  edges: [
    // 포트 id/dataType은 templates/* 정의와 일치 — edgeType은 소스 포트 dataType 기준.
    { id: "seed-pp-e1", sourceNodeId: "seed-pp-event", sourcePortId: "event_out", targetNodeId: "seed-pp-facility", targetPortId: "event_in", edgeType: "event_flow" },
    { id: "seed-pp-e2", sourceNodeId: "seed-pp-facility", sourcePortId: "scoped_out", targetNodeId: "seed-pp-equipment", targetPortId: "scoped_in", edgeType: "scope_flow" },
    { id: "seed-pp-e3", sourceNodeId: "seed-pp-equipment", sourcePortId: "scoped_out", targetNodeId: "seed-pp-cond", targetPortId: "in", edgeType: "scope_flow" },
    { id: "seed-pp-e4", sourceNodeId: "seed-pp-cond", sourcePortId: "true_out", targetNodeId: "seed-pp-sop", targetPortId: "trigger_in", edgeType: "condition_flow" },
    { id: "seed-pp-e5", sourceNodeId: "seed-pp-sop", sourcePortId: "missions_out", targetNodeId: "seed-pp-role", targetPortId: "mission_in", edgeType: "execution_flow" },
    // role.mission_out(dataType: mission) → app_push.mission_in(dataType: mission) — 타입 정합.
    { id: "seed-pp-e6", sourceNodeId: "seed-pp-role", sourcePortId: "mission_out", targetNodeId: "seed-pp-push", targetPortId: "mission_in", edgeType: "execution_flow" },
    { id: "seed-pp-e7", sourceNodeId: "seed-pp-sop", sourcePortId: "flow_out", targetNodeId: "seed-pp-board", targetPortId: "flow_in", edgeType: "execution_flow" },
  ],
  groups: [
    {
      id: "seed-pp-sop",
      label: "터빈 점검/부하조정",
      nodeIds: ["seed-pp-task-1", "seed-pp-task-2"],
    },
  ],
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

/** 발전소 도메인 템플릿 시드 — 진동 계측값을 포함한 EVT-PP-001 샘플 이벤트 제공. */
export const POWER_PLANT_SEED: DomainTemplateSeed = {
  seedId: "seed-power-plant",
  name: "발전소",
  domain: "power_plant",
  description: "발전소 터빈 진동 이상 감지·점검/부하조정·책임자 보고 시나리오.",
  graph: POWER_PLANT_GRAPH,
  sampleEvents: [
    {
      eventId: "EVT-PP-001",
      eventType: "TURBINE_VIBRATION",
      severity: "DANGER",
      occurredAt: "2026-07-05T10:00:00.000Z",
      siteId: "B00300000001AUPWR",
      spaceId: "L_B00300000001AUPWR_F01F01_BS_RM_00001",
      assetId: "M_B00300000001AUPWRF01F01_MNFC_9900001",
      source: "simulation",
      measuredValues: { vibration_mm_s: 9.4 },
    },
  ],
};
