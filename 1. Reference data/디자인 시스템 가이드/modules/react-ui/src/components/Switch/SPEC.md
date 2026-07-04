# Switch — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `33:3054` |
| 링크 | [Figma](https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=33-3054) |

## 컴포넌트 구성

`Switch`는 Compound 패턴으로 구성됩니다.

- `Switch` — 공개 API. `SwitchTrack` + `SwitchThumb`을 조합
- `SwitchTrack` — 트랙(배경) 영역
- `SwitchThumb` — 이동하는 원형 thumb

## Prop ↔ Figma Property 매핑

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `boolean` | — | 스위치 ON/OFF 상태 |
| `setValue` | `(value: boolean) => void` | — | 상태 변경 핸들러 |
| `size` | `"lg" \| "md" \| "sm"` | `"md"` | 스위치 크기 |
| `disabled` | `boolean` | — | 비활성화 여부 |
| `className` | `string` | — | 추가 className |

> `SwitchProps`는 `ComponentProps<"div">`를 확장하므로 div 속성도 지원합니다.

## 지원 상태 조합

| state | 비고 |
|---|---|
| OFF Default | 회색 트랙, 흰 thumb |
| OFF Hover | CSS `:hover` |
| OFF Active | CSS `:active` |
| OFF Focus-visible | 포커스 링(2px, `--selected-shadow`) |
| ON Default | 파란 트랙, 흰 thumb |
| ON Hover | 더 진한 파란 트랙 |
| ON Active | CSS `:active` |
| ON Focus-visible | 파란 트랙, 포커스 링(2px) |
| Disabled OFF | 연한 회색 트랙, 회색 thumb |
| Disabled ON | 연한 회색 트랙, 회색 thumb |

## 생략된 조합

- Disabled + Hover — `cursor-not-allowed`로 hover 상태 진입 불가 (시각적 변화 없음)

## Figma 작업 요청

- [x] 이 컴포넌트의 Figma 디자인 제작 완료
- [x] 노드 ID 업데이트 완료
