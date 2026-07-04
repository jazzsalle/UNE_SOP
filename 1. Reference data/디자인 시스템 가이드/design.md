# @une-front/react-ui — Design System Reference

이 문서는 `@une-front/react-ui` 디자인 시스템을 사용해 컴포넌트를 구현하기 위한 완전한 참조 문서입니다.
AI가 이 디자인 시스템의 토큰과 컴포넌트를 올바르게 사용할 수 있도록 작성되었습니다.

---

## 목차

1. [기술 스택](#1-기술-스택)
2. [설치 및 설정](#2-설치-및-설정)
3. [Design Tokens](#3-design-tokens)
4. [컴포넌트](#4-컴포넌트)
5. [Icons](#5-icons)
6. [Logos](#6-logos)

---

## 1. 기술 스택

- **React** + **TypeScript**
- **Tailwind CSS v4** (CSS 커스텀 프로퍼티 기반)
- 단위 체계: `rem` 단위 사용 (root font-size가 `1px`로 설정됨 → `16rem` = `16px`)
- 다크모드: HTML에 `.dark` 클래스 토글 방식

> **중요**: 이 프로젝트에서 `16rem`은 실제로 `16px`입니다. root font-size가 1px로 설정된 커스텀 환경입니다.

---

## 2. 설치 및 설정

### 패키지 설치

```bash
npm install @une-front/react-ui @une-front/design-tokens
npm install -D tailwindcss @tailwindcss/vite
```

### Vite 설정

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});
```

### 전역 CSS (필수 4가지를 모두 포함해야 스타일이 정상 동작)

```css
/* src/index.css */
@import "tailwindcss";
@import "@une-front/design-tokens";
@import "@une-front/react-ui/css";

@custom-variant dark (&:where(.dark &));

html {
  font-size: 1px;
}

body {
  font-size: 16rem;
  font-family: var(--font-family-base);
}
```

### 진입점 / 컴포넌트 사용

```tsx
// src/main.tsx
import "./index.css";

// 컴포넌트 import
import { Button, Input, Select } from "@une-front/react-ui";
```

### 다크모드 활성화

```ts
document.documentElement.classList.toggle("dark");
```
또는
```html
<html class="dark">...</html>
```

---

## 3. Design Tokens

모든 토큰은 CSS 커스텀 프로퍼티입니다. Tailwind에서는 `var(--token-name)` 형태로 사용합니다.

### 3-1. Primitive Colors

#### Grayscale
| Token | Value |
|---|---|
| `--grayscale-20` | `#f9f9fb` |
| `--grayscale-25` | `#f4f5f7` |
| `--grayscale-50` | `#ebecf0` |
| `--grayscale-75` | `#dadbdd` |
| `--grayscale-100` | `#cecfd2` |
| `--grayscale-150` | `#bbbcc0` |
| `--grayscale-200` | `#a6a9af` |
| `--grayscale-300` | `#888c94` |
| `--grayscale-400` | `#787c87` |
| `--grayscale-500` | `#686d78` |
| `--grayscale-600` | `#565b69` |
| `--grayscale-700` | `#444a57` |
| `--grayscale-800` | `#313644` |
| `--grayscale-850` | `#242935` |
| `--grayscale-900` | `#1c202a` |

#### Light Blue (Brand)
| Token | Value |
|---|---|
| `--light-blue-20` | `#f5f8ff` |
| `--light-blue-25` | `#f0f4ff` |
| `--light-blue-50` | `#e1e9ff` |
| `--light-blue-75` | `#d2deff` |
| `--light-blue-100` | `#c2d3ff` |
| `--light-blue-200` | `#84a8ff` |
| `--light-blue-300` | `#6693ff` |
| `--light-blue-400` | `#4d7cff` |
| `--light-blue-500` | `#3c69fc` |
| `--light-blue-600` | `#345ce0` |
| `--light-blue-700` | `#2c4ec4` |

#### Dark Blue
| Token | Value |
|---|---|
| `--dark-blue-20` | `#0a1128` |
| `--dark-blue-25` | `#0e1733` |
| `--dark-blue-50` | `#111c3d` |
| `--dark-blue-75` | `#15244d` |
| `--dark-blue-100` | `#1a2b5c` |
| `--dark-blue-150` | `#203470` |
| `--dark-blue-200` | `#253d82` |
| `--dark-blue-300` | `#477dff` |

#### Status Colors
| Token | Red | Yellow | Green | Teal |
|---|---|---|---|---|
| -500 (기본) | `#d92d20` | `#cc8400` | `#1d792b` | `#08bbae` |
| -300 | `#f04438` | `#ffb114` | `#29a33b` | `#4fcfc1` |
| -25 (subtle bg) | `#fef3f2` | `#fff7e0` | `#ecfdf3` | `#e6f7f6` |

---

### 3-2. Semantic Colors — 배경 (bg)

| Token | Light | Dark |
|---|---|---|
| `--color-bg-surface` | `#ffffff` | `#111c3d` |
| `--color-bg-elevated` | `#ffffff` | `#15244d` |
| `--color-bg-muted` | `#f4f5f7` | `#1a2b5c` |
| `--color-bg-subtle` | `#f9f9fb` | `#0e1733` |
| `--color-bg-overlay` | `#242935` | `#0a1128` |
| `--color-bg-disabled` | `#f4f5f7` | `#313644` |
| `--color-bg-neutral` | `#888c94` | `#686d78` |
| `--color-bg-neutral-hover` | `#787c87` | `#787c87` |
| `--color-bg-danger` | `#d92d20` | `#f04438` |
| `--color-bg-danger-subtle` | `#fef3f2` | `#15244d` |
| `--color-bg-brand` | `#3c69fc` | `#477dff` |
| `--color-bg-brand-subtle` | `#f0f4ff` | `#0a1128` |
| `--color-bg-brand-subtle-pressed` | `#e1e9ff` | `#0e1733` |
| `--color-bg-warning` | `#cc8400` | `#ffb114` |
| `--color-bg-warning-subtle` | `#fff7e0` | `#15244d` |
| `--color-bg-success` | `#1d792b` | `#29a33b` |
| `--color-bg-success-subtle` | `#ecfdf3` | `#15244d` |
| `--color-bg-info` | `#08bbae` | `#4fcfc1` |
| `--color-bg-info-subtle` | `#e6f7f6` | `#15244d` |

#### Accordion 전용 배경 토큰
| Token | Light | Dark |
|---|---|---|
| `--color-bg-accordion-open` | `#f5f8ff` | `#0e1733` |
| `--color-bg-accordion-open-hover` | `#f0f4ff` | `#111c3d` |
| `--color-bg-accordion-open-active` | `#e1e9ff` | `#15244d` |
| `--color-bg-accordion-closed-hover` | `#f9f9fb` | `#313644` |
| `--color-bg-accordion-closed-active` | `#f4f5f7` | `#444a57` |
| `--color-bg-accordion-content` | `#ffffff` | `#1c202a` |

---

### 3-3. Semantic Colors — 텍스트 (text)

| Token | Light | Dark |
|---|---|---|
| `--color-text-default` | `#1c202a` | `#f5f8ff` |
| `--color-text-subtle` | `#444a57` | `#c2d3ff` |
| `--color-text-disabled` | `#a6a9af` | `#565b69` |
| `--color-text-placeholder` | `#888c94` | `#686d78` |
| `--color-text-danger` | `#c4251b` | `#f04438` |
| `--color-text-on-brand` | `#ffffff` | `#0a1128` |
| `--color-text-brand` | `#3c69fc` | `#477dff` |
| `--color-text-warning` | `#a86900` | `#ffb114` |
| `--color-text-success` | `#186424` | `#29a33b` |
| `--color-text-info` | `#07a69b` | `#4fcfc1` |
| `--color-text-accordion-content` | `#444a57` | `#cecfd2` |
| `--color-text-accordion-helper` | `#84a8ff` | `#84a8ff` |
| `--color-text-accordion-helper-disabled` | `#cecfd2` | `#444a57` |

> **다크모드 주의**: `--color-text-on-brand`는 다크모드에서 `#0a1128`(어두운 색)입니다.
> 항상 흰색이어야 하는 요소(체크 아이콘 등)는 Tailwind `text-white`를 직접 사용하세요.

---

### 3-4. Semantic Colors — 테두리 (border)

| Token | Light | Dark |
|---|---|---|
| `--color-border-default` | `#cecfd2` | `#203470` |
| `--color-border-subtle` | `#dadbdd` | `#1a2b5c` |
| `--color-border-strong` | `#a6a9af` | `#253d82` |
| `--color-border-focus` | `#3c69fc` | `#477dff` |
| `--color-border-danger` | `#d92d20` | `#e5352e` |
| `--color-border-disabled` | `#a6a9af` | `#565b69` |
| `--color-border-brand` | `#3c69fc` | `#477dff` |
| `--color-border-warning` | `#cc8400` | `#e89a00` |
| `--color-border-success` | `#1d792b` | `#238e33` |
| `--color-border-accordion` | `#ebecf0` | `#313644` |

---

### 3-5. Semantic Colors — 아이콘 (icon)

| Token | Light | Dark |
|---|---|---|
| `--color-icon-default` | `#686d78` | `#a3beff` |
| `--color-icon-subtle` | `#888c94` | `#84a8ff` |
| `--color-icon-disabled` | `#a6a9af` | `#565b69` |
| `--color-icon-on-brand` | `#ffffff` | `#0a1128` |
| `--color-icon-brand` | `#3c69fc` | `#477dff` |
| `--color-icon-danger` | `#d92d20` | `#f04438` |
| `--color-icon-warning` | `#cc8400` | `#ffb114` |
| `--color-icon-success` | `#1d792b` | `#29a33b` |
| `--color-icon-info` | `#08bbae` | `#4fcfc1` |

---

### 3-6. Semantic Colors — 인터랙션

| Token | Light | Dark |
|---|---|---|
| `--color-interactive-brand` | `#3c69fc` | `#477dff` |
| `--color-interactive-brand-hover` | `#345ce0` | `#6693ff` |
| `--color-interactive-brand-pressed` | `#2c4ec4` | `#84a8ff` |
| `--color-interactive-neutral` | `#ebecf0` | `#444a57` |
| `--color-interactive-neutral-hover` | `#dadbdd` | `#565b69` |
| `--color-interactive-neutral-pressed` | `#cecfd2` | `#686d78` |
| `--color-interactive-danger` | `#d92d20` | `#f04438` |
| `--color-interactive-danger-hover` | `#c4251b` | `#e5352e` |

#### 폼 컨트롤 (Checkbox, Radio 비선택 상태)
| Token | Light | Dark |
|---|---|---|
| `--color-control-border` | `#888c94` | `#686d78` |
| `--color-control-border-hover` | `#787c87` | `#787c87` |
| `--color-control-border-pressed` | `#686d78` | `#888c94` |
| `--color-control-border-active` | `#565b69` | `#cecfd2` |
| `--color-control-bg-hover` | `#f4f5f7` | `#313644` |
| `--color-control-bg-pressed` | `#ebecf0` | `#444a57` |
| `--color-control-text` | `#313644` | `#cecfd2` |

---

### 3-7. 포커스 링

```css
--selected-shadow: 0 0 0 2px #C2D3FF;       /* Light */
/* Dark */
--selected-shadow: 0 0 0 2px rgba(132, 168, 255, 0.50);
```

Tailwind 사용: `shadow-[0_0_0_2rem_var(--selected-shadow)]`  
또는 `ring-2 ring-[--light-blue-100]`

---

### 3-8. Typography

#### Primitive
| Token | Value |
|---|---|
| `--font-family-base` | `"Spoqa Han Sans Neo", system-ui, sans-serif` |
| `--font-size-1` | `12rem` (=12px) |
| `--font-size-2` | `14rem` (=14px) |
| `--font-size-3` | `16rem` (=16px) |
| `--font-size-4` | `20rem` (=20px) |
| `--font-size-5` | `24rem` (=24px) |
| `--font-size-6` | `32rem` (=32px) |
| `--line-height-140` | `1.4` |
| `--line-height-150` | `1.5` |
| `--line-height-160` | `1.6` |
| `--letter-spacing-base` | `-0.03em` |

#### Semantic Typography Classes (Tailwind `@utility`)
```
typo-title-lg  → 32px / line-height 1.5
typo-title-md  → 24px / line-height 1.5
typo-title-sm  → 20px / line-height 1.6
typo-text-lg   → 16px / line-height 1.5
typo-text-md   → 14px / line-height 1.4
typo-text-sm   → 12px / line-height 1.5
```

**font-weight는 별도 Tailwind 클래스로 조합**: `font-normal` / `font-medium` / `font-bold`

---

### 3-9. Spacing

#### Primitive
| Token | Value |
|---|---|
| `--space-0` | `0px` |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |

#### Semantic
| Token | Value |
|---|---|
| `--space-page-x` | `16px` (페이지 좌우 여백) |
| `--space-page-y` | `24px` (페이지 상하 여백) |
| `--space-section-gap` | `32px` (섹션 간 간격) |
| `--space-card-padding` | `16px` (카드 내부 패딩) |

---

### 3-10. Radius

#### Primitive
| Token | Value |
|---|---|
| `--radius-none` | `0px` |
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-full` | `9999px` |

#### Semantic
| Token | Value | 용도 |
|---|---|---|
| `--radius-control` | `8px` (= `--radius-md`) | 버튼, 입력, 체크박스 등 컨트롤 |
| `--radius-surface` | `12px` (= `--radius-lg`) | 카드, 모달, 팝오버 등 서피스 |

---

### 3-11. Elevation (Shadow)

| Token | Light | Dark |
|---|---|---|
| `--elevation-01` | `0 0 3px rgba(0,0,0,.04), 0 4px 11px rgba(0,0,0,.11)` | `0 1px 2px rgba(0,0,0,.2)` |
| `--elevation-02` | `0 0 3px rgba(0,0,0,.04), 0 6px 13px rgba(0,0,0,.13)` | `0 2px 4px rgba(0,0,0,.24)` |
| `--elevation-03` | `0 0 5px rgba(0,0,0,.06), 0 8px 15px rgba(0,0,0,.15)` | `0 2px 8px rgba(0,0,0,.28)` |
| `--elevation-04` | `0 0 5px rgba(0,0,0,.06), 0 10px 17px rgba(0,0,0,.18)` | `0 4px 12px rgba(0,0,0,.3)` |
| `--elevation-05` | `0 0 5px rgba(0,0,0,.08), 0 10px 24px rgba(0,0,0,.24)` | `0 6px 16px rgba(0,0,0,.32)` |
| `--elevation-06` | `0 0 7px rgba(0,0,0,.08), 0 10px 32px rgba(0,0,0,.32)` | `0 8px 24px rgba(0,0,0,.36)` |
| `--elevation-07` | `0 0 7px rgba(0,0,0,.1), 0 12px 36px rgba(0,0,0,.36)` | `0 0 7px rgba(0,0,0,.24), 0 8px 28px rgba(0,0,0,.36)` |
| `--elevation-08` | `0 0 7px rgba(0,0,0,.1), 0 12px 40px rgba(0,0,0,.4)` | `0 0 7px rgba(0,0,0,.3), 0 12px 40px rgba(0,0,0,.44)` |

---

## 4. 컴포넌트

### 공통 규칙

- 모든 컴포넌트는 `@une-front/react-ui`에서 import합니다.
- primitive 토큰(`--grayscale-*`, `--light-blue-*` 등)을 직접 사용하지 말고 **시맨틱 토큰**을 사용합니다.
- `disabled` 상태는 항상 intent보다 우선합니다.
- Tailwind에서 CSS 변수 사용: `bg-[var(--color-bg-surface)]` 또는 `bg-[--color-bg-surface]`

---

### 4-1. Button

```tsx
import { Button } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"fill" \| "outline" \| "ghost"` | `"fill"` | 버튼 스타일 |
| `color` | `"primary" \| "grayscale"` | `"primary"` | 버튼 색상 |
| `size` | ButtonSize | `"md"` | 크기 (10단계) |
| `selected` | `boolean` | `false` | 선택 상태 (focus ring 상시 표시) |
| `disabled` | `boolean` | — | 비활성화 |
| `leftIcon` | `ReactNode` | — | 왼쪽 아이콘 |
| `rightIcon` | `ReactNode` | — | 오른쪽 아이콘 |
| `children` | `ReactNode` | — | 버튼 텍스트 (필수) |

> `ButtonProps`는 `ComponentProps<"button">`을 확장합니다. (`color` 제외)

#### 크기별 치수 (ButtonSize)
| size | 높이 | 아이콘 |
|---|---|---|
| `3xl` | 56px | 28px |
| `2xl` | 52px | 24px |
| `xl` | 48px | 24px |
| `lg` | 44px | 20px |
| `md` | 40px | 20px |
| `sm` | 36px | 20px |
| `xs` | 32px | 16px |
| `2xs` | 28px | 16px |
| `3xs` | 24px | 12px |
| `4xs` | 20px | 12px |

#### 지원 상태
Default / Hover / Focus / Active / Disabled / Selected

#### 사용 예시
```tsx
<Button variant="fill" color="primary" size="md">확인</Button>
<Button variant="outline" color="grayscale" leftIcon={<IconSearch />}>검색</Button>
<Button variant="ghost" disabled>비활성화</Button>
```

---

### 4-2. IconButton

```tsx
import { IconButton } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"fill" \| "outline" \| "ghost"` | `"fill"` | 버튼 스타일 |
| `color` | `"primary" \| "grayscale"` | `"primary"` | 버튼 색상 |
| `size` | ButtonSize | `"md"` | 크기 (Button과 동일 10단계) |
| `icon` | `ReactNode` | — | 아이콘 (필수) |
| `selected` | `boolean` | `false` | 선택 상태 |
| `disabled` | `boolean` | — | 비활성화 |

#### 크기별 치수
| size | 버튼 크기 | 아이콘 크기 |
|---|---|---|
| `3xl` | 56px | 28px |
| `2xl` | 52px | 24px |
| `xl` | 48px | 24px |
| `lg` | 44px | 20px |
| `md` | 40px | 20px |
| `sm` | 36px | 20px |
| `xs` | 32px | 16px |
| `2xs` | 28px | 16px |
| `3xs` | 24px | 12px |
| `4xs` | 20px | 12px |

#### 사용 예시
```tsx
<IconButton icon={<IconSearch />} size="md" />
<IconButton variant="ghost" color="grayscale" icon={<IconX />} />
```

---

### 4-3. Input

```tsx
import { Input } from "@une-front/react-ui";
import type { InputProps, InputSize, InputVariant, InputIntent } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `size` | InputSize | `"md"` | 크기 (8단계) |
| `variant` | `"standard" \| "inline"` | `"standard"` | 레이아웃 변형 |
| `intent` | `"default" \| "error" \| "complete"` | `"default"` | 유효성 상태 |
| `label` | `string` | — | 레이블 (standard: 위, inline: 왼쪽 고정 160px) |
| `helperText` | `string` | — | 하단 안내 메시지 |
| `leftIcon` | `ReactNode` | — | 왼쪽 슬롯 |
| `rightButton` | `ReactNode` | — | 오른쪽 슬롯 |
| `clearable` | `boolean` | `false` | X 버튼 표시 |
| `onClear` | `() => void` | — | X 버튼 콜백 |
| `disabled` | `boolean` | — | 비활성화 |
| `value` | `string` | — | 제어 모드 |
| `defaultValue` | `string` | — | 비제어 모드 초기값 |
| `placeholder` | `string` | — | 플레이스홀더 |

> `InputProps`는 `ComponentProps<"input">`을 확장합니다.

#### 크기별 치수 (InputSize)
| size | 높이 | 패딩X | 반경 | 아이콘 | 입력 텍스트 | 레이블 텍스트 |
|---|---|---|---|---|---|---|
| `3xl` | 56px | 16px | 8px | 24px | `typo-title-sm` | `typo-text-md` |
| `2xl` | 52px | 16px | 8px | 24px | `typo-text-lg` | `typo-text-md` |
| `xl`  | 48px | 16px | 6px | 20px | `typo-text-lg` | `typo-text-md` |
| `lg`  | 44px | 12px | 6px | 20px | `typo-text-lg` | `typo-text-sm` |
| `md`  | 40px | 12px | 6px | 16px | `typo-text-md` | `typo-text-sm` |
| `sm`  | 36px | 12px | 6px | 16px | `typo-text-md` | `typo-text-sm` |
| `xs`  | 32px |  8px | 4px | 16px | `typo-text-sm` | `typo-text-sm` |
| `2xs` | 28px |  8px | 4px | 16px | `typo-text-sm` | `typo-text-sm` |

#### helperText 표시 규칙
- `intent="error"` / `"complete"` → 항상 표시
- `intent="default"` → 포커스 시에만 표시
- `disabled` → 미표시

#### 지원 상태
Default / Hover (브랜드 테두리) / Focus (포커스 링) / Error / Error+Focus / Complete / Complete+Focus / Disabled

#### 사용 예시
```tsx
<Input label="이름" placeholder="이름을 입력하세요" />
<Input intent="error" helperText="필수 입력 항목입니다" />
<Input variant="inline" label="검색" clearable />
<Input size="lg" leftIcon={<IconSearch />} rightButton={<Button size="sm">검색</Button>} />
```

---

### 4-4. Textarea

```tsx
import { Textarea } from "@une-front/react-ui";
import type { TextareaProps, TextareaResize, TextareaIntent, TextareaSize } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 크기 |
| `label` | `string` | — | 레이블 |
| `intent` | `"default" \| "error" \| "complete"` | `"default"` | 유효성 상태 |
| `helperText` | `string` | — | 하단 메시지 |
| `maxLength` | `number` | `0` | 글자 수 제한 (0 = 제한 없음) |
| `showCounter` | `boolean` | `false` | 글자 수 카운터 표시 |
| `minHeight` | `number` | `100` | 최소 높이 (rem 단위, px 동일) |
| `maxHeight` | `number` | `176` | 최대 높이 (rem 단위, 0 = 제한 없음) |
| `resize` | `"none" \| "vertical" \| "auto"` | `"auto"` | 리사이즈 동작 |
| `disabled` | `boolean` | — | 비활성화 |

#### 크기별 스펙
| size | 폰트 | 레이블 폰트 | 수평 패딩 |
|---|---|---|---|
| `lg` | `typo-text-lg` (16px) | `typo-text-md` (14px) | 16px |
| `md` | `typo-text-md` (14px) | `typo-text-sm` (12px) | 12px |
| `sm` | `typo-text-sm` (12px) | `typo-text-sm` (12px) | 8px |

#### resize 동작
| 값 | 동작 |
|---|---|
| `auto` | 입력 내용에 따라 높이 자동 확장 (min~max) |
| `vertical` | 사용자 드래그로 높이 조절 (핸들 아이콘 표시) |
| `none` | 높이 고정 |

#### 사용 예시
```tsx
<Textarea label="내용" placeholder="내용을 입력하세요" />
<Textarea maxLength={200} showCounter resize="auto" />
<Textarea intent="error" helperText="필수 입력 항목입니다" />
```

---

### 4-5. Select

```tsx
import { Select } from "@une-front/react-ui";
import type { SelectProps, SelectOption, SelectGroup, SelectSize, SelectIntent, SelectVariant } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"standard" \| "inline"` | `"standard"` | 레이아웃 변형 |
| `size` | SelectSize | `"md"` | 크기 (8단계) |
| `intent` | `"none" \| "error" \| "complete"` | `"none"` | 유효성 상태 |
| `options` | `SelectOption[]` | `[]` | 옵션 목록 |
| `groups` | `SelectGroup[]` | — | 그룹화된 옵션 목록 |
| `value` | `string` | — | 제어 모드 선택값 |
| `defaultValue` | `string` | — | 비제어 모드 초기값 |
| `onChange` | `(value: string) => void` | — | 값 변경 콜백 |
| `placeholder` | `string` | `"선택하세요"` | 플레이스홀더 |
| `label` | `string` | — | 레이블 |
| `helperText` | `string` | — | 하단 메시지 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `leftIcon` | `ReactNode` | — | 왼쪽 아이콘 |
| `zIndex` | `number` | `50` | 드롭다운 z-index |

#### SelectOption 타입
```ts
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

#### SelectGroup 타입
```ts
interface SelectGroup {
  label: string;
  options: SelectOption[];
}
```

#### 크기별 치수 (SelectSize)
| size | 높이 | 패딩X | 아이콘 | 텍스트 | 반경 |
|---|---|---|---|---|---|
| `3xl` | 56px | 20px | 24px | `typo-text-lg` | 6px |
| `2xl` | 52px | 16px | 24px | `typo-text-lg` | 6px |
| `xl`  | 48px | 16px | 24px | `typo-text-lg` | 6px |
| `lg`  | 44px | 16px | 20px | `typo-text-lg` | 6px |
| `md`  | 40px | 12px | 20px | `typo-text-md` | 6px |
| `sm`  | 36px | 12px | 16px | `typo-text-md` | 6px |
| `xs`  | 32px | 12px | 16px | `typo-text-md` | 4px |
| `2xs` | 28px | 12px | 16px | `typo-text-sm` | 4px |

#### 드롭다운 동작
- `document.body` Portal 렌더링 (overflow:hidden 부모 무관)
- 트리거 아래 공간 부족 시 위로 자동 flip
- 스크롤/리사이즈 시 위치 재계산

#### 사용 예시
```tsx
<Select
  options={[
    { value: "a", label: "옵션 A" },
    { value: "b", label: "옵션 B", disabled: true },
  ]}
  value={value}
  onChange={setValue}
  label="카테고리"
/>

<Select
  groups={[
    { label: "그룹 1", options: [{ value: "a", label: "옵션 A" }] },
  ]}
  placeholder="선택하세요"
/>
```

---

### 4-6. Checkbox

```tsx
import { Checkbox } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `checked` | `boolean` | `false` | 체크 상태 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 상태 변경 핸들러 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 크기 |
| `label` | `string` | — | 레이블 |
| `disabled` | `boolean` | — | 비활성화 |

#### 크기별 치수
| size | 박스 | 아이콘 | 텍스트 |
|---|---|---|---|
| `lg` | 24px | 16px | `typo-title-sm` |
| `md` | 20px | 12px | `typo-text-lg` |
| `sm` | 16px | 12px | `typo-text-md` |

#### 지원 상태
Unchecked(Default/Hover/Active/Focus-visible) / Checked(Default/Hover/Active/Focus-visible) / Disabled Unchecked / Disabled Checked

#### 사용 예시
```tsx
<Checkbox checked={value} onCheckedChange={setValue} label="동의합니다" />
<Checkbox size="lg" disabled />
```

---

### 4-7. Radio

```tsx
import { RadioGroup, RadioButton } from "@une-front/react-ui";
```

#### RadioGroup Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` | `string` | — | 현재 선택값 (필수) |
| `setValue` | `(value: string) => void` | — | 변경 핸들러 (필수) |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 하위 RadioButton에 전파 |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | 배치 방향 |
| `disabled` | `boolean` | `false` | 전체 비활성화 |

#### RadioButton Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` | `string` | — | 라디오 값 (필수) |
| `label` | `string` | — | 레이블 |
| `disabled` | `boolean` | — | 개별 비활성화 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 단독 사용 시 크기 |

#### 크기별 치수
| size | 외부 원 | 내부 원(thumb) | 텍스트 |
|---|---|---|---|
| `lg` | 24px | 12px | `typo-title-sm` |
| `md` | 20px | 10px | `typo-text-lg` |
| `sm` | 16px | 8px | `typo-text-md` |

#### direction 레이아웃
| direction | 간격 |
|---|---|
| `vertical` | 8px |
| `horizontal` | 16px |

#### 사용 예시
```tsx
<RadioGroup value={value} setValue={setValue} direction="horizontal">
  <RadioButton value="a" label="옵션 A" />
  <RadioButton value="b" label="옵션 B" />
  <RadioButton value="c" label="옵션 C" disabled />
</RadioGroup>
```

---

### 4-8. Switch

```tsx
import { Switch } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` | `boolean` | — | ON/OFF 상태 |
| `setValue` | `(value: boolean) => void` | — | 변경 핸들러 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 크기 |
| `disabled` | `boolean` | — | 비활성화 |

#### 지원 상태
OFF(Default/Hover/Active/Focus-visible) / ON(Default/Hover/Active/Focus-visible) / Disabled OFF / Disabled ON

#### 사용 예시
```tsx
<Switch value={isOn} setValue={setIsOn} />
<Switch value={isOn} setValue={setIsOn} size="lg" disabled />
```

---

### 4-9. Tab

Compound 패턴: `Tabs` > `TabList` > `TabButton` + `TabPanel`

```tsx
import { Tabs, TabList, TabButton, TabPanel } from "@une-front/react-ui";
```

#### Tabs Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` | `any` | — | 현재 선택된 탭 값 (필수) |
| `setValue` | `Dispatch<SetStateAction<any>>` | — | 변경 핸들러 (필수) |
| `size` | `"lg" \| "md" \| "sm"` | `"lg"` | 탭 크기 |

#### TabButton Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` | `string` | — | 탭 식별값 (필수) |
| `label` | `string` | — | 탭 텍스트 (필수) |
| `icon` | `ReactNode` | — | 왼쪽 아이콘 |
| `badge` | `ReactNode` | — | 오른쪽 뱃지 |

#### TabPanel Props
| Prop | Type | 설명 |
|---|---|---|
| `value` | `string` | 연결된 탭 값 (필수) |

#### 크기별 치수
| size | 높이 | 패딩X | 아이콘 | 텍스트 |
|---|---|---|---|---|
| `lg` | 56px | 20px | 24px | `typo-title-sm` (20px) |
| `md` | 48px | 16px | 20px | `typo-text-lg` (16px) |
| `sm` | 40px | 12px | 16px | `typo-text-md` (14px) |

#### 선택 스타일
- 텍스트: `--color-text-brand` + `font-medium`
- 하단 인디케이터: 4px 높이 바, 상단 모서리 `border-radius: 8px`, `--color-border-brand` 배경
- 비선택 하단: 1px, `--color-border-default`

#### 사용 예시
```tsx
const [tab, setTab] = useState("tab1");

<Tabs value={tab} setValue={setTab} size="md">
  <TabList>
    <TabButton value="tab1" label="첫 번째" icon={<IconHomeLine />} />
    <TabButton value="tab2" label="두 번째" badge={<Badge label="3" size="xs" />} />
  </TabList>
  <TabPanel value="tab1">탭 1 콘텐츠</TabPanel>
  <TabPanel value="tab2">탭 2 콘텐츠</TabPanel>
</Tabs>
```

---

### 4-10. SegmentedControl

```tsx
import { SegmentedControl } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` | `T extends string` | — | 선택값 (필수, 제네릭) |
| `options` | `SegmentedOption<T>[]` | — | 옵션 목록 (필수) |
| `setValue` | `Dispatch<SetStateAction<T>>` | — | 변경 핸들러 (필수) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 크기 |
| `fullWidth` | `boolean` | — | 전체 너비 |
| `disabled` | `boolean` | — | 전체 비활성화 |
| `fitContent` | `boolean` | `false` | 버튼 너비를 콘텐츠에 맞춤 |

#### SegmentedOption 타입
```ts
interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}
```

#### 사용 예시
```tsx
<SegmentedControl
  value={period}
  setValue={setPeriod}
  options={[
    { value: "day", label: "일" },
    { value: "week", label: "주" },
    { value: "month", label: "월" },
  ]}
/>
```

---

### 4-11. Pagination

```tsx
import { Pagination } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `totalPages` | `number` | — | 전체 페이지 수 (필수) |
| `value` | `number` | — | 현재 페이지 (필수) |
| `setValue` | `(page: number) => void` | — | 페이지 변경 핸들러 (필수) |
| `jumpSize` | `number` | `5` | `...` 클릭 시 이동 페이지 수 |

#### 페이지 표시 규칙
- 총 10 이하: 전체 표시
- 총 11 이상: 현재 주변 + 말줄임(`...`) 축약

#### 사용 예시
```tsx
<Pagination totalPages={20} value={page} setValue={setPage} jumpSize={5} />
```

---

### 4-12. Modal

```tsx
import { Modal } from "@une-front/react-ui";
import type { ModalProps, ModalIntent, ModalSize } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `open` | `boolean` | — | 열림 여부 (필수) |
| `onClose` | `() => void` | — | 닫힘 콜백 (필수) |
| `title` | `ReactNode` | — | 모달 제목 |
| `intent` | `"none" \| "info" \| "success" \| "warning" \| "delete"` | `"none"` | 아이콘 의도 |
| `closeOnBackdrop` | `boolean` | `true` | 백드롭 클릭으로 닫기 |
| `closeOnEsc` | `boolean` | `true` | ESC 키로 닫기 |
| `footer` | `ReactNode` | — | 하단 액션 버튼 영역 |

#### intent별 아이콘
| intent | 색상 |
|---|---|
| `none` | 아이콘 없음 |
| `info` | 파란 정보 아이콘 |
| `success` | 초록 체크 아이콘 |
| `warning` | 노란 경고 아이콘 |
| `delete` | 빨간 삭제 아이콘 |

#### 동작
- `document.body` Portal 렌더링
- body 스크롤 잠금 (open 시)
- 백드롭 표시

#### 사용 예시
```tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="제목"
  intent="warning"
  footer={
    <div className="flex gap-[8rem] justify-end">
      <Button variant="ghost" onClick={() => setIsOpen(false)}>취소</Button>
      <Button variant="fill" color="primary">확인</Button>
    </div>
  }
>
  모달 내용
</Modal>
```

---

### 4-13. Alert

```tsx
import { Alert } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `intent` | `"info" \| "success" \| "warning" \| "error"` | `"info"` | 알림 의도 |
| `variant` | `"filled" \| "outlined" \| "light"` | `"light"` | 스타일 변형 |
| `title` | `ReactNode` | — | 제목 |
| `onClose` | `() => void` | — | 닫기 콜백 (설정 시 X 버튼 표시) |
| `hideIcon` | `boolean` | `false` | 아이콘 숨기기 |
| `children` | `ReactNode` | — | 본문 내용 |

#### variant × intent 색상
| variant | info | success | warning | error |
|---|---|---|---|---|
| `filled` | 파란 배경 + 흰 텍스트 | 초록 배경 + 흰 텍스트 | 노란 배경 + 흰 텍스트 | 빨간 배경 + 흰 텍스트 |
| `outlined` | 파란 테두리 + 파란 텍스트 | 초록 테두리 + 초록 텍스트 | 노란 테두리 + 노란 텍스트 | 빨간 테두리 + 빨간 텍스트 |
| `light` | 연한 파란 배경 + 진한 파란 텍스트 | 연한 초록 배경 + 진한 초록 텍스트 | 연한 노란 배경 + 진한 노란 텍스트 | 연한 빨간 배경 + 진한 빨간 텍스트 |

#### 사용 예시
```tsx
<Alert intent="success" title="저장 완료">변경사항이 저장되었습니다.</Alert>
<Alert intent="error" variant="outlined" onClose={handleClose}>오류가 발생했습니다.</Alert>
<Alert intent="warning" hideIcon>주의가 필요합니다.</Alert>
```

---

### 4-14. Toast

Context + Hook 패턴. 앱 최상위에 `ToastProvider`를 배치하고, 하위에서 `useToast()` 훅으로 사용합니다.

```tsx
import { ToastProvider, useToast } from "@une-front/react-ui";
import type { ToastCloseReason, ToastData, ToastProviderProps } from "@une-front/react-ui";
```

#### ToastProvider Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `position` | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"top-center"` | 표시 위치 |
| `duration` | `number` | `3000` | 기본 지속 시간 (ms, 0 = 자동 닫힘 없음) |
| `maxToasts` | `number` | `3` | 최대 동시 표시 수 |
| `zIndex` | `number` | `60` | z-index |

#### useToast() 반환값
| 메서드 | 시그니처 | 설명 |
|---|---|---|
| `toast` | `(message: ReactNode, options?) => string` | 토스트 생성, id 반환 |
| `dismiss` | `(id: string) => void` | 특정 토스트 닫기 |
| `dismissAll` | `() => void` | 모든 토스트 닫기 |

#### toast() options
| 옵션 | Type | Default | 설명 |
|---|---|---|---|
| `intent` | `"none" \| "info" \| "success" \| "warning" \| "error"` | `"info"` | 아이콘/색상 |
| `duration` | `number` | Provider 값 | 개별 지속 시간 |
| `dismissible` | `boolean` | — | X 버튼 override |
| `onClose` | `(reason: ToastCloseReason) => void` | — | 닫힘 콜백 |

#### ToastCloseReason
- `"timeout"` — duration 경과
- `"manual"` — X 버튼 클릭
- `"programmatic"` — `dismiss()` 호출 또는 maxToasts 초과

#### 사용 예시
```tsx
// 앱 최상위
<ToastProvider position="top-right" duration={4000}>
  <App />
</ToastProvider>

// 컴포넌트 내부
const { toast, dismiss } = useToast();

toast("저장 완료", { intent: "success" });
toast("오류 발생", { intent: "error", duration: 0, dismissible: true });
```

---

### 4-15. Tooltip

```tsx
import { Tooltip } from "@une-front/react-ui";
import type { TooltipProps, TooltipSize, TooltipDirection, TooltipArrow, TooltipTrigger } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `content` | `ReactNode` | — | 툴팁 내용 (필수) |
| `size` | `"sm" \| "lg"` | `"sm"` | 크기 (`sm`: 1줄, `lg`: 여러 줄) |
| `direction` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | 방향 (공간 부족 시 자동 flip) |
| `arrow` | `"start" \| "center" \| "end"` | `"center"` | 화살표 위치 |
| `trigger` | `"hover" \| "click"` | `"hover"` | 트리거 방식 |
| `showCloseButton` | `boolean` | — | 닫기 버튼 (`click` 트리거 시 자동 표시) |
| `icon` | `ReactNode` | — | 상태 아이콘 |
| `gap` | `number` | `4` | 트리거와 간격 (rem) |
| `zIndex` | `number` | `70` | z-index |
| `open` | `boolean` | — | 외부 제어 열림 상태 |
| `onOpenChange` | `(open: boolean) => void` | — | 열림 상태 변경 콜백 |
| `children` | `ReactNode` | — | 트리거 요소 (필수) |

#### 자동 Flip 규칙
| 원래 방향 | Fallback 순서 |
|---|---|
| `top` | bottom → right → left |
| `bottom` | top → right → left |
| `left` | right → bottom → top |
| `right` | left → bottom → top |

#### 트리거별 동작
| trigger | 열기 | 닫기 |
|---|---|---|
| `hover` | mouseenter / focus | mouseleave (100ms delay) / blur / ESC |
| `click` | click | 외부 클릭 / ESC / X 버튼 |

#### 사용 예시
```tsx
<Tooltip content="도움말 텍스트" direction="bottom">
  <IconButton icon={<IconInfoCircleLine />} variant="ghost" />
</Tooltip>

<Tooltip content="클릭으로 여는 툴팁" trigger="click" size="lg">
  <Button>도움말</Button>
</Tooltip>
```

---

### 4-16. List / ListItem

```tsx
import { ListItem } from "@une-front/react-ui";
import type { ListItemOption, ListItemProps, ListSize } from "@une-front/react-ui";
```

#### ListItemOption 타입
```ts
interface ListItemOption {
  value: string;
  label: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  disabled?: boolean;
}
```

#### ListItem Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `option` | `ListItemOption` | — | 옵션 데이터 (필수) |
| `selected` | `boolean` | `false` | 선택 상태 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 크기 |
| `showCheckbox` | `boolean` | `false` | 체크박스 표시 |
| `onSelect` | `(value: string) => void` | — | 선택 콜백 |

#### 크기별 치수
| size | 높이 | 패딩X | 아이콘 | 텍스트 |
|---|---|---|---|---|
| `lg` | 56px | 28px | 20px | `typo-text-lg` |
| `md` | 48px | 24px | 16px | `typo-text-md` |
| `sm` | 40px | 20px | 12px | `typo-text-sm` |

#### 상태별 색상
| 상태 | 배경 | 레이블 | 아이콘 |
|---|---|---|---|
| Default | 투명 | `--color-text-subtle` | `--color-icon-default` |
| Selected | 투명 | `--color-interactive-brand` | `--color-icon-brand` |
| Hover | `--color-bg-subtle` | 상동 | 상동 |
| Active | `--color-bg-muted` | 상동 | 상동 |
| Disabled | 투명 | `--color-text-disabled` | `--color-icon-disabled` |

#### 사용 예시
```tsx
<ListItem
  option={{ value: "a", label: "항목 A", leftIcon: <IconHomeLine /> }}
  selected={selected === "a"}
  onSelect={setSelected}
  size="md"
/>
```

---

### 4-17. Badge / BadgeDot

```tsx
import { Badge, BadgeDot } from "@une-front/react-ui";
```

#### Badge Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `label` | `string` | — | 라벨 텍스트 (필수) |
| `shape` | `"round-square" \| "cylinder"` | `"round-square"` | 형태 |
| `variant` | `"solid" \| "solid-pastel" \| "outline" \| "dot-accent" \| "dot-neutral"` | `"solid"` | 스타일 |
| `color` | `"primary" \| "success" \| "error" \| "secondary" \| "warning" \| "grayscale"` | `"primary"` | 색상 |
| `size` | `"xl" \| "lg" \| "md" \| "sm" \| "xs"` | `"md"` | 크기 |
| `leftIcon` | `ReactNode` | — | 왼쪽 아이콘 (`solid`, `solid-pastel`, `outline` 전용) |

#### Badge 크기별 치수
| size | 높이 | 패딩X | 텍스트 |
|---|---|---|---|
| `xl` | 36px | 14px | `typo-text-lg` |
| `lg` | 32px | 12px | `typo-text-md` |
| `md` | 28px | 10px | `typo-text-md` |
| `sm` | 24px | 8px | `typo-text-sm` |
| `xs` | 20px | 6px | `typo-text-sm` |

#### variant 설명
| variant | 설명 |
|---|---|
| `solid` | 진한 배경 + 흰 텍스트 |
| `solid-pastel` | 연한 배경 + 색상 텍스트 |
| `outline` | 투명 배경 + 색상 테두리 + 색상 텍스트 |
| `dot-accent` | 점 + 레이블 모두 intent 색상 |
| `dot-neutral` | 점만 intent 색상, 레이블은 subtle 회색 |

#### BadgeDot Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"primary" \| "new"` | `"primary"` | 점 스타일 (`primary`: 브랜드 파란색, `new`: 오렌지색) |
| `size` | `"xl" \| "lg" \| "md" \| "sm"` | `"md"` | 점 크기 (8/6/4/2px) |

#### 사용 예시
```tsx
<Badge label="NEW" variant="solid" color="primary" size="sm" />
<Badge label="완료" variant="solid-pastel" color="success" shape="cylinder" />
<Badge label="진행중" variant="dot-accent" color="warning" />
<BadgeDot variant="new" size="md" />
```

---

### 4-18. Accordion

```tsx
import { Accordion } from "@une-front/react-ui";
import type { AccordionProps, AccordionVariant, AccordionSize } from "@une-front/react-ui";
```

#### Props
| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"line" \| "selecte"` | `"selecte"` | 컨테이너 스타일 (`selecte`: border+radius, `line`: border-bottom) |
| `size` | `"lg" \| "md" \| "sm"` | `"lg"` | 헤더 크기 |
| `open` | `boolean` | — | 제어 모드 열림 상태 |
| `defaultOpen` | `boolean` | `false` | 비제어 모드 초기값 |
| `onToggle` | `(open: boolean) => void` | — | 열림/닫힘 콜백 |
| `title` | `string` | — | 헤더 타이틀 (필수) |
| `leftIcon` | `ReactNode` | — | 헤더 왼쪽 아이콘 |
| `headerCheckbox` | `boolean` | `false` | 헤더 체크박스 표시 |
| `checked` | `boolean` | — | 헤더 체크박스 선택 상태 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 체크박스 변경 핸들러 |
| `helperText` | `string` | — | 헤더 우측 보조 텍스트 |
| `showBodyText` | `boolean` | `true` | 본문 텍스트 영역 표시 |
| `showList` | `boolean` | `false` | 리스트 콘텐츠 표시 |
| `list` | `ReactNode` | — | 리스트 콘텐츠 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `children` | `ReactNode` | — | 본문 내용 (필수) |

#### 크기별 치수
| size | 높이 | 패딩X | 아이콘 | 폰트 | 반경 | 콘텐츠 패딩 |
|---|---|---|---|---|---|---|
| `lg` | 56px | 20px | 20px | `typo-text-lg` | 8px | px:20px py:12px |
| `md` | 48px | 16px | 16px | `typo-text-md` | 6px | px:16px py:12px |
| `sm` | 40px | 12px | 16px | `typo-text-sm` | 6px | p:12px |

#### 상태별 헤더 스타일
| 상태 | 헤더 배경 | 타이틀 | 아이콘 |
|---|---|---|---|
| 닫힘 Default | 투명 | `--color-text-default` | `--color-icon-default` |
| 닫힘 Hover | `--color-bg-muted` | `--color-text-default` | `--color-icon-default` |
| 열림 Default | `--color-bg-accordion-open` | `--color-text-brand` | `--color-icon-brand` |
| 열림 Hover | `--color-bg-accordion-open-hover` | `--color-text-brand` | `--color-icon-brand` |
| Disabled | 투명 | `--color-text-disabled` | `--color-icon-disabled` |

#### 사용 예시
```tsx
// 비제어 모드
<Accordion title="FAQ 제목" variant="selecte" size="md" defaultOpen={false}>
  FAQ 내용이 여기 표시됩니다.
</Accordion>

// 제어 모드
<Accordion
  title="설정"
  open={isOpen}
  onToggle={setIsOpen}
  leftIcon={<IconSetting />}
  helperText="3개 항목"
>
  설정 내용
</Accordion>
```

---

## 5. Icons

모든 아이콘은 `@une-front/react-ui`에서 named export됩니다.

```tsx
import { IconSearch, IconX, IconCheck } from "@une-front/react-ui";
```

#### Icon Props
```ts
interface IconProps {
  size?: number;     // 픽셀 크기 (기본값: 컴포넌트별 상이)
  className?: string;
  color?: string;    // CSS color 값
}
```

#### 사용 가능한 아이콘 목록 (일부)

**일반**
`IconSearch` / `IconX` / `IconXCircle` / `IconCheck` / `IconCheckFill` / `IconCheckLine` / `IconPlus` / `IconMinus` / `IconFilter` / `IconSetting` / `IconEdit` (Line/Fill) / `IconBin` (Line/Fill) / `IconCopy` / `IconLink` / `IconUnlink` / `IconFlag` / `IconPin`

**내비게이션**
`IconArrow` (Up/Down/Left/Right) / `IconChevron` (Up/Down/Left/Right) / `IconDoubleChevron` (Up/Down/Left/Right) / `IconChevronFar` (Up/Down) / `IconCaretUp` / `IconCaretDown` / `IconSolidCaret` (Left/Right) / `IconMore` (Horizontal/Vertical)

**상태/알림**
`IconInfoCircle` (Fill/Line) / `IconWarning` (Fill/Line) / `IconSerious` (Fill/Line) / `IconQuestionCircle` (Fill/Line) / `IconAlarm` (Fill/Line/On/Off) / `IconEmergency` (Fill/Line)

**UI**
`IconFullScreen` / `IconFullScreenClose` / `IconZoomIn` / `IconZoomOut` / `IconGridFill` / `IconGridLine` / `IconListFill` / `IconListLine` / `IconFilter` / `IconSort` / `IconSend` / `IconMail` / `IconAttachment` / `IconCalendar` / `IconClock`

**사용자/프로필**
`IconProfile` (Fill/Line/Circle/Check/Setting) / `IconLock` / `IconUnlock` / `IconViewPassword` / `IconHidePassword` / `IconFingerprint`

**파일**
`IconDocument` / `IconFolder` (Fill/Line) / `IconFileDownload` / `IconFileUpload` / `IconCloudDownload` / `IconCloudUpload` / `IconPrint`

**기타**
`IconHome` (Fill/Line) / `IconBuilding` (Fill/Line) / `IconMap` (Fill/Line) / `IconCctv` (Fill/Line) / `IconCamera` (Fill/Line) / `IconStar` (Fill/Line) / `IconHeart` (Fill/Line) / `IconLoading` / `IconReset` / `IconPower`

> 전체 목록은 `modules/react-ui/src/index.ts`를 참조하세요.

---

## 6. Logos

```tsx
import { LogoBuilder, LogoProtecto, LogoPdf, LogoDocx } from "@une-front/react-ui";
```

#### 사용 가능한 Logo
`LogoBuilder` / `LogoDocx` / `LogoHwpx` / `LogoJpeg` / `LogoManagement` / `LogoMonitoring` / `LogoPdf` / `LogoPng` / `LogoPptx` / `LogoProtecto` / `LogoSop` / `LogoXlsx`

#### Logo Props
```ts
interface LogoProps {
  size?: number;
  className?: string;
}
```

---

## 부록: 구현 체크리스트

새 컴포넌트를 이 디자인 시스템으로 구현할 때 확인할 사항:

1. **토큰 사용**: primitive 토큰(`--grayscale-*`) 직접 사용 금지 → 시맨틱 토큰 사용
2. **단위**: CSS에서 `rem` 단위 사용 (`16rem` = `16px` in this project)
3. **다크모드**: `.dark` 클래스 기반, 시맨틱 토큰은 자동으로 다크모드 전환됨
4. **포커스 링**: 키보드 접근성을 위해 `focus-visible` 상태에서 `--selected-shadow` 적용
5. **disabled 우선**: disabled 상태는 intent/variant보다 우선 적용
6. **아이콘**: 새 SVG 직접 작성 금지 → `@une-front/react-ui`의 Icon 컴포넌트 사용
7. **흰색 고정 요소**: 다크모드에서 `--color-text-on-brand`는 어두운 색으로 반전. 항상 흰색이어야 하면 `text-white` 사용
