#!/usr/bin/env bash
# SessionStart hook: PROGRESS.md + git 상태를 additionalContext로 주입한다.
# 내용은 명령문이 아닌 사실 진술. 10,000자 제한 대비 9,000자로 절단(UTF-8 안전).

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.." || exit 0

CONTEXT=""

if [ -f "PROGRESS.md" ]; then
  CONTEXT="[프로젝트 진행상황 — PROGRESS.md 내용]
$(cat PROGRESS.md)
"
fi

if git rev-parse --git-dir >/dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null)
  RECENT=$(git log --oneline -5 2>/dev/null)
  DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  CONTEXT="$CONTEXT
[Git 상태 — 사실 진술]
현재 브랜치: $BRANCH
최근 커밋 5개:
$RECENT
미커밋 변경 파일 수: $DIRTY
"
fi

if [ -z "$CONTEXT" ]; then
  exit 0
fi

# python으로 UTF-8 안전 절단 + JSON 직렬화 (한글 깨짐 방지). 없으면 plain stdout 폴백.
# (Windows 스토어 스텁 대비: 실제 실행 가능한지 검사)
PY=""
for cand in python3 python; do
  if "$cand" -c "import sys" >/dev/null 2>&1; then PY="$cand"; break; fi
done

if [ -n "$PY" ]; then
  CONTEXT="$CONTEXT" "$PY" -c '
import json, os, sys
ctx = os.environ.get("CONTEXT", "")
if len(ctx) > 9000:
    ctx = ctx[:9000] + "\n...(9,000자에서 절단됨. 전체는 PROGRESS.md 참조)"
out = {
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": ctx,
    }
}
sys.stdout.reconfigure(encoding="utf-8")
print(json.dumps(out, ensure_ascii=False))
'
else
  # 폴백: plain stdout (hook은 stdout을 컨텍스트로 취급)
  printf '%s' "$CONTEXT" | head -c 9000
fi
