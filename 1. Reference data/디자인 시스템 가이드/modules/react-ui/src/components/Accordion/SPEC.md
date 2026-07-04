# Accordion — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `314:6075` |
| 링크 | https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=314-6075 |
| 상태 | 1차 검토완료 |

## 컴포넌트 구성

단일 컴포넌트입니다. 제어/비제어 모드를 모두 지원합니다.

## Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `variant` | `"default" \| "line"` | `"default"` | 기본형(border+radius) / 라인형(border-bottom) |
| `size` | `"lg" \| "md" \| "sm"` | `"lg"` | 헤더 크기 |
| `open` | `boolean` | — | 제어 모드 열림 상태 |
| `defaultOpen` | `boolean` | `false` | 비제어 모드 초기 열림 상태 |
| `onToggle` | `(open: boolean) => void` | — | 열림/닫힘 변경 핸들러 |
| `title` | `string` | — | 헤더 타이틀 텍스트 (필수) |
| `icon` | `ReactNode` | — | 헤더 왼쪽 아이콘 |
| `disabled` | `boolean` | `false` | 비활성화 상태 |
| `children` | `ReactNode` | — | 콘텐츠 영역 (필수) |

## 크기별 치수

| size | 헤더 높이 | 좌우 패딩 | 아이콘 | 셰브론 | 폰트 | 모서리 반경 | 콘텐츠 패딩 |
|---|---|---|---|---|---|---|---|
| `lg` | 56px | 20px | 20px | 16px | `typo-text-lg` (16px) | 8px | px 20px / py 12px |
| `md` | 48px | 16px | 16px | 16px | `typo-text-md` (14px) | 6px | px 16px / py 12px |
| `sm` | 40px | 12px | 16px | 12px | `typo-text-sm` (12px) | 6px | p 12px |

## variant별 컨테이너

| variant | 스타일 |
|---|---|
| `default` | `rounded` + `border border-[--color-interactive-neutral]` + `overflow-hidden` |
| `line` | `border-b border-[--color-interactive-neutral]` |

## 상태별 스타일

| 상태 | 헤더 bg | 타이틀 | 아이콘 |
|---|---|---|---|
| 닫힘 Default | transparent | `--color-text-default` | `--color-icon-default` |
| 닫힘 Hover | `--color-bg-muted` | `--color-text-default` | `--color-icon-default` |
| 열림 Default | `--color-bg-accordion-open` | `--color-text-brand` | `--color-icon-brand` |
| 열림 Hover | `--color-bg-accordion-open-hover` | `--color-text-brand` | `--color-icon-brand` |
| Disabled | transparent | `--color-text-disabled` | `--color-icon-disabled` |
| Focus-visible | `--selected-shadow` 포커스 링 |  |  |

## 신규 시맨틱 토큰

| 토큰 | Light | Dark |
|---|---|---|
| `--color-bg-accordion-open` | `#f0f4ff` (light-blue/25) | `#0e1733` (dark-blue/25) |
| `--color-bg-accordion-open-hover` | `#e1e9ff` (light-blue/50) | `#111c3d` (dark-blue/50) |

## 콘텐츠 영역

- bg: `--color-bg-surface`
- text: `--color-text-subtle`
- 패딩: size별 치수표 참조
