# 설계 문서 (1차 POC — Visual SOP Graph Studio)

원본 `1. Reference data/Project Instructions for Codex.docx`(.pdf 동일)를 Claude Code가 읽을 수 있는 마크다운으로 변환·재구성한 것이다. **이 디렉터리가 1차 POC 설계의 기준 문서이며**, 원본 docx/pdf는 이력 보존용이다.

원본은 Codex 개발용으로 작성되었으나 본 프로젝트는 Claude Code로 개발하므로 다음을 조정했다:

- 원본 "파일 1. AGENTS.md(Project Instructions for Codex)" → `00_overview.md` (도구 중립 개요). 프로젝트 규칙의 최상위 기준은 저장소 루트 `CLAUDE.md`다.
- 원본 "06_POC_TASKS.md"의 내부 Phase 1~12는 **CLAUDE.md의 Phase 1~9와 번호 체계가 다르다**. 혼동 방지를 위해 `07_task_breakdown.md`에 매핑표를 추가했다. 이 저장소에서 "Phase N"은 항상 CLAUDE.md 기준이다.

## 문서 목록

| 파일 | 내용 |
|---|---|
| `00_overview.md` | 프로젝트 목표, MVP 범위, 필수 샘플 플로우, 아키텍처 규칙, 승인 기준 |
| `01_prd.md` | 1차 POC PRD — 제품 정의, 목표, 사용자, 포함/제외 범위, 성공 기준 |
| `02_domain_model.md` | SOPGraph 중심 도메인 모델 — 타입 정의 전체 |
| `03_user_flow.md` | Flow 1~10 사용자 흐름 |
| `04_feature_requirements.md` | FR-001~020, Node Palette/Custom Node/Validation/Runtime Preview 요구사항 |
| `05_api_schema.md` | Mock API 경로·요청/응답 구조 (향후 백엔드 전환 대비) |
| `06_seed_data.md` | 노드 템플릿 시드 + 샘플 그래프 4종 |
| `07_task_breakdown.md` | 원본 태스크 분해 (CLAUDE.md Phase 매핑표 포함) |

2단계 이후(Phase 5~9) 설계 근거는 `단계별 개발내용.txt`, `1. Reference data/실내공간정보 구축 작업규정/`, `1. Reference data/workplans_webbuilder/`를 참조한다.
