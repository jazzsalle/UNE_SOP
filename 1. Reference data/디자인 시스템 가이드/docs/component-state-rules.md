# 컴포넌트 상태 규칙 (Component State Rules)

> Figma 변수 시스템과 코드 사이의 갭을 메우는 상태 우선순위 및 조합 규칙 정의서.

---

## 1. 왜 이 문서가 필요한가

### 문제: Figma에는 상태 우선순위가 없다

CSS에서는 선언 순서와 specificity로 상태 간 우선순위가 자동으로 결정된다.

```css
.select:hover    { border-color: var(--light-blue-500); }
.select:disabled { border-color: var(--grayscale-100); cursor: not-allowed; }
/* disabled가 뒤에 선언되어 hover를 덮음 */
```

Figma Variables는 값 저장소(key → value)일 뿐이다. 조건부 로직("disabled면 hover 무시")을 담을 수 없다. 결과적으로 상태 중첩 처리는 다음 세 곳에 흩어져 정의된다.

| 레이어 | 현재 상황 |
|---|---|
| Figma | variant 명세 — 어떤 조합을 만들지 명시적 규칙 없음 |
| 디자인 토큰 | 값만 있음 — 상태 간 우선순위 없음 |
| 코드 | 개발자가 직접 로직 작성 — 명세와 분리될 위험 |

### 해결: 단일 소스 상태 규칙

```
component-state-rules.md  ← 이 문서 (사람이 읽는 명세)
        ↓                           ↓
  Figma 컴포넌트            코드 구현
  (어떤 variant 필요한지)   (어떤 스타일 적용할지)
```

---

## 2. 상태 분류

상태는 **두 축**으로 나눈다.

### Axis A — Interaction State (인터랙션 상태)
사용자 행동에 의해 변하는 일시적 상태.

| 상태 | 트리거 | 설명 |
|---|---|---|
| `default` | — | 아무 인터랙션 없음 |
| `hover` | `mouseenter` | 마우스 올림 |
| `focus` | `Tab` / `mousedown` | 키보드·클릭으로 포커스 |
| `open` | `click` / `Enter` | 드롭다운·팝업 열림 (Select 등) |
| `active` | `mousedown` | 눌리는 순간 |

### Axis B — Status (상태값)
컴포넌트의 현재 조건. 인터랙션보다 더 오래 유지된다.

| 상태 | 설명 |
|---|---|
| `disabled` | 비활성화 — 모든 인터랙션 차단 |
| `error` | 유효성 검증 실패 |
| `complete` | 유효성 검증 성공 |
| `selected` | 항목이 선택된 상태 |

---

## 3. 상태 우선순위

숫자가 높을수록 다른 상태를 덮는다.

```
priority (높음 → 낮음)
─────────────────────────────────
100  disabled     모든 인터랙션 차단
 80  error        시각적 강조, hover/focus는 허용
 70  complete     시각적 강조, hover/focus는 허용
 60  open         트리거 활성화 (focus 상위 집합)
 40  active       누르는 순간
 30  focus        키보드 접근성
 20  hover        마우스 오버
  0  default      기본
─────────────────────────────────
selected는 별개 축 — 위 우선순위와 독립적으로 공존 가능
```

---

## 4. 상태 조합 규칙

두 상태가 동시에 활성화될 때 어떤 스타일을 적용할지 정의한다.

### 4-1. disabled가 포함된 조합

`disabled`는 모든 인터랙션 상태를 차단한다.

| 조합 | 결과 | 근거 |
|---|---|---|
| `disabled` + `hover` | → `disabled` | hover 불가, cursor-not-allowed |
| `disabled` + `focus` | → `disabled` | tabIndex=-1로 focus 자체를 막음 |
| `disabled` + `active` | → `disabled` | 클릭 이벤트 차단 |
| `disabled` + `error` | → `disabled` | error 표시 불필요 (입력 자체 불가) |
| `disabled` + `selected` | → `disabled-selected` | 선택 상태는 유지, 인터랙션만 차단 |

```tsx
// Select/index.tsx 구현 예시
const triggerState = disabled
  ? stateStyles.disabled          // 최우선 — 나머지 모두 무시
  : isOpen && intent === 'error'  // 다음 우선순위
  ? stateStyles.errorOpen
  : ...
```

### 4-2. error / complete가 포함된 조합

`error`, `complete`는 인터랙션 상태(hover, focus, open)와 **공존**한다.
시각적으로 두 상태를 모두 반영해야 할 경우 명시적 조합 스타일이 필요하다.

| 조합 | Figma variant 필요? | 토큰/스타일 |
|---|---|---|
| `error` + `default` | 필요 | `error` 스타일 단독 적용 |
| `error` + `hover` | 필요 | border 색상이 달라짐 (red-600) |
| `error` + `open` | 필요 | `errorOpen` — border 유지, shadow 추가 |
| `error` + `focus` | `error+open`으로 통합 | Select에서 open = focus 상위 집합 |
| `complete` + `hover` | 필요 | blue hover 복원 |
| `complete` + `open` | 필요 | `completeOpen` |

### 4-3. selected가 포함된 조합

`selected`는 Axis B의 독립적 상태. 위 조합에 추가로 레이어된다.

| 조합 | 결과 |
|---|---|
| `selected` + `default` | selected 배경 + 기본 border |
| `selected` + `hover` | selected 배경 + hover border |
| `selected` + `disabled` | `disabled-selected` — 선택 표시 유지, 인터랙션 없음 |

---

## 5. Figma 컴포넌트 가이드

### 만들어야 하는 variant 조합

위 규칙에 따라 **시각적으로 구분되는 조합만** variant로 만든다.

```
Select (예시)
├── 상태=Default
├── 상태=Hover
├── 상태=Focus  (= Open 닫히기 직전)
├── 상태=Open
├── 상태=Disabled
│
├── intent=Error + 상태=Default
├── intent=Error + 상태=Hover      ← border 색 달라짐
├── intent=Error + 상태=Open
│
├── intent=Complete + 상태=Default
├── intent=Complete + 상태=Hover
└── intent=Complete + 상태=Open
```

### 만들 필요 없는 variant 조합

| 생략 가능한 조합 | 이유 |
|---|---|
| `Disabled + Hover` | Disabled와 동일 — 인터랙션 없음 |
| `Disabled + Focus` | tabIndex=-1 → focus 도달 불가 |
| `Disabled + Error` | disabled가 이김 |
| `Error + Active` | Error + Open으로 충분 |

> **문서화 방법:** 생략한 조합은 Figma 컴포넌트 설명(Description)에 이유를 명시한다.
> 예: "Disabled+Hover는 Disabled와 동일합니다. 별도 variant 없음."

---

## 6. 토큰 네이밍 컨벤션

### 현재 구조 (`semantic/colors-interaction.css`)

```css
--color-action-{intent}-{interaction}
/* 예: --color-action-primary-hover */
```

### 상태 조합을 포함한 확장 컨벤션

```css
/* 기본 패턴 */
--color-{element}-{property}-{status}-{interaction}

/* 예시 */
--color-select-border-default          /* default */
--color-select-border-hover            /* hover */
--color-select-border-focus            /* focus / open */
--color-select-border-disabled         /* disabled */
--color-select-border-error            /* error + default */
--color-select-border-error-hover      /* error + hover */
--color-select-border-error-focus      /* error + open */
--color-select-border-complete         /* complete + default */
```

### 현재 Select 컴포넌트와의 대응

```
현재 코드 (styles.ts)       →  규칙 기반 토큰명
─────────────────────────────────────────────────────
stateStyles.default          →  *-border-default
stateStyles.hover            →  *-border-hover        (CSS hover 수식어로 처리)
stateStyles.open             →  *-border-focus        (open = focus 상위 집합)
stateStyles.error            →  *-border-error
stateStyles.errorOpen        →  *-border-error-focus
stateStyles.complete         →  *-border-complete
stateStyles.completeOpen     →  *-border-complete-focus
stateStyles.disabled         →  *-border-disabled
```

---

## 7. 코드 구현 패턴

### 현재 패턴 (Select/index.tsx)

```tsx
const triggerState = disabled
  ? stateStyles.disabled
  : isOpen && intent === 'error'
  ? stateStyles.errorOpen
  : isOpen && intent === 'complete'
  ? stateStyles.completeOpen
  : isOpen
  ? stateStyles.open
  : intent === 'error'
  ? stateStyles.error
  : intent === 'complete'
  ? stateStyles.complete
  : stateStyles.default;
```

이 패턴이 이미 우선순위를 올바르게 구현하고 있다: `disabled` 최우선 → `open+intent` → `open` → `intent` → `default`.

### 규칙 기반 유틸리티로 추상화 (제안)

반복되는 패턴이 많은 컴포넌트에서 재사용할 수 있는 유틸리티.

```typescript
// src/utils/resolveComponentState.ts

type InteractionState = 'default' | 'hover' | 'focus' | 'open' | 'active';
type StatusState = 'none' | 'error' | 'complete' | 'disabled';

interface ActiveStates {
  interaction: InteractionState;
  status: StatusState;
}

/**
 * 두 축의 상태를 받아 stateStyles 키를 반환.
 * disabled 최우선 — 나머지는 status+interaction 조합.
 */
export function resolveComponentState(
  states: ActiveStates,
): string {
  const { interaction, status } = states;

  if (status === 'disabled') return 'disabled';

  const isActive = interaction === 'open' || interaction === 'focus';

  if (status === 'error')    return isActive ? 'errorOpen'    : 'error';
  if (status === 'complete') return isActive ? 'completeOpen' : 'complete';

  return interaction === 'open' ? 'open' : 'default';
}

// 사용 예
const key = resolveComponentState({ interaction: 'open', status: 'error' });
// → 'errorOpen'
```

---

## 8. Figma ↔ 코드 동기화 체크리스트

새 컴포넌트를 추가하거나 상태를 변경할 때 아래 항목을 확인한다.

```
[ ] Figma variant 목록이 §5의 "만들어야 하는 조합"과 일치하는가?
[ ] 생략된 조합이 Figma 컴포넌트 Description에 기록되어 있는가?
[ ] 코드의 상태 분기가 §3의 우선순위 순서를 따르는가?
[ ]   → disabled 최우선 확인
[ ]   → error/complete + open 조합 처리 확인
[ ] 토큰명이 §6의 컨벤션을 따르는가?
[ ] 새 상태 조합 추가 시 이 문서의 §4 조합 규칙 테이블을 업데이트했는가?
```

---

## 9. 적용 사례 — Select 컴포넌트

현재 `Select/styles.ts`의 `stateStyles`는 이 규칙을 이미 준수하고 있다.

| stateStyles 키 | Axis A | Axis B | 우선순위 준수 |
|---|---|---|---|
| `disabled` | — | disabled | ✅ 최우선 |
| `errorOpen` | open | error | ✅ error+open 조합 |
| `completeOpen` | open | complete | ✅ complete+open 조합 |
| `open` | open | none | ✅ |
| `error` | default | error | ✅ |
| `complete` | default | complete | ✅ |
| `default` | default | none | ✅ |

**누락된 항목:** `error+hover`, `complete+hover` — 현재 CSS hover 수식어로 인라인 처리되어 있음.
```css
/* styles.ts 내 error 스타일 */
"hover:border-[var(--red-600)]"  /* ← error+hover를 인라인으로 처리 */
```
이 방식도 유효하지만, 토큰으로 분리하면 Figma variant와 1:1 대응이 명확해진다.

---

## 참고

- `modules/react-ui/src/components/Select/styles.ts` — stateStyles 구현 예시
- `modules/design-tokens/src/semantic/colors-interaction.css` — 인터랙션 토큰
- `modules/design-tokens/src/semantic/colors.css` — 시맨틱 색상 토큰
