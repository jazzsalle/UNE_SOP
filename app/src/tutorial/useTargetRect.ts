/**
 * useTargetRect — data-tutorial-id 대상 요소의 뷰포트 rect를 추적하는 훅 (Phase 9 T6).
 * `[data-tutorial-id="..."]` 셀렉터로 요소를 찾아 getBoundingClientRect를 읽으며,
 * (a) rAF 폴링으로 요소의 "등장 대기"(뷰 전환 직후 아직 未렌더)와 위치 변동
 *     (패널 리사이즈·애니메이션)을 추적하고,
 * (b) resize/scroll(capture) 리스너로 즉시 재측정한다.
 * 값이 실제로 바뀔 때만 setState하므로 폴링이 불필요한 리렌더를 만들지 않는다.
 * 이 훅은 TutorialOverlay 내용 컴포넌트(오버레이가 열려 있을 때만 마운트)에서만
 * 사용되므로, 닫힌 상태에서는 폴링이 돌지 않는다.
 */
import { useEffect, useState } from "react";

/** rect 동등 비교 — left/top/width/height가 모두 같으면 동일로 본다. */
function rectsEqual(a: DOMRect | null, b: DOMRect | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return (
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height
  );
}

/**
 * 대상 rect 추적 — targetId가 null이거나 요소가 없거나 크기 0(display:none 등)이면
 * null을 반환한다(호출측은 중앙 안내 폴백).
 */
export function useTargetRect(targetId: string | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!targetId) {
      setRect(null);
      return;
    }

    let frameId = 0;

    const measure = () => {
      const element = document.querySelector(
        `[data-tutorial-id="${targetId}"]`,
      );
      const next = element ? element.getBoundingClientRect() : null;
      // 크기 0 rect(숨김 뷰 안의 요소 등)는 "없음"으로 취급해 폴백을 유도한다.
      const visible = next !== null && next.width > 0 && next.height > 0;
      const value = visible ? next : null;
      setRect((prev) => (rectsEqual(prev, value) ? prev : value));
    };

    // rAF 폴링 — 뷰 전환 직후 요소 등장 대기 + 레이아웃 변동 추적.
    const loop = () => {
      measure();
      frameId = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [targetId]);

  return rect;
}
