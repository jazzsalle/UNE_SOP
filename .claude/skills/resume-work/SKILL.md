---
name: resume-work
description: 사용자가 "이어서 하자", "계속", "어디까지 했지", "resume" 등 이전 작업 재개를 요청할 때 호출. PROGRESS.md와 git 상태를 읽어 중단 지점부터 이어간다.
---

# resume-work — 작업 재개 (수동 폴백)

SessionStart hook이 진행상황을 주입하지 못했거나, 사용자가 명시적으로 재개를 요청할 때 사용한다.

## 현재 진행상황

!`cat PROGRESS.md`

## Git 상태

!`git log --oneline -5 && git status --short && git branch --show-current`

## 할 일

1. 위 PROGRESS.md의 **Next steps**와 **In progress**를 확인한다.
2. git 로그·미커밋 변경과 대조해 실제 상태를 파악한다(문서와 코드가 다르면 코드를 신뢰하고 사용자에게 알린다).
3. 기록된 Next steps의 첫 항목부터 이어서 작업한다. Phase 단위 작업이면 `/phase-run N` 사용을 제안한다.
