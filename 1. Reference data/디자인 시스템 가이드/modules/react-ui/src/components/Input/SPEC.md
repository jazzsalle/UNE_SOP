# Input — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `123:17394` |
| 링크 | https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=123-17394 |

## Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `size` | `"3xl" \| "2xl" \| "xl" \| "lg" \| "md" \| "sm" \| "xs" \| "2xs"` | `"md"` | 입력 필드 크기 |
| `variant` | `"standard" \| "inline"` | `"standard"` | 레이아웃 변형 |
| `intent` | `"default" \| "error" \| "complete"` | `"default"` | 유효성 검증 상태 |
| `label` | `string` | — | 레이블 텍스트 (standard: 위, inline: 왼쪽 고정 영역) |
| `helperText` | `string` | — | 하단 안내/결과 메시지 |
| `error` | `string \| boolean` | — | 에러 메시지 (`@deprecated` — `intent="error"` + `helperText` 사용 권장) |
| `leftIcon` | `ReactNode` | — | 왼쪽 슬롯 (아이콘, 버튼 등) |
| `rightButton` | `ReactNode` | — | 오른쪽 슬롯 (아이콘, 버튼 등) |
| `clearable` | `boolean` | `false` | 값 초기화(X) 버튼 표시 여부 |
| `onClear` | `() => void` | — | 값 초기화 시 콜백 |
| `value` | `string` | — | 제어 모드 값 |
| `defaultValue` | `string` | — | 비제어 모드 초기값 |
| `disabled` | `boolean` | — | 비활성화 여부 |
| `placeholder` | `string` | — | 플레이스홀더 텍스트 |

> `InputProps`는 `ComponentProps<"input">`을 확장하므로 표준 input 속성(`onChange`, `onFocus`, `onBlur` 등)도 모두 지원합니다.

## 크기별 치수

| size | 높이 | 좌우 패딩 | 반경 | 아이콘 | 클리어 버튼 | 입력 텍스트 | 레이블 텍스트 |
|---|---|---|---|---|---|---|---|
| `3xl` | 56px | 16px | 8px | 24px | 40px (md) | `typo-title-sm` | `typo-text-md` |
| `2xl` | 52px | 16px | 8px | 24px | 36px (sm) | `typo-text-lg`  | `typo-text-md` |
| `xl`  | 48px | 16px | 6px | 20px | 32px (xs) | `typo-text-lg`  | `typo-text-md` |
| `lg`  | 44px | 12px | 6px | 20px | 32px (xs) | `typo-text-lg`  | `typo-text-sm` |
| `md`  | 40px | 12px | 6px | 16px | 28px (2xs) | `typo-text-md` | `typo-text-sm` |
| `sm`  | 36px | 12px | 6px | 16px | 24px (3xs) | `typo-text-md` | `typo-text-sm` |
| `xs`  | 32px |  8px | 4px | 16px | 24px (3xs) | `typo-text-sm` | `typo-text-sm` |
| `2xs` | 28px |  8px | 4px | 16px | 20px (4xs) | `typo-text-sm` | `typo-text-sm` |

## variant 별 레이아웃

| variant | 레이블 위치 | 설명 |
|---|---|---|
| `standard` | 컨테이너 위 | 기본 레이아웃. 레이블은 `<label>` 태그로 상단 렌더링 |
| `inline` | 컨테이너 왼쪽 | 레이블이 고정 너비(160px) 회색 영역에 배치. 입력 영역은 flex-1 |

### Inline 레이블 영역 스펙

- 너비: `160px` (고정, 모든 크기 공통)
- 배경: `--color-bg-muted`
- 오른쪽 구분선: `border-r` / `--color-border-default`
- 좌우 패딩: 16px (3xl/2xl/xl), 12px (lg 이하)
- 텍스트: 같은 크기의 타이포 + `font-medium` + `--color-text-subtle`
- 컨테이너에 `overflow-hidden` 적용 (배경색이 border-radius에 맞춰 클리핑)

## 지원 상태 조합

| state | 비고 |
|---|---|
| Default | 기본 테두리 |
| Hover | 브랜드 색상 테두리 |
| Focus | 포커스 링 표시 |
| Error | `intent="error"` — 위험 색상 테두리 |
| Error + Focus | 위험 포커스 링 |
| Complete | `intent="complete"` — 브랜드 테두리 |
| Complete + Focus | 브랜드 포커스 링 |
| Disabled | `disabled` prop — 배경 회색, 비활성 커서 |
| Dark Mode | 모든 상태 다크모드 지원 |

## HelperText 표시 규칙

- `intent="error"` 또는 `intent="complete"` : 항상 표시 (포커스 무관)
- `intent="default"` : 포커스 시에만 표시
- `disabled` 상태에서는 helperText 미표시

## 생략된 조합

- Disabled + Error/Complete — disabled 상태가 intent보다 우선
- clearable 버튼은 `hasValue && !disabled` 조건에서만 표시
