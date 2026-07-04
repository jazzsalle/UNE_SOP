import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { assertRootFontSize } from "@/utils/assertRootFontSize";
import { IconInfoCircleLine } from "@/components/Icons/IconInfoCircleLine";
import { IconCheckLine } from "@/components/Icons/IconCheckLine";
import { IconWarningLine } from "@/components/Icons/IconWarningLine";
import { IconXCircle } from "@/components/Icons/IconXCircle";
import { IconX } from "@/components/Icons/IconX";
import { IconButton } from "@/components/buttons/IconButton";

// ─── Types ───

type ToastIntent = "none" | "info" | "success" | "warning" | "error";
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * 토스트가 닫힌 이유
 * - `timeout`: duration 경과로 자동 닫힘
 * - `manual`: 사용자가 닫기(X) 버튼 클릭
 * - `programmatic`: `dismiss`/`dismissAll` 호출 또는 maxToasts 초과로 밀려나 닫힘
 */
export type ToastCloseReason = "timeout" | "manual" | "programmatic";

export interface ToastData {
  id: string;
  message: ReactNode;
  intent: ToastIntent;
  duration: number;
  /** 닫기(X) 버튼 표시 여부 override. 미지정 시 2개 이상이거나 duration=0일 때 자동 표시 */
  dismissible?: boolean;
  /** 닫힐 때 호출되는 콜백 */
  onClose?: (reason: ToastCloseReason) => void;
  /** 닫기 진행 중 여부 (exit 애니메이션용) */
  closing?: boolean;
}

interface ToastContextValue {
  toast: (
    message: ReactNode,
    options?: {
      intent?: ToastIntent;
      duration?: number;
      dismissible?: boolean;
      onClose?: (reason: ToastCloseReason) => void;
    },
  ) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ─── Context ───

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * useToast - 토스트를 띄우기 위한 훅
 *
 * @example
 * const { toast, dismiss, dismissAll } = useToast();
 * toast("저장되었습니다", { intent: "success" });
 */
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};

// ─── Icons ───

const icons: Record<ToastIntent, ReactNode> = {
  none: null,
  info: <IconInfoCircleLine size={20} />,
  success: <IconCheckLine size={20} />,
  warning: <IconWarningLine size={20} />,
  error: <IconXCircle size={20} />,
};

// ─── Styles ───

// 다크모드는 시맨틱 토큰이 자동 처리
const intentStyles: Record<ToastIntent, string> = {
  none: "",
  info: "text-[var(--color-icon-info)]",
  warning: "text-[var(--color-icon-warning)]",
  error: "text-[var(--color-icon-danger)]",
  success: "text-[var(--color-icon-success)]",
};

const positionStyles: Record<ToastPosition, string> = {
  "top-left": "top-[60rem] left-[24rem] items-start",
  "top-center": "top-[60rem] left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-[60rem] right-[24rem] items-end",
  "bottom-left": "bottom-[60rem] left-[24rem] items-start",
  "bottom-center": "bottom-[60rem] left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-[60rem] right-[24rem] items-end",
};

// ─── Toast Item ───

const ToastItem = ({
  data,
  onDismiss,
  showDismiss,
}: {
  data: ToastData;
  onDismiss: (id: string, reason: ToastCloseReason) => void;
  showDismiss: boolean;
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center w-[480rem] h-[48rem]",
        "px-[20rem] rounded-[6rem] shadow-[var(--elevation-03)]",
        "typo-text-lg font-normal",
        "bg-[var(--color-bg-elevated)]",
        "text-[var(--color-text-default)]",
        data.closing
          ? "animate-[toastOut_200ms_ease-in_forwards]"
          : "animate-[toastIn_200ms_ease-out]",
      )}
    >
      {data.intent !== "none" && (
        <span
          className={cn("flex-shrink-0 mr-[8rem]", intentStyles[data.intent])}
        >
          {icons[data.intent]}
        </span>
      )}
      <span className="flex-1">{data.message}</span>
      {showDismiss && (
        <IconButton
          className="ml-[20rem]"
          icon={<IconX />}
          size="4xs"
          variant="ghost"
          color="grayscale"
          onClick={() => onDismiss(data.id, "manual")}
          aria-label="닫기"
        />
      )}
    </div>
  );
};

// ─── Provider ───

export interface ToastProviderProps {
  children: ReactNode;
  /** 토스트 위치 @default "top-center" */
  position?: ToastPosition;
  /** 기본 지속 시간 (ms) @default 3000 */
  duration?: number;
  /** 최대 토스트 개수 @default 3 */
  maxToasts?: number;
  /** 토스트 컨테이너 z-index @default 60 */
  zIndex?: number;
}

/**
 * ToastProvider - 토스트 컨텍스트 프로바이더
 *
 * 앱 최상위에 감싸면 하위 어디서든 useToast()로 토스트를 띄울 수 있습니다.
 *
 * @example
 * <ToastProvider position="top-center" duration={3000}>
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider = ({
  children,
  position = "top-center",
  duration: defaultDuration = 3000,
  maxToasts = 3,
  zIndex = 60,
}: ToastProviderProps) => {
  // 현재 활성 토스트 목록
  const [toasts, setToasts] = useState<ToastData[]>([]);
  // 토스트별 자동 dismiss 타이머
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // exit 애니메이션 후 토스트 제거 및 타이머 정리
  const dismiss = useCallback(
    (id: string, reason: ToastCloseReason = "programmatic") => {
      setToasts((prev) => {
        const target = prev.find((t) => t.id === id);
        // 이미 닫히는 중이면 중복 호출 방지
        if (!target || target.closing) return prev;
        // 닫힘 콜백 호출
        target.onClose?.(reason);
        return prev.map((t) => (t.id === id ? { ...t, closing: true } : t));
      });
      // 애니메이션 후 제거
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
          clearTimeout(timer);
          timers.current.delete(id);
        }
      }, 200);
    },
    [],
  );

  // 새 토스트 생성, 최대 개수 초과 시 가장 오래된 항목 dismiss
  const toast = useCallback(
    (
      message: ReactNode,
      options?: {
        intent?: ToastIntent;
        duration?: number;
        dismissible?: boolean;
        onClose?: (reason: ToastCloseReason) => void;
      },
    ) => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      const intent = options?.intent ?? "info";
      const duration = options?.duration ?? defaultDuration;

      const newToast: ToastData = {
        id,
        message,
        intent,
        duration,
        dismissible: options?.dismissible,
        onClose: options?.onClose,
      };
      setToasts((prev) => {
        const next = [...prev, newToast];
        if (maxToasts > 0 && next.filter((t) => !t.closing).length > maxToasts) {
          const oldest = next.find((t) => !t.closing);
          if (oldest) dismiss(oldest.id, "programmatic");
        }
        return next;
      });

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id, "timeout"), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, dismiss, maxToasts],
  );

  // 모든 토스트 exit 애니메이션 후 일괄 제거
  const dismissAll = useCallback(() => {
    setToasts((prev) => {
      // 활성 토스트에 대해서만 onClose 호출 (이미 닫히는 중이면 스킵)
      prev.forEach((t) => {
        if (!t.closing) t.onClose?.("programmatic");
      });
      return prev.map((t) => ({ ...t, closing: true }));
    });
    setTimeout(() => {
      setToasts([]);
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    }, 200);
  }, []);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // html font-size 오설정 감지 (dev 전용, 세션 내 1회)
  useEffect(() => {
    assertRootFontSize();
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      {createPortal(
        <div
          style={{ zIndex }}
          className={cn(
            "fixed flex gap-[8rem] pointer-events-none -mx-[16rem] -my-[10rem]",
            position.startsWith("top") ? "flex-col-reverse" : "flex-col",
            positionStyles[position],
          )}
        >
          {(() => {
            // 활성(닫히는 중이 아닌) 토스트 개수
            const activeCount = toasts.filter((v) => !v.closing).length;
            return toasts.map((t) => {
              // 닫기 버튼 표시 여부: 명시값 > (다중 스택 || 자동 닫힘 없음)
              const showDismiss =
                t.dismissible ?? (activeCount > 1 || t.duration === 0);
              return (
                <div
                  key={t.id}
                  className={cn(
                    "pointer-events-auto",
                    t.closing
                      ? "animate-[toastSlotClose_200ms_ease-in_forwards]"
                      : "animate-[toastSlotOpen_200ms_ease-out]",
                  )}
                >
                  <div className={cn("px-[16rem]")}>
                    <ToastItem
                      data={t}
                      onDismiss={dismiss}
                      showDismiss={showDismiss}
                    />
                  </div>
                </div>
              );
            });
          })()}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};
