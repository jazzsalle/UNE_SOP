# Button — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `oMm0nhTOiYl6EoqhcVlBJf` |
| 노드 ID | `63:2` |
| 링크 | [Figma에서 열기](https://www.figma.com/design/oMm0nhTOiYl6EoqhcVlBJf/My-Design-System-v0.1?node-id=63:2) |

## Prop ↔ Figma Property 매핑

| React Prop | Figma Property | 값 매핑 |
|---|---|---|
| `variant` | `variant` | `"fill"` / `"outline"` / `"ghost"` (1:1) |
| `color` | `color` | `"primary"` / `"grayscale"` (1:1) |
| `size` | `size` | `"4xs"`~`"3xl"` 10단계 (1:1) |
| `disabled` | `state=Disabled` | boolean (CSS :disabled 가상 클래스) |
| `selected` | *(미정의)* | Figma에 variant 없음 → 추가 요청 필요 |
| `leftIcon` | `showLeftIcon=true` + swap icon | ReactNode |
| `rightIcon` | `showRightIcon=true` + swap icon | ReactNode |

## 지원 상태 조합

| state | variant | color | 비고 |
|---|---|---|---|
| Default | all | all | — |
| Hover | all | all | CSS :hover |
| Focus | all | all | CSS :focus (focus ring 표시) |
| Active | all | all | CSS :active |
| Disabled | all | all | `disabled` prop |
| Selected | — | — | `selected` prop (Figma 미정의) |

## 생략된 조합

- `Disabled + Hover` — Figma 미제작, 코드에서도 `not-disabled` 조건으로 제외
- `Disabled + Focus` — 동일
- `Disabled + Active` — 동일
- `Focus + Hover` — Figma 미제작, 코드에서도 `not-focus` 조건으로 제외

## 시맨틱 토큰 사용 현황

- `--color-action-primary-*` / `--color-action-secondary-*` / `--color-action-danger-*` — 배경
- `--color-text-primary` / `--color-text-inverse` / `--color-text-brand` / `--color-text-disabled` — 텍스트
- `--color-border-brand` / `--color-border-default` / `--color-border-disabled` — 테두리
- `--color-bg-brand-subtle` / `--color-bg-brand-subtle-hover` / `--color-bg-muted` / `--color-bg-disabled` — 배경 면
- `--color-focus-ring-default` — 포커스 링 (`shadow-[0_0_0_2rem_var(--color-focus-ring-default)]`)

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-29 | Figma `63:2` 원본 대조, primitive → 시맨틱 토큰 마이그레이션, 버그 6개 수정 |
