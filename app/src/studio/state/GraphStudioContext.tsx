/**
 * Graph Studio 상태 컨텍스트 — React Flow의 useNodesState/useEdgesState를 단일 소스로
 * 끌어올려 Palette/Canvas/Inspector가 공유한다. RF 내장 스토어에 제품 로직을 넣지 않고
 * 이 얇은 액션 계층에서 도메인 규칙(포트 호환, 그룹 접기)을 적용한다.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
  type XYPosition,
} from "@xyflow/react";
import { createNodeFromTemplate, getTemplate } from "../../domain";
import type { GraphNode } from "../../domain";
import type { StudioEdge, StudioNode } from "./editorTypes";
import { checkConnection } from "./portCompatibility";
import { EDGE_COLOR_TOKEN } from "./flowTokens";
import { applyGroupCollapse } from "./groupCollapse";

/**
 * Graph Studio 공유 API — 병렬 태스크(T2~T5)가 의존하는 계약.
 * 시그니처를 변경하려면 phase-3 계획 문서를 먼저 갱신할 것.
 */
export interface GraphStudioApi {
  nodes: StudioNode[];
  edges: StudioEdge[];
  /** 현재 선택된 노드 (nodes에서 selected 플래그로 파생, 없으면 null). */
  selectedNode: StudioNode | null;
  onNodesChange: OnNodesChange<StudioNode>;
  onEdgesChange: OnEdgesChange<StudioEdge>;
  /** checkConnection 통과 시에만 타입드 엣지를 추가한다. */
  onConnect: (conn: Connection) => void;
  /** RF `isValidConnection` prop용 — checkConnection에 위임한다. */
  isValidConnection: (edgeOrConn: Edge | Connection) => boolean;
  /**
   * 템플릿으로 노드를 생성해 캔버스에 추가한다. 미등록 templateId면 null.
   * parentGroupId가 있고 템플릿이 sop_task일 때만 그룹 자식으로 배치한다
   * (position은 부모 상대좌표로 전달받은 값 그대로 사용).
   */
  addNodeFromTemplate: (
    templateId: string,
    position: XYPosition,
    parentGroupId?: string,
  ) => StudioNode | null;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeDescription: (nodeId: string, description: string) => void;
  updateNodeProperty: (nodeId: string, key: string, value: unknown) => void;
  /** SOP Group 접기/펼치기 토글 — 자식 노드·엣지 hidden 동기화 포함. */
  toggleGroupCollapse: (groupId: string) => void;
  /** parentId === groupId인 자식 노드들의 도메인 GraphNode 목록. */
  getGroupChildren: (groupId: string) => GraphNode[];
}

const GraphStudioContext = createContext<GraphStudioApi | null>(null);

/** Graph Studio 상태 Provider — ReactFlowProvider 내부에 배치해야 한다. */
export function GraphStudioProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<StudioNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<StudioEdge>([]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.selected) ?? null,
    [nodes],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      const result = checkConnection(conn, nodes, edges);
      if (!result.ok || !result.edgeType) {
        return;
      }
      const edge: StudioEdge = {
        id: `edge-${crypto.randomUUID().slice(0, 8)}`,
        source: conn.source,
        sourceHandle: conn.sourceHandle,
        target: conn.target,
        targetHandle: conn.targetHandle,
        data: { edgeType: result.edgeType },
        style: { stroke: `var(${EDGE_COLOR_TOKEN[result.edgeType]})` },
      };
      setEdges((prev) => [...prev, edge]);
    },
    [nodes, edges, setEdges],
  );

  const isValidConnection = useCallback(
    (edgeOrConn: Edge | Connection): boolean =>
      checkConnection(
        {
          source: edgeOrConn.source,
          target: edgeOrConn.target,
          sourceHandle: edgeOrConn.sourceHandle,
          targetHandle: edgeOrConn.targetHandle,
        },
        nodes,
        edges,
      ).ok,
    [nodes, edges],
  );

  const addNodeFromTemplate = useCallback(
    (
      templateId: string,
      position: XYPosition,
      parentGroupId?: string,
    ): StudioNode | null => {
      const template = getTemplate(templateId);
      if (!template) {
        return null;
      }
      const graphNode = createNodeFromTemplate(template, position);
      const node: StudioNode = {
        id: graphNode.id,
        type: template.nodeType === "sop_group" ? "sopGroup" : "sopNode",
        position,
        data: { graphNode },
      };
      if (template.defaultSize) {
        node.style = {
          width: template.defaultSize.width,
          height: template.defaultSize.height,
        };
      }
      if (parentGroupId && template.nodeType === "sop_task") {
        node.parentId = parentGroupId;
        node.extent = "parent";
      }
      // RF 규칙: 부모(그룹) 노드는 배열에서 자식보다 앞에 있어야 하므로 append 순서 유지.
      setNodes((prev) => [...prev, node]);
      return node;
    },
    [setNodes],
  );

  /** data.graphNode를 스프레드로 새 객체 생성해 갱신한다 (참조 변경으로 RF 리렌더 유도). */
  const patchGraphNode = useCallback(
    (nodeId: string, patch: (graphNode: GraphNode) => GraphNode) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, graphNode: patch(node.data.graphNode) } }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const updateNodeLabel = useCallback(
    (nodeId: string, label: string) => {
      patchGraphNode(nodeId, (graphNode) => ({ ...graphNode, label }));
    },
    [patchGraphNode],
  );

  const updateNodeDescription = useCallback(
    (nodeId: string, description: string) => {
      patchGraphNode(nodeId, (graphNode) => ({ ...graphNode, description }));
    },
    [patchGraphNode],
  );

  const updateNodeProperty = useCallback(
    (nodeId: string, key: string, value: unknown) => {
      patchGraphNode(nodeId, (graphNode) => ({
        ...graphNode,
        properties: { ...graphNode.properties, [key]: value },
      }));
    },
    [patchGraphNode],
  );

  const toggleGroupCollapse = useCallback(
    (groupId: string) => {
      const group = nodes.find((node) => node.id === groupId);
      if (!group) {
        return;
      }
      const collapsed = !(group.data.graphNode.collapsed ?? false);
      const next = applyGroupCollapse(nodes, edges, groupId, collapsed);
      setNodes(next.nodes);
      setEdges(next.edges);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const getGroupChildren = useCallback(
    (groupId: string): GraphNode[] =>
      nodes
        .filter((node) => node.parentId === groupId)
        .map((node) => node.data.graphNode),
    [nodes],
  );

  const api = useMemo<GraphStudioApi>(
    () => ({
      nodes,
      edges,
      selectedNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      isValidConnection,
      addNodeFromTemplate,
      updateNodeLabel,
      updateNodeDescription,
      updateNodeProperty,
      toggleGroupCollapse,
      getGroupChildren,
    }),
    [
      nodes,
      edges,
      selectedNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      isValidConnection,
      addNodeFromTemplate,
      updateNodeLabel,
      updateNodeDescription,
      updateNodeProperty,
      toggleGroupCollapse,
      getGroupChildren,
    ],
  );

  return (
    <GraphStudioContext.Provider value={api}>
      {children}
    </GraphStudioContext.Provider>
  );
}

/** Graph Studio 공유 API 훅 — GraphStudioProvider 밖에서 호출하면 throw. */
export function useStudio(): GraphStudioApi {
  const api = useContext(GraphStudioContext);
  if (!api) {
    throw new Error("useStudio()는 GraphStudioProvider 내부에서만 호출할 수 있습니다.");
  }
  return api;
}
