# 07 — POC Task Breakdown

> **주의 — Phase 번호 체계**: 이 문서의 "Phase 1~12"는 원본 설계 문서의 내부 태스크 단계이며, 이 저장소의 공식 Phase 체계(CLAUDE.md의 Phase 1~9)와 **다르다**. 이 저장소에서 "Phase N"은 항상 CLAUDE.md 기준을 의미한다. 혼동을 피하기 위해 아래에서는 원본 단계를 "Step"으로 표기한다.

## CLAUDE.md Phase 매핑

| CLAUDE.md Phase | 이 문서의 Step |
|---|---|
| Phase 1 (스캐폴딩) | Step 1 |
| Phase 2 (도메인 타입 + 노드 템플릿) | Step 2, Step 3 |
| Phase 3 (Graph Studio UI) | Step 4, Step 5, Step 6 |
| Phase 4 (검증·컴파일·시뮬레이션·Runtime Preview + 도메인 템플릿) | Step 7 ~ Step 12 |

## Step 1: Project Base

| Task | 설명 |
|---|---|
| T1-01 | React + TypeScript + Vite 구성 |
| T1-02 | React Flow / xyflow 설치 |
| T1-03 | 기본 레이아웃 구성 |
| T1-04 | Graph Studio 라우트 또는 메인 화면 구성 |

## Step 2: Domain Types

| Task | 설명 |
|---|---|
| T2-01 | NodeType 정의 |
| T2-02 | PortDataType 정의 |
| T2-03 | GraphNodeData 정의 |
| T2-04 | SOPGraph 정의 |
| T2-05 | GraphEdge 정의 |
| T2-06 | EventContext 정의 |
| T2-07 | ExecutionPlan 정의 |

## Step 3: Node Templates

| Task | 설명 |
|---|---|
| T3-01 | Event Node 템플릿 작성 |
| T3-02 | Space Scope Node 템플릿 작성 |
| T3-03 | Asset Filter Node 템플릿 작성 |
| T3-04 | Condition Node 템플릿 작성 |
| T3-05 | SOP Task Node 템플릿 작성 |
| T3-06 | SOP Group Node 템플릿 작성 |
| T3-07 | Notification Node 템플릿 작성 |
| T3-08 | Branch Node 템플릿 작성 |
| T3-09 | Situation Board Node 템플릿 작성 |

## Step 4: Graph Studio UI

| Task | 설명 |
|---|---|
| T4-01 | Infinite Canvas 구현 |
| T4-02 | Node Palette 구현 |
| T4-03 | Drag & Drop Node 생성 구현 |
| T4-04 | Custom GraphNode 구현 |
| T4-05 | Input / Output Handle 표시 |
| T4-06 | Edge 연결 구현 |
| T4-07 | MiniMap / Controls / Background 적용 |

## Step 5: Property Inspector

| Task | 설명 |
|---|---|
| T5-01 | 선택 노드 상태 관리 |
| T5-02 | 노드 속성 표시 |
| T5-03 | JSON 기반 속성 편집 |
| T5-04 | 속성 변경 시 캔버스 노드 상태 반영 |

## Step 6: Composite SOP Group

| Task | 설명 |
|---|---|
| T6-01 | SOP Group Node 렌더링 |
| T6-02 | collapsed / expanded 상태 관리 |
| T6-03 | 내부 Task 목록 표시 |
| T6-04 | 접기/펼치기 UI 구현 |
| T6-05 | children node 연결 구조 반영 |

## Step 7: Graph Validation

| Task | 설명 |
|---|---|
| T7-01 | 필수 입력 포트 검증 |
| T7-02 | 필수 속성 검증 |
| T7-03 | 포트 타입 검증 |
| T7-04 | 고립 노드 검증 |
| T7-05 | Event에서 Runtime까지 도달 가능성 검증 |
| T7-06 | Validation Panel 표시 |

## Step 8: Graph Compile

| Task | 설명 |
|---|---|
| T8-01 | React Flow nodes/edges normalize |
| T8-02 | SOPGraph JSON 생성 |
| T8-03 | EdgeType 매핑 |
| T8-04 | Compile 결과 Preview |
| T8-05 | localStorage 저장 |

## Step 9: Event Simulation

| Task | 설명 |
|---|---|
| T9-01 | 샘플 EventContext 작성 |
| T9-02 | Trigger Node 매칭 |
| T9-03 | Condition Node 평가 Mock |
| T9-04 | 실행 경로 계산 |
| T9-05 | 실행 경로 하이라이트 |

## Step 10: Runtime Preview

| Task | 설명 |
|---|---|
| T10-01 | RuntimeMission 생성 |
| T10-02 | Notification Mock 생성 |
| T10-03 | Branch 결과 Mock 표시 |
| T10-04 | Situation Board 기록 Mock 표시 |
| T10-05 | Execution Timeline 표시 |

## Step 11: Domain Templates

| Task | 설명 |
|---|---|
| T11-01 | 액화수소 플랜트 샘플 그래프 |
| T11-02 | 발전소 모니터링 샘플 그래프 |
| T11-03 | 안전한국훈련 샘플 그래프 |
| T11-04 | 일반 사업장 안전 샘플 그래프 |

## Step 12: Review

| Task | 설명 |
|---|---|
| T12-01 | Figma v2 와이어프레임과 UI 비교 |
| T12-02 | Graph Studio 사용성 검토 |
| T12-03 | SOPGraph JSON 구조 검토 |
| T12-04 | 2차 POC 범위 정리 |
