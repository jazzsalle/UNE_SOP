# Figma ↔ 코드 동기화 가이드

> Figma와 `@une/design-system`이 별도로 진행되어 온 상태에서, 두 시스템을 정렬하고 앞으로 함께 유지하기 위한 단계별 실행 가이드.
>
> **마지막 업데이트**: 2026-04-30 — Phase 0~4 완료, Variables Pro 플러그인 기반 토큰 동기화 워크플로우 정립

---

## 현재 상태 진단

```
이전 (2026-04-29 이전)        현재 (2026-04-30)
────────────────────────────────────────────────────────
Figma                         Figma
  Variables (색상/간격)  ─X─▶   Variables ──┐ (※ REST API는 Enterprise 전용)
  Button 컴포넌트        ─✓─▶   컴포넌트    │  Variables Pro 플러그인으로 export.json
  나머지 컴포넌트        ─X─▶   (미제작)    │  → tokens:import 스크립트로 CSS 생성 ✅
                                            ↓
code                          code
  design-tokens (수동)  ◀─✓─   design-tokens ◀── import-figma-variables.ts
  react-ui (시맨틱 토큰) ◀─✓─   react-ui (시맨틱 토큰 완료)
  Storybook              ─✓─▶   Storybook ──▶ Figma 임베드 (Button)
```

**핵심 문제 세 가지 (초기):**
1. ~~토큰 값이 Figma와 코드에서 따로 관리됨~~ → **✅ 해결**: 시맨틱 토큰 전면 마이그레이션 완료
2. ~~Figma 컴포넌트 Props와 React Props의 명세 불일치~~ → **✅ 해결**: SPEC.md 16개 작성, Button Code Connect 완료
3. 변경이 생겼을 때 어느 쪽을 먼저 바꿔야 하는지 프로세스 없음 → **→ Phase 5에서 정립 중**

---

## 전체 로드맵

```
Phase 0   현황 파악           ✅ 완료 (2026-04-29)
Phase 1   토큰 파이프라인     ✅ 완료 (2026-04-29)  ※ Figma API는 Enterprise 전용, 스크립트 준비만
Phase 2   컴포넌트 명세 정렬  ✅ 완료 (2026-04-29)  시맨틱 토큰 + SPEC.md 16개
Phase 3   Code Connect        ⚠️ 부분 완료         Button만 완료, 나머지 Figma 컴포넌트 제작 후
Phase 4   Storybook 연결      ⚠️ 부분 완료         Button만 완료, addon-designs 설치 완료
Phase 5   워크플로우 정립     ✅ 완료 (2026-04-30)  시나리오 A~D 정립, 미결 항목 2개만 잔존 (디자이너 작업 대기)
```

---

## Phase 0. 현황 파악 (Audit)

> **목표**: 어디가 맞고 어디가 어긋났는지 목록화한다.

### 담당
디자이너 + 개발자 함께

### Step 0-1. 컴포넌트 대응표 작성

Figma 컴포넌트와 코드 컴포넌트를 1:1로 매핑한다.

| Figma 컴포넌트명 | 코드 경로 | Props 일치 여부 | 상태 variant 일치 여부 |
|---|---|---|---|
| 셀렉트 (Select) | `components/Select/` | △ | △ |
| 버튼 (Button) | `components/buttons/Button/` | ? | ? |
| ... | ... | ... | ... |

**체크 항목:**
- [ ] Figma에 있는데 코드에 없는 컴포넌트
- [ ] 코드에 있는데 Figma에 없는 컴포넌트
- [ ] Prop 이름이 다른 것 (예: Figma `크기=Large` ↔ 코드 `size="lg"`)
- [ ] Figma variant에는 있는데 코드 Props에 없는 상태

### Step 0-2. 토큰 값 비교

Figma Variables 값과 `design-tokens` CSS 값을 비교한다.

```
비교 대상:
  Figma Color Collection → modules/design-tokens/src/primitive/colors.css
  Figma Color Collection → modules/design-tokens/src/semantic/colors.css
  Figma Spacing          → modules/design-tokens/src/primitive/spacing.css
```

**자주 발생하는 불일치:**
- Figma에서 수정한 색상이 코드에 반영 안 됨
- 코드에서 추가한 토큰이 Figma에 없음
- 이름 체계가 다름 (`--grayscale-500` vs `Gray/500`)

### Step 0-3. 불일치 목록 정리

```
docs/audit-YYYY-MM.md  ← 날짜별로 관리
```

---

## Phase 1. 토큰 파이프라인 구축

> **목표**: Figma Variables를 토큰의 단일 소스로 확정하고, 코드로 자동 내보내는 파이프라인을 만든다.

### 담당
개발자 주도 / 디자이너 검토

### 결정 사항 먼저

> **Figma Variables → CSS 커스텀 프로퍼티** 방향을 소스 오브 트루스로 확정.
> 코드에서 토큰을 먼저 바꾸는 것은 금지. 반드시 Figma에서 먼저 변경.

### Step 1-1. Figma Variables 정리

현재 Figma에서 Variables 구조를 정리한다.

```
Figma Collections 목표 구조:
  Primitives   → 원시 값 (색상 팔레트, 간격 숫자)
  Color        → 시맨틱 색상 (Light/Dark 모드)
  Spacing      → 시맨틱 간격
  Typography   → 폰트 사이즈/두께
  Radius       → 테두리 반경
```

네이밍 컨벤션을 코드 토큰명과 맞춘다.

| Figma Variable | CSS 커스텀 프로퍼티 |
|---|---|
| `Color/grayscale/500` | `--grayscale-500` |
| `Color/light-blue/500` | `--light-blue-500` |
| `Semantic/bg/default` | `--color-bg-default` |
| `Semantic/text/disabled` | `--color-text-disabled` |

### Step 1-2. 토큰 내보내기 스크립트 작성

두 가지 방법이 있다. Professional 플랜은 **방법 B(플러그인)**를 사용한다.

```
modules/design-tokens/
  scripts/
    export-figma-tokens.ts       ← 방법 A: Figma REST API (Enterprise 전용)
    import-figma-variables.ts    ← 방법 B: Variables Pro 플러그인 JSON 변환 ✅ 현재 운영
  src/
    primitive/                   ← 스크립트 출력물
    semantic/
```

#### 방법 A — Figma Variables REST API (Enterprise 플랜 전용)

```bash
FIGMA_ACCESS_TOKEN=<token> npm run tokens:export --workspace=modules/design-tokens
```

> ⚠️ Professional 플랜에서는 403 반환. Enterprise 업그레이드 후 사용 가능.

#### 방법 B — Variables Pro 플러그인 + import 스크립트 ✅ 현재 운영 방식

**사전 준비 (1회):** Figma → 플러그인 → `Variables Pro | Swap, Import & Export Variables` 설치

**토큰 동기화 절차:**

```
1. Figma 파일 열기 → 플러그인 실행: Variables Pro
2. Export 탭 → "Export JSON" 버튼 클릭
3. 저장된 export.json 경로 확인
4. 변경사항 미리 확인 (dry-run):
   npx tsx scripts/import-figma-variables.ts <export.json>
5. 실제 CSS 파일 업데이트:
   npx tsx scripts/import-figma-variables.ts <export.json> --write
6. 변경된 파일 검토 → PR 생성
```

**출력 파일:**

| 스크립트 출력 | 대상 파일 | 내용 |
|---|---|---|
| primitive | `src/primitive/colors.css` | `--grayscale-*`, `--light-blue-*` 등 팔레트 |
| semantic | `src/semantic/colors.css` | `--color-text-*`, `--color-bg-*`, `--color-border-*` |
| semantic | `src/semantic/colors-status.css` | brand/success/warning/error/info 계열 |
| semantic | `src/semantic/colors-interaction.css` | action/icon/focus-ring 계열 |

**dry-run 출력 예시:**
```
📄 colors-status.css
    ~ --color-text-warning [light]  #dc6803 → #cc8400
    + --color-text-on-brand  light:#ffffff  dark:#ffffff
```

### Step 1-3. npm 스크립트 추가

```json
// modules/design-tokens/package.json
{
  "scripts": {
    "tokens:export":       "tsx scripts/export-figma-tokens.ts",
    "tokens:diff":         "tsx scripts/export-figma-tokens.ts --dry-run",
    "tokens:import":       "tsx scripts/import-figma-variables.ts",
    "tokens:import:write": "tsx scripts/import-figma-variables.ts"
  }
}
```

> `tokens:import` / `tokens:import:write` 는 첫 번째 인수로 JSON 파일 경로를 받는다.
> ```bash
> npm run tokens:import -- export.json           # dry-run
> npm run tokens:import:write -- export.json --write  # 적용
> ```

### Step 1-4. CI 파이프라인 연결 (선택, 이후 단계)

초기에는 수동 실행으로 시작하고, 안정화되면 자동화한다.

```yaml
# 수동 트리거로 시작
# bitbucket-pipelines.yml에 추가
custom:
  sync-tokens:
    - step:
        script:
          - npm run tokens:import:write -- export.json --write --workspace=modules/design-tokens
          - git commit -am "chore: sync design tokens from Figma"
```

### 완료 기준
- [x] `npm run tokens:diff` 스크립트 (`export-figma-tokens.ts`) — REST API용, 준비 완료
- [x] `npm run tokens:import` 스크립트 (`import-figma-variables.ts`) — Variables Pro 플러그인용 ✅
- [x] Figma Variable 이름과 CSS 변수명이 1:1 대응 (시맨틱 토큰 체계 정렬 완료)
- [x] Variables Pro 플러그인 → export.json → CSS 동기화 1회 실행 완료 (2026-04-30)
- [ ] *(향후)* Figma Variables REST API 연동 — Enterprise 업그레이드 시 `tokens:export`로 완전 자동화 가능

---

## Phase 2. 컴포넌트 명세 정렬

> **목표**: 16개 컴포넌트에 대해 Figma variant와 React Props를 정렬한다.

### 담당
디자이너 + 개발자 컴포넌트별 페어링

### Step 2-1. 상태 규칙 적용

`docs/component-state-rules.md`의 규칙을 각 컴포넌트에 적용한다.

**컴포넌트별 체크리스트:**

```
각 컴포넌트에 대해:
  [ ] Figma variant 목록이 state-rules §5 기준에 맞는가?
  [ ] 불필요한 variant(disabled+hover 등)가 제거되었는가?
  [ ] 생략된 조합이 Figma 컴포넌트 Description에 기록되었는가?
  [ ] 코드 상태 분기가 우선순위를 준수하는가?
```

### Step 2-2. Prop 이름 정렬

Figma Property명 → React Prop명 매핑 테이블을 확정한다.

| Figma Property | 값 예시 | React Prop | 값 예시 |
|---|---|---|---|
| `크기` | `Large(36)` | `size` | `"lg"` |
| `유형` | `Standard` | `variant` | `"standard"` |
| `상태` | `Error` | `intent` | `"error"` |
| `비활성화` | `true/false` | `disabled` | `true/false` |
| `모드` | `Dark/Light` | (CSS dark class) | — |

> **규칙**: Figma Property 변경 시 반드시 코드 Props도 같이 변경.
> 단방향이 아닌 **양방향 계약(contract)**으로 관리.

### Step 2-3. 컴포넌트별 명세서 작성

각 컴포넌트 폴더에 `SPEC.md`를 추가한다.

```
components/Select/
  index.tsx
  types.ts
  styles.ts
  SPEC.md   ← 새로 추가
```

`SPEC.md` 포함 내용:
- Figma 파일 링크 + 컴포넌트 노드 ID
- Prop ↔ Figma Property 매핑 테이블
- 지원하는 상태 조합
- 생략된 상태 조합과 이유

### 완료 기준
- [x] 16개 컴포넌트 모두 primitive → 시맨틱 토큰 마이그레이션 완료 (`dark:` 접두사 제거)
- [x] 16개 컴포넌트 모두 `SPEC.md` 존재 (Button, IconButton, Input, Select, Textarea, Checkbox, Radio, Switch, Modal, Alert, Toast, Tooltip, Tab, SegmentedControl, Pagination, badges)
- [x] 상태 규칙 위반 variant 없음
- [ ] *(향후)* Figma에서 나머지 15개 컴포넌트 제작 후 Props 대조

> **주의 (2026-04-29)**: 현재 Figma v0.1에는 Button과 Icon만 제작됨.
> 나머지 15개 컴포넌트는 코드에 존재하나 Figma에 미제작.
> SPEC.md는 코드 기반으로 작성했으며, Figma 컴포넌트 제작 후 node-id 기입 필요.

---

## Phase 3. Code Connect 설정

> **목표**: Figma에서 컴포넌트를 클릭했을 때 코드 스니펫이 자동으로 표시되도록 연결한다.

### 담당
개발자 주도

### Step 3-1. Code Connect 파일 구조

각 컴포넌트에 `.figma.tsx` 파일을 추가한다.

```
components/Select/
  index.tsx
  index.figma.tsx   ← 새로 추가
```

**`index.figma.tsx` 예시 (Select):**

```tsx
import figma from '@figma/code-connect';
import { Select } from './index';

figma.connect(
  Select,
  'https://www.figma.com/design/jcTNXE7pRZlfXEq37jHmXv?node-id=766:13602',
  {
    props: {
      size:     figma.enum('크기', { 'XLarge(40)': 'xl', 'Large(36)': 'lg', 'Medium(32)': 'md' }),
      variant:  figma.enum('유형', { Standard: 'standard', Inline: 'inline' }),
      disabled: figma.boolean('비활성화'),
      label:    figma.string('라벨'),
    },
    example: ({ size, variant, disabled, label }) => (
      <Select
        size={size}
        variant={variant}
        disabled={disabled}
        label={label}
        options={[{ value: '1', label: '옵션 1' }]}
      />
    ),
  }
);
```

### Step 3-2. 전체 컴포넌트에 적용

우선순위 순서:
1. 자주 쓰이는 컴포넌트 먼저: Button, Input, Select, Checkbox, Modal
2. 나머지 11개 순차 적용

### Step 3-3. 배포

```bash
# Code Connect 퍼블리시
npx @figma/code-connect publish
```

### 완료 기준
- [x] Button — `index.figma.tsx` 작성 완료, Figma node `63:2` 연결
- [ ] 나머지 15개 컴포넌트 — Figma 컴포넌트 제작 완료 후 순차 작성
- [ ] `npx @figma/code-connect publish` 실행하여 Figma에 배포

> **현재 진행 상황**: Figma v0.1에 Button 외 컴포넌트 미제작.
> 디자이너가 컴포넌트를 Figma에 추가하면 → SPEC.md에 node-id 기입 → `.figma.tsx` 작성 순서로 진행.

---

## Phase 4. Storybook ↔ Figma 연결

> **목표**: Storybook에서 Figma 디자인을 임베드하고, 시각적 회귀 테스트를 자동화한다.

### 담당
개발자 주도

### Step 4-1. Storybook Figma 애드온 추가

```bash
npm install --workspace=modules/react-ui \
  @storybook/addon-designs
```

각 Story에 Figma 링크를 추가한다.

```tsx
// Select.stories.tsx
export default {
  title: 'Form/Select',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/jcTNXE7pRZlfXEq37jHmXv?node-id=766:13602',
    },
  },
};
```

### Step 4-2. Chromatic 시각적 회귀 테스트

이미 Storybook에 Chromatic 애드온이 포함되어 있음. 파이프라인에 연결한다.

```yaml
# bitbucket-pipelines.yml
- step:
    name: Visual Regression (Chromatic)
    script:
      - npx chromatic --project-token=$CHROMATIC_TOKEN
```

> **효과**: Figma에서 토큰이 변경되어 코드에 반영되었을 때,
> 시각적으로 달라진 컴포넌트를 자동으로 감지한다.

### 완료 기준
- [x] `@storybook/addon-designs` 설치 및 `.storybook/main.ts` 등록 완료
- [x] Button 스토리에 Figma 임베드 링크 추가 (`node-id=63:2`)
- [ ] 나머지 15개 스토리 — Figma 컴포넌트 제작 후 node-id 링크 추가
- [ ] Chromatic 파이프라인 연결 (선택, 별도 진행)

---

## Phase 5. 워크플로우 정립

> **목표**: 디자인 변경과 코드 변경이 서로를 깨지 않는 루틴을 만든다.

### 현재 운영 체계 (2026-04-30 기준)

**토큰 소스**: Figma Variables (Variables Pro 플러그인 export.json) → `import-figma-variables.ts` → CSS 파일  
**컴포넌트 진실 소스**: 코드 `SPEC.md` + Figma (Button만 양쪽 완성)  
**Figma 계획**: Professional 플랜 — Variables REST API 미지원, Variables Pro 플러그인으로 대체 운영

### 5-1. 변경 시나리오별 프로세스

#### 시나리오 A — 디자이너가 토큰 값을 바꿀 때

```
1. Figma에서 Variable 값 수정
2. 개발자에게 알림 (Slack/PR 코멘트)
3. 개발자: Variables Pro 플러그인으로 export.json 내보내기
4. dry-run으로 변경사항 확인:
   npx tsx scripts/import-figma-variables.ts <export.json>
5. 이상 없으면 CSS 파일 업데이트:
   npx tsx scripts/import-figma-variables.ts <export.json> --write
6. 변경된 CSS 파일 검토 → PR 생성
7. 시각적 영향 Storybook에서 확인
8. 병합
```

> **현재 운영 방식 (Professional 플랜)**: Variables Pro 플러그인으로 export.json 추출 후
> `import-figma-variables.ts` 스크립트로 CSS 4개 파일 일괄 동기화.
> *(향후)* Enterprise 업그레이드 시 `npm run tokens:export` 로 플러그인 없이 자동화 가능.

#### 시나리오 B — 디자이너가 Figma 컴포넌트를 새로 제작할 때

```
1. Figma에서 컴포넌트 제작 완료
2. 디자이너: 컴포넌트 node-id 개발자에게 공유
3. 개발자: 해당 컴포넌트 SPEC.md의 Figma 섹션에 node-id 기입
4. 개발자: index.figma.tsx (Code Connect) 파일 작성
   - figma.enum/boolean/string으로 Prop 매핑
5. 개발자: Story에 Figma 임베드 링크 추가
   - parameters.design.url에 node-id 추가
6. npx @figma/code-connect publish 실행
7. PR 생성 및 병합
```

#### 시나리오 C — 디자이너가 기존 컴포넌트 variant를 추가/수정할 때

```
1. Figma에서 variant 추가
2. SPEC.md 업데이트 (Figma ↔ Props 매핑)
3. 개발자: React Props 추가, styles.ts 업데이트
4. Code Connect 파일(index.figma.tsx) 업데이트
5. Story 추가 → PR 생성
6. 병합
```

#### 시나리오 D — 개발자가 새 컴포넌트를 코드에 먼저 추가할 때

```
1. 코드에서 컴포넌트 구현 (index.tsx, types.ts, styles.ts)
2. SPEC.md 초안 작성 (코드 기반 — Figma node-id는 TBD)
3. 디자이너에게 SPEC.md 전달 → Figma 컴포넌트 제작 요청
4. Figma 컴포넌트 완성 후 → 시나리오 B 절차 진행
```

### 5-2. 리뷰 체크리스트

PR에 컴포넌트 변경이 포함될 때 아래를 확인한다.

```
디자이너 리뷰:
  [ ] Figma variant가 코드 SPEC.md Props와 일치하는가?
  [ ] 변경된 variant가 component-state-rules.md 규칙을 따르는가?
  [ ] SPEC.md의 Figma 섹션 (node-id, 링크)이 최신인가?

개발자 리뷰:
  [ ] styles.ts에 primitive 토큰(--grayscale-*, --light-blue-*)이 없는가?
  [ ] dark: 접두사 색상 클래스가 없는가? (시맨틱 토큰이 자동 처리)
  [ ] 새 시맨틱 토큰이 필요하면 Figma Variables에도 추가 요청했는가?
  [ ] Code Connect 파일(index.figma.tsx)이 존재하거나 업데이트되었는가?
  [ ] Story가 추가/수정되었는가?
  [ ] TypeScript 타입 에러 없음 (npx tsc --noEmit 통과)
```

### 5-3. 미결 항목

#### 해결됨 ✅

| 항목 | 해결 방법 |
|---|---|
| `focus-ring` Variable | Figma `focus-ring.default` 정의 확인, import 스크립트로 동기화 완료 |
| `icon/*` Variables | Figma `icon.*` 전체 정의 확인, import 스크립트로 동기화 완료 |
| Tooltip 다크 배경 토큰 | `--color-bg-surface-raised` (#313644) 유지 결정 (2026-04-30) |

#### 미결 (디자이너 작업 필요)

| 항목 | 담당 | 비고 |
|---|---|---|
| 나머지 15개 컴포넌트 Figma 제작 | 디자이너 | IconButton, Input, Select, Textarea, Checkbox, Radio, Switch, Modal, Alert, Toast, Tooltip, Tab, SegmentedControl, Pagination, badges |
| Button `selected` 상태 variant | 디자이너 | 코드에 `selected` prop 존재, Figma 미정의 |
| Badge `secondary`/`warning` intent 색상 | 디자이너 | 코드에 `// TODO: 시맨틱 토큰 미정의` 주석 있음 |

### 5-4. 정기 동기화 미팅 (제안)

**격주 30분** — 디자이너 + 개발자

```
안건:
  - Figma에서 변경된 것 중 코드에 미반영된 항목 확인
  - 코드에서 변경된 것 중 Figma에 미반영된 항목 확인
  - TODO 주석(// TODO: 시맨틱 토큰 미정의) 항목 해소 계획
  - 다음 컴포넌트 Figma 제작 우선순위 합의
```

---

## 우선순위 요약 (2026-04-30 기준)

**완료 ✅:**
1. Phase 0 — 현황 파악, 불일치 목록 작성 (`docs/audit-2026-04.md`)
2. Phase 1 — 시맨틱 토큰 체계 정렬, 토큰 동기화 스크립트 완성
   - `tokens:diff` / `tokens:export` (REST API, Enterprise용)
   - `tokens:import` / `tokens:import:write` (Variables Pro 플러그인, **현재 운영**)
   - Variables Pro 플러그인 → export.json → CSS 동기화 1회 실행 완료
3. Phase 2 — 25개 컴포넌트 파일 primitive → 시맨틱 토큰 마이그레이션, 16개 SPEC.md 생성
4. Phase 3 (Button) — `index.figma.tsx` Code Connect 파일 작성
5. Phase 4 (Button) — Storybook `@storybook/addon-designs` + Button Figma 임베드
6. Phase 5 — 시나리오 A~D 워크플로우 정립, 미결 항목 정리

**대기 중 (디자이너 Figma 작업):**
- Phase 3/4 나머지 15개 컴포넌트 — Figma 제작 완료 후 `.figma.tsx` + Story 연결
- Button `selected` 상태 Figma variant 추가
- Badge `secondary`/`warning` 시맨틱 토큰 색상 정의

**플랜 업그레이드 후:**
- Code Connect publish — `npx @figma/code-connect publish` (Organization/Enterprise 플랜 필요)

---

## 참고 문서

| 문서 | 위치 | 설명 |
|---|---|---|
| 상태 규칙 | `docs/component-state-rules.md` | 상태 우선순위 및 조합 규칙 |
| PRD | `PRD.md` | 프로젝트 전체 아키텍처 |
| 토큰 구조 | `modules/design-tokens/README.md` | 토큰 계층 설명 |
| 컴포넌트 카탈로그 | `COMPONENT_CATALOG.md` | 전체 컴포넌트 목록 |
| Figma 파일 | `jcTNXE7pRZlfXEq37jHmXv` | 현재 작업 중인 Figma 파일 키 |
