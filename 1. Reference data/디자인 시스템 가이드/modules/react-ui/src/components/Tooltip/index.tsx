import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import type { TooltipProps, TooltipDirection } from "./types";
import { containerStyles } from "./styles";
import { TooltipContent } from "./components/TooltipContent";

/**
 * Tooltip — 툴팁 컴포넌트
 *
 * 요소에 마우스를 올리거나 클릭했을 때 짧은 부가 설명을 표시합니다.
 * Small(1줄) / Large(여러줄) 크기, 4방향, 화살표 정렬, 아이콘/닫기 버튼을 지원합니다.
 * Portal(document.body) + position: fixed 기반으로 overflow: hidden 부모에서도 잘리지 않습니다.
 *
 * @example
 * ```tsx
 * <Tooltip content="설명 텍스트">
 *   <button>호버하세요</button>
 * </Tooltip>
 *
 * <Tooltip content="긴 설명..." size="lg" trigger="click" icon={<IconSeriousFill size={16} />}>
 *   <button>클릭하세요</button>
 * </Tooltip>
 * ```
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      size = "sm",
      direction = "top",
      arrow = "center",
      trigger = "hover",
      showCloseButton,
      icon,
      gap = 4,
      zIndex = 70,
      open: controlledOpen,
      onOpenChange,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // 내부 열림 상태 (비제어 모드)
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    // hover 딜레이 타이머
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // 트리거 컨테이너 참조
    const containerRef = useRef<HTMLDivElement>(null);
    // 툴팁 엘리먼트 참조
    const tooltipRef = useRef<HTMLDivElement>(null);
    // 뷰포트 오버플로 시 자동 전환된 방향
    const [resolvedDirection, setResolvedDirection] =
      useState<TooltipDirection>(direction);
    // 스크롤/리사이즈 시 위치 재계산용 카운터
    const [, setTick] = useState(0);

    // click 트리거 시 닫기 버튼 자동 표시
    const resolvedShowCloseButton = showCloseButton ?? trigger === "click";

    const setOpen = useCallback(
      (value: boolean) => {
        if (!isControlled) setInternalOpen(value);
        onOpenChange?.(value);
      },
      [isControlled, onOpenChange],
    );

    const handleClose = useCallback(() => setOpen(false), [setOpen]);

    // ── hover 핸들러 ──
    const handleMouseEnter = useCallback(() => {
      if (trigger !== "hover") return;
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setOpen(true);
    }, [trigger, setOpen]);

    const handleMouseLeave = useCallback(() => {
      if (trigger !== "hover") return;
      hoverTimeoutRef.current = setTimeout(() => setOpen(false), 100);
    }, [trigger, setOpen]);

    // ── focus 핸들러 ──
    const handleFocus = useCallback(() => {
      if (trigger === "hover") setOpen(true);
    }, [trigger, setOpen]);

    const handleBlur = useCallback(() => {
      if (trigger === "hover") setOpen(false);
    }, [trigger, setOpen]);

    // ── click 핸들러 ──
    const handleClick = useCallback(() => {
      if (trigger !== "click") return;
      setOpen(!isOpen);
    }, [trigger, isOpen, setOpen]);

    // ── click 트리거: 외부 클릭으로 닫기 (portal 밖 클릭 포함) ──
    useEffect(() => {
      if (trigger !== "click" || !isOpen) return;
      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          (!tooltipRef.current || !tooltipRef.current.contains(target))
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }, [trigger, isOpen, setOpen]);

    // ── ESC 키로 닫기 ──
    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, setOpen]);

    // ── 스크롤/리사이즈 시 위치 재계산 트리거 ──
    useEffect(() => {
      if (!isOpen) return;
      // rAF로 스로틀링하여 성능 보장
      let rafId: number;
      const update = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => setTick((c) => c + 1));
      };
      // capture 단계에서 모든 스크롤 이벤트 감지
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }, [isOpen]);

    // ── Portal 기반 위치 계산 + 뷰포트 오버플로 감지 ──
    useLayoutEffect(() => {
      if (!isOpen || !tooltipRef.current || !containerRef.current) {
        setResolvedDirection((prev) => (prev === direction ? prev : direction));
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      // 컨테이너가 아직 레이아웃되지 않았으면 다음 프레임에 재시도
      if (containerRect.width === 0 && containerRect.height === 0) {
        requestAnimationFrame(() => setTick((c) => c + 1));
        return;
      }
      const tw = tooltipRef.current.offsetWidth;
      const th = tooltipRef.current.offsetHeight;
      const ARROW_SIZE = 6;
      const offset = gap + ARROW_SIZE;

      // 주어진 방향에 툴팁이 들어갈 공간이 있는지 판정
      const fitsIn = (dir: TooltipDirection): boolean => {
        switch (dir) {
          case "top":
            return containerRect.top - offset - th >= 0;
          case "bottom":
            return containerRect.bottom + offset + th <= window.innerHeight;
          case "left":
            return containerRect.left - offset - tw >= 0;
          case "right":
            return containerRect.right + offset + tw <= window.innerWidth;
        }
      };

      // 현재 방향이 안 맞으면 fallback 순서대로 최적 방향 탐색
      let bestDir = direction;
      if (!fitsIn(direction)) {
        const fallbacks: Record<TooltipDirection, TooltipDirection[]> = {
          top: ["bottom", "right", "left"],
          bottom: ["top", "right", "left"],
          left: ["right", "bottom", "top"],
          right: ["left", "bottom", "top"],
        };
        for (const candidate of fallbacks[direction]) {
          if (fitsIn(candidate)) {
            bestDir = candidate;
            break;
          }
        }
        if (bestDir === direction) bestDir = fallbacks[direction][0];
      }

      setResolvedDirection((prev) => (prev === bestDir ? prev : bestDir));

      // 방향에 따른 기본 좌표 계산
      let top = 0;
      let left = 0;

      if (bestDir === "top" || bestDir === "bottom") {
        // 수직 위치
        top =
          bestDir === "top"
            ? containerRect.top - offset - th
            : containerRect.bottom + offset;
        // 수평 정렬 (arrow 기준)
        switch (arrow) {
          case "start":
            left = containerRect.left;
            break;
          case "center":
            left = containerRect.left + containerRect.width / 2 - tw / 2;
            break;
          case "end":
            left = containerRect.right - tw;
            break;
        }
      } else {
        // 수평 위치
        left =
          bestDir === "left"
            ? containerRect.left - offset - tw
            : containerRect.right + offset;
        // 수직 정렬 (arrow 기준)
        switch (arrow) {
          case "start":
            top = containerRect.top;
            break;
          case "center":
            top = containerRect.top + containerRect.height / 2 - th / 2;
            break;
          case "end":
            top = containerRect.bottom - th;
            break;
        }
      }

      // DOM에 직접 위치 적용 (useLayoutEffect이므로 paint 전 반영)
      tooltipRef.current.style.top = `${top}px`;
      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.visibility = "visible";
    });

    // ── cleanup timeout ──
    useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      };
    }, []);

    // 트리거 요소에 aria 속성 주입
    const triggerElement = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          "aria-describedby": isOpen ? "tooltip-content" : undefined,
        })
      : children;

    return (
      <div
        ref={(node) => {
          (
            containerRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
        }}
        className={cn(containerStyles, className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        {...rest}
      >
        {triggerElement}

        {/* Portal로 body에 렌더링하여 overflow: hidden 영향 방지 */}
        {isOpen &&
          createPortal(
            <TooltipContent
              tooltipRef={tooltipRef}
              content={content}
              size={size}
              direction={resolvedDirection}
              arrow={arrow}
              showCloseButton={resolvedShowCloseButton}
              icon={icon}
              onClose={handleClose}
              zIndex={zIndex}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />,
            document.body,
          )}
      </div>
    );
  },
);
Tooltip.displayName = "Tooltip";
