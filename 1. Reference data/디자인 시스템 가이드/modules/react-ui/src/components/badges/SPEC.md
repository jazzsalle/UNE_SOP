# Badges — Component Spec

뱃지는 2개의 독립 컴포넌트로 구성됩니다: `Badge`, `BadgeDot`

---

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `761:11045` |
| 링크 | https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=761-11045 |

---

## 1. Badge — 라벨 뱃지

상태나 카테고리를 표시하는 라벨 형태의 뱃지입니다.

### Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `label` | `string` | — | 라벨 텍스트 (필수) |
| `shape` | `"round-square" \| "cylinder"` | `"round-square"` | 형태 |
| `variant` | `"solid" \| "solid-pastel" \| "outline" \| "dot-accent" \| "dot-neutral"` | `"solid"` | 스타일 변형 |
| `color` | `"primary" \| "success" \| "error" \| "secondary" \| "warning" \| "grayscale"` | `"primary"` | 색상 |
| `size` | `"xl" \| "lg" \| "md" \| "sm" \| "xs"` | `"md"` | 크기 |
| `leftIcon` | `ReactNode` | — | 왼쪽 아이콘 (solid / solid-pastel / outline 전용) |
| `className` | `string` | — | 추가 className |

### 크기별 치수

| size | 높이 | 좌우 패딩 | gap | 텍스트 스타일 | round-square radius |
|---|---|---|---|---|---|
| `xl` | 36px | 14px | 8px | `typo-text-lg` | 6px |
| `lg` | 32px | 12px | 6px | `typo-text-md` | 4px |
| `md` | 28px | 10px | 4px | `typo-text-md` | 4px |
| `sm` | 24px | 8px  | 4px | `typo-text-sm` | 4px |
| `xs` | 20px | 6px  | 4px | `typo-text-sm` | 4px |

> `cylinder` shape는 크기 무관 `rounded-full` 적용

### 아이콘 크기 (solid / solid-pastel / outline)

| size | 아이콘 크기 |
|---|---|
| `xl` | 20px |
| `lg`, `md` | 16px |
| `sm`, `xs` | 12px |

### variant × color 조합

| variant | 설명 |
|---|---|
| `solid` | 진한 배경 + 흰 텍스트 |
| `solid-pastel` | 연한 배경 + 색상 텍스트 |
| `outline` | 투명 배경 + 색상 테두리 + 색상 텍스트 |
| `dot-accent` | 점 + 레이블 모두 intent 색상 |
| `dot-neutral` | 점은 intent 색상, 레이블은 subtle 회색 |

### dot 변형 점 크기

| size | 점 크기 |
|---|---|
| `xl` | 10px |
| `lg`, `md` | 8px |
| `sm`, `xs` | 6px |

---

## 2. BadgeDot — 점 뱃지

알림이나 새로운 콘텐츠가 있음을 나타내는 작은 점 표시입니다.

### Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `variant` | `"primary" \| "new"` | `"primary"` | 점 스타일 |
| `size` | `"xl" \| "lg" \| "md" \| "sm"` | `"md"` | 점 크기 |
| `className` | `string` | — | 추가 className |

### 크기별 치수

| size | 점 크기 |
|---|---|
| `xl` | 8px |
| `lg` | 6px |
| `md` | 4px |
| `sm` | 2px |

### variant 별 색상

| variant | Light | Dark |
|---|---|---|
| `primary` | `light-blue-500` | `dark-blue-300` |
| `new` | `orange-500` | `orange-300` |

---

## 공통 지원 상태 조합

| state | 비고 |
|---|---|
| Default | 정적 표시 |
| Dark Mode | 모든 뱃지 다크모드 지원 |

## 생략된 조합

- Hover/Focus/Active/Disabled 상태 없음 — 모든 뱃지는 정적 인디케이터 컴포넌트
- `BadgeStatus` 컴포넌트 제거됨 — `dot-accent` / `dot-neutral` variant로 `Badge`에 통합
