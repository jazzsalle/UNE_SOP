---
name: handoff
description: 자리를 뜨기 전 인계 기록을 남기는 스킬. PROGRESS.md를 갱신하고 커밋한다. /handoff로만 호출.
disable-model-invocation: true
---

# handoff — 자리 뜨기 전 인계

## 절차

1. 이번 세션에서 한 일을 되짚어 **`PROGRESS.md`를 갱신**한다. 섹션 구조 유지:
   - `Last updated`: 오늘 날짜
   - `Current goal`: 현재 목표(진행 중인 Phase)
   - `Done this session`: 이번 세션에서 완료한 것들 (기존 이력 아래에 날짜별 누적)
   - `In progress`: 하다 만 것 (파일·중단 지점 구체적으로)
   - `Next steps`: 다음에 할 일 순서대로
   - `Blockers`: 막힌 것/결정 대기
   - `How to run`: 빌드·실행 방법 (바뀌었으면 갱신)
2. 내용은 명령문이 아닌 **사실 진술**로 쓴다.
3. `git add -A && git commit -m "chore: handoff — <오늘 날짜> <한 줄 요약>"` 실행.
4. push는 **직접 하지 말고** 안내만 한다: "다른 곳에서 이어가려면 `git push` 하세요."
