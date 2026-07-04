# 04 — Feature Requirements

## 1. 기능 요구사항 개요

본 POC의 기능 요구사항은 기존 SOPBinding 관리 기능이 아니라 Visual SOP Graph Studio 구현에 초점을 둔다.

## 2. 기능 요구사항 목록

| ID | 기능명 | 설명 | POC 포함 |
|---|---|---|---|
| FR-001 | Graph Studio Canvas | 무한 캔버스 기반 노드 편집 화면 | 포함 |
| FR-002 | Node Palette | 사용 가능한 노드 템플릿 목록 제공 | 포함 |
| FR-003 | Drag & Drop Node Creation | 팔레트에서 캔버스로 노드 추가 | 포함 |
| FR-004 | Custom Node Rendering | 노드 유형별 색상, 헤더, 속성, 포트 표시 | 포함 |
| FR-005 | Typed Input / Output Port | 포트별 데이터 타입 정의 | 포함 |
| FR-006 | Edge Connection | 노드 포트 간 연결선 생성 | 포함 |
| FR-007 | Connection Validation | 포트 타입이 맞지 않으면 연결 제한 또는 오류 표시 | 포함 |
| FR-008 | Property Inspector | 선택 노드의 속성 편집 | 포함 |
| FR-009 | Composite SOP Group | 여러 SOP Task를 묶은 복합 노드 | 포함 |
| FR-010 | Collapse / Expand | SOP Group 접기/펼치기 | 포함 |
| FR-011 | Graph Validation | 필수 연결, 필수 속성, 순환 참조 검증 | 포함 |
| FR-012 | SOPGraph JSON Export | nodes/edges를 SOPGraph로 변환 | 포함 |
| FR-013 | EventContext Simulator | 테스트 이벤트 입력 | 포함 |
| FR-014 | Execution Path Highlight | 실행 경로 하이라이트 | 포함 |
| FR-015 | Runtime Preview | 임무, 전파, 응답, 상황판 반영 Mock 표시 | 포함 |
| FR-016 | Domain Templates | 액화수소/발전소/훈련 샘플 템플릿 | 포함 |
| FR-017 | Real SMS | 실제 문자 발송 | 제외 |
| FR-018 | Real IoT Integration | 실제 센서/IoT 연동 | 제외 |
| FR-019 | 3D Viewer Adapter | 3D Viewer 연동 인터페이스 | 2차 POC |
| FR-020 | AI/RAG SOP Generation | 문서 기반 SOPGraph 초안 생성 | 2차 POC |

## 3. Node Palette 요구사항

| 그룹 | 노드 |
|---|---|
| Trigger | Sensor Event, Manual Report, AI Detection |
| Scope | Facility, Zone, Evacuation Area |
| Object | Sensor, Equipment, CCTV, Valve |
| Logic | Condition, AND/OR, Branch |
| SOP | SOP Task, SOP Group, Checklist |
| People | Role, Contact Group, Agency |
| Action | SMS, App Push, Broadcast |
| Runtime | Situation Board, Timer, Escalation |
| Record | Evidence, Report, History |

## 4. Custom Node 요구사항

| 요소 | 설명 |
|---|---|
| Node Type | event, condition, sop_group 등 |
| Label | 사용자 표시명 |
| Description | 설명 |
| Properties | 노드별 설정값 |
| Input Ports | 입력 포트 |
| Output Ports | 출력 포트 |
| Validation State | 오류/경고 상태 |
| Collapse State | 접기/펼치기 상태 |

## 5. Graph Validation 요구사항

| 검증 항목 | 설명 |
|---|---|
| 필수 입력 포트 | required input port 연결 여부 |
| 필수 속성 | eventType, condition, assignee 등 필수값 |
| 포트 타입 | source/target port dataType 호환 여부 |
| 고립 노드 | 연결되지 않은 노드 |
| 실행 불가 경로 | Event에서 Runtime까지 도달 불가한 경로 |
| 순환 참조 | 무한 루프 가능성 |
| 미응답 분기 | timeout 또는 escalation 누락 여부 |

## 6. Runtime Preview 요구사항

| 항목 | 설명 |
|---|---|
| Triggered Event | 입력 EventContext |
| Execution Path | 실행되는 노드 경로 |
| Missions | 생성된 임무 |
| Notifications | 전파 메시지 Mock |
| Responses | 완료/지연/미응답 Mock |
| Situation Board Record | 상황판 기록 내용 |
