# Phase 8 계획 — 조치결과 회신 웹앱 (5단계)

> planner subagent 산출물 (2026-07-05). `/phase-run 8` 실행 기록.

## 선행 설계 결정 (근거 명시)

**결정 1 — "외부 웹앱"은 App 4번째 뷰 "현장 회신"으로 구현 (옵션 a)**
- 근거 1: `subscribeRuns`(`app/src/engine/runStorage.ts`)는 **same-tab 동기 알림**이다. 같은 앱 내 뷰여야 회신 → 대시보드 실시간 반영이 기존 메커니즘 그대로 동작한다(별도 탭/라우트면 `storage` 이벤트 처리를 새로 만들어야 함 — 과설계).
- 근거 2: react-router 미도입은 Phase 5 선행 판단으로 확정된 관례이고, App.tsx의 뷰 탭 추가 패턴(동시 마운트 + display:none)이 확립되어 있다.
- 외부 웹앱 관점은 **모바일 폭 시뮬레이션 프레임**(중앙 정렬 max-width ~420px 카드)과 **담당자(role) 선택 = 간이 로그인 Mock**으로 표현한다. 로그인한 role에게 할당된 임무(`mission.assigneeRole === role`)와 그 role이 `targets`에 포함된 상황전파만 노출한다.

**결정 2 — 회신 데이터 모델**
- `ExecutorAction`에 `REPORT_ACTION { missionId, result: "DONE" | "IMPOSSIBLE", reporter, note? }` 추가. 전이: DONE → COMPLETED (from SENT|RUNNING|DELAYED — 현장 회신은 착수 절차 없이 완료 처리 허용), IMPOSSIBLE → FAILED (from SENT|RUNNING|DELAYED). 종결 판정은 기존 `finalizeIfSettled` 재사용.
- `ExecutionLogKind`에 `ACTION_REPORTED` 추가(13→14종).
- `ExecutionRun.actionReports?: ActionReport[]` — **optional**로 추가해 기존 localStorage run과 하위 호환(마이그레이션 불필요, 소비 측 `?? []`). `ActionReport = { reportId, missionId, missionTitle, reporter, result, note?, reportedAt, elapsedMinutes }`.
- 상황전파 수신 확인은 기존 `ACK_NOTIFICATION`을 responder 뷰에서 재사용(신규 액션 불필요).
- executor 순수성(React/localStorage 무의존, 불변 리듀서, no-op 동일 참조 반환) 유지.

---

### Task T1: 회신 계약 + 실행기 리듀서 확장 (선행 — 공유 계약)
- 목표: ActionReport 타입·REPORT_ACTION 액션·ACTION_REPORTED 로그 kind를 엔진 계약에 추가하고 리듀서를 구현한다.
- 대상 파일:
  - `app/src/engine/executionTypes.ts` — `ActionReport` 인터페이스, `ExecutionLogKind`에 `ACTION_REPORTED`, `ExecutorAction`에 `REPORT_ACTION` variant, `ExecutionRun.actionReports?: ActionReport[]` (JSDoc에 하위 호환 근거)
  - `app/src/engine/executor.ts` — `createRun`에서 `actionReports: []` 초기화; `applyExecutorAction`에 `REPORT_ACTION` case: 허용 전이표 검사(밖이면 no-op) → mission.status 전이 + actionReports push (reportedAt은 `loggedAtOf` 모의 시계) → `ACTION_REPORTED` 로그(message에 회신자/결과/비고, missionSummary=mission.title) → `finalizeIfSettled`; 모듈 헤더 전이표 주석 갱신
- 완료 기준: 빌드 타입 에러 0. 기존 액션 5종 동작 불변. REPORT_ACTION이 이미 COMPLETED/FAILED인 임무에 no-op(동일 참조).
- 구현 세부: `transitionMission` 재사용 대신 별도 함수 `reportAction` 권장(로그 kind·actionReports push가 다름).

### Task T2: 현장 회신 뷰(Responder) 구현 [AFTER: T1] [PARALLEL with T3]
- 목표: 외부 점검자/안전관리자가 진행 중 run을 골라 간이 로그인(role 선택) 후, 수신된 상황전파를 조회·수신확인하고 자기 임무에 조치결과를 회신하는 모바일 프레임 뷰.
- 대상 파일 (전부 신규):
  - `app/src/responder/ResponderPage.tsx` — ① 진행 중(RUNNING) run 목록에서 선택(`listRuns` + `subscribeRuns` version 카운터 패턴) ② 담당자 선택: run.missions의 assigneeRole 유니크 + notifications.targets 합집합 드롭다운/칩("담당 미지정" 임무는 공통 노출) ③ 선택 role 기준 필터된 상황전파 목록 + "수신 확인"(ACK_NOTIFICATION) ④ 할당 임무 카드 목록
  - `app/src/responder/MissionReportCard.tsx` — 임무 카드: 제목/지시사항/기한/상태 뱃지 + 결과 선택("조치 완료"/"조치 불가") + 비고 입력 + "회신" 버튼 → `applyExecutorAction(run, {type:"REPORT_ACTION",...})` 동일 참조 아니면 `saveRun`. 회신 완료 임무는 회신 내역 읽기 전용 표시
  - `app/src/responder/responder.css` — 모바일 프레임(중앙 max-width ~420px, 배경 `--color-bg-muted` 대비 카드 `--color-bg-surface`), 상태 뱃지
- 완료 기준: run 시작 → role 선택 → 자기 임무/전파만 보임 → 회신 시 상태 전이·saveRun → 전 임무 회신 시 run 종결(boardRecords 갱신). 빌드 통과. 하드코딩 hex/rgb 0건.
- 구현 세부: run 상태는 localStorage 단일 진실 — 로컬 useState에 들고 있지 말고 `loadRun(runId)`를 version 의존 useMemo로 재조회(RunDetailPanel 패턴). App.tsx는 이 태스크에서 수정하지 않음(T4 담당).

### Task T3: 대시보드 회신 이력 반영 [AFTER: T1] [PARALLEL with T2]
- 목표: 회신 이력(누가/언제/결과/비고)이 전자상황판 상세와 실행이력 로그 테이블에 표시된다.
- 대상 파일:
  - `app/src/dashboard/RunDetailPanel.tsx` — 섹션 "조치결과 회신 이력" 추가(③ 상황전파와 ⑤ 로그 사이): `run.actionReports ?? []` 테이블(회신자/회신 시각/임무/결과 뱃지/비고), 빈 상태 문구
  - `app/src/dashboard/ExecutionLogTable.tsx` — `LOG_KIND_LABEL`에 `ACTION_REPORTED: "조치 회신"` 추가(Record 완전성 — T1 후 필수)
  - `app/src/dashboard/dashboard.css` — 회신 이력 테이블 최소 스타일(기존 클래스 재사용 우선)
- 완료 기준: 빌드 통과. actionReports 없는 기존 run에서 크래시 없이 빈 상태. 회신 시 subscribeRuns 실시간 갱신. 토큰만 사용.

### Task T4: App 셸 통합 + 마감 검증 [AFTER: T2, T3]
- 대상 파일: `app/src/App.tsx`(AppView에 "responder", VIEW_TABS에 "현장 회신" — 전자상황판 다음, 동시 마운트+display:none), 필요 시 `단계별 개발내용.txt`(5단계 기록)
- 완료 기준:
  - `cd app && npm run build` 성공(타입 에러 0)
  - 엔드투엔드: Studio 시드 로드→Compile→실행 시작 → 현장 회신 뷰 role 선택→전파 수신확인→임무 회신 → 전자상황판 임무 상태·회신 이력·ACTION_REPORTED 로그 확인 → 전 임무 회신 시 RUN_COMPLETED·상황판 기록 갱신
  - 회귀: Studio 편집/검증/컴파일/시뮬레이션, ExecutionPanel 수동 전이·TICK, 공간 모델 뷰 정상
  - 하드코딩 hex/rgb 0건

**규모 요약**: 신규 3(responder/) + 수정 5(executionTypes, executor, RunDetailPanel, ExecutionLogTable, App) + css 소폭. 신규 의존성 없음.
