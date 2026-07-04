# Pagination — Component Spec

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
| `totalPages` | `number` | — | 전체 페이지 수 (필수) |
| `value` | `number` | — | 현재 페이지 번호 (필수) |
| `setValue` | `(page: number) => void` | — | 페이지 변경 핸들러 (필수) |
| `jumpSize` | `number` | `5` | 말줄임(...) 클릭 시 이동할 페이지 수 |

## 내부 서브 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| `PageButton` | 개별 페이지 번호 버튼. 현재 페이지는 파란 배경으로 강조 |
| `EllipsisButton` | 말줄임(...) 버튼. hover 시 `>>` / `<<` 아이콘으로 변경, 클릭 시 jumpSize만큼 이동 |

## 페이지 번호 표시 규칙

| 총 페이지 수 | 표시 방식 |
|---|---|
| 10 이하 | 전체 페이지 번호 표시 |
| 11 이상 | 현재 페이지 주변 + 말줄임(...) 축약 표시 |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Page Default | 회색 텍스트 |
| Page Hover | 연한 배경, 진한 텍스트 |
| Page Active | 더 진한 배경 |
| Page Selected | 파란 배경 + 흰 텍스트 + focus ring(2px) |
| Ellipsis Default | `...` 아이콘 표시 |
| Ellipsis Hover | `>>` 또는 `<<` 아이콘으로 변경 |
| Prev Button Disabled | `value <= 1` 시 비활성화 |
| Next Button Disabled | `value >= totalPages` 시 비활성화 |

## 생략된 조합

- Selected + Hover — selected 스타일이 hover를 덮도록 명시적 override

## Figma 작업 요청

- [ ] 이 컴포넌트의 Figma 디자인 제작 필요
- [ ] 제작 후 노드 ID를 이 파일에 업데이트
