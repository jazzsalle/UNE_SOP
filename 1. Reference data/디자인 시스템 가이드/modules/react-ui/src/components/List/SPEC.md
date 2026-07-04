# List 컴포넌트 스펙

## Figma

- **파일 키**: `xTsueffpy8PZYysvysIAn8`
- **노드 ID**: `2323:27211`
- **링크**: https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=2323-27211

## 컴포넌트 구성

| 컴포넌트 | 설명 |
|---|---|
| `List` | 옵션 목록을 렌더링하는 컨테이너. `role="listbox"` |
| `ListItem` | 개별 행. `role="option"` |

## Props

### ListItemOption (데이터 모델)

| 속성 | 타입 | 설명 |
|---|---|---|
| `value` | `string` | 식별자 |
| `label` | `string` | 표시 텍스트 |
| `helperText?` | `string` | 보조 텍스트 (항상 `--color-text-disabled` 색상) |
| `leftIcon?` | `ReactNode` | 왼쪽 아이콘 |
| `rightIcon?` | `ReactNode` | 오른쪽 아이콘 |
| `disabled?` | `boolean` | 비활성화 |

### ListItemProps

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `option` | `ListItemOption` | — | 옵션 데이터 |
| `selected` | `boolean` | `false` | 선택 상태 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 아이템 크기 |
| `showCheckbox` | `boolean` | `false` | 체크박스 시각 표시 |
| `onSelect` | `(value: string) => void` | — | 선택 콜백 |

### ListProps

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `options` | `ListItemOption[]` | — | 옵션 목록 |
| `value` | `string` | — | 현재 선택 값 |
| `onSelect` | `(value: string) => void` | — | 선택 콜백 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 전체 아이템 크기 |
| `showCheckbox` | `boolean` | `false` | 체크박스 표시 |
| `role` | `string` | `"listbox"` | ARIA role |

## 사이즈 스펙

| 사이즈 | 높이 | 패딩(좌우) | 아이콘 | 체크박스 | 타이포 |
|---|---|---|---|---|---|
| `lg` (Figma: lg(52)¹) | 56rem | 28rem | 20rem | 20rem | `typo-text-lg` (16px) |
| `md` | 48rem | 24rem | 16rem | 16rem | `typo-text-md` (14px) |
| `sm` | 40rem | 20rem | 12rem | 16rem | `typo-text-sm` (12px) |

> ¹ Figma 컴포넌트 이름은 `lg(52)`이지만 실제 렌더 높이는 56px. 다음 Figma 업데이트에서 수정될 예정.

## 상태별 색상 (Figma Light 기준 → 시맨틱 토큰)

| 상태 | 배경 | 레이블 색상 | 왼쪽 아이콘 |
|---|---|---|---|
| Default | 투명 | `--color-text-subtle` | `--color-icon-default` |
| Selected | 투명 | `--color-interactive-brand` | `--color-icon-brand` |
| Hover | `--color-bg-subtle` | 상동 | 상동 |
| Active | `--color-bg-muted` | 상동 | 상동 |
| Focus-visible | 투명 + `--selected-shadow` | 상동 | 상동 |
| Disabled | 투명 | `--color-text-disabled` | `--color-icon-disabled` |

> helperText / rightIcon 색상은 항상 `--color-text-disabled` / `--color-icon-default` (비활성화 시 `--color-icon-disabled`).

## 상태 조합 테스트

| selected | disabled | showCheckbox | 구현 완료 | Storybook 시각 검증 |
|---|---|---|---|---|
| false | false | false | ✅ | — |
| true | false | false | ✅ | — |
| false | false | true | ✅ | — |
| true | false | true | ✅ | — |
| false | true | false | ✅ | — |
| false | true | true | ✅ | — |
| true | true | true | ✅ | — |
