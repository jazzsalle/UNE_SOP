# 00 — Project Overview

## Project Goal

Build a domain-agnostic **Visual SOP Graph Studio POC**.

This project is not a fixed SOP management screen and not a liquid-hydrogen-only application. It is a visual programming editor where users freely compose executable SOP logic by connecting nodes with typed input/output ports.

The interface should feel closer to Unreal Blueprint, Node-RED, Rete.js-style graph editing, or a mind-map-based node editor than a traditional CRUD admin screen.

## Core Product Concept

Users create an executable `SOPGraph` by dragging node types into an infinite canvas and connecting them through typed ports.

A graph may combine:

- Event nodes
- Space / Scope nodes
- Asset / Object nodes
- Condition / Branch nodes
- SOP Task nodes
- Composite SOP Group nodes
- Role / Contact nodes
- Notification nodes
- Timer / Escalation nodes
- Situation Board nodes
- Evidence / Record nodes

The generated graph is compiled into an executable SOP flow.

## MVP Scope

Implement the first vertical slice:

1. Main Graph Studio screen
2. Left Node Palette
3. Infinite React Flow canvas
4. Custom nodes with visible typed input/output ports
5. Right Property Inspector
6. Composite SOP Group node with expand/collapse
7. Graph validation panel
8. Compile current nodes/edges into `SOPGraph` JSON
9. Simulate an `EventContext`
10. Highlight the execution path
11. Runtime Preview showing generated missions and mock status results

## Required Sample Flow

The first POC must support this sample graph:

```text
Event
→ Space Scope
→ Asset Filter
→ Condition
→ SOP Group
→ Notification
→ Branch
→ Situation Board
```

Example:

```text
가스누출 감지
→ 발생 공간 범위 적용
→ 관련 객체 필터
→ 위험도 WARNING 이상 조건
→ 가스누출 초동대응 SOP Group
→ SMS/앱 전파 Mock
→ 응답 분기
→ 전자상황판 기록
```

## Non-goals

Do not implement the following in the first POC:

- Real SMS
- Real IoT / sensor integration
- Real 3D Viewer
- Production authentication
- Production database
- AI/RAG SOP generation
- Domain-specific KGS-only screens

Use liquid hydrogen, power plant, and disaster drill only as sample templates.

## Technology Preference

Use:

- React
- TypeScript
- Vite
- React Flow / xyflow (`@xyflow/react`)

## Architecture Rule

React Flow is only the visual editor. The product data model must be `SOPGraph`, not React Flow state itself.

```text
React Flow Nodes / Edges
        ↓
normalizeGraph()
        ↓
SOPGraph
        ↓
validateGraph()
        ↓
compileGraph()
        ↓
ExecutionPlan
        ↓
Runtime Preview
```

Keep the editor layer and execution logic separated.

## Acceptance Criteria

The POC is successful when:

1. A user can add nodes from the Node Palette.
2. Nodes have typed input/output ports.
3. A user can connect nodes through visible handles.
4. Invalid or missing connections are detected.
5. A user can create the sample flow: `Event → Space Scope → Asset Filter → Condition → SOP Group → Notification → Branch → Situation Board`
6. A composite SOP Group can be expanded/collapsed.
7. The graph can be compiled to `SOPGraph` JSON.
8. A simulated `EventContext` can trigger a graph execution preview.
9. The execution path is highlighted.
10. Runtime Preview shows mock missions, notification status, and situation board records.
