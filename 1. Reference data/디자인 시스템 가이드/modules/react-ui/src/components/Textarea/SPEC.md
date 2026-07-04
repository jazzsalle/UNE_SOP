# Textarea — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `585:4067` |
| 링크 | [Design-System_New-v1.0.0 · Textarea](https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=585-4067) |

## Prop ↔ Figma Property 매핑

| React Prop | 타입 | 기본값 | Figma Property |
|---|---|---|---|
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | size |
| `label` | `string` | — | label (on/off) |
| `intent` | `"default" \| "error" \| "complete"` | `"default"` | state |
| `helperText` | `string` | — | helperText (on/off) |
| `error` | `string \| boolean` | — | *(deprecated → intent="error" + helperText)* |
| `maxLength` | `number` | `0` | — |
| `showCounter` | `boolean` | `false` | Counter (on/off) |
| `minHeight` | `number` | `100` | Height (design rule) |
| `maxHeight` | `number` | `176` | Height (design rule) |
| `resize` | `"none" \| "vertical" \| "auto"` | `"auto"` | showResize |
| `value` | `string` | — | — |
| `defaultValue` | `string` | — | — |
| `disabled` | `boolean` | — | state=Disabled |
| `placeholder` | `string` | — | placeholder |

## 사이즈별 스펙

| size | 폰트 | 라벨 폰트 | 수평 패딩 (effective) |
|---|---|---|---|
| `lg` | `typo-text-lg` (16px) | `typo-text-md` (14px) | 16px |
| `md` | `typo-text-md` (14px) | `typo-text-sm` (12px) | 12px |
| `sm` | `typo-text-sm` (12px) | `typo-text-sm` (12px) | 8px |

> 수평 패딩은 wrapper `px-[4rem]` + textarea `px` 합산 기준

## resize 동작 상세

| resize 값 | 동작 |
|---|---|
| `auto` | 입력 내용에 따라 높이 자동 확장 (minHeight ~ maxHeight) |
| `vertical` | 사용자가 드래그로 높이 조절 가능 (리사이즈 핸들 아이콘 표시) |
| `none` | 높이 고정 |

## 지원 상태 조합

| Figma state | 코드 동작 | 비고 |
|---|---|---|
| Default | 기본 테두리 | — |
| Hover | 브랜드 색 테두리 | CSS hover |
| Active | hover 스타일 유지, 포커스 링 없음 | 마우스 클릭 시 |
| Focus-visible | 포커스 링 표시 | 키보드 Tab 이동 시 |
| Error | 빨간 테두리 | `intent="error"` 또는 `maxLength` 초과 |
| Error + Focus | 빨간 포커스 링 | 키보드 포커스 시 |
| Complete | `intent="complete"` | 기본 테두리 유지 |
| Complete + Focus | 브랜드 포커스 링 | 키보드 포커스 시 |
| Disabled | 뮤트 배경 + 비활성 테두리 | — |

## HelperText / Counter 표시 규칙

- `intent="error"` 또는 `intent="complete"` : helperText 항상 표시
- `intent="default"` : **키보드 포커스** 시에만 helperText 표시
- `disabled` 상태에서는 helperText 미표시
- `showCounter=true` : disabled 여부와 무관하게 카운터 표시
- 글자 수 초과 시 카운터 숫자가 에러 색상으로 변경

## 생략된 조합

- Disabled + Error/Complete — disabled 상태가 intent보다 우선
