/**
 * 일반 사업장 안전 시드 — 작업자 쓰러짐 응급대응 SOPGraph (docs/design/06_seed_data.md §6).
 * 플로우: Manual Report → Zone(작업구역) → CCTV 확인 → Condition(WARNING 이상)
 * → SOP Group(응급조치) → Agency(119) / SMS(관리자 전파) 두 갈래 전파 + Board 기록.
 */
import type { SOPGraph } from "../types";
import { SEED_TIMESTAMP, seedNode, type DomainTemplateSeed } from "./seedTypes";

/** 일반 사업장 작업자 쓰러짐 응급대응 시드 그래프 — 노드 10개, 엣지 7개. */
const GENERAL_WORKPLACE_GRAPH: SOPGraph = {
  graphId: "graph-seed-general-workplace",
  name: "일반 사업장 — 작업자 쓰러짐 응급대응",
  description:
    "작업자 쓰러짐 신고 → 작업구역 범위 → CCTV 확인 → 위험도 조건 → 응급조치 SOP → 119/관리자 전파 → 상황판 기록.",
  domain: "general_workplace",
  version: "0.1.0",
  nodes: [
    seedNode("tpl-trigger-manual-report", "seed-gw-event", { x: 0, y: 200 }, {
      label: "작업자 쓰러짐 신고",
      properties: { eventType: "WORKER_DOWN" },
    }),
    seedNode("tpl-scope-zone", "seed-gw-zone", { x: 280, y: 200 }, {
      label: "작업구역",
      properties: { siteId: "B00500000001AUWRK", spaceIds: ["L_B00500000001AUWRK_F01F01_BS_RM_00001"] },
    }),
    seedNode("tpl-object-cctv", "seed-gw-cctv", { x: 560, y: 200 }, {
      label: "현장 CCTV",
      properties: { assetIds: ["M_B00500000001AUWRKF01F01_SFFC_0200001"], streamUrl: "mock://cctv-07" },
    }),
    seedNode("tpl-logic-condition", "seed-gw-cond", { x: 840, y: 200 }, {
      label: "위험도 WARNING 이상",
      properties: { field: "severity", operator: ">=", value: "WARNING" },
    }),
    seedNode("tpl-sop-group", "seed-gw-sop", { x: 1120, y: 120 }, {
      label: "응급조치",
      properties: {
        name: "응급조치",
        domain: "general_workplace",
        taskIds: ["seed-gw-task-1", "seed-gw-task-2"],
      },
      children: ["seed-gw-task-1", "seed-gw-task-2"],
    }),
    // 그룹 자식 — position은 부모(seed-gw-sop) 기준 상대좌표.
    seedNode("tpl-sop-task", "seed-gw-task-1", { x: 24, y: 56 }, {
      label: "응급처치",
      properties: {
        title: "응급처치",
        assigneeRole: "보건관리자",
        dueMinutes: 5,
        instructions: "쓰러진 작업자의 의식·호흡을 확인하고 응급처치를 시행한다.",
      },
    }),
    seedNode("tpl-sop-task", "seed-gw-task-2", { x: 24, y: 136 }, {
      label: "작업중지",
      properties: {
        title: "작업중지",
        assigneeRole: "작업반장",
        dueMinutes: 5,
        instructions: "해당 구역 작업을 즉시 중지하고 접근을 통제한다.",
      },
    }),
    seedNode("tpl-people-agency", "seed-gw-agency", { x: 1520, y: 140 }, {
      label: "119",
      properties: { agencyName: "119 구급대", contactNumber: "119" },
    }),
    seedNode("tpl-action-sms", "seed-gw-sms", { x: 1520, y: 300 }, {
      label: "관리자 전파",
      properties: { messageTemplate: "[사업장] 작업자 쓰러짐 — 응급조치 진행 중" },
    }),
    seedNode("tpl-runtime-situation-board", "seed-gw-board", { x: 1800, y: 220 }, {
      label: "전자상황판",
      properties: { boardId: "BOARD-GW-MAIN" },
    }),
  ],
  edges: [
    // 포트 id/dataType은 templates/* 정의와 일치 — edgeType은 소스 포트 dataType 기준.
    { id: "seed-gw-e1", sourceNodeId: "seed-gw-event", sourcePortId: "event_out", targetNodeId: "seed-gw-zone", targetPortId: "event_in", edgeType: "event_flow" },
    { id: "seed-gw-e2", sourceNodeId: "seed-gw-zone", sourcePortId: "scoped_out", targetNodeId: "seed-gw-cctv", targetPortId: "scoped_in", edgeType: "scope_flow" },
    { id: "seed-gw-e3", sourceNodeId: "seed-gw-cctv", sourcePortId: "scoped_out", targetNodeId: "seed-gw-cond", targetPortId: "in", edgeType: "scope_flow" },
    { id: "seed-gw-e4", sourceNodeId: "seed-gw-cond", sourcePortId: "true_out", targetNodeId: "seed-gw-sop", targetPortId: "trigger_in", edgeType: "condition_flow" },
    // sop_group.missions_out(mission, multiple) → agency/sms 두 갈래 병렬 전파.
    { id: "seed-gw-e5", sourceNodeId: "seed-gw-sop", sourcePortId: "missions_out", targetNodeId: "seed-gw-agency", targetPortId: "mission_in", edgeType: "execution_flow" },
    { id: "seed-gw-e6", sourceNodeId: "seed-gw-sop", sourcePortId: "missions_out", targetNodeId: "seed-gw-sms", targetPortId: "mission_in", edgeType: "execution_flow" },
    { id: "seed-gw-e7", sourceNodeId: "seed-gw-sop", sourcePortId: "flow_out", targetNodeId: "seed-gw-board", targetPortId: "flow_in", edgeType: "execution_flow" },
  ],
  groups: [
    {
      id: "seed-gw-sop",
      label: "응급조치",
      nodeIds: ["seed-gw-task-1", "seed-gw-task-2"],
    },
  ],
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

/** 일반 사업장 도메인 템플릿 시드 — 작업자 쓰러짐 EVT-GW-001 샘플 이벤트 제공. */
export const GENERAL_WORKPLACE_SEED: DomainTemplateSeed = {
  seedId: "seed-general-workplace",
  name: "일반 사업장",
  domain: "general_workplace",
  description: "일반 사업장 작업자 쓰러짐 신고·응급조치·119/관리자 전파 시나리오.",
  graph: GENERAL_WORKPLACE_GRAPH,
  sampleEvents: [
    {
      eventId: "EVT-GW-001",
      eventType: "WORKER_DOWN",
      severity: "DANGER",
      occurredAt: "2026-07-05T11:00:00.000Z",
      siteId: "B00500000001AUWRK",
      spaceId: "L_B00500000001AUWRK_F01F01_BS_RM_00001",
      assetId: "M_B00500000001AUWRKF01F01_SFFC_0200001",
      source: "simulation",
    },
  ],
};
