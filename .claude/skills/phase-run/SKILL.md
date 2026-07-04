---
name: phase-run
description: /phase-run N 또는 "Phase N 실행" 요청 시 호출. planner → generator(병렬) → evaluator 사이클로 Phase N을 오케스트레이션한다.
allowed-tools: Read, Edit, Write, Bash(git *), Task
---

# phase-run — Phase 오케스트레이션

사용자가 `/phase-run N`(또는 "Phase N 실행")을 요청하면 **메인 세션이 직접** 아래 사이클을 오케스트레이션한다.

인자 N이 없으면 CLAUDE.md의 "## Phase" 섹션과 PROGRESS.md를 보고 다음 미완료 Phase를 제안하고 확인받는다.

## 절차

### a) 계획
`@planner` subagent를 Task 도구로 띄워 Phase N을 태스크로 분해한다.
프롬프트에 Phase N의 목표(CLAUDE.md)와 합격 기준(evaluation_criteria.md 해당 섹션)을 포함하라.
planner가 반환한 태스크 분해 결과를 `docs/plans/phase-N.md`로 저장해 설계 기록으로 남긴다.

### b) 병렬 디스패치
planner가 반환한 태스크 목록을 실행한다:
- `[PARALLEL]` 태스크들 → 각각 `@generator`를 **Task 도구로 동시에**(한 메시지에 여러 Task 호출) 띄워 병렬 처리.
- `[AFTER: …]` 태스크 → 선행 태스크 완료 후 순차 실행.
- 병렬화는 generator 내부가 아니라 **이 스킬에서 Task를 여러 개 띄우는 방식**으로 한다.
- 각 generator에게 태스크 명세(목표/대상 파일/완료 기준)를 그대로 전달한다.

### c) 평가
모든 태스크 완료 후 `@evaluator`를 띄워 Phase N을 검증한다.

### d) FAIL 처리
- evaluator의 **거절 노트**를 해당 태스크의 `@generator`에게 전달해 수정시킨 뒤 재평가한다.
- 이 수정 루프는 **최대 3회**. 3회 후에도 FAIL이면 멈추고 남은 문제를 사용자에게 보고한다.

### e) PASS 처리 ★ 핸드오프 연결선 — 반드시 수행
1. **`PROGRESS.md`를 갱신**한다:
   - `Last updated`: 오늘 날짜
   - `Current goal`: 다음 Phase 목표로 갱신
   - `Done this session`: 이번 Phase에서 완료한 내용 추가
   - `Next steps`: 다음 Phase(및 남은 작업)로 갱신
2. "Phase N 완료"를 선언하고 evaluator 체크리스트 결과를 요약해 보여준다.
3. `git add -A` 후 **커밋 메시지를 제안**한다(예: `feat: complete Phase N — <요약>`). **자동 push 금지.**
