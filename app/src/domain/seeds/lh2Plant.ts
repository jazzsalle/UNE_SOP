/**
 * 액화수소 플랜트 시드 — 가스누출 초동대응 SOPGraph (docs/design/06_seed_data.md §3).
 * 승인 기준 플로우 전체 포함:
 * Event → Space Scope(Zone) → Asset Filter(Sensor) → Condition → SOP Group(자식 task 2)
 * → Notification(SMS) → Branch → Situation Board (+ timeout 시 Escalation → Board).
 */
import type { SOPGraph } from "../types";
import { SEED_TIMESTAMP, seedNode, type DomainTemplateSeed } from "./seedTypes";

/** 액화수소 플랜트 가스누출 초동대응 시드 그래프 — 노드 11개, 엣지 10개. */
const LH2_GRAPH: SOPGraph = {
  graphId: "graph-seed-lh2",
  name: "액화수소 플랜트 — 가스누출 초동대응",
  description:
    "가스누출 감지 → 저장구역 범위 → 수소센서 필터 → 위험도 조건 → 초동대응 SOP → SMS 전파 → 응답 분기 → 상황판 기록 (미응답 시 상향 전파).",
  domain: "lh2_plant",
  version: "0.1.0",
  nodes: [
    seedNode("tpl-trigger-sensor-event", "seed-lh2-event", { x: 0, y: 200 }, {
      label: "가스누출 감지",
      properties: { eventType: "GAS_LEAK", severityMin: "WARNING" },
    }),
    seedNode("tpl-scope-zone", "seed-lh2-zone", { x: 280, y: 200 }, {
      label: "저장구역",
      properties: { siteId: "B00200000001AULH2", spaceIds: ["L_B00200000001AULH2_F01F01_BS_RM_00001"] },
    }),
    seedNode("tpl-object-sensor", "seed-lh2-sensor", { x: 560, y: 200 }, {
      label: "수소센서",
      properties: { assetIds: ["M_B00200000001AULH2F01F01_SFFC_9900001"] },
    }),
    seedNode("tpl-logic-condition", "seed-lh2-cond", { x: 840, y: 200 }, {
      label: "위험도 WARNING 이상",
      properties: { field: "severity", operator: ">=", value: "WARNING" },
    }),
    seedNode("tpl-sop-group", "seed-lh2-sop", { x: 1120, y: 120 }, {
      label: "가스누출 초동대응",
      properties: {
        name: "가스누출 초동대응",
        domain: "lh2_plant",
        taskIds: ["seed-lh2-task-1", "seed-lh2-task-2"],
      },
      children: ["seed-lh2-task-1", "seed-lh2-task-2"],
    }),
    // 그룹 자식 — position은 부모(seed-lh2-sop) 기준 상대좌표.
    seedNode("tpl-sop-task", "seed-lh2-task-1", { x: 24, y: 56 }, {
      label: "현장 상황 확인",
      properties: {
        title: "현장 상황 확인",
        assigneeRole: "현장 안전관리자",
        dueMinutes: 5,
        instructions: "누출 지점과 주변 인원 상황을 확인하고 보고한다.",
      },
    }),
    seedNode("tpl-sop-task", "seed-lh2-task-2", { x: 24, y: 136 }, {
      label: "밸브 차단",
      properties: {
        title: "밸브 차단",
        assigneeRole: "설비 담당",
        dueMinutes: 10,
        instructions: "저장구역 공급 밸브를 차단하고 차단 상태를 보고한다.",
      },
    }),
    seedNode("tpl-action-sms", "seed-lh2-sms", { x: 1520, y: 200 }, {
      label: "SMS 전파",
      properties: { messageTemplate: "[LH2] 가스누출 감지 — 즉시 확인 요망" },
    }),
    seedNode("tpl-logic-branch", "seed-lh2-branch", { x: 1800, y: 200 }, {
      label: "응답 분기",
      properties: { timeoutMinutes: 5 },
    }),
    seedNode("tpl-runtime-situation-board", "seed-lh2-board", { x: 2360, y: 160 }, {
      label: "전자상황판",
      properties: { boardId: "BOARD-LH2-MAIN" },
    }),
    seedNode("tpl-runtime-escalation", "seed-lh2-esc", { x: 2080, y: 360 }, {
      label: "상향 전파",
      properties: { escalateToRole: "통합방재실장" },
    }),
  ],
  edges: [
    // 포트 id/dataType은 templates/* 정의와 일치 — edgeType은 소스 포트 dataType 기준.
    { id: "seed-lh2-e1", sourceNodeId: "seed-lh2-event", sourcePortId: "event_out", targetNodeId: "seed-lh2-zone", targetPortId: "event_in", edgeType: "event_flow" },
    { id: "seed-lh2-e2", sourceNodeId: "seed-lh2-zone", sourcePortId: "scoped_out", targetNodeId: "seed-lh2-sensor", targetPortId: "scoped_in", edgeType: "scope_flow" },
    { id: "seed-lh2-e3", sourceNodeId: "seed-lh2-sensor", sourcePortId: "scoped_out", targetNodeId: "seed-lh2-cond", targetPortId: "in", edgeType: "scope_flow" },
    { id: "seed-lh2-e4", sourceNodeId: "seed-lh2-cond", sourcePortId: "true_out", targetNodeId: "seed-lh2-sop", targetPortId: "trigger_in", edgeType: "condition_flow" },
    { id: "seed-lh2-e5", sourceNodeId: "seed-lh2-sop", sourcePortId: "missions_out", targetNodeId: "seed-lh2-sms", targetPortId: "mission_in", edgeType: "execution_flow" },
    { id: "seed-lh2-e6", sourceNodeId: "seed-lh2-sms", sourcePortId: "response_out", targetNodeId: "seed-lh2-branch", targetPortId: "response_in", edgeType: "response_flow" },
    { id: "seed-lh2-e7", sourceNodeId: "seed-lh2-branch", sourcePortId: "responded_out", targetNodeId: "seed-lh2-board", targetPortId: "flow_in", edgeType: "execution_flow" },
    { id: "seed-lh2-e8", sourceNodeId: "seed-lh2-branch", sourcePortId: "timeout_out", targetNodeId: "seed-lh2-esc", targetPortId: "flow_in", edgeType: "execution_flow" },
    { id: "seed-lh2-e9", sourceNodeId: "seed-lh2-esc", sourcePortId: "flow_out", targetNodeId: "seed-lh2-board", targetPortId: "flow_in", edgeType: "execution_flow" },
    { id: "seed-lh2-e10", sourceNodeId: "seed-lh2-sop", sourcePortId: "flow_out", targetNodeId: "seed-lh2-board", targetPortId: "flow_in", edgeType: "execution_flow" },
  ],
  groups: [
    {
      id: "seed-lh2-sop",
      label: "가스누출 초동대응",
      nodeIds: ["seed-lh2-task-1", "seed-lh2-task-2"],
    },
  ],
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

/** 액화수소 플랜트 도메인 템플릿 시드 — 매칭용 EVT-LH2-001 + 미매칭 확인용 EVT-LH2-002 포함. */
export const LH2_PLANT_SEED: DomainTemplateSeed = {
  seedId: "seed-lh2-plant",
  name: "액화수소 플랜트",
  domain: "lh2_plant",
  description: "액화수소 저장구역 가스누출 감지·초동대응·전파·상향 시나리오.",
  graph: LH2_GRAPH,
  sampleEvents: [
    {
      eventId: "EVT-LH2-001",
      eventType: "GAS_LEAK",
      severity: "WARNING",
      occurredAt: "2026-07-05T09:00:00.000Z",
      siteId: "B00200000001AULH2",
      spaceId: "L_B00200000001AULH2_F01F01_BS_RM_00001",
      assetId: "M_B00200000001AULH2F01F01_SFFC_9900001",
      source: "simulation",
      measuredValues: { h2_ppm: 1200 },
    },
    {
      // severityMin(WARNING) 미달 — 트리거 미매칭 확인용 샘플.
      eventId: "EVT-LH2-002",
      eventType: "GAS_LEAK",
      severity: "INFO",
      occurredAt: "2026-07-05T09:30:00.000Z",
      siteId: "B00200000001AULH2",
      spaceId: "L_B00200000001AULH2_F01F01_BS_RM_00001",
      assetId: "M_B00200000001AULH2F01F01_SFFC_9900001",
      source: "simulation",
      measuredValues: { h2_ppm: 150 },
    },
  ],
};
