# Tab — Component Spec

## Figma

| 항목 | 값 |
|---|---|
| 파일 키 | `xTsueffpy8PZYysvysIAn8` |
| 노드 ID | `149:3173` |
| 링크 | https://www.figma.com/design/xTsueffpy8PZYysvysIAn8/Design-System_New-v1.0.0?node-id=149-3173 |
| 상태 | 1차 검토완료 |

## 컴포넌트 구성

Tab은 Compound 패턴으로 구성됩니다.

| 컴포넌트 | 역할 |
|---|---|
| `Tabs` | 루트. Context로 상태(`value`, `size`) 전파 |
| `TabList` | 탭 버튼들을 감싸는 컨테이너 |
| `TabButton` | 개별 탭 버튼 |
| `TabPanel` | 탭에 연결된 콘텐츠 패널 |

## Tabs Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `any` | — | 현재 선택된 탭 값 (필수) |
| `setValue` | `Dispatch<SetStateAction<any>>` | — | 값 변경 핸들러 (필수) |
| `size` | `"lg" \| "md" \| "sm"` | `"lg"` | 탭 크기 |
| `children` | `ReactNode` | — | TabList, TabPanel 요소들 (필수) |

## TabButton Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `string` | — | 탭 식별 값 (Tabs의 value와 매칭) (필수) |
| `label` | `string` | — | 탭에 표시할 텍스트 (필수) |
| `icon` | `ReactNode` | — | 왼쪽 아이콘 |
| `badge` | `ReactNode` | — | 오른쪽 뱃지 (카운트 등) |

## TabPanel Props

| React Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `string` | — | 연결된 탭 값 (필수) |
| `children` | `ReactNode` | — | 패널 콘텐츠 (필수) |

## 크기별 치수

| size | 높이 | 좌우 패딩 | 아이콘 크기 | 텍스트 스타일 |
|---|---|---|---|---|
| `lg` | 56px | 20px | 24px | `typo-title-sm` (20px) |
| `md` | 48px | 16px | 20px | `typo-text-lg` (16px) |
| `sm` | 40px | 12px | 16px | `typo-text-md` (14px) |

## 선택 스타일

- 텍스트: `--color-text-brand` + `font-medium`
- 하단 인디케이터: `4px` 높이 바, 상단 모서리 라운드(`border-radius-top: 8px`), `--color-border-brand` 배경
- 비선택 하단 보더: `1px`, `--color-border-default`

> **Fill variant 제거**: v1 Figma 디자인 기준으로 fill 스타일이 제거되고 line 스타일만 사용합니다.

## 지원 상태 조합

| state | 설명 |
|---|---|
| Default | 기본 상태 |
| Hover | 콘텐츠 영역 `--color-bg-muted` 배경 |
| Active | 콘텐츠 영역 `--color-bg-muted` 배경 |
| Selected | 브랜드 텍스트 + 4px 하단 인디케이터 |
| Focus-visible | `--selected-shadow` (0 0 0 2px `#C2D3FF`) 포커스 링 |

## 생략된 조합

- Disabled 상태 없음
- Selected Hover — selected 스타일 유지 (hover bg 없음)
