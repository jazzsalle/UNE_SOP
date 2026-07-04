# Project Guidelines

## 컴포넌트 사용 규칙

이 프로젝트는 디자인 시스템입니다. UI 컴포넌트가 필요할 때는 새로 만들지 말고, 반드시 `modules/react-ui/src/components/` 아래의 기존 컴포넌트를 import하여 사용하세요.

- **Icons**: 새 SVG를 인라인으로 작성하거나 새 SVG 파일을 만들지 마세요. 아이콘이 필요하면 **반드시 `Icons/` 폴더를 먼저 검색**하여 기존 아이콘 컴포넌트를 사용하세요. 검색 없이 SVG를 직접 작성하는 것은 금지입니다.
- **Buttons**: 버튼이 필요하면 `buttons/` 폴더의 기존 버튼 컴포넌트를 사용하세요.
- **Modal / NonModal**: 모달이나 다이얼로그가 필요하면 `Modal/` 또는 `NonModal/` 컴포넌트를 사용하세요.
- **Toast / Alert**: 알림이 필요하면 `Toast/` 또는 `Alert/` 컴포넌트를 사용하세요.
- **Input / Textarea / Select**: 폼 입력이 필요하면 해당 폴더의 컴포넌트를 사용하세요.
- **Checkbox / Radio / Switch**: 선택 컨트롤이 필요하면 해당 폴더의 컴포넌트를 사용하세요.
- **Tab / SegmentedControl / Pagination**: 네비게이션 UI가 필요하면 해당 폴더의 컴포넌트를 사용하세요.
- **Typography / Colors / Elevation**: 텍스트 스타일, 색상, 그림자는 해당 폴더의 토큰/컴포넌트를 사용하세요.
- **Logos / Assets / Scrollbar / badges**: 해당 폴더의 기존 컴포넌트를 사용하세요.

필요한 컴포넌트가 존재하지 않는 경우, 직접 만들기 전에 사용자에게 확인하세요.

## 컴포넌트 export 규칙

`modules/react-ui/src/index.ts`는 패키지의 공개 API 진입점입니다. 컴포넌트를 추가하거나 삭제할 때 반드시 이 파일의 export를 동기화하세요.

- **컴포넌트 추가 시**: 컴포넌트와 함께 관련 타입(Props, Size, Intent 등)도 `index.ts`에 export를 추가합니다.
- **컴포넌트 삭제 시**: `index.ts`에서 해당 컴포넌트와 관련 타입의 export를 제거합니다.
- **Storybook 전용 컴포넌트**(`storybook/`)나 **스토리만 있는 폴더**(Assets, Colors, Elevation 등)는 export 대상이 아닙니다.

## 컴포넌트 내부 구조 규칙

컴포넌트 내부에서만 사용되는 하위 컴포넌트는 해당 컴포넌트 폴더 안에 `components/` 디렉토리를 만들고 그 안에 분리합니다.

공유 타입(인터페이스, props 등)은 `types.ts`에 정의하여 `index.tsx`와 `components/*` 모두 `types.ts`를 참조하도록 합니다. `components/*`에서 `index.tsx`를 직접 import하면 순환 참조가 발생하므로 금지합니다.

예시:
```
Select/
  index.tsx        ← 메인 컴포넌트, types.ts에서 타입 import
  types.ts         ← 공유 타입 정의 (SelectOption, SelectProps 등)
  styles.ts
  components/
    SelectDropdown.tsx      ← types.ts에서 타입 import
    SelectOptionItem.tsx    ← types.ts에서 타입 import
```

## 코드 주석 규칙

JSX 내에서 5줄 이상의 코드 블록(조건부 렌더링, map, 중첩 컴포넌트 등)에는 해당 블록의 역할을 설명하는 간단한 한글 주석을 추가하세요.

```tsx
{/* 리스트 항목 */}
<div className={listContainerStyles}>
  {listItems.map((item, index) => (
    <div key={index} className={listItemStyles}>
      <span>{item.icon}</span>
      <span>{item.text}</span>
    </div>
  ))}
</div>
```

- 1~4줄의 짧은 코드나 역할이 자명한 코드에는 불필요합니다.
- 주석은 `{/* 닫기 버튼 */}` 처럼 짧고 명확하게 작성하세요.

컴포넌트 내부의 `useState`, `useRef` 등 상태·참조 선언에는 각각의 역할을 설명하는 짧은 한글 주석을 달아주세요.

```tsx
// 내부 열림 상태 (비제어 모드)
const [internalOpen, setInternalOpen] = useState(false);
// hover 딜레이 타이머
const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
// 트리거 컨테이너 참조
const containerRef = useRef<HTMLDivElement>(null);
```

- 변수명만으로 역할이 자명한 경우에도 일관성을 위해 주석을 추가합니다.

로직 코드(함수, switch, 조건문, 계산 블록 등)가 6줄 이상일 경우 해당 블록 위에 역할을 설명하는 짧은 한글 주석을 추가하세요.

```tsx
// 주어진 방향에 툴팁이 들어갈 공간이 있는지 판정
const fitsIn = (dir: TooltipDirection): boolean => {
  switch (dir) {
    case "top":
      return containerRect.top - GAP - th >= 0;
    case "bottom":
      return containerRect.bottom + GAP + th <= window.innerHeight;
    ...
  }
};
```

- 이미 주석이 달려 있거나 함수명/변수명만으로 역할이 명확한 1~5줄 코드에는 불필요합니다.

## Figma 디자인 동기화 규칙

Figma URL이 주어지면 Figma MCP 도구(`get_design_context`, `get_screenshot`, `get_metadata`)로 디자인 스펙을 가져와 코드를 동기화합니다.

- **Figma가 진실의 원천**: 시맨틱 토큰 값과 Figma 디자인이 불일치할 경우, **Figma 디자인을 우선**합니다. 기존 시맨틱 토큰이 맞지 않으면 새 시맨틱 토큰을 추가하거나 기존 토큰을 수정하여 Figma 색상값에 맞춥니다.
- **다크모드 반드시 검증**: Figma에서 Light/Dark 두 모드의 색상값을 모두 가져와 시맨틱 토큰의 `:root`와 `.dark` 값과 대조합니다. 한쪽 모드만 확인하고 넘어가지 마세요.
- **시맨틱 토큰 경로**: `modules/design-tokens/src/semantic/` 아래 CSS 파일에 정의합니다. primitive 토큰(`--grayscale-*` 등)을 컴포넌트에서 직접 사용하지 말고, 반드시 시맨틱 토큰으로 매핑하세요.
- **SPEC.md 업데이트**: 컴포넌트를 Figma에 동기화한 후 해당 컴포넌트의 `SPEC.md`에 파일 키, 노드 ID, 링크, 상태 조합 등을 업데이트합니다.
- **체크 아이콘 / 흰색 요소**: 다크모드에서 `--color-text-on-brand` 토큰은 어두운 색(`#0a1128`)으로 반전됩니다. 체크 아이콘처럼 항상 흰색이어야 하는 요소는 `text-white`(Tailwind)를 사용하세요.
- **Figma Component Property ↔ React props 일치 검토**: Figma 컴포넌트를 동기화할 때 Figma의 모든 Component Property(Variant, Boolean, Text, Instance Swap)를 React 컴포넌트의 `props` 인터페이스와 대조합니다. Figma에만 있는 property는 React props로 추가하고, prop 이름은 Figma property 이름과 가능한 한 일치시킵니다(camelCase 변환 허용). React에만 있는 내부 전용 props(이벤트 핸들러, ref 등)는 제외합니다.

## Storybook 스토리 네이밍 규칙

각 컴포넌트 스토리 파일(`index.stories.tsx`)에서 스토리 제목은 다음 규칙을 따릅니다.

- **첫 번째 스토리(기본 Props 제어용)**: export 이름은 `Default`로 유지하되, `name: "props test"`를 명시합니다.
- **나머지 스토리**: export 이름은 PascalCase로 유지하되, `name`을 **소문자**로 명시합니다. 단어 사이는 공백으로 구분합니다.
- **Controls 패널**: 첫 번째 스토리(`props test`)만 Controls 패널을 활성화하고, 나머지 모든 스토리에는 `parameters: { controls: { disable: true } }`를 추가합니다.

```tsx
export const Default: Story = {
  name: "props test",
  // Controls 패널 활성화 (기본값이므로 별도 설정 불필요)
};

export const WithCheckbox: Story = {
  name: "with checkbox",
  parameters: { controls: { disable: true } },
  ...
};

export const Sizes: Story = {
  name: "sizes",
  parameters: { controls: { disable: true } },
  ...
};
```

> export 이름(PascalCase)은 코드 참조용으로 유지하고, Storybook UI에 표시되는 이름은 `name` 필드로 별도 지정합니다.

## Storybook Props 노출 규칙

**Figma에서 확인 가능한 모든 Property는 첫 번째 스토리(props test)의 Storybook Controls 패널에서 제어 가능해야 합니다.**

- boolean, string, number, enum 타입은 표준 `argTypes` 컨트롤(boolean / select / text 등)로 직접 노출합니다.
- **ReactNode 타입(아이콘, 커스텀 슬롯 등)** 은 `iconMap` 객체와 `select` 컨트롤을 조합합니다.
  1. `iconMap` 객체에 `{ "none": undefined, "IconName": <IconName /> }` 형태로 선택지를 정의합니다.
  2. `argTypes`에 `control: { type: "select" }` + `options: Object.keys(iconMap)` 을 설정합니다.
  3. 스토리 `render()` 함수에서 `iconMap[args.iconKey]` 로 변환한 뒤 컴포넌트에 전달합니다.
  4. 컴포넌트가 직접 아이콘 prop을 받지 않는 경우(예: options 배열 내부), render 함수에서 옵션에 주입합니다.

```tsx
const leftIconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine />,
  IconSearch: <IconSearch />,
};

// meta argTypes
leftIcon: {
  control: { type: "select" },
  options: Object.keys(leftIconMap),
  description: "왼쪽 아이콘",
},

// story render
render: (args) => {
  const leftIcon = leftIconMap[args.leftIcon];
  const options = BASE_OPTIONS.map((opt) => ({ ...opt, leftIcon }));
  return <List options={options} ... />;
},
```

- 컴포넌트 내부 전용 props(key, ref 등)나 고정된 시각적 비교 스토리(Sizes, States 등)는 Controls 노출 대상에서 제외합니다.

## 플러그인 버전 관리 규칙

`plugins/migrate-une-front/` 등 이 저장소의 Claude Code 플러그인은 두 개의 버전 필드를 가지며 **항상 동기화**해야 합니다.

- `plugins/<plugin>/.claude-plugin/plugin.json`의 `version`
- `.claude-plugin/marketplace.json`의 `plugins[].version`

둘 중 하나만 올리면 `/plugin` Discover 화면에 구버전이 표시되어 update가 동작하지 않습니다. 버전을 올릴 때는 두 파일을 같은 커밋에 포함하세요.

커밋 메시지는 관례대로 `<plugin-name>: <요약> (<version>)` 형식을 따릅니다. 예: `migrate-une-front: className 충돌 정리 추가 (0.1.3)`.
