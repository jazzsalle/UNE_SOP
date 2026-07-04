# Radio — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `570:9110` |
| 링크 | [Figma](https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=570-9110) |

## 컴포넌트 구성

Radio는 `RadioGroup`과 `RadioButton` 두 컴포넌트로 구성됩니다.  
`RadioGroup`이 Context로 상태를 관리하고, `RadioButton`은 단독으로도 사용 가능합니다.

## RadioGroup Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `string` | — | 현재 선택된 값 (필수) |
| `setValue` | `(value: string) => void` | — | 값 변경 핸들러 (필수) |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 라디오 크기 (하위 RadioButton에 전파) |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | 배치 방향 |
| `disabled` | `boolean` | `false` | 전체 비활성화 |
| `children` | `ReactNode` | — | RadioButton 요소들 (필수) |

## RadioButton Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `string` | — | 라디오 값 (필수) |
| `label` | `string` | — | 라벨 텍스트 |
| `disabled` | `boolean` | — | 개별 비활성화 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 크기 (RadioGroup 없이 단독 사용 시) |

> `RadioButtonProps`는 `ComponentProps<"input">`을 확장하므로 표준 input 속성도 지원합니다. (`size`, `type`, `value` 제외)

## 크기별 치수

| size | 외부 원 크기 | 내부 원(thumb) 크기 | 텍스트 스타일 |
|---|---|---|---|
| `lg` | 24px | 12px | `typo-title-sm` |
| `md` | 20px | 10px | `typo-text-lg` |
| `sm` | 16px | 8px | `typo-text-md` |

## direction 별 레이아웃

| direction | 레이아웃 | 간격 |
|---|---|---|
| `vertical` | 세로 나열 | 8px |
| `horizontal` | 가로 나열 | 16px |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Unselected Default | 흰 배경, 회색 테두리 |
| Unselected Hover | 테두리 진해짐, 연한 배경 |
| Unselected Active | 더 진한 테두리, 회색 배경 |
| Unselected Focus-visible | 포커스 링(2px, `--selected-shadow`) |
| Selected Default | 파란 배경, 흰 thumb, focus ring(2px) |
| Selected Hover | 더 진한 파란 배경, focus ring 제거 |
| Selected Active | 가장 진한 파란 배경, focus ring 제거 |
| Selected Focus-visible | 파란 배경, 흰 thumb, 포커스 링(2px) |
| Disabled Unselected | 연한 회색 배경, 연한 테두리, 라벨 흐림 |
| Disabled Selected | 연한 회색 배경, 회색 thumb, 라벨 흐림 |

## 생략된 조합

- Disabled + Hover — hover 상태에서 시각적 변화 없음
- 개별 `RadioButton`의 `disabled`와 `RadioGroup`의 `disabled`는 OR 조건으로 합산

## Figma 작업 요청

- [x] 이 컴포넌트의 Figma 디자인 제작 완료
- [x] 노드 ID 업데이트 완료
