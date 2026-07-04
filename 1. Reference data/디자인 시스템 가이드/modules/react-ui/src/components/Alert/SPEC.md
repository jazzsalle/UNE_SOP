# Alert — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `oMm0nhTOiYl6EoqhcVlBJf` |
| 노드 ID | *(미정의 — Figma에 컴포넌트 미제작)* |
| 링크 | — |

## Prop ↔ Figma Property 매핑

*(Figma 컴포넌트 미제작 — 코드 Props 기준으로 작성)*

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `intent` | `"info" \| "success" \| "warning" \| "error"` | `"info"` | 알림 의도 |
| `variant` | `"filled" \| "outlined" \| "light"` | `"light"` | 스타일 변형 |
| `title` | `ReactNode` | — | 제목 (굵은 텍스트) |
| `onClose` | `() => void` | — | 닫기 콜백 (설정 시 우측에 X 버튼 표시) |
| `hideIcon` | `boolean` | `false` | 좌측 아이콘 숨기기 |
| `children` | `ReactNode` | — | 알림 본문 내용 |
| `className` | `string` | — | 추가 className |

> `AlertProps`는 `ComponentProps<"div">`를 확장합니다. (`title` 제외)

## intent 별 아이콘

| intent | 아이콘 |
|---|---|
| `info` | `IconInfoCircleLine` (20px) |
| `success` | `IconCheckLine` (20px) |
| `warning` | `IconWarningLine` (20px) |
| `error` | `IconXCircle` (20px) |

## variant × intent 조합 색상

| variant | info | success | warning | error |
|---|---|---|---|---|
| `filled` | 파란 배경 + 흰 텍스트 | 초록 배경 + 흰 텍스트 | 노란 배경 + 흰 텍스트 | 빨간 배경 + 흰 텍스트 |
| `outlined` | 파란 테두리 + 파란 텍스트 | 초록 테두리 + 초록 텍스트 | 노란 테두리 + 노란 텍스트 | 빨간 테두리 + 빨간 텍스트 |
| `light` | 연한 파란 배경 + 진한 파란 텍스트 | 연한 초록 배경 + 진한 초록 텍스트 | 연한 노란 배경 + 진한 노란 텍스트 | 연한 빨간 배경 + 진한 빨간 텍스트 |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Default | 인라인 고정 표시 |
| Dismissible | `onClose` prop 설정 시 X 버튼 표시 |
| Without Icon | `hideIcon=true` 시 아이콘 영역 숨김 |
| With Title | `title` prop 설정 시 굵은 타이틀 표시 |
| Title + Content | title과 children 동시 사용 시 children에 `opacity-90` 적용 |

## 생략된 조합

- Hover/Focus/Active 상태 없음 — 인라인 정적 컴포넌트
- Disabled 상태 없음

## Figma 작업 요청

- [ ] 이 컴포넌트의 Figma 디자인 제작 필요
- [ ] 제작 후 노드 ID를 이 파일에 업데이트
