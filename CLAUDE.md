# Visual SOP Graph Studio

공간·이벤트·조건·SOP 임무·전파·상황판을 노드로 표현하고, 자유 캔버스에서 타입드 포트로 연결해 실행 가능한 `SOPGraph`를 저작·검증·컴파일·시뮬레이션하는 도구. 특정 도메인(액화수소) 전용이 아닌 범용 재난안전 SOP 저작 도구를 목표로 한다.

## 설계 문서

- `docs/design/` — **1차 POC 설계 기준 문서** (개요, PRD, 도메인 모델, 유저 플로우, 기능 요구사항 FR-001~020, API 스키마, 시드 데이터, 태스크 분해). 원본 `1. Reference data/Project Instructions for Codex.docx`(.pdf)를 마크다운으로 변환·재구성한 것으로, 원본은 이력 보존용. 문서 내부 태스크 단계(Step 1~12)와 이 파일의 Phase 1~9 매핑은 `docs/design/07_task_breakdown.md` 참조.
- `단계별 개발내용.txt` — 전체 6단계 로드맵
- `1. Reference data/실내공간정보 구축 작업규정/` — Phase 6 공간 스키마 근거 (별표 2·3·5·6·10)
- `1. Reference data/workplans_webbuilder/` — Phase 7 토폴로지 연동 근거 (개발팀의 3D 웹 저작도구 작업계획)
- `1. Reference data/디자인 시스템 가이드/` — UI 디자인 준수 대상 (design-tokens + react-ui SPEC)

## 기술 스택 / 규칙

- React + TypeScript + Vite + `@xyflow/react` (React Flow)
- 1차 POC는 Mock API / localStorage 기반. 실제 SMS·IoT·인증·프로덕션 DB 없음.
- **아키텍처 규칙**: React Flow는 시각 편집기 레이어일 뿐이다. 제품 데이터 모델은 `SOPGraph`.
  `React Flow nodes/edges → normalizeGraph() → SOPGraph → validateGraph() → compileGraph() → ExecutionPlan → Runtime Preview`
  편집기 레이어와 실행 로직을 분리한다.
- UI는 `1. Reference data/디자인 시스템 가이드`의 토큰·컴포넌트 SPEC을 따른다.
- 앱 코드는 `app/` 디렉터리에 둔다 (Phase 1에서 스캐폴딩).

## 빌드 / 실행 (Phase 1 이후 유효)

```
cd app
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (타입 체크 포함)
```

## Phase

각 Phase는 `/phase-run N`으로 실행한다. 합격 기준은 `evaluation_criteria.md` 참조.

| Phase | 목표 | 산출물 |
|---|---|---|
| 1 | 스캐폴딩: Vite+React+TS+xyflow 구성, 디자인 토큰 연동, 3패널 기본 레이아웃, git init | 빌드되는 앱 골격 + Graph Studio 빈 화면 |
| 2 | 도메인 타입 + 노드 템플릿: NodeType/PortDataType/GraphNode/GraphEdge/SOPGraph/EventContext/ExecutionPlan 타입, 노드 템플릿(Trigger/Scope/Object/Logic/SOP/People/Action/Runtime/Record 그룹) | `app/src/domain/*` 타입·템플릿 모듈 |
| 3 | Graph Studio UI: 무한 캔버스, Node Palette(드래그앤드롭), 커스텀 노드+타입드 포트, Property Inspector, SOP Group 접기/펼치기 | 편집 가능한 그래프 에디터 |
| 4 | 검증→컴파일→시뮬레이션→Runtime Preview + 도메인 템플릿 4종(액화수소/발전소/안전한국훈련/일반 사업장). **1단계 완료** = Codex 승인 기준 충족 | Validation Panel, SOPGraph JSON Export, EventContext 시뮬레이터, 실행경로 하이라이트, 임무/전파/상황판 Mock |
| 5 | 2단계 — SOP 실행기 + 실행이력 로그 + 전자상황판 대시보드(장소/시간/임무내용/상황전파를 관리자가 점검) | 실행기 + 대시보드 |
| 6 | 3단계 — 실내공간정보 구축 작업규정 분석 → 레이어 분류/명명규칙 반영 공간 스키마 설계·적용, 검증용 3D 공간 모델링, 1단계 Space 노드 연동 보완 | 표준 기반 공간 스키마 + 검증 모델 |
| 7 | 4단계 — webbuilder 토폴로지(내비 메시 기반 노드/링크) 구조 분석 → 토폴로지 스키마 연결 설계, 층별/특정 토폴로지 셋 임포트 및 SOP 그래프 연동 컴포넌트(예: 로봇개 패트롤 시나리오) | 토폴로지-SOP 연동 |
| 8 | 5단계 — 외부 현장 점검자/안전관리자가 상황전파를 수신하고 조치결과를 회신하면 실행이력 로그·대시보드에 반영되는 웹앱 | 조치결과 회신 웹앱 |
| 9 | 6단계 — 통합 seed data + 시나리오 실행기(토폴로지 임의 생성·공간 연결), 간단 WebGL 뷰어, 마우스 커서 위치를 표기하는 단계별 조작 튜토리얼 | 엔드투엔드 데모 통합 서비스 |
