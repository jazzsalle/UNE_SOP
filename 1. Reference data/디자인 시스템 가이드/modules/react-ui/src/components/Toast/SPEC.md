# Toast — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `oMm0nhTOiYl6EoqhcVlBJf` |
| 노드 ID | *(미정의 — Figma에 컴포넌트 미제작)* |
| 링크 | — |

## 컴포넌트 구성

Toast는 Context + Hook 패턴으로 구성됩니다.

- `ToastProvider` — 앱 최상위에 배치. 토스트 컨테이너와 Context 제공
- `useToast()` — `toast()`, `dismiss()`, `dismissAll()` 훅 반환

## ToastProvider Props

*(Figma 컴포넌트 미제작 — 코드 Props 기준으로 작성)*

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `position` | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"top-center"` | 토스트 표시 위치 |
| `duration` | `number` | `3000` | 기본 지속 시간 (ms). `0`이면 자동 닫힘 없음 |
| `maxToasts` | `number` | `3` | 최대 동시 표시 개수. 초과 시 가장 오래된 항목 dismiss |
| `zIndex` | `number` | `60` | 컨테이너 z-index |
| `children` | `ReactNode` | — | 앱 콘텐츠 (필수) |

## useToast() 반환값

| 메서드 | 시그니처 | 설명 |
|---|---|---|
| `toast` | `(message: ReactNode, options?) => string` | 토스트 생성, id 반환 |
| `dismiss` | `(id: string) => void` | 특정 토스트 닫기 |
| `dismissAll` | `() => void` | 모든 토스트 닫기 |

## toast() options

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `intent` | `"none" \| "info" \| "success" \| "warning" \| "error"` | `"info"` | 아이콘/색상 |
| `duration` | `number` | Provider `duration` 값 | 개별 지속 시간 (ms). `0`이면 자동 닫힘 없음 |
| `dismissible` | `boolean` | — | X 버튼 표시 override. 미지정 시 다중 스택 또는 `duration=0` 일 때 자동 표시 |
| `onClose` | `(reason: ToastCloseReason) => void` | — | 닫힐 때 콜백 |

## ToastCloseReason 값

| reason | 발생 조건 |
|---|---|
| `"timeout"` | duration 경과로 자동 닫힘 |
| `"manual"` | 사용자가 X 버튼 클릭 |
| `"programmatic"` | `dismiss()`/`dismissAll()` 호출 또는 maxToasts 초과로 밀려남 |

## intent 별 아이콘

| intent | 아이콘 |
|---|---|
| `none` | 아이콘 없음 |
| `info` | `IconInfoCircleLine` (20px) |
| `success` | `IconCheckLine` (20px) |
| `warning` | `IconWarningLine` (20px) |
| `error` | `IconXCircle` (20px) |

## 지원 상태 조합

| state | 비고 |
|---|---|
| Enter | `toastIn` + `toastSlotOpen` 애니메이션 (200ms ease-out) |
| Exit | `toastOut` + `toastSlotClose` 애니메이션 (200ms ease-in) |
| Dismissible | X 버튼 표시 조건: `dismissible` override 또는 (활성 토스트 2개 이상 OR `duration=0`) |

## 생략된 조합

- 단일 스택 + `duration > 0` + `dismissible` 미지정 → X 버튼 없음

## Figma 작업 요청

- [ ] 이 컴포넌트의 Figma 디자인 제작 필요
- [ ] 제작 후 노드 ID를 이 파일에 업데이트
