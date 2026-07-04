// html font-size 오설정 감지 유틸 (개발 환경 전용)
//
// 호스트 프로젝트가 html { font-size: 1px }을 설정했더라도 :root의 font / font-size
// 선언이 더 높은 specificity로 이를 덮으면 컴포넌트가 16배 확대 렌더된다.
// 첫 번째 une-front 컴포넌트 mount 시점에 한 번만 검사해 경고를 출력한다.

// @types/node 없이 process.env.NODE_ENV만 참조하기 위한 최소 선언.
// consumer 번들러가 NODE_ENV 문자열을 리터럴로 치환해 프로덕션에서 이 블록을 제거한다.
declare const process: { env: { NODE_ENV?: string } };

// 세션 내 경고 중복 방지 플래그
let asserted = false;

// 기대되는 html font-size 범위 (px). 1px 고정 또는 vw 반응형 모두 커버.
const EXPECTED_MIN_PX = 0.5;
const EXPECTED_MAX_PX = 2;

const DOCS_URL =
  "https://bitbucket.org/unecorp/designsystem/src/main/modules/react-ui/README.md#html-font-size";

export function assertRootFontSize(): void {
  // 프로덕션 빌드에서는 consumer 번들러가 이 블록 전체를 제거
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") return;
  if (asserted) return;

  // SSR / 비-브라우저 환경 가드
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const root = document.documentElement;
  if (!root) return;

  const computed = getComputedStyle(root).fontSize;
  const px = parseFloat(computed);
  if (!Number.isFinite(px)) return;

  if (px >= EXPECTED_MIN_PX && px <= EXPECTED_MAX_PX) return;

  asserted = true;

  // eslint-disable-next-line no-console
  console.warn(
    [
      "[@une-front/react-ui] html font-size가 예상 범위를 벗어났습니다.",
      `  현재 html font-size: ${computed} (≈ ${px}px)`,
      `  기대 범위: ${EXPECTED_MIN_PX}px ~ ${EXPECTED_MAX_PX}px (보통 1px 고정 또는 vw 반응형)`,
      "  컴포넌트 내부 수치가 rem 기반이라 호스트의 html { font-size } 설정이 필요합니다.",
      "  가능성 높은 원인: :root { font: ... } 또는 :root { font-size: ... } 선언이",
      "  html 규칙을 specificity(0,0,1,0 > 0,0,0,1)로 덮고 있을 수 있습니다.",
      `  해결 가이드: ${DOCS_URL}`,
    ].join("\n"),
  );
}

// 테스트 전용 내부 리셋
export function __resetAssertRootFontSizeForTests(): void {
  asserted = false;
}
