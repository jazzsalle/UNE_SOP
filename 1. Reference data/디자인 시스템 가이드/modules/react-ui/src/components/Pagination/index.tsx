import { useState } from "react";
import { cn } from "@/utils/cn";
import { IconMoreHorizontal } from "@/components/Icons/IconMoreHorizontal";
import { IconChevronLeft } from "@/components/Icons/IconChevronLeft";
import { IconChevronRight } from "@/components/Icons/IconChevronRight";
import { IconDoubleChevronLeft } from "@/components/Icons/IconDoubleChevronLeft";
import { IconDoubleChevronRight } from "@/components/Icons/IconDoubleChevronRight";
import { Button } from "@/components/buttons/Button";
import { usePagination } from "./usePagination";

interface PaginationProps {
  /** 전체 페이지 수 */
  totalPages: number;
  /** 현재 페이지 번호 */
  value: number;
  /** 페이지 변경 핸들러 */
  setValue: (page: number) => void;
  /** 말줄임(...) 클릭 시 이동할 페이지 수 @default 5 */
  jumpSize?: number;
}

/**
 * 페이지네이션 컴포넌트
 *
 * 많은 양의 콘텐츠를 여러 화면에 나누어 탐색할 수 있습니다.
 * 10페이지 이하는 전체 표시, 11페이지 이상은 말줄임(...)으로 축약되며
 * 말줄임 hover 시 ">>" 아이콘으로 변경, 클릭 시 5페이지씩 이동합니다.
 *
 * @example
 * <Pagination totalPages={50} value={page} setValue={setPage} />
 */
export const Pagination = ({
  totalPages,
  value,
  setValue,
  jumpSize = 5,
}: PaginationProps) => {
  const items = usePagination({ totalPages, currentPage: value });

  const handlePrev = () => {
    if (value > 1) setValue(value - 1);
  };

  const handleNext = () => {
    if (value < totalPages) setValue(value + 1);
  };

  return (
    <nav className="flex items-center gap-[24rem]">
      <Button
        variant="ghost"
        color="grayscale"
        size="md"
        leftIcon={<IconChevronLeft />}
        onClick={handlePrev}
        disabled={value <= 1}
      >
        이전
      </Button>

      {/* 페이지 번호 목록 */}
      <div className="flex items-center gap-[8rem]">
        {items.map((item, index) =>
          item.type === "page" ? (
            <PageButton
              key={item.page}
              page={item.page}
              isSelected={item.page === value}
              onClick={() => setValue(item.page)}
            />
          ) : (
            <EllipsisButton
              key={`ellipsis-${index}`}
              direction={item.direction}
              onClick={() => {
                if (item.direction === "forward") {
                  setValue(Math.min(totalPages, value + jumpSize));
                } else {
                  setValue(Math.max(1, value - jumpSize));
                }
              }}
            />
          ),
        )}
      </div>

      <Button
        variant="ghost"
        color="grayscale"
        size="md"
        rightIcon={<IconChevronRight />}
        onClick={handleNext}
        disabled={value >= totalPages}
      >
        다음
      </Button>
    </nav>
  );
};

/** 개별 페이지 번호 버튼. 현재 페이지는 primary 배경으로 강조됩니다. */
function PageButton({
  page,
  isSelected,
  onClick,
}: {
  page: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "min-w-[32rem] h-[32rem] flex items-center justify-center border-none",
        "rounded-[6rem] select-none transition-[colors,box-shadow]",
        "typo-text-md font-normal cursor-pointer",
        // 다크모드는 시맨틱 토큰이 자동 처리
        "text-[var(--color-text-default)]", // default
        "hover:text-[var(--color-text-default)] hover:bg-[var(--color-bg-muted)]", // hover
        "active:text-[var(--color-text-default)] active:bg-[var(--color-bg-muted)]", // active
        isSelected &&
          cn(
            // selected
            "bg-[var(--color-interactive-brand)] text-[var(--color-text-on-brand)]", // default
            "shadow-[var(--selected-shadow)]",
            "hover:bg-[var(--color-interactive-brand)] hover:text-[var(--color-text-on-brand)]", // hover
            "active:bg-[var(--color-interactive-brand)] active:text-[var(--color-text-on-brand)]", // active
          ),
      )}
      onClick={onClick}
    >
      {page}
    </button>
  );
}

/** 말줄임 버튼. hover 시 ">>" 아이콘으로 변경되며, 클릭 시 여러 페이지를 건너뜁니다. */
function EllipsisButton({
  direction,
  onClick,
}: {
  direction: "forward" | "backward";
  onClick: () => void;
}) {
  // 마우스 호버 상태
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "min-w-[32rem] h-[32rem] flex items-center justify-center border-none",
        "rounded-[6rem] select-none transition-[colors,box-shadow]",
        "typo-text-md font-normal cursor-pointer",
        // 다크모드는 시맨틱 토큰이 자동 처리
        "text-[var(--color-text-default)]",
        "hover:text-[var(--color-text-default)] hover:bg-[var(--color-bg-muted)]",
        "active:text-[var(--color-text-default)] active:bg-[var(--color-bg-muted)]",
      )}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        direction === "forward" ? (
          <IconDoubleChevronRight size={16} />
        ) : (
          <IconDoubleChevronLeft size={16} />
        )
      ) : (
        <IconMoreHorizontal size={16} pathFill="var(--color-icon-default)" />
      )}
    </button>
  );
}
