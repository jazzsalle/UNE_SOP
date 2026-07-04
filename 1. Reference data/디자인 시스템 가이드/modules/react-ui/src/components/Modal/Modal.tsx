import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { IntentIcon } from "./IntentIcon";
import type { ModalProps } from "./types";

/**
 * Modal — 모달 다이얼로그
 *
 * 백드롭 위에 중앙 정렬되는 대화 상자입니다.
 * ESC 닫기, 백드롭 클릭 닫기를 지원합니다.
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="제목" intent="info">
 *   모달 내용
 * </Modal>
 * ```
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      intent = "none",
      // size = "md",
      closeOnBackdrop = true,
      closeOnEsc = true,
      footer,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const hasIntent = intent !== "none";

    /* ── ESC 키 닫기 ── */
    useEffect(() => {
      if (!open || !closeOnEsc) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, closeOnEsc, onClose]);

    /* ── 열릴 때 body 스크롤 잠금 ── */
    useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open]);

    /* ── 백드롭 클릭 ── */
    const handleBackdropClick = useCallback(
      (e: MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      },
      [closeOnBackdrop, onClose],
    );

    if (!open) return null;

    return createPortal(
      /* ── Backdrop ── */
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-black/25",
          "animate-[fadeIn_150ms_ease-out]",
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      >
        {/* ── Dialog ── */}
        <div
          ref={ref ?? dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          className={cn(
            "relative flex gap-[24rem] p-[24rem]",
            "w-[540rem] h-[220rem]",
            "bg-[var(--color-bg-elevated)]",
            "rounded-[12rem] shadow-[var(--elevation-03)]",
            "animate-[scaleIn_150ms_ease-out]",
            className,
          )}
          {...rest}
        >
          {/* Intent Icon */}
          {hasIntent && <IntentIcon intent={intent} />}
          <div className="flex-1 flex flex-col">
            {/* ── Header: 타이틀 ── */}
            {title && (
              <h2
                id="modal-title"
                className={cn(
                  "typo-title-sm font-bold",
                  "mb-[16rem]",
                  "text-[var(--color-text-default)]",
                )}
              >
                {title}
              </h2>
            )}

            {/* ── Body: intent 있으면 아이콘 너비만큼 들여쓰기(pl-60rem) ── */}
            <div
              className={cn(
                "flex-1 overflow-y-auto mb-[24rem]",
                "typo-text-md font-normal",
                "text-[var(--color-text-subtle)]",
              )}
            >
              {children}
            </div>

            {/* ── Footer: 하단 액션 버튼 영역 ── */}
            {footer && (
              <div
                className={cn(
                  "typo-text-md font-normal",
                  "text-[var(--color-text-default)]",
                  "flex items-center justify-end gap-[8rem]",
                )}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body,
    );
  },
);
Modal.displayName = "Modal";
