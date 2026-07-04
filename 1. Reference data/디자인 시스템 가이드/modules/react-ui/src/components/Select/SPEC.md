# Select — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `80:2333` |
| 링크 | https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=80-2333 |

## Prop ↔ Figma Property 매핑

| React Prop | 타입 | 기본값 | Figma Property |
|---|---|---|---|
| `variant` | `"standard" \| "inline"` | `"standard"` | variant |
| `size` | `SelectSize` | `"md"` | size |
| `intent` | `"none" \| "error" \| "complete"` | `"none"` | state (Complete / Error) |
| `options` | `SelectOption[]` | `[]` | — |
| `groups` | `SelectGroup[]` | — | — |
| `value` | `string` | — | — |
| `defaultValue` | `string` | — | — |
| `onChange` | `(value: string) => void` | — | — |
| `placeholder` | `string` | `"선택하세요"` | placeholder |
| `label` | `string` | — | label |
| `helperText` | `string` | — | — |
| `error` | `string \| boolean` | — | *(deprecated)* |
| `disabled` | `boolean` | `false` | state = Disabled |
| `leftIcon` | `ReactNode` | — | leftIcon |
| `zIndex` | `number` | `50` | — |
| `className` | `string` | — | — |

## 사이즈 스펙 (Figma 기준)

| Size | 높이 | Padding X | 아이콘 | 텍스트 | Radius |
|---|---|---|---|---|---|
| `3xl` | 56rem | 20rem | 24rem | typo-text-lg | 6rem |
| `2xl` | 52rem | 16rem | 24rem | typo-text-lg | 6rem |
| `xl`  | 48rem | 16rem | 24rem | typo-text-lg | 6rem |
| `lg`  | 44rem | 16rem | 20rem | typo-text-lg | 6rem |
| `md`  | 40rem | 12rem | 20rem | typo-text-md | 6rem |
| `sm`  | 36rem | 12rem | 16rem | typo-text-md | 6rem |
| `xs`  | 32rem | 12rem | 16rem | typo-text-md | 4rem |
| `2xs` | 28rem | 12rem | 16rem | typo-text-sm | 4rem |

## inline variant 라벨 영역 스펙

| Size | 라벨 너비 | 라벨 Padding X |
|---|---|---|
| `3xl` | 126rem | 20rem |
| `2xl` | 118rem | 16rem |
| `xl`  | 118rem | 16rem |
| `lg`  | 118rem | 16rem |
| `md`  | 100rem | 12rem |
| `sm`  | 100rem | 12rem |
| `xs`  | 100rem | 12rem |
| `2xs` |  89rem | 12rem |

## SelectOption 타입

| 필드 | 타입 | 설명 |
|---|---|---|
| `value` | `string` | 옵션 값 |
| `label` | `string` | 표시 텍스트 |
| `disabled` | `boolean?` | 개별 옵션 비활성화 |

## SelectGroup 타입

| 필드 | 타입 | 설명 |
|---|---|---|
| `label` | `string` | 그룹 헤더 텍스트 |
| `options` | `SelectOption[]` | 그룹 내 옵션 목록 |

## variant 별 동작 차이

| variant | 라벨 위치 | 외형 |
|---|---|---|
| `standard` | 트리거 위 (외부) | 박스형 테두리 |
| `inline` | 트리거 내 (구분선 왼쪽) | 인라인 최소 스타일 |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Default | 기본 테두리 |
| Open | 드롭다운 열림 — 포커스 링 표시 |
| Error | `intent="error"` — 빨간 테두리 |
| Error + Open | 빨간 포커스 링 |
| Complete | `intent="complete"` — 초록 테두리 |
| Complete + Open | 초록 포커스 링 |
| Disabled | `disabled` prop |

## 드롭다운 위치 자동 플립

- 트리거 아래 공간 부족 시 위로 자동 뒤집힘 (spaceBelow < 240px && spaceAbove > spaceBelow)
- 스크롤/리사이즈 시 위치 재계산 (rAF 스로틀링)
- `document.body` Portal로 렌더링하여 `overflow: hidden` 부모 영향 없음

## 생략된 조합

- Disabled + Error/Complete — disabled 상태가 intent보다 우선
- helperText는 `disabled` 상태에서 미표시
