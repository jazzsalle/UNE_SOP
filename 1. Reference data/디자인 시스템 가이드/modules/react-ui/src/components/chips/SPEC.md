# Chips

Figma: https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=2300-15857
File Key: `xTsueffpy8PZYysvysIAn8`
Node ID: `2300:15857`

## Components

| Component  | 설명 |
|------------|------|
| InputChip  | 태그/선택값을 표시하며 X 버튼으로 삭제 가능 |
| FilterChip | 멀티 선택 필터 칩 — 선택 시 체크 아이콘 표시 |
| ChoiceChip | 단일 선택 칩 (라디오 버튼 형태) — 선택 시 체크 아이콘 표시 |
| ActionChip | 액션 트리거 칩 — neutral / primary 색상 |

## Sizes

| Size | Height  | Padding X | Gap    | Typography    | Icon Size |
|------|---------|-----------|--------|---------------|-----------|
| lg   | 36rem   | 14rem     | 8rem   | typo-text-lg  | 20rem     |
| md   | 32rem   | 12rem     | 6rem   | typo-text-md  | 16rem     |
| sm   | 28rem   | 10rem     | 4rem   | typo-text-sm  | 16rem     |

## Variants

| Variant | 설명 |
|---------|------|
| fill    | 채워진 배경 |
| outline | 테두리만 (border) |
| ghost   | 배경/테두리 없음 |

## State Combinations

### FilterChip / ChoiceChip

| State             | Fill BG                        | Text                          |
|-------------------|--------------------------------|-------------------------------|
| Default           | --color-interactive-neutral    | --color-text-secondary        |
| Hover             | --color-interactive-neutral-hover | --color-text-default       |
| Active            | --color-interactive-neutral-pressed | (same text)              |
| Selected          | --color-bg-brand-subtle-pressed | --color-text-brand           |
| Selected Hover    | --color-bg-chip-selected-hover | --color-interactive-brand-hover |
| Selected Active   | --color-bg-chip-selected-pressed | --color-interactive-brand-pressed |
| Disabled          | --color-bg-subtle              | --color-text-disabled         |

### ActionChip (primary color)

| State    | Fill BG                      | Text                    |
|----------|------------------------------|-------------------------|
| Default  | --color-interactive-brand    | --color-text-on-brand   |
| Hover    | --color-interactive-brand-hover | (same text)          |
| Active   | --color-interactive-brand-pressed | (same text)        |
| Disabled | --color-bg-subtle            | --color-text-disabled   |

## New Semantic Tokens Added

`modules/design-tokens/src/semantic/colors-interaction.css`

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg-chip-selected-hover` | `--light-blue-75` (#d2deff) | `--dark-blue-50` (#111c3d) |
| `--color-bg-chip-selected-pressed` | `--light-blue-100` (#c2d3ff) | `--dark-blue-75` (#15244d) |
