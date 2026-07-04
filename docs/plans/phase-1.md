# Phase 1 Plan — 스캐폴딩 (planner 산출물, 2026-07-04)

## 사전 조사 결과

1. **디자인 토큰 위치**: `1. Reference data\디자인 시스템 가이드\modules\design-tokens\src\tokens.css`가 진입점이며, 상대경로로 `primitive/*.css` 6개 + `semantic/*.css` 7개를 `@import`한다. 경로에 공백·한글이 포함되어 있고 참조 데이터 폴더는 수정 대상이 아니므로, **토큰 파일을 `app/src/design-system/tokens/`로 벤더링(복사)** 하는 방식이 안전하다.
2. **Tailwind v4 의존성**: react-ui 컴포넌트(`modules/react-ui/src/index.css`)는 `@import "tailwindcss/theme.css"` + `@custom-variant dark` 기반의 Tailwind v4를 사용. Phase 3 이후 react-ui 컴포넌트 활용 대비 지금 Tailwind v4(`@tailwindcss/vite`)를 함께 설치한다.
3. **다크모드**: 토큰은 `:root` / `.dark` 클래스 스코프로 정의됨.
4. **.gitignore**: 루트에 없음 → 루트 `.gitignore` 생성 필요.

## 태스크

### [PARALLEL] T1. Vite+React+TS+xyflow 스캐폴딩 및 .gitignore

- 목표: app/ 아래 빌드 가능한 Vite+React+TS 프로젝트를 생성하고 필수 의존성을 설치한다.
- 방식: 루트에서 `npm create vite@latest app -- --template react-ts` 실행 후 보일러플레이트 정리. 이어서 `npm install; npm install @xyflow/react; npm install -D tailwindcss @tailwindcss/vite`.
- 대상 파일: app/package.json, app/tsconfig*.json, app/vite.config.ts, app/index.html(title "Visual SOP Graph Studio", lang="ko"), app/src/main.tsx, app/src/App.tsx, 루트 .gitignore
- vite.config.ts: `@tailwindcss/vite` 플러그인 등록, `@` → `./src` 경로 별칭 (tsconfig paths 동일 설정)
- 완료 기준:
  1. dependencies에 react, react-dom, @xyflow/react / devDependencies에 typescript, vite, tailwindcss, @tailwindcss/vite
  2. `npm run build` 성공 (타입 에러 0)
  3. 루트 .gitignore 존재, `git status`에 app/node_modules 미표시

### [AFTER: T1] T2. 디자인 토큰 벤더링 + 전역 스타일 연동

- 복사 원본: `1. Reference data\디자인 시스템 가이드\modules\design-tokens\src\` (tokens.css + primitive 6개 + semantic 7~8개) → `app/src/design-system/tokens/` (디렉터리 구조 유지)
- 원본 폴더는 절대 수정 금지. 경로 공백/한글 따옴표 주의.
- app/src/styles/global.css (신규): `@import "tailwindcss";` + 토큰 임포트 + `@custom-variant dark (&:where(.dark &));` + body 기본 스타일(시맨틱 토큰만 사용, primitive 직접 사용 금지)
- app/src/main.tsx에서만 global.css 임포트
- 완료 기준: 빌드 성공 / :root에 시맨틱 토큰 CSS 변수 존재 / "1. Reference data/"에 git 변경분 없음

### [AFTER: T2] T3. 3패널 Graph Studio 레이아웃 + 빈 React Flow 캔버스

- 대상 파일:
  - app/src/App.tsx: GraphStudio 렌더
  - app/src/studio/GraphStudio.tsx: CSS Grid (헤더 바 + 좌 240~280px / 중앙 1fr / 우 300~340px, 하단 패널 160~200px)
  - app/src/studio/panels/NodePalette.tsx, PropertyInspector.tsx, ValidationPanel.tsx: 헤더 + placeholder
  - app/src/studio/canvas/GraphCanvas.tsx: ReactFlowProvider + ReactFlow(빈 nodes/edges) + Background + Controls + `@xyflow/react/dist/style.css`
- 스타일 규칙: 시맨틱 토큰 변수만 사용(hex 하드코딩 금지). 인터랙티브 컴포넌트는 Phase 3에서 react-ui SPEC 기반 도입.
- 완료 기준: 빌드 성공 / dev 서버에서 4영역 + 도트 배경 + 줌 컨트롤 렌더링 / 콘솔 에러 0

## 실행 순서

T1 → T2 → T3 순차 (단일 체인, 병렬 없음).
