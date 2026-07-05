/**
 * 에디터 레이어 공유 타입 — React Flow 노드/엣지에 도메인 모델(GraphNode)을 실어 나르는 계약.
 * React Flow는 시각 편집기 레이어일 뿐이며, 제품 데이터 모델은 `data.graphNode`(SOPGraph의 노드)다.
 */
import type { Edge, Node } from "@xyflow/react";
import type { EdgeType, GraphNode } from "../../domain";

/** 팔레트 → 캔버스 드래그앤드롭에 쓰는 dataTransfer MIME 타입 (templateId 전달). */
export const TEMPLATE_DRAG_MIME = "application/x-sop-template";

/**
 * RF 노드 data 페이로드 — 도메인 GraphNode를 그대로 담는다.
 * RF v12의 `Record<string, unknown>` 제약을 통과하려면 interface가 아닌 type alias여야 한다.
 */
export type StudioNodeData = { graphNode: GraphNode };

/** 에디터 캔버스의 노드 — RF 노드 id는 GraphNode.id와 동일하다. */
export type StudioNode = Node<StudioNodeData>;

/** RF 엣지 data 페이로드 — 도메인 EdgeType을 담는다. */
export type StudioEdgeData = { edgeType: EdgeType };

/** 에디터 캔버스의 엣지 — 타입드 포트 연결 결과. */
export type StudioEdge = Edge<StudioEdgeData>;
