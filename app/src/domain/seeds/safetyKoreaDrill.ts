/**
 * 안전한국훈련 시드 — 지진 대피훈련 SOPGraph (docs/design/06_seed_data.md §5).
 * 플로우: Manual Report → Evacuation Area(운동장) → Condition(훈련상황 확인)
 * → SOP Group(대피유도) → Contact Group(교직원) → Broadcast 전파,
 * SOP flow → Checklist(인원확인) → Board 기록 → Report(종료보고).
 */
import type { SOPGraph } from "../types";
import { SEED_TIMESTAMP, seedNode, type DomainTemplateSeed } from "./seedTypes";

/** 안전한국훈련 지진 대피훈련 시드 그래프 — 노드 11개, 엣지 8개. */
const SAFETY_KOREA_DRILL_GRAPH: SOPGraph = {
  graphId: "graph-seed-safety-korea-drill",
  name: "안전한국훈련 — 지진 대피훈련",
  description:
    "지진 발생 훈련상황 → 대피구역 범위 → 훈련상황 확인 → 대피유도 SOP → 교직원 방송 전파 → 인원확인 체크리스트 → 상황판 기록 → 종료보고.",
  domain: "safety_korea_drill",
  version: "0.1.0",
  nodes: [
    seedNode("tpl-trigger-manual-report", "seed-drill-event", { x: 0, y: 200 }, {
      label: "지진 발생 훈련상황",
      properties: { eventType: "EARTHQUAKE_DRILL" },
    }),
    seedNode("tpl-scope-evacuation-area", "seed-drill-area", { x: 280, y: 200 }, {
      label: "운동장",
      properties: { siteId: "B00400000001AUSCH", spaceIds: ["L_B00400000001AUSCH_F01F01_CV_RM_00001"], capacity: 800 },
    }),
    seedNode("tpl-logic-condition", "seed-drill-cond", { x: 560, y: 200 }, {
      label: "훈련상황 확인",
      properties: { field: "severity", operator: ">=", value: "INFO" },
    }),
    seedNode("tpl-sop-group", "seed-drill-sop", { x: 840, y: 120 }, {
      label: "대피유도",
      properties: {
        name: "대피유도",
        domain: "safety_korea_drill",
        taskIds: ["seed-drill-task-1", "seed-drill-task-2"],
      },
      children: ["seed-drill-task-1", "seed-drill-task-2"],
      // 자식 2개(추정 높이 ~110px)가 겹치지 않고 프레임 안에 들어가는 크기.
      size: { width: 340, height: 310 },
    }),
    // 그룹 자식 — position은 부모(seed-drill-sop) 기준 상대좌표.
    seedNode("tpl-sop-task", "seed-drill-task-1", { x: 24, y: 56 }, {
      label: "대피 경로 안내",
      properties: {
        title: "대피 경로 안내",
        assigneeRole: "층별 대피 유도요원",
        dueMinutes: 5,
        instructions: "지정 대피 경로로 인원을 운동장까지 유도한다.",
      },
    }),
    seedNode("tpl-sop-task", "seed-drill-task-2", { x: 24, y: 176 }, {
      label: "취약인원 지원",
      properties: {
        title: "취약인원 지원",
        assigneeRole: "보건 담당",
        dueMinutes: 10,
        instructions: "이동 취약 인원의 대피를 지원하고 특이사항을 보고한다.",
      },
    }),
    seedNode("tpl-people-contact-group", "seed-drill-contact", { x: 1240, y: 200 }, {
      label: "교직원",
      properties: { groupName: "교직원", members: ["교장", "교감", "행정실장"] },
    }),
    seedNode("tpl-action-broadcast", "seed-drill-broadcast", { x: 1520, y: 200 }, {
      label: "구내방송 전파",
      properties: { messageTemplate: "[훈련] 지진 발생 — 운동장으로 대피하십시오" },
    }),
    seedNode("tpl-sop-checklist", "seed-drill-checklist", { x: 1240, y: 400 }, {
      label: "인원확인",
      properties: {
        title: "인원확인",
        items: ["학급별 인원 보고", "미확인 인원 파악"],
        assigneeRole: "담임교사",
      },
    }),
    seedNode("tpl-runtime-situation-board", "seed-drill-board", { x: 1520, y: 400 }, {
      label: "전자상황판",
      properties: { boardId: "BOARD-DRILL-MAIN" },
    }),
    seedNode("tpl-record-report", "seed-drill-report", { x: 1800, y: 400 }, {
      label: "종료보고",
    }),
  ],
  edges: [
    // 포트 id/dataType은 templates/* 정의와 일치 — edgeType은 소스 포트 dataType 기준.
    { id: "seed-drill-e1", sourceNodeId: "seed-drill-event", sourcePortId: "event_out", targetNodeId: "seed-drill-area", targetPortId: "event_in", edgeType: "event_flow" },
    { id: "seed-drill-e2", sourceNodeId: "seed-drill-area", sourcePortId: "scoped_out", targetNodeId: "seed-drill-cond", targetPortId: "in", edgeType: "scope_flow" },
    { id: "seed-drill-e3", sourceNodeId: "seed-drill-cond", sourcePortId: "true_out", targetNodeId: "seed-drill-sop", targetPortId: "trigger_in", edgeType: "condition_flow" },
    { id: "seed-drill-e4", sourceNodeId: "seed-drill-sop", sourcePortId: "missions_out", targetNodeId: "seed-drill-contact", targetPortId: "mission_in", edgeType: "execution_flow" },
    { id: "seed-drill-e5", sourceNodeId: "seed-drill-contact", sourcePortId: "mission_out", targetNodeId: "seed-drill-broadcast", targetPortId: "mission_in", edgeType: "execution_flow" },
    // sop_group.flow_out(execution_flow) → checklist.trigger_in(execution_flow) — 타입 정합.
    { id: "seed-drill-e6", sourceNodeId: "seed-drill-sop", sourcePortId: "flow_out", targetNodeId: "seed-drill-checklist", targetPortId: "trigger_in", edgeType: "execution_flow" },
    // checklist.record_out(record) → board.record_in(record) — 타입 정합.
    { id: "seed-drill-e7", sourceNodeId: "seed-drill-checklist", sourcePortId: "record_out", targetNodeId: "seed-drill-board", targetPortId: "record_in", edgeType: "record_flow" },
    // board.record_out(record) → report.record_in(record) — 타입 정합.
    { id: "seed-drill-e8", sourceNodeId: "seed-drill-board", sourcePortId: "record_out", targetNodeId: "seed-drill-report", targetPortId: "record_in", edgeType: "record_flow" },
  ],
  groups: [
    {
      id: "seed-drill-sop",
      label: "대피유도",
      nodeIds: ["seed-drill-task-1", "seed-drill-task-2"],
    },
  ],
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

/** 안전한국훈련 도메인 템플릿 시드 — 훈련상황 EVT-DRILL-001 샘플 이벤트 제공. */
export const SAFETY_KOREA_DRILL_SEED: DomainTemplateSeed = {
  seedId: "seed-safety-korea-drill",
  name: "안전한국훈련",
  domain: "safety_korea_drill",
  description: "학교 지진 대피훈련 — 대피유도·전파·인원확인·종료보고 시나리오.",
  graph: SAFETY_KOREA_DRILL_GRAPH,
  sampleEvents: [
    {
      eventId: "EVT-DRILL-001",
      eventType: "EARTHQUAKE_DRILL",
      severity: "CAUTION",
      occurredAt: "2026-07-05T14:00:00.000Z",
      siteId: "B00400000001AUSCH",
      spaceId: "L_B00400000001AUSCH_F01F01_CV_RM_00001",
      source: "simulation",
    },
  ],
};
