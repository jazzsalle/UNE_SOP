interface UsePaginationProps {
  totalPages: number;
  currentPage: number;
}

export type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; direction: "forward" | "backward" };

/**
 * 페이지네이션 아이템 목록을 생성하는 훅
 *
 * 10페이지 이하: 전체 페이지 번호 표시
 * 11페이지 이상: 항상 10칸 고정 (첫 페이지 + 말줄임 + 중간 페이지 + 말줄임 + 마지막 페이지)
 */
export function usePagination({
  totalPages,
  currentPage,
}: UsePaginationProps): PaginationItem[] {
  // 10페이지 이하: 전체 표시
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => ({
      type: "page" as const,
      page: i + 1,
    }));
  }

  const items: PaginationItem[] = [];
  const page = (p: number): PaginationItem => ({ type: "page", page: p });

  // 앞쪽에 가까울 때: 1~8, ..., 마지막
  if (currentPage <= 6) {
    for (let i = 1; i <= 8; i++) items.push(page(i));
    items.push({ type: "ellipsis", direction: "forward" });
    items.push(page(totalPages));
    return items;
  }

  // 뒤쪽에 가까울 때: 1, ..., (마지막-7)~마지막
  if (currentPage >= totalPages - 5) {
    items.push(page(1));
    items.push({ type: "ellipsis", direction: "backward" });
    for (let i = totalPages - 7; i <= totalPages; i++) items.push(page(i));
    return items;
  }

  // 중간: 1, ..., (현재-3)~(현재+2), ..., 마지막
  items.push(page(1));
  items.push({ type: "ellipsis", direction: "backward" });
  for (let i = currentPage - 3; i <= currentPage + 2; i++) items.push(page(i));
  items.push({ type: "ellipsis", direction: "forward" });
  items.push(page(totalPages));

  return items;
}
