# Tooltip — Component Spec

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
| `content` | `ReactNode` | — | 툴팁 콘텐츠 텍스트 또는 ReactNode (필수) |
| `size` | `"sm" \| "lg"` | `"sm"` | 크기 (`sm`: 1줄 간결, `lg`: 여러 줄 상세) |
| `direction` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | 툴팁 방향 (뷰포트 공간 부족 시 자동 flip) |
| `arrow` | `"start" \| "center" \| "end"` | `"center"` | 화살표 위치 정렬 |
| `trigger` | `"hover" \| "click"` | `"hover"` | 트리거 방식 |
| `showCloseButton` | `boolean` | — | 닫기 버튼 표시 (`click` 트리거 시 자동 `true`) |
| `icon` | `ReactNode` | — | 상태 아이콘 (전달 시 콘텐츠 왼쪽에 표시) |
| `gap` | `number` | `4` | 트리거와 툴팁 사이 간격 (rem 단위) |
| `zIndex` | `number` | `70` | 툴팁 z-index |
| `open` | `boolean` | — | 외부 제어 모드 열림 상태 |
| `onOpenChange` | `(open: boolean) => void` | — | 열림 상태 변경 콜백 |
| `children` | `ReactNode` | — | 툴팁을 감쌀 트리거 요소 (필수) |
| `className` | `string` | — | 추가 className |

> `TooltipProps`는 `ComponentProps<"div">`를 확장합니다. (`content` 제외)

## direction 자동 Flip 규칙

뷰포트 공간이 부족할 때 다음 우선순위로 방향 전환됩니다.

| 원래 방향 | Fallback 순서 |
|---|---|
| `top` | bottom → right → left |
| `bottom` | top → right → left |
| `left` | right → bottom → top |
| `right` | left → bottom → top |

## trigger 별 동작

| trigger | 열기 | 닫기 | 닫기 버튼 |
|---|---|---|---|
| `hover` | mouseenter / focus | mouseleave (100ms delay) / blur / ESC | 기본 없음 |
| `click` | click | 외부 클릭 / ESC / 닫기 버튼 | 자동 표시 |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Hidden | 기본 상태 |
| Visible (hover) | `trigger="hover"` — hover/focus 시 표시 |
| Visible (click) | `trigger="click"` — 클릭 시 토글, X 버튼 자동 표시 |
| Controlled | `open` prop으로 외부 제어 |

## 생략된 조합

- Disabled 상태 없음 — 트리거 요소의 disabled 상태를 직접 제어

## Figma 작업 요청

- [ ] 이 컴포넌트의 Figma 디자인 제작 필요
- [ ] 제작 후 노드 ID를 이 파일에 업데이트
