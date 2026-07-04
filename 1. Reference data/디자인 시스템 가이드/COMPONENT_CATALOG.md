# 디자인 시스템 컴포넌트 카탈로그

> 패키지: `@une-front/react-ui`
> 모든 컴포넌트는 `import { ComponentName } from '@une-front/react-ui'`로 사용

---

## Button

- **import**: `import { Button } from '@une-front/react-ui'`
- **props**: `variant('fill'|'outline'|'ghost')`, `color('primary'|'grayscale')`, `size('xl'|'lg'|'md'|'sm'|'xs'|'xxs')`, `selected`, `disabled`, `leftIcon`, `rightIcon`
- **교체 대상**: `<button>`, MUI Button, antd Button 등 모든 버튼 요소

## IconButton

- **import**: `import { IconButton } from '@une-front/react-ui'`
- **props**: `variant('fill'|'outline'|'ghost')`, `color('primary'|'grayscale')`, `size('xl'|'lg'|'md'|'sm'|'xs')`, `selected`, `disabled`, `icon(ReactNode)`
- **교체 대상**: 아이콘만 있는 버튼, 닫기/설정/메뉴 버튼 등

## Input

- **import**: `import { Input } from '@une-front/react-ui'`
- **props**: `size('xxl'|'xl'|'lg'|'md')`, `intent('default'|'error'|'complete')`, `label`, `helperText`, `error`, `leftIcon`, `rightButton`, `clearable`, `onClear`
- **교체 대상**: `<input type="text">`, MUI TextField, antd Input 등

## Textarea

- **import**: `import { Textarea } from '@une-front/react-ui'`
- **props**: `label`, `intent('default'|'error'|'complete')`, `helperText`, `error`, `maxLength`, `showCounter`, `minHeight`, `maxHeight`, `resize('none'|'vertical'|'auto')`
- **교체 대상**: `<textarea>`, MUI TextField multiline, antd TextArea 등

## Select

- **import**: `import { Select } from '@une-front/react-ui'`
- **props**: `variant('standard'|'inline')`, `size('xl'|'lg'|'md')`, `intent('none'|'error'|'complete')`, `options(SelectOption[])`, `groups(SelectGroup[])`, `value`, `onChange`, `placeholder`, `label`, `helperText`, `error`, `disabled`, `leftIcon`
- **교체 대상**: `<select>`, MUI Select, antd Select, react-select 등

## Checkbox

- **import**: `import { Checkbox } from '@une-front/react-ui'`
- **props**: `checked`, `indeterminate`, `onCheckedChange((checked)=>void)`, `size('lg'|'md'|'sm')`, `label`, `disabled`
- **교체 대상**: `<input type="checkbox">`, MUI Checkbox, antd Checkbox 등

## Radio

- **import**: `import { RadioGroup, RadioButton } from '@une-front/react-ui'`
- **props**: RadioGroup: `value`, `setValue`, `size('lg'|'md'|'sm')`, `direction('vertical'|'horizontal')`, `disabled` / RadioButton: `value`, `label`, `disabled`
- **사용법**: `<RadioGroup>` 안에 `<RadioButton>` 배치 (Compound 패턴)
- **교체 대상**: `<input type="radio">`, MUI RadioGroup, antd Radio.Group 등

## Switch

- **import**: `import { Switch } from '@une-front/react-ui'`
- **props**: `value`, `setValue((value)=>void)`, `disabled`, `size('md'|'lg')`
- **교체 대상**: MUI Switch, antd Switch, 커스텀 토글 등

## Toast

- **import**: `import { ToastProvider, useToast } from '@une-front/react-ui'`
- **props**: ToastProvider: `position('top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right')`, `duration`, `maxToasts`
- **사용법**: 앱 루트에 `<ToastProvider>` 배치 → 컴포넌트에서 `useToast()` 훅으로 `toast(message, options)` 호출
- **교체 대상**: react-toastify, MUI Snackbar, antd message/notification 등

## Tooltip

- **import**: `import { Tooltip } from '@une-front/react-ui'`
- **props**: `content`, `size('sm'|'lg')`, `direction('top'|'bottom'|'left'|'right')`, `arrow('start'|'center'|'end')`, `trigger('hover'|'click')`, `showCloseButton`, `icon`, `gap`, `open`, `onOpenChange`
- **교체 대상**: MUI Tooltip, antd Tooltip, 커스텀 툴팁 등

## Tab

- **import**: `import { Tabs, TabList, TabButton, TabPanel } from '@une-front/react-ui'`
- **props**: Tabs: `value`, `setValue`, `variant('fill'|'line')`, `size('lg'|'md')` / TabButton: `value`, `label` / TabPanel: `value`
- **사용법**: `<Tabs>` > `<TabList>` > `<TabButton>` + `<TabPanel>` (Compound 패턴)
- **교체 대상**: MUI Tabs, antd Tabs, 커스텀 탭 등

## SegmentedControl

- **import**: `import { SegmentedControl } from '@une-front/react-ui'`
- **props**: `value`, `options(SegmentedOption<T>[])`, `setValue`, `size('sm'|'md'|'lg')`, `fullWidth`, `fitContent`, `disabled`
- **교체 대상**: antd Segmented, 커스텀 세그먼트 버튼 그룹 등

## Pagination

- **import**: `import { Pagination } from '@une-front/react-ui'`
- **props**: `totalPages`, `value`, `setValue((page)=>void)`, `jumpSize`
- **교체 대상**: MUI Pagination, antd Pagination, 커스텀 페이지네이션 등

## Badge

- **import**: `import { Badge } from '@une-front/react-ui'`
- **props**: `label`, `shape('round-square'|'cylinder')`, `variant('solid'|'solid-pastel'|'outline')`, `color('primary'|'success'|'error'|'secondary'|'warning'|'grayscale')`, `size('md'|'sm')`, `leftIcon`
- **교체 대상**: MUI Chip, antd Tag, 커스텀 뱃지/태그 등

## BadgeDot

- **import**: `import { BadgeDot } from '@une-front/react-ui'`
- **props**: `variant('primary'|'new')`, `size('lg'|'md'|'sm')`
- **교체 대상**: 알림 도트, 상태 인디케이터 등

## BadgeStatus

- **import**: `import { BadgeStatus } from '@une-front/react-ui'`
- **props**: `label`, `variant('neutral'|'accent')`, `color('primary'|'success'|'error'|'secondary'|'warning'|'grayscale')`, `size('md'|'sm')`
- **교체 대상**: 상태 표시 뱃지 (온라인/오프라인, 활성/비활성 등)

## Icons

- **import**: `import { IconX, IconSearch, IconCheck, ... } from '@une-front/react-ui'`
- **props**: `size(12|16|20|24|28|32|36|40)`, `pathFill`, `className`
- **교체 대상**: react-icons, MUI Icons, antd Icons, 인라인 SVG, FontAwesome 등
- **참고**: 사용 가능한 아이콘 목록은 `node_modules/@une-front/react-ui/dist/index.d.ts`에서 Icon으로 시작하는 export 검색

## Logos

- **import**: `import { LogoProtecto, LogoPdf, ... } from '@une-front/react-ui'`
- **export 목록**: `LogoBuilder`, `LogoDocx`, `LogoHwpx`, `LogoJpeg`, `LogoManagement`, `LogoMonitoring`, `LogoPdf`, `LogoPng`, `LogoPptx`, `LogoProtecto`, `LogoSop`, `LogoXlsx`
- **props**: `size(12|16|20|24|28|32|36|40)`, `className`

---

## 공통 패턴

| 패턴                    | 해당 컴포넌트                                                                     | 설명                                |
| ----------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| Compound                | Tab, Radio, SegmentedControl                                                      | 부모-자식 Context 패턴              |
| Provider + Hook         | Toast                                                                             | 앱 루트에 Provider, 사용처에서 Hook |
| Controlled/Uncontrolled | Input, Select, Textarea, Tooltip                                                  | value+onChange 또는 defaultValue    |
| intent prop             | Input, Textarea, Select, Modal, Alert, Toast                                      | 상태 표현 (error, success 등)       |
| size prop               | 대부분의 컴포넌트                                                                 | 크기 조절                           |
| forwardRef              | Button, IconButton, Input, Textarea, Checkbox, Radio, Switch, Alert, Tab, Tooltip | ref 전달 지원                       |

## 교체 시 주의사항

1. **Props 이름 차이**: 기존 라이브러리와 prop 이름이 다를 수 있음 (예: `onChange` → `onCheckedChange`, `checked` → `value`)
2. **Intent vs Status**: 에러/성공 상태는 `intent` prop으로 통일
3. **Icons**: 아이콘은 반드시 `Icons/` 폴더에서 검색 후 사용. 인라인 SVG 금지
4. **다크모드**: CSS 변수 기반으로 자동 지원됨. 별도 처리 불필요
5. **Toast**: 반드시 `ToastProvider`를 앱 루트에 배치해야 동작
6. **Tab/Radio**: Compound 패턴이므로 반드시 부모 컴포넌트로 감싸야 함
