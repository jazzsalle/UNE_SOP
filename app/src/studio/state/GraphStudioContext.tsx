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
  useState,
  type ReactNode,
} from "react";
import {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
  type XYPosition,
} from "@xyflow/react";
import { createNodeFromTemplate, getSeed, getTemplate } from "../../domain";
import type {
  EventContext,
  GraphNode,
  SOPGraph,
  ValidationResult,
} from "../../domain";
import {
  normalizeGraph,
  saveCompiledGraph,
  simulate,
  validateGraph,
} from "../../engine";
import type {
  GraphMeta,
  SimulateOptions,
  SimulationResult,
} from "../../engine";
import type { StudioEdge, StudioNode } from "./editorTypes";
import { checkConnection } from "./portCompatibility";
import { EDGE_COLOR_TOKEN } from "./flowTokens";
import { applyGroupCollapse } from "./groupCollapse";
import { toEditorSnapshot, toStudioGraph } from "./graphIO";

/**
 * Graph Studio 공유 API — 병렬 태스크가 의존하는 계약.
 * (Phase 3 편집 API + Phase 4 검증/컴파일/시뮬레이션 확장 — T5/T6/T7이 의존)
 * 시그니처를 변경하려면 해당 phase 계획 문서를 먼저 갱신할 것.
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

  // ── Phase 4 확장: 검증/컴파일/시뮬레이션 (T5/T6/T7이 의존하는 계약) ──
  /** 현재 편집 중인 그래프의 메타 정보 — normalizeGraph() 입력. */
  graphMeta: GraphMeta;
  updateGraphMeta: (patch: Partial<GraphMeta>) => void;
  /** 마지막 runValidate/runCompile 결과. 아직 실행 전이면 null. */
  validationResult: ValidationResult | null;
  /** 마지막 runCompile 산출물(validation 첨부 SOPGraph). 아직 실행 전이면 null. */
  compiledGraph: SOPGraph | null;
  /** 마지막 runSimulate 결과 — 캔버스 하이라이트/Runtime Preview의 소스. */
  simulation: SimulationResult | null;
  /** EventContext 시뮬레이터 다이얼로그 열림 상태 (SimulateDialog가 소비). */
  simulateDialogOpen: boolean;
  setSimulateDialogOpen: (open: boolean) => void;
  /** normalizeGraph(toEditorSnapshot(...), graphMeta) → validateGraph. 상태 저장 후 반환. */
  runValidate: () => ValidationResult;
  /** 검증 결과를 graph.validation에 첨부해 localStorage에 저장하고 반환. */
  runCompile: () => SOPGraph;
  /** normalize → simulate. 결과를 simulation 상태에 저장 후 반환. */
  runSimulate: (ctx: EventContext, opts?: SimulateOptions) => SimulationResult;
  /** 시뮬레이션 결과(캔버스 하이라이트 포함)를 해제한다. */
  clearSimulation: () => void;
  /** 도메인 템플릿 시드를 캔버스에 로드한다 — 기존 노드/엣지 대체 + fitView. */
  loadDomainTemplate: (seedId: string) => void;
  /** 해당 노드만 selected:true로 만든다 (검증 이슈 클릭 → 노드 포커스용). */
  selectNode: (nodeId: string) => void;
}

const GraphStudioContext = createContext<GraphStudioApi | null>(null);

/** Graph Studio 상태 Provider — ReactFlowProvider 내부에 배치해야 한다. */
export function GraphStudioProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<StudioNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<StudioEdge>([]);
  const { fitView } = useReactFlow<StudioNode, StudioEdge>();

  // Phase 4 실행 상태 — 노드/엣지 변경 시 기존 validationResult/simulation을
  // 자동 무효화하지 **않는다** (POC 단순화 — 사용자가 다시 Validate/Simulate하면 갱신).
  const [graphMeta, setGraphMeta] = useState<GraphMeta>(() => ({
    graphId: `graph-${crypto.randomUUID().slice(0, 8)}`,
    name: "새 SOP Graph",
    domain: "generic",
    version: "0.1.0",
  }));
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [compiledGraph, setCompiledGraph] = useState<SOPGraph | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [simulateDialogOpen, setSimulateDialogOpen] = useState(false);

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

  // ── Phase 4: 검증/컴파일/시뮬레이션/템플릿 로드 ──

  const updateGraphMeta = useCallback((patch: Partial<GraphMeta>) => {
    setGraphMeta((prev) => ({ ...prev, ...patch }));
  }, []);

  /** 편집기 상태 → normalizeGraph. 실행 로직 3종(runValidate/runCompile/runSimulate)의 공통 입구. */
  const normalizeCurrent = useCallback(
    (): SOPGraph => normalizeGraph(toEditorSnapshot(nodes, edges), graphMeta),
    [nodes, edges, graphMeta],
  );

  const runValidate = useCallback((): ValidationResult => {
    const result = validateGraph(normalizeCurrent());
    setValidationResult(result);
    return result;
  }, [normalizeCurrent]);

  const runCompile = useCallback((): SOPGraph => {
    const graph = normalizeCurrent();
    const result = validateGraph(graph);
    graph.validation = result;
    saveCompiledGraph(graph);
    setValidationResult(result);
    setCompiledGraph(graph);
    return graph;
  }, [normalizeCurrent]);

  const runSimulate = useCallback(
    (ctx: EventContext, opts?: SimulateOptions): SimulationResult => {
      const result = simulate(normalizeCurrent(), ctx, opts);
      setSimulation(result);
      return result;
    },
    [normalizeCurrent],
  );

  const clearSimulation = useCallback(() => {
    setSimulation(null);
  }, []);

  const loadDomainTemplate = useCallback(
    (seedId: string) => {
      const seed = getSeed(seedId);
      if (!seed) {
        return;
      }
      // 시드 원본 오염 방지 — 깊은 복제 후 편집기 노드/엣지로 변환.
      const graph = structuredClone(seed.graph);
      const studio = toStudioGraph(graph);
      setNodes(studio.nodes);
      setEdges(studio.edges);
      setGraphMeta((prev) => ({
        ...prev,
        graphId: graph.graphId,
        name: graph.name,
        domain: graph.domain,
        version: graph.version,
        description: graph.description,
      }));
      // 이전 그래프의 실행 결과는 새 템플릿과 무관하므로 초기화한다.
      setValidationResult(null);
      setCompiledGraph(null);
      setSimulation(null);
      // RF가 새 노드를 커밋한 뒤 화면 맞춤 (즉시 호출하면 빈 캔버스 기준으로 fit됨).
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    },
    [setNodes, setEdges, fitView],
  );

  const selectNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((node) => ({ ...node, selected: node.id === nodeId })),
      );
    },
    [setNodes],
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
      graphMeta,
      updateGraphMeta,
      validationResult,
      compiledGraph,
      simulation,
      simulateDialogOpen,
      setSimulateDialogOpen,
      runValidate,
      runCompile,
      runSimulate,
      clearSimulation,
      loadDomainTemplate,
      selectNode,
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
      graphMeta,
      updateGraphMeta,
      validationResult,
      compiledGraph,
      simulation,
      simulateDialogOpen,
      runValidate,
      runCompile,
      runSimulate,
      clearSimulation,
      loadDomainTemplate,
      selectNode,
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
