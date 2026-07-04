# SegmentedControl — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `oMm0nhTOiYl6EoqhcVlBJf` |
| 노드 ID | *(미정의 — Figma에 컴포넌트 미제작)* |
| 링크 | — |

## 컴포넌트 구성

SegmentedControl은 Compound 패턴으로 구성됩니다.

- `SegmentedControl` — 공개 API. `SegmentedContainer` + `SegmentedButton` 조합
- `SegmentedContainer` — 전체 컨테이너 (배경 트랙)
- `SegmentedButton` — 개별 선택 버튼

## Prop ↔ Figma Property 매핑

*(Figma 컴포넌트 미제작 — 코드 Props 기준으로 작성)*

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `T extends string` | — | 현재 선택된 값 (필수, 제네릭) |
| `options` | `SegmentedOption<T>[]` | — | 선택 가능한 옵션 목록 (필수) |
| `setValue` | `Dispatch<SetStateAction<T>>` | — | 값 변경 핸들러 (필수) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 전체 크기 |
| `fullWidth` | `boolean` | — | 컨테이너 전체 너비 사용 여부 |
| `disabled` | `boolean` | — | 전체 비활성화 |
| `fitContent` | `boolean` | `false` | 버튼 너비를 콘텐츠 크기에 맞출지 여부 |
| `className` | `string` | — | 추가 className |

> `SegmentedControlProps<T>`는 `ComponentProps<"div">`를 확장합니다.

## SegmentedOption 타입

| 필드 | 타입 | 설명 |
|---|---|---|
| `value` | `T` | 옵션 값 |
| `label` | `ReactNode` | 표시 라벨 (텍스트 또는 ReactNode) |
| `disabled` | `boolean?` | 개별 옵션 비활성화 |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Unselected Default | 투명 배경 |
| Unselected Hover | CSS `:hover` |
| Unselected Active | CSS `:active` |
| Selected | 흰 배경 + 그림자 (선택 슬라이더) |
| Disabled (전체) | `disabled` prop — 모든 버튼 비활성화 |
| Disabled (개별) | `option.disabled` — 해당 버튼만 비활성화 |

## 생략된 조합

- Selected + Disabled — 개별 disabled는 선택된 항목에도 적용 가능하나 선택 해제는 불가

## Figma 작업 요청

- [ ] 이 컴포넌트의 Figma 디자인 제작 필요
- [ ] 제작 후 노드 ID를 이 파일에 업데이트
