import React, {
  forwardRef,
  useEffect,
  useRef,
  useState as useReactState,
  useCallback,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { IconButton } from "@/components/buttons/IconButton";
import { IconX } from "@/components/Icons/IconX";
import type { NonModalProps, NonModalSize } from "./types";

// ─── 크기별 너비 ───

const nonModalSizeStyles: Record<NonModalSize, string> = {
  sm: "w-[320rem]",
  md: "w-[420rem]",
  lg: "w-[560rem]",
};

/**
 * NonModal — 논모달 다이얼로그
 *
 * 백드롭 없이 페이지 위에 떠 있는 다이얼로그입니다.
 * 뒤의 콘텐츠와 상호작용이 가능하며, 헤더를 드래그하여 위치를 이동할 수 있습니다.
 *
 * @example
 * ```tsx
 * <NonModal open={isOpen} onClose={() => setIsOpen(false)} title="제목">
 *   내용
 * </NonModal>
 * ```
 */
export const NonModal = forwardRef<HTMLDivElement, NonModalProps>(
  (
    {
      open,
      onClose,
      title,
      size = "md",
      closeOnEsc = true,
      footer,
      showCloseButton = true,
      draggable = true,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useReactState({ x: 0, y: 0 });
    const [centered, setCentered] = useReactState(false);
    const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

    /* ── 열릴 때 화면 중앙 배치 ── */
    useEffect(() => {
      if (!open) {
        setCentered(false);
        return;
      }
      const el = innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPosition({
        x: Math.round((window.innerWidth - rect.width) / 2),
        y: Math.round((window.innerHeight - rect.height) / 2),
      });
      setCentered(true);
    }, [open]);

    /* ── ESC 키 닫기 ── */
    useEffect(() => {
      if (!open || !closeOnEsc) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, closeOnEsc, onClose]);

    /* ── 드래그 핸들러 ── */
    const handlePointerDown = useCallback(
      (e: PointerEvent) => {
        if (!draggable) return;
        dragState.current = {
          startX: e.clientX,
          startY: e.clientY,
          origX: position.x,
          origY: position.y,
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      },
      [draggable, position],
    );

    const handlePointerMove = useCallback(
      (e: PointerEvent) => {
        if (!dragState.current) return;
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        setPosition({
          x: dragState.current.origX + dx,
          y: dragState.current.origY + dy,
        });
      },
      [],
    );

    const handlePointerUp = useCallback(() => {
      dragState.current = null;
    }, []);

    if (!open) return null;

    return createPortal(
      <div
        ref={(node) => {
          (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        role="dialog"
        aria-modal="false"
        aria-labelledby={title ? "nonmodal-title" : undefined}
        className={cn(
          "fixed z-50 flex flex-col",
          "bg-[var(--color-bg-elevated)]",
          "rounded-[12rem] shadow-2xl",
          "border border-[var(--color-border-default)]",
          "animate-[scaleIn_150ms_ease-out]",
          nonModalSizeStyles[size],
          !centered && "invisible",
          className,
        )}
        style={{ left: position.x, top: position.y }}
        {...rest}
      >
        {/* ── Header: 드래그 핸들 ── */}
        <div
          className={cn(
            "flex items-center justify-between px-[24rem] pt-[20rem] pb-[8rem]",
            draggable && "cursor-grab active:cursor-grabbing select-none",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {title && (
            <h2
              id="nonmodal-title"
              className="text-[16rem] font-semibold text-[var(--color-text-default)]"
            >
              {title}
            </h2>
          )}
          {showCloseButton && (
            <IconButton
              variant="ghost"
              color="grayscale"
              size="xs"
              icon={<IconX />}
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              className={!title ? "ml-auto" : undefined}
              aria-label="닫기"
            />
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-[24rem] py-[16rem] text-[14rem] text-[var(--color-text-subtle)]">
          {children}
        </div>

        {/* ── Footer ── */}
        {footer && (
          <div className="flex items-center justify-end gap-[8rem] px-[24rem] pt-[8rem] pb-[20rem]">
            {footer}
          </div>
        )}
      </div>,
      document.body,
    );
  },
);
NonModal.displayName = "NonModal";
