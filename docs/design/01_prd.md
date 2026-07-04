# 01 — Visual SOP Graph Studio 1차 POC PRD

## 1. 제품 개요

Visual SOP Graph Studio는 공간, 객체, 이벤트, 조건, SOP 임무, 담당자, 전파, 상황판을 노드로 표현하고, 사용자가 이를 자유 캔버스에서 연결하여 실행 가능한 `SOPGraph`를 생성하는 시각적 SOP 프로그래밍 도구이다.

본 POC는 액화수소 도메인 전용 시스템이 아니다. 장기적으로 플랜트, 발전소, 공공시설, 학교, 지하공간, 산업단지, 안전한국훈련 등 다양한 재난안전 상황에 적용 가능한 범용 SOP 그래프 저작 도구를 목표로 한다.

## 2. 기존 방향과의 차이

기존 1차 POC 구조:

```text
Space / Asset 조회
→ Event 선택
→ SOPBinding 생성
→ Event Simulator
→ Situation Board
```

수정된 방향:

```text
Node Palette
→ Infinite Canvas
→ Typed Port Connection
→ SOPGraph Validation
→ SOPGraph Compile
→ EventContext Simulation
→ Runtime Preview
```

기존 구조가 "SOP 매핑 관리 화면"에 가까웠다면, 수정된 구조는 "SOP를 시각적으로 프로그래밍하는 저작 도구"에 가깝다.

## 3. 제품 정의

본 시스템의 핵심은 사용자가 다음 요소를 노드로 자유롭게 배치하고 연결할 수 있게 하는 것이다.

```text
Event, Space, Asset, Condition, SOP Task, SOP Group, Role,
Notification, Branch, Timer, Escalation, Situation Board, Evidence
```

노드는 각각 속성, 입력 포트, 출력 포트를 가진다. 노드 간 연결은 단순 선이 아니라 실행 흐름, 데이터 흐름, 조건 흐름, 전파 흐름을 의미한다.

## 4. 1차 POC 목표

| 목표 | 설명 |
|---|---|
| 자유 캔버스 | 사용자가 노드를 자유롭게 배치 |
| 노드 팔레트 | 다양한 SOP 구성 노드를 제공 |
| 포트 연결 | 노드의 입력/출력 포트를 연결 |
| 속성 편집 | 선택 노드의 속성을 우측 패널에서 수정 |
| 복합 노드 | SOP Group을 접고 펼칠 수 있음 |
| 그래프 검증 | 필수 연결, 필수 속성, 연결 오류 검증 |
| 그래프 컴파일 | React Flow 상태를 SOPGraph JSON으로 변환 |
| 시뮬레이션 | EventContext를 입력해 실행 경로 확인 |
| 실행 미리보기 | Runtime Preview에서 임무/전파/응답 Mock 확인 |

## 5. 주요 사용자

| 사용자 | 역할 |
|---|---|
| 안전관리자 | 재난/안전 SOP 시나리오를 그래프 형태로 작성 |
| 상황실 운영자 | 이벤트 발생 시 실행 경로와 임무 상태 확인 |
| 시스템 관리자 | 노드 템플릿, 담당자, 전파 채널 관리 |
| 연구개발 담당자 | 도메인별 템플릿, 실행엔진, AI/RAG 확장 |

## 6. POC 포함 범위

- React Flow 기반 무한 캔버스
- Node Palette
- Custom Graph Node
- Typed Input / Output Port
- Property Inspector
- Composite SOP Group
- Collapse / Expand
- Graph Validation
- SOPGraph JSON Export
- EventContext Simulator
- Runtime Preview
- Domain Template Sample

## 7. POC 제외 범위

- 실제 SMS 발송
- 실제 앱푸시
- 실제 센서/IoT 연동
- 실제 3D Viewer 연동
- 실제 DB 저장
- 로그인/권한
- AI/RAG 기반 SOP 자동 생성
- 상용 운영 수준의 전자상황판

## 8. 도메인 확장 방향

1차 POC에서는 액화수소를 하나의 샘플로만 사용한다.

| 샘플 도메인 | 예시 이벤트 | 예시 공간 | 예시 SOP |
|---|---|---|---|
| 액화수소 플랜트 | 누출의심, 압력상승 | 저장구역, 벤트구역 | 초동대응, 전파, 보고 |
| 발전소 | 터빈 진동 이상 | 터빈실, 전기실 | 점검, 부하조정, 책임자 보고 |
| 안전한국훈련 | 지진, 화재, 침수 | 건물, 대피구역 | 대피유도, 인원확인, 상황보고 |
| 일반 사업장 | 작업자 쓰러짐, 화재감지 | 작업구역, 위험구역 | 신고, 응급조치, 대피 |

## 9. 성공 기준

1. 사용자가 노드를 캔버스에 자유롭게 추가할 수 있다.
2. 노드 간 입력/출력 포트를 연결할 수 있다.
3. Event → Space Scope → Asset Filter → Condition → SOP Group → Notification → Branch → Situation Board 흐름을 만들 수 있다.
4. SOP Group을 접고 펼칠 수 있다.
5. 그래프 검증 결과를 확인할 수 있다.
6. SOPGraph JSON을 생성할 수 있다.
7. EventContext 시뮬레이션으로 실행 경로를 확인할 수 있다.
8. Runtime Preview에서 임무와 상태 결과를 확인할 수 있다.
