import { forwardRef, useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/utils/cn";
import {
  droplistContainerStyles,
  droplistScrollStyles,
  droplistListStyles,
  droplistGroupLabelStyles,
} from "./styles";
import { ListItem } from "@/components/List/components/ListItem";
import { IconChevronRight } from "@/components/Icons";
import type { DroplistProps, DroplistOption, DroplistGroup, DroplistConfig } from "./types";

export type { DroplistProps, DroplistOption, DroplistGroup, DroplistConfig };

/**
 * Droplist — Select 등에서 사용되는 공통 드롭다운 목록 컴포넌트.
 *
 * 호출부(Select 등)에서 Portal + fixed 포지셔닝을 담당하고,
 * 이 컴포넌트는 시각/접근성 측면의 목록 렌더링만 책임진다.
 * 아이템 렌더링은 ListItem을 공유한다.
 *
 * `children` 필드가 있는 옵션은 hover 시 우측에 서브 Droplist를 자동으로 표시한다.
 *
 * @example
 * <Droplist options={[{ value: "1", label: "옵션 1" }]} value="1" onSelect={setValue} />
 */
export const Droplist = forwardRef<HTMLDivElement, DroplistProps>(
  (
    {
      options = [],
      groups,
      value,
      onSelect,
      role = "listbox",
      className,
      style,
      config,
    },
    forwardedRef,
  ) => {
    // 서브메뉴가 열린 옵션 값
    const [hoveredValue, setHoveredValue] = useState<string | null>(null);
    // 서브메뉴 top 위치 (px, 외부 컨테이너 기준)
    const [subTop, setSubTop] = useState(0);
    // hover 닫힘 딜레이 타이머
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // 외부 컨테이너 참조 (sub-droplist 위치 계산 및 overflow 회피용)
    const outerRef = useRef<HTMLDivElement>(null);

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }, []);

    // forwardedRef + outerRef 동시 할당
    const assignOuterRef = useCallback(
      (el: HTMLDivElement | null) => {
        outerRef.current = el;
        if (typeof forwardedRef === "function") {
          forwardedRef(el);
        } else if (forwardedRef) {
          forwardedRef.current = el;
        }
      },
      [forwardedRef],
    );

    // style에서 maxHeight 분리 — outer는 position/size, inner scroll은 maxHeight 담당
    const { maxHeight, ...outerStyle } = (style ?? {}) as React.CSSProperties;

    // config.width가 있으면 outerStyle에 병합 (config 우선)
    const containerStyle: React.CSSProperties = {
      ...outerStyle,
      ...(config?.width != null ? { width: config.width } : {}),
    };

    // children config 미지정 시 현재 config 상속
    const subConfig = config?.children ?? config;

    // 하위 항목이 있는 옵션에 마우스 진입 시 서브메뉴 위치 계산 후 열기
    const handleOptionMouseEnter = (
      opt: DroplistOption,
      e: React.MouseEvent<HTMLDivElement>,
    ) => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (opt.children?.length && outerRef.current) {
        const outerRect = outerRef.current.getBoundingClientRect();
        const itemRect = e.currentTarget.getBoundingClientRect();
        setSubTop(Math.round(itemRect.top - outerRect.top));
        setHoveredValue(opt.value);
      } else {
        setHoveredValue(null);
      }
    };

    // 옵션 영역 이탈 시 150ms 딜레이 후 서브메뉴 닫기 (서브로 이동 시간 확보)
    const scheduleClose = () => {
      closeTimerRef.current = setTimeout(() => setHoveredValue(null), 150);
    };

    // 서브메뉴 진입 시 닫힘 취소
    const cancelClose = () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };

    // 현재 hover된 옵션 데이터
    const hoveredOption = [...options, ...(groups?.flatMap((g) => g.options) ?? [])].find(
      (o) => o.value === hoveredValue,
    );

    // 개별 옵션 렌더 (children 여부에 따라 hover 핸들러 포함)
    const renderOption = (opt: DroplistOption) => {
      const hasChildren = !!opt.children?.length;
      const listItemOption = {
        ...opt,
        rightIcon: hasChildren ? (opt.rightIcon ?? <IconChevronRight />) : opt.rightIcon,
      };

      if (!hasChildren) {
        return (
          <ListItem
            key={opt.value}
            option={listItemOption}
            selected={opt.value === value}
            size="md"
            onSelect={onSelect}
          />
        );
      }

      return (
        <div
          key={opt.value}
          onMouseEnter={(e) => handleOptionMouseEnter(opt, e)}
          onMouseLeave={scheduleClose}
        >
          <ListItem
            option={listItemOption}
            selected={opt.value === value}
            size="md"
            onSelect={onSelect}
          />
        </div>
      );
    };

    return (
      <div
        ref={assignOuterRef}
        role={role}
        className={cn(droplistContainerStyles, className)}
        style={containerStyle}
      >
        {/* 스크롤 영역 — overflow-y-auto는 여기서 처리하여 outer가 sub-Droplist를 클리핑하지 않도록 분리 */}
        <div className={droplistScrollStyles} style={{ maxHeight }}>
          <div className={droplistListStyles}>
            {/* 그룹/옵션 목록 */}
            {groups
              ? groups.map((group) => (
                  <div key={group.label} className="flex flex-col">
                    <span className={droplistGroupLabelStyles}>{group.label}</span>
                    {group.options.map((opt) => renderOption(opt))}
                  </div>
                ))
              : options.map((opt) => renderOption(opt))}
          </div>
        </div>

        {/* 서브 드롭리스트 — outer 직속으로 렌더하여 inner scroll의 overflow 클리핑 회피 */}
        {hoveredOption?.children?.length ? (
          <div
            className="absolute z-[1]"
            style={{ top: subTop, left: "calc(100% - 4rem)", width: subConfig?.width ?? "100%" }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <Droplist options={hoveredOption.children} value={value} onSelect={onSelect} config={subConfig} />
          </div>
        ) : null}
      </div>
    );
  },
);

Droplist.displayName = "Droplist";
