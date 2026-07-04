# IconButton — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `oMm0nhTOiYl6EoqhcVlBJf` |
| 노드 ID | *(미정의 — Figma에 컴포넌트 미제작)* |
| 링크 | — |

## Prop ↔ Figma Property 매핑

*(Figma 컴포넌트 미제작 — 코드 Props 기준으로 작성)*

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `variant` | `"fill" \| "outline" \| "ghost"` | `"fill"` | 버튼 스타일 |
| `color` | `"primary" \| "grayscale"` | `"primary"` | 버튼 색상 |
| `size` | `"3xl" \| "2xl" \| "xl" \| "lg" \| "md" \| "sm" \| "xs" \| "2xs" \| "3xs" \| "4xs"` | `"md"` | 버튼 크기 (56px ~ 20px 10단계) |
| `icon` | `ReactNode` | — | 표시할 아이콘 (필수) |
| `selected` | `boolean` | `false` | 선택 상태 (focus ring 표시) |
| `disabled` | `boolean` | — | 비활성화 여부 |
| `className` | `string` | — | 추가 className |

## 크기별 픽셀 매핑

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

## 지원 상태 조합

| state | 비고 |
|---|---|
| Default | — |
| Hover | CSS `:hover` (not-focus, not-selected, not-disabled 조건) |
| Focus | CSS `:focus` — focus ring(2px) 표시 |
| Active | CSS `:active` |
| Selected | `selected` prop — focus ring 상시 표시 |
| Disabled | `disabled` prop |

## 생략된 조합

- Disabled + Hover — `not-disabled` 조건으로 hover 제외
- Selected + Hover — `not-[data-selected]` 조건으로 hover 배경 제외
- Focus + Hover — `not-focus` 조건으로 hover 배경 제외

## Figma 작업 요청

- [ ] 이 컴포넌트의 Figma 디자인 제작 필요
- [ ] 제작 후 노드 ID를 이 파일에 업데이트
