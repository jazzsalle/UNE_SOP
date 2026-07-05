# Phase 3 계획 — Graph Studio UI

> planner subagent 산출물 (2026-07-05). `/phase-run 3` 실행 기록.

## 사전 결정 사항 (모든 태스크 공통)

**상태 관리 결정: 새 의존성 없음 (zustand 도입 안 함).**
React Flow v12의 `useNodesState`/`useEdgesState`를 커스텀 React Context(`GraphStudioProvider`)로 끌어올려 단일 소스로 관리한다. 이유: (1) 패널 3개(Palette/Canvas/Inspector)가 하나의 노드/엣지 상태를 공유해야 하지만 규모가 작아 Context로 충분, (2) CLAUDE.md 아키텍처 규칙상 React Flow는 편집기 레이어일 뿐이므로 RF 내장 스토어에 제품 로직을 넣지 않고 얇은 Context 액션 계층으로 격리, (3) Phase 4의 `normalizeGraph()`가 이 Context 상태(nodes/edges)를 입력으로 읽으면 됨.

**RF 노드 데이터 설계**: `type StudioNodeData = { graphNode: GraphNode }` (interface가 아닌 **type alias**로 선언해야 RF v12의 `Record<string, unknown>` 제약을 통과함). RF 노드 `id` = `GraphNode.id`, 위치는 RF 노드가 소스 오브 트루스. RF 커스텀 노드 타입은 2종: `"sopNode"`(일반 13종), `"sopGroup"`(sop_group 전용).

**포트 호환 규칙**: source 포트는 `direction:"output"`, target은 `"input"`, **dataType 완전 일치 시에만 연결 허용**. 추가로 self-loop 금지, 동일 포트쌍 중복 엣지 금지, target 포트가 `multiple !== true`면 기존 incoming 엣지 존재 시 거부.

**PortDataType → EdgeType 매핑** (`edgeTypeForDataType`): event→event_flow, scoped_event→scope_flow, asset→asset_flow, condition_result→condition_flow, execution_flow→execution_flow, mission→execution_flow, mission_status→response_flow, notification_payload→notification_flow, response→response_flow, record→record_flow.

**색상 토큰** (하드코딩 금지 — 사용 가능 토큰은 `app/src/design-system/tokens/semantic/colors.css`, `colors-status.css`에서 확인):
- 노드 헤더 배경: 템플릿의 `accentColorToken`(`--color-bg-danger|brand|warning|info|neutral`), 헤더 텍스트: `--color-text-on-brand`
- 선택 노드 테두리: `--color-border-focus`, 기본 테두리: `--color-border-default`, 노드 본문: `--color-bg-surface`
- 포트 핸들/엣지 색: PortDataType·EdgeType별 토큰 맵(T1에서 정의, 위 토큰 풀에서 선택)
- 주의: `--color-text-inverse`는 없음. `--color-text-on-brand` 사용.

---

### Task T1: 에디터 상태 기반 — Context 스토어 + 포트 호환 유틸 + 그룹 접기 헬퍼 [PARALLEL 아님 — 최우선 단독 실행]
- 목표: 모든 UI 태스크가 컴파일 대상으로 삼을 공유 상태 계층과 유틸을 완성한다.
- 대상 파일:
  - `app/src/studio/state/editorTypes.ts` (신규)
  - `app/src/studio/state/portCompatibility.ts` (신규)
  - `app/src/studio/state/flowTokens.ts` (신규)
  - `app/src/studio/state/groupCollapse.ts` (신규)
  - `app/src/studio/state/GraphStudioContext.tsx` (신규)
  - `app/src/studio/GraphStudio.tsx` (수정 — Provider 배선)
- 완료 기준: `cd app && npm run build` 성공. `useStudio()` 훅이 아래 API 전부를 노출. GraphStudio가 `<ReactFlowProvider><GraphStudioProvider>…`로 감싸짐(기존 4영역 레이아웃 회귀 없음).
- 구현 세부사항:
  - `editorTypes.ts`:
    ```ts
    export const TEMPLATE_DRAG_MIME = "application/x-sop-template";
    export type StudioNodeData = { graphNode: GraphNode };   // type alias 필수
    export type StudioNode = Node<StudioNodeData>;            // @xyflow/react의 Node
    export type StudioEdgeData = { edgeType: EdgeType };
    export type StudioEdge = Edge<StudioEdgeData>;
    ```
  - `portCompatibility.ts`:
    ```ts
    export function edgeTypeForDataType(dataType: PortDataType): EdgeType;      // 위 매핑표
    export function findPort(node: GraphNode, portId: string): NodePort | undefined;
    export function checkConnection(
      conn: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null },
      nodes: StudioNode[], edges: StudioEdge[],
    ): { ok: boolean; reason?: string; edgeType?: EdgeType };
    ```
    규칙: 위 "포트 호환 규칙" 6가지 전부 구현.
  - `flowTokens.ts`: `PORT_COLOR_TOKEN: Record<PortDataType, string>`, `EDGE_COLOR_TOKEN: Record<EdgeType, string>` — 값은 CSS 변수명 문자열(예: `"--color-bg-danger"`). 사용 가능 토큰만 쓸 것(위 색상 토큰 절 참조).
  - `groupCollapse.ts`: `applyGroupCollapse(nodes, edges, groupId, collapsed)` → 그룹 노드의 `data.graphNode.collapsed` 갱신, `parentId === groupId`인 자식 노드에 `hidden: collapsed`, 양 끝 중 하나라도 hidden인 엣지에 `hidden: true` 설정한 새 배열 반환(불변 갱신).
  - `GraphStudioContext.tsx` — Provider 내부에서 `useNodesState<StudioNode>([])`, `useEdgesState<StudioEdge>([])` 사용. 노출 API(정확히 이 시그니처로 — 병렬 태스크가 이 계약에 의존):
    ```ts
    interface GraphStudioApi {
      nodes: StudioNode[];
      edges: StudioEdge[];
      selectedNode: StudioNode | null;               // nodes.find(n => n.selected) 파생
      onNodesChange: OnNodesChange<StudioNode>;
      onEdgesChange: OnEdgesChange<StudioEdge>;
      onConnect: (conn: Connection) => void;         // checkConnection 통과 시 edge 추가(id: `edge-${uuid8}`, data.edgeType, style.stroke = var(EDGE_COLOR_TOKEN))
      isValidConnection: (edgeOrConn: Edge | Connection) => boolean;  // checkConnection 위임
      addNodeFromTemplate: (templateId: string, position: XYPosition, parentGroupId?: string) => StudioNode | null;
      updateNodeLabel: (nodeId: string, label: string) => void;
      updateNodeDescription: (nodeId: string, description: string) => void;
      updateNodeProperty: (nodeId: string, key: string, value: unknown) => void;
      toggleGroupCollapse: (groupId: string) => void; // applyGroupCollapse 적용
      getGroupChildren: (groupId: string) => GraphNode[]; // parentId===groupId인 노드의 data.graphNode
    }
    export function useStudio(): GraphStudioApi;      // Provider 밖 호출 시 throw
    ```
  - `addNodeFromTemplate`: `getTemplate()` + `createNodeFromTemplate()`(둘 다 `app/src/domain`에서 import) 사용. RF 노드 생성 시 `type: template.nodeType === "sop_group" ? "sopGroup" : "sopNode"`, `data: { graphNode }`, `template.defaultSize` 있으면 `style: { width, height }`. `parentGroupId`가 있고 `template.nodeType === "sop_task"`인 경우에만 `parentId: parentGroupId`, `extent: "parent"` 부여(position은 부모 상대좌표로 전달받은 값 그대로). 부모 노드는 배열에서 자식보다 앞에 있어야 하므로 append 방식 유지.
  - `updateNodeProperty` 등 갱신 액션은 `data.graphNode`를 스프레드로 새 객체 생성(참조 변경으로 RF 리렌더 유도).
  - `GraphStudio.tsx`: 기존 레이아웃 그대로 두고 최상위를 `<ReactFlowProvider>` → `<GraphStudioProvider>` 순으로 감싼다.

### Task T2: 커스텀 노드 컴포넌트 (SOPNode / SOPGroupNode / 타입드 포트 핸들) [AFTER: T1]
- 목표: 타입별 색상 헤더 + 타입드 포트 핸들을 가진 커스텀 노드와, 내부 Task 목록·접기/펼치기를 지원하는 SOP Group 노드를 구현한다.
- 대상 파일:
  - `app/src/studio/canvas/nodes/PortHandle.tsx` (신규)
  - `app/src/studio/canvas/nodes/SOPNode.tsx` (신규)
  - `app/src/studio/canvas/nodes/SOPGroupNode.tsx` (신규)
  - `app/src/studio/canvas/nodes/nodeTypes.ts` (신규 — `export const nodeTypes = { sopNode: SOPNode, sopGroup: SOPGroupNode }`)
  - `app/src/studio/canvas/nodes/nodes.css` (신규 — 핸들/노드 상태 스타일, 토큰만 사용)
- 완료 기준: 빌드 성공. SOPNode가 accent 헤더(라벨+타입 뱃지), 좌측 input 핸들/우측 output 핸들(포트 라벨·dataType별 토큰 색)을 렌더. SOPGroupNode가 헤더의 접기/펼치기 버튼으로 `toggleGroupCollapse` 호출, 접힘 시 자식 Task 라벨 요약 목록 표시. 선택 시 `--color-border-focus` 테두리.
- 구현 세부사항:
  - `PortHandle.tsx`: props `{ port: NodePort; index: number; total: number }`. `<Handle type={port.direction === "input" ? "target" : "source"} position={input ? Position.Left : Position.Right} id={port.id} />`. 핸들 배경 `var(PORT_COLOR_TOKEN[port.dataType])`(T1 `flowTokens.ts`), `title={`${port.label} (${port.dataType})`}` 툴팁으로 타입 안내. 포트가 여러 개면 세로로 분산 배치(`top: ((index+1)/(total+1))*100%` 또는 행 단위 레이아웃 — 포트 라벨 텍스트를 노드 본문에 행으로 나열하고 각 행에 핸들을 정렬하는 방식 권장).
  - `SOPNode.tsx`: `NodeProps<StudioNode>` 수신, `data.graphNode`에서 렌더. 구조: 헤더(배경 = `var(accentColorToken)` — accent는 `getTemplatesByType` 대신 `NODE_TEMPLATES`에서 nodeType으로 조회하거나 T1에서 nodeType→토큰 맵을 추가해도 됨. 텍스트 `--color-text-on-brand`, 라벨 + nodeType 뱃지) / 본문(`--color-bg-surface`, input 포트 라벨 좌측 정렬·output 우측 정렬). 최소 폭 200px 내외. `selected` prop으로 focus 테두리. `memo()` 적용.
  - `SOPGroupNode.tsx`: `useStudio()`의 `getGroupChildren(id)`, `toggleGroupCollapse(id)` 사용(Provider 내부이므로 Context 접근 가능). 펼침 상태: 반투명 컨테이너(`--color-bg-brand-subtle` 배경 + `--color-border-brand` 점선 테두리)로 자식 노드가 내부에 실제 배치될 프레임 제공, 헤더에 Task 개수 표시. 접힘 상태(`data.graphNode.collapsed`): 자식 Task 라벨의 요약 리스트(순번 + 라벨, `typo-text-sm`)를 본문에 표시. 포트 핸들은 접힘/펼침 모두 유지(연결 보존).
  - `nodes.css`: `.react-flow__handle` 크기(10~12px)·테두리 토큰, hover 시 `--color-border-focus` 등. 하드코딩 hex 금지.
  - 기존 파일(GraphCanvas 등)은 수정하지 말 것 — T5와의 충돌 방지.

### Task T3: Node Palette 드래그앤드롭 [AFTER: T1] [PARALLEL — T2, T4와 동시 실행 가능]
- 목표: 팔레트 아이템을 HTML5 DnD 드래그 소스로 만들고 그룹 접기 UI를 추가한다.
- 대상 파일: `app/src/studio/panels/NodePalette.tsx` (수정 — 이 태스크만 이 파일 소유)
- 완료 기준: 빌드 성공. 각 템플릿 아이템이 `draggable`이며 `onDragStart`에서 `event.dataTransfer.setData(TEMPLATE_DRAG_MIME, template.templateId)` + `effectAllowed = "move"` 설정. 9개 그룹이 접기/펼치기 가능한 섹션으로 렌더.
- 구현 세부사항:
  - `TEMPLATE_DRAG_MIME`은 `../state/editorTypes`에서 import (문자열 재정의 금지 — 캔버스 drop과 계약 일치).
  - 기존 스타일 관례 유지(inline style + 토큰 + `typo-*` 클래스). 아이템에 `cursor: grab`, hover 배경 `--color-bg-subtle`, 좌측 accent 바(기존 코드) 유지.
  - 그룹 접기: 로컬 `useState<Set<NodeTemplateGroup>>`. 접기 헤더 상태 색상은 디자인 시스템 Accordion 토큰(`--color-bg-accordion-*`, `1. Reference data/디자인 시스템 가이드/modules/react-ui/src/components/Accordion/SPEC.md` 참조) 사용.
  - 아이템에 `title={template.description}` 툴팁 추가.

### Task T4: Property Inspector [AFTER: T1] [PARALLEL — T2, T3과 동시 실행 가능]
- 목표: 선택 노드의 라벨/설명/properties를 표시·편집하고 변경을 노드 상태에 즉시 반영한다.
- 대상 파일:
  - `app/src/studio/panels/PropertyInspector.tsx` (수정)
  - `app/src/studio/panels/inspector/PropertyField.tsx` (신규)
  - `app/src/studio/panels/inspector/PortListSection.tsx` (신규)
- 완료 기준: 빌드 성공. `useStudio().selectedNode`가 null이면 기존 "노드를 선택하세요" placeholder 유지. 선택 시: 노드 타입 뱃지(accent 토큰 색)·id(읽기전용), label 입력, description 텍스트영역, properties의 각 키에 대한 타입별 편집 필드, 포트 목록(읽기전용, dataType 뱃지). 입력 변경이 `updateNodeLabel`/`updateNodeDescription`/`updateNodeProperty`로 반영됨.
- 구현 세부사항:
  - `PropertyField.tsx`: props `{ propKey: string; value: unknown; onChange: (v: unknown) => void }`. 값 타입별 렌더 — `string` → text input(단, key가 `instructions`/`message`/`bodyTemplate` 류면 textarea), `number` → `<input type="number">`(onChange 시 `Number()` 변환, NaN 가드), `boolean` → checkbox, `Array` → 콤마 구분 텍스트(입력을 `split(",").map(s=>s.trim()).filter(Boolean)`로 역변환; 원소가 객체인 배열이면 읽기전용 JSON `<pre>`), 그 외 object → 읽기전용 JSON.
  - 입력 스타일: 토큰만 사용 — 테두리 `--color-border-default`, focus 시 `--color-border-focus`, 배경 `--color-bg-surface`, placeholder `--color-text-placeholder`, radius는 `semantic/radius.css`의 토큰. 폼 상태 규칙은 `1. Reference data/디자인 시스템 가이드/docs/component-state-rules.md`와 `COMPONENT_CATALOG.md` 참고.
  - `PortListSection.tsx`: input/output 포트를 방향별로 나열, dataType 뱃지 배경은 `flowTokens.ts`의 `PORT_COLOR_TOKEN` 사용, `required` 표시(`*`).
  - 편집은 uncontrolled 금지 — `selectedNode.data.graphNode`를 value 소스로 하는 controlled 입력. 선택 노드 변경 시 필드 리마운트 위해 `key={selectedNode.id}` 사용.

### Task T5: Graph Canvas 배선 — 컨트롤드 플로우 + Drop + 연결 검증 + MiniMap [AFTER: T1, T2]
- 목표: 캔버스를 Context 상태 기반 컨트롤드 React Flow로 전환하고 드롭 생성·타입드 연결 검증·MiniMap/Controls/Background를 완성한다.
- 대상 파일:
  - `app/src/studio/canvas/GraphCanvas.tsx` (전면 수정)
  - `app/src/studio/canvas/edgeOptions.ts` (신규)
  - `app/src/studio/canvas/canvas.css` (신규)
- 완료 기준: 빌드 성공. 팔레트 드래그 → 캔버스 드롭 시 마우스 위치에 노드 생성(sop_task를 SOP Group 프레임 위에 드롭하면 그룹 자식으로 생성). 호환 포트만 연결선 생성(비호환 시 not-allowed로 제한). MiniMap/Controls/Background 렌더. 노드 삭제(Delete 키)·엣지 삭제 동작.
- 구현 세부사항:
  - 내부 `ReactFlowProvider` 제거(T1에서 GraphStudio 최상위로 이동됨). `useStudio()`에서 nodes/edges/onNodesChange/onEdgesChange/onConnect/isValidConnection 수령, `nodeTypes`는 `./nodes/nodeTypes`에서 import — **컴포넌트 밖 상수**로 참조(리렌더 경고 방지).
  - Drop 처리: `onDragOver`에서 `preventDefault()` + `dropEffect="move"`. `onDrop`에서 `dataTransfer.getData(TEMPLATE_DRAG_MIME)` → 없으면 무시. `useReactFlow().screenToFlowPosition({x: e.clientX, y: e.clientY})`로 좌표 변환. 그룹 드롭 판정: `type === "sopGroup"`이고 `!data.graphNode.collapsed`인 노드 중 `position + (measured?.width ?? style.width)` 사각형에 드롭 좌표가 포함되고 드롭 템플릿의 `nodeType === "sop_task"`면 `addNodeFromTemplate(templateId, 부모상대좌표, groupId)`, 아니면 일반 생성.
  - `<ReactFlow>` props: `nodesConnectable`, `deleteKeyCode={["Delete","Backspace"]}`, `fitView`, `proOptions={{hideAttribution:true}}`, `defaultEdgeOptions`(edgeOptions.ts에서: `type:"smoothstep"`, `markerEnd: arrowclosed`).
  - `edgeOptions.ts`: `defaultEdgeOptions` + `EDGE_COLOR_TOKEN`(T1 flowTokens) 기반 스타일 헬퍼. 엣지 stroke는 `var(--color-…)` 문자열로 지정(SVG에서 CSS 변수 동작함).
  - `canvas.css`: React Flow v12 CSS 변수를 토큰으로 오버라이드 — 예: `.react-flow { --xy-background-color: var(--color-bg-muted); --xy-edge-stroke-default: var(--color-border-strong); --xy-edge-stroke-selected-default: var(--color-border-focus); --xy-minimap-background-color-default: var(--color-bg-surface); --xy-controls-button-background-color-default: var(--color-bg-surface); --xy-controls-button-color-default: var(--color-text-default); --xy-attribution-background-color-default: transparent; }`. Background는 `variant={BackgroundVariant.Dots}` + `color`에 토큰 변수.
  - MiniMap: `<MiniMap pannable zoomable />`, `nodeColor` 콜백은 노드 accent 토큰의 `var()` 문자열 반환(불가 시 CSS로 `.react-flow__minimap-node { fill: var(--color-bg-neutral); }`).

### Task T6: 통합 마감 — 그룹 접기/펼치기 종단 검증 + 회귀 수정 [AFTER: T2, T3, T4, T5]
- 목표: 병렬 산출물 간 계약 불일치·타입 오류를 해소하고, 합격 기준 6개 항목을 종단 시나리오로 확인·보수한다.
- 대상 파일: T1~T5 산출 파일 전체(수정 권한 있음, 신규 파일 생성은 buildfix 목적에 한정)
- 완료 기준:
  1. `cd app && npm run build` 성공(타입 에러 0)
  2. `npm run dev`에서 시나리오 통과: (a) Sensor Event·Facility·Condition·SOP Group·SMS Notification·Situation Board를 드롭 배치 → 각 노드가 기본 속성/포트 보유, (b) `event_out(event)` → `event_in(event)` 연결 성공 / `event_out(event)` → `trigger_in(execution_flow)` 연결 거부, (c) 노드 클릭 → Inspector에서 label·properties 수정 → 캔버스 노드에 즉시 반영, (d) SOP Group 펼침 상태에서 SOP Task 2개를 그룹 위에 드롭 → 자식 배치 → 접기 버튼 → 자식 숨김 + 요약 목록 표시 → 펼치기 복원(자식 연결 엣지 hidden 동기화 포함), (e) MiniMap/Controls/Background 표시
  3. Phase 1~2 회귀 없음(4영역 레이아웃, ValidationPanel placeholder 유지, `app/src/domain/*` 무변경 — 도메인 모듈은 이 Phase에서 수정 금지)
  4. 신규 UI 전체에서 hex/rgb 하드코딩 색상 0건(`#[0-9a-fA-F]{3,8}`·`rgb(` 검색으로 확인, RF 기본 CSS 제외)
- 구현 세부사항: 흔한 불일치 예상 지점 — (1) `useStudio` API 시그니처와 각 패널의 호출부, (2) RF v12 제네릭(`Node<StudioNodeData>` vs `NodeProps<StudioNode>`) 타입 정합, (3) 중첩 ReactFlowProvider 잔재 제거, (4) 그룹 자식 노드가 부모보다 배열 앞에 오는 순서 문제(RF 에러 발생 — addNodeFromTemplate append 순서 확인), (5) collapsed 시 엣지 hidden 처리 누락. 발견 즉시 해당 파일에서 수정.

## 실행 순서 요약

```
T1 (단독 선행)
 ├─ T2 [PARALLEL] 커스텀 노드
 ├─ T3 [PARALLEL] Palette DnD
 └─ T4 [PARALLEL] Inspector
      T5 [AFTER: T1, T2] Canvas 배선   ← T3·T4와는 병렬 가능 (파일 겹침 없음)
           T6 [AFTER: 전부] 통합 마감
```

파일 소유권이 태스크별로 분리되어 병렬 충돌이 없다: T2=`canvas/nodes/*`, T3=`panels/NodePalette.tsx`, T4=`panels/PropertyInspector.tsx`+`panels/inspector/*`, T5=`canvas/GraphCanvas.tsx`+`canvas/edgeOptions.ts`+`canvas/canvas.css`. 공유 계약(`state/*`)은 T1이 단독 확정한다.
