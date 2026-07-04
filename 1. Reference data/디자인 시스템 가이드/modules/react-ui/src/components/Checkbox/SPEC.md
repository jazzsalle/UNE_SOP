# Checkbox — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `33:3055` |
| 링크 | [Figma](https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=33-3055) |

## Prop ↔ Figma Property 매핑

*(Figma 컴포넌트 제작 완료)*

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `checked` | `boolean` | `false` | 체크 상태 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 상태 변경 핸들러 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 체크박스 크기 |
| `label` | `string` | — | 라벨 텍스트 |
| `disabled` | `boolean` | — | 비활성화 여부 |
| `className` | `string` | — | 추가 className |

> `CheckboxProps`는 `ComponentProps<"input">`을 확장하므로 표준 input 속성도 지원합니다. (`size`, `type` 제외)

## 크기별 치수

| size | 박스 크기 | 아이콘 크기 | 텍스트 스타일 |
|---|---|---|---|
| `lg` | 24px | 16px | `typo-title-sm` |
| `md` | 20px | 12px | `typo-text-lg` |
| `sm` | 16px | 12px | `typo-text-md` |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Unchecked Default | 흰 배경, 회색 테두리 |
| Unchecked Hover | 테두리 진해짐, 배경 밝은 회색 |
| Unchecked Active | 테두리 진해짐, 배경 밝은 회색 |
| Unchecked Focus-visible | focus ring(2px) |
| Checked Default | 파란 배경 |
| Checked Hover | 더 진한 파란 배경 |
| Checked Active | 가장 진한 파란 배경 |
| Checked Focus-visible | 파란 배경, focus ring(2px) |
| Disabled Unchecked | 연한 회색 배경(`--color-bg-disabled`), 연한 테두리(`--color-border-disabled`) |
| Disabled Checked | 연한 회색 배경, 회색 체크 아이콘 |

## 생략된 조합

- Disabled + Hover — `cursor-not-allowed`로 hover 상태 진입 불가 (시각적 변화 없음)

## Figma 작업 요청

- [x] 이 컴포넌트의 Figma 디자인 제작 완료
- [x] 노드 ID 업데이트 완료
