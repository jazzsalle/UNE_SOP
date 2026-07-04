# Modal — Component Spec

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
| `open` | `boolean` | — | 모달 열림 여부 (필수) |
| `onClose` | `() => void` | — | 닫힘 콜백 (필수) |
| `title` | `ReactNode` | — | 모달 제목 |
| `intent` | `"none" \| "info" \| "success" \| "warning" \| "delete"` | `"none"` | 의도 아이콘 표시 |
| `closeOnBackdrop` | `boolean` | `true` | 백드롭 클릭으로 닫기 허용 |
| `closeOnEsc` | `boolean` | `true` | ESC 키로 닫기 허용 |
| `footer` | `ReactNode` | — | 하단 액션 버튼 영역 |
| `className` | `string` | — | 추가 className |

> `ModalProps`는 `ComponentProps<"div">`를 확장합니다. (`title` 제외)

> `size` prop이 타입에 정의되어 있으나(`"sm" \| "md" \| "lg" \| "xl" \| "full"`) 현재 구현에서는 주석 처리되어 있음. 실제 다이얼로그는 고정 크기(540×220px)입니다.

## intent 별 아이콘

| intent | 아이콘 |
|---|---|
| `none` | 아이콘 없음 |
| `info` | 파란 정보 아이콘 |
| `success` | 초록 체크 아이콘 |
| `warning` | 노란 경고 아이콘 |
| `delete` | 빨간 삭제/위험 아이콘 |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Open | `open=true` — Portal로 body에 렌더링, 백드롭 표시, body 스크롤 잠금 |
| Closed | `open=false` — 컴포넌트 언마운트 |

## 닫기 트리거

| 트리거 | 조건 |
|---|---|
| 백드롭 클릭 | `closeOnBackdrop=true` (기본값) |
| ESC 키 | `closeOnEsc=true` (기본값) |
| footer 버튼 | 직접 `onClose` 호출 |

## 생략된 조합

- `size` prop — 현재 미구현 (고정 크기)

## Figma 작업 요청

- [ ] 이 컴포넌트의 Figma 디자인 제작 필요
- [ ] 제작 후 노드 ID를 이 파일에 업데이트
- [ ] `size` prop 구현 시 다양한 크기 변형 디자인 필요
