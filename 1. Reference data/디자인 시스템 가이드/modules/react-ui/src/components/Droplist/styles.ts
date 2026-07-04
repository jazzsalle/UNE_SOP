import { cn } from "@/utils/cn";

/* ──────────────────────────────────────────────
 * 컨테이너 (드롭리스트 외곽)
 * ────────────────────────────────────────────── */

export const droplistContainerStyles = cn(
  // position/size는 호출부(Select 등)에서 Portal + fixed 등으로 인라인 주입
  // overflow 미설정 — sub-Droplist가 우측으로 삐져나와도 클리핑되지 않도록
  "relative rounded-[8rem] bg-[var(--color-bg-elevated)]",
  "shadow-[var(--elevation-04)]",
);

// 스크롤 래퍼 — overflow는 여기서 처리 (maxHeight는 호출부에서 인라인 주입)
export const droplistScrollStyles = cn("overflow-y-auto");

// 옵션 목록 래퍼 — 상하 padding만, 아이템 간 gap 없음 (Figma 기준)
export const droplistListStyles = cn("py-[8rem] flex flex-col");

/* ──────────────────────────────────────────────
 * 그룹 라벨
 * ────────────────────────────────────────────── */

export const droplistGroupLabelStyles = cn(
  "typo-text-sm font-medium px-[12rem] pt-[8rem] pb-[4rem]",
  // Figma 미정의 — 프리미티브 유지
  "text-[var(--grayscale-400)] dark:text-[var(--grayscale-500)]",
);
