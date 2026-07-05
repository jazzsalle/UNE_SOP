/**
 * tutorialSteps — 단계별 조작 튜토리얼의 스텝 정의 (Phase 9 T6).
 * 엔드투엔드 데모 흐름(공간 모델 → 시나리오 → Studio 검증/컴파일 → 실행 →
 * 현장 회신 → 대시보드)을 15스텝으로 안내한다.
 * targetId는 phase-9 계획의 data-tutorial-id 계약 표 리터럴만 사용하고,
 * targetId가 null인 스텝(환영/마무리)은 화면 중앙 안내로 렌더된다.
 * view는 스텝 진입 시 TutorialOverlay가 자동 전환하는 앱 뷰다.
 */
import type { AppView } from "../shell/AppViewContext";

export interface TutorialStep {
  /** 스텝 고유 id — key 용도. */
  id: string;
  /** 이 스텝에서 보여야 하는 앱 뷰 — 진입 시 자동 전환된다. */
  view: AppView;
  /** 하이라이트 대상의 data-tutorial-id — null이면 중앙 안내. */
  targetId: string | null;
  /** 말풍선 제목. */
  title: string;
  /** 말풍선 본문 설명. */
  body: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    view: "studio",
    targetId: null,
    title: "환영합니다",
    body:
      "Visual SOP Graph Studio의 엔드투엔드 데모 튜토리얼입니다. " +
      "공간 모델 확인 → 시나리오 실행 → SOP 검증·컴파일 → 실행 → 현장 회신 → " +
      "전자상황판 점검까지 순서대로 안내합니다. [다음]을 눌러 시작하세요.",
  },
  {
    id: "nav-spatial",
    view: "spatial",
    targetId: "nav-spatial",
    title: "공간 모델 탭",
    body:
      "먼저 공간 모델 뷰입니다. 사이트의 층·공간·시설물과 내비 토폴로지를 " +
      "2D 평면도/3D 뷰어로 확인할 수 있습니다.",
  },
  {
    id: "spatial-3d-toggle",
    view: "spatial",
    targetId: "spatial-3d-toggle",
    title: "2D / 3D 전환",
    body:
      "이 토글로 2D 평면도와 WebGL 3D 뷰를 전환합니다. 3D 뷰에서는 드래그로 " +
      "회전(orbit), 휠로 확대/축소하며 층별 표시/숨김도 조절할 수 있습니다.",
  },
  {
    id: "spatial-topo-select",
    view: "spatial",
    targetId: "spatial-topo-select",
    title: "토폴로지 셋 선택",
    body:
      "표시할 내비 토폴로지 셋(노드·링크)을 선택합니다. 시나리오 실행기에서 " +
      "임의 생성한 토폴로지도 이 목록에 바로 나타납니다.",
  },
  {
    id: "nav-scenario",
    view: "scenario",
    targetId: "nav-scenario",
    title: "시나리오 탭",
    body:
      "시나리오 뷰는 공간·토폴로지·SOP·담당자를 묶은 통합 데모를 단계별로 " +
      "실행하는 화면입니다.",
  },
  {
    id: "scenario-select",
    view: "scenario",
    targetId: "scenario-select",
    title: "시나리오 선택",
    body:
      "실행할 통합 시나리오를 선택합니다. 사이트·SOP 시드·이벤트·담당자 명단이 " +
      "좌측에 요약됩니다.",
  },
  {
    id: "scenario-step-topology",
    view: "scenario",
    targetId: "scenario-step-topology",
    title: "① 토폴로지 생성",
    body:
      "첫 단계로 사이트 공간 footprint에서 내비 토폴로지(노드·링크)를 임의 " +
      "생성합니다. 생성 결과는 [공간 모델에서 보기]로 3D 확인이 가능합니다.",
  },
  {
    id: "scenario-step-load",
    view: "scenario",
    targetId: "scenario-step-load",
    title: "② SOP 로드",
    body:
      "도메인 템플릿 시드를 Graph Studio 캔버스에 로드합니다. 패트롤 노드가 " +
      "있으면 방금 생성한 토폴로지의 경로로 자동 치환됩니다.",
  },
  {
    id: "studio-validate",
    view: "studio",
    targetId: "studio-toolbar-validate",
    title: "그래프 검증 (Validate)",
    body:
      "Graph Studio로 이동했습니다. [Validate] 버튼은 그래프의 연결·타입·필수 " +
      "속성을 검사해 오류/경고를 하단 Validation 패널에 표시합니다.",
  },
  {
    id: "studio-compile",
    view: "studio",
    targetId: "studio-toolbar-compile",
    title: "컴파일 (Compile)",
    body:
      "[Compile] 버튼은 검증을 통과한 SOPGraph를 실행 가능한 ExecutionPlan으로 " +
      "변환합니다. 오류가 있으면 컴파일이 중단됩니다.",
  },
  {
    id: "studio-tab-execution",
    view: "studio",
    targetId: "studio-tab-execution",
    title: "Execution 탭",
    body:
      "하단 Execution 탭에서는 실행 중인 run의 임무 착수/완료 전이와 모의 시간 " +
      "경과(TICK)를 세부 조작할 수 있습니다.",
  },
  {
    id: "scenario-step-run",
    view: "scenario",
    targetId: "scenario-step-run",
    title: "③ 실행 시작",
    body:
      "시나리오 뷰로 돌아와 [실행 시작]을 누르면 시나리오 이벤트로 run이 " +
      "생성되고 임무 전송·상황전파가 시작됩니다.",
  },
  {
    id: "responder-missions",
    view: "responder",
    targetId: "responder-mission-list",
    title: "현장 회신 — 할당 임무",
    body:
      "현장 회신 뷰에서 진행 중 실행과 담당자를 선택하면 이 영역에 할당 임무가 " +
      "나타나고, 조치결과(완료/불가)를 회신할 수 있습니다.",
  },
  {
    id: "dashboard-runs",
    view: "dashboard",
    targetId: "dashboard-run-list",
    title: "전자상황판 — 실행 Run 목록",
    body:
      "전자상황판에서는 실행이력이 이 목록에 실시간 반영됩니다. run을 선택하면 " +
      "장소·시간·임무내용·상황전파·회신 이력을 점검할 수 있습니다.",
  },
  {
    id: "finish",
    view: "scenario",
    targetId: null,
    title: "튜토리얼 완료",
    body:
      "엔드투엔드 흐름 안내를 마쳤습니다. 이제 시나리오 뷰에서 직접 단계를 " +
      "실행해 보세요. 튜토리얼은 내비 우측 [튜토리얼] 버튼으로 언제든 다시 볼 수 " +
      "있습니다.",
  },
];
