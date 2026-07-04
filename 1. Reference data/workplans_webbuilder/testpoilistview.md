# TestPoiListView

---
## 목적
테스트용 Poi 목록보기

## 요청사항
- 팝업창 관련 코드는 TestPoiListDialog.tsx에 작성할것
- 좌측 툴바(LeftToolbar.tsx)에서 버튼 상태와 상관없이 'POI 목록보기' 버튼 클릭 이벤트 발동시 팝업창 표출
- 아래 구성 요소 필요
  - '테스트용 Poi 목록'의 텍스트를 가지는 타이틀바
  - 타이틀바 우측에 팝업창 닫기 동작을 하는 x 버튼
  - Poi 목록을 보여주는 컨텐츠 영역
- Poi 목록은 Poi.ts파일내 Poi인터페이스의 일부 정보를 보여주도록 하며 대략적인 형태 및 예제는 아래와 같음
  - 카테고리1(Poi.category 대응)
    - Poi id(Poi.id 대응)
    - Poi id(Poi.id 대응)
  - 카테고리2
    - Poi id
    - Poi id
    - Poi id
- 타이틀바 를 기준으로 팝업창 드래그 앤 드롭 가능하도록
- 팝업창의 우하단을 기준으로 팝업창 크기를 변경 할 수 있도록
- 레이아웃 구성을 먼저 확인해야 하므로 실제 Poi 데이터와 연계하지말고 테스트용 목업 데이터로 세팅하길 원함
---
## 구현 계획

### 1. 팝업 컴포넌트 구현 (TestPoiListDialog.tsx)
- `useDragResize` 훅을 사용하여 드래그앤드롭 및 크기 조절 기능 구현.
- 타이틀바 '테스트용 Poi 목록' 및 닫기 'x' 버튼 제공.
- 카테고리별로 그룹화된 POI 목업 데이터 렌더링.

### 2. 좌측 툴바 연동 (LeftToolbar.tsx)
- 팝업 노출 콜백 `onShowTestPoiList` 프로퍼티 추가 및 `showTestPoiListDialog` 클릭 시 호출(조기 반환 처리로 에디터 모드 전환 방지).

### 3. 메인 에디터 연동 (MainPage.tsx)
- 팝업 노출 여부 상태(`testPoiListDialogOpen`) 관리.
- `LeftToolbar`와 `TestPoiListDialog` 배치 및 연동.

---
## 오류 분석 및 수정 계획

### 오류 원인 분석
- `LeftToolbar` 컴포넌트 내 `handleToolClick` 메서드에서 `showTestPoiListDialog` 버튼 클릭 시 `onShowTestPoiList()` 콜백 함수를 다이렉트로 호출하고 있습니다.
- 특정 비정상적인 상황(예: React 렌더링 생명주기 지연, HMR 핫 리로딩, 혹은 예기치 않은 컴포넌트 구조 변경)으로 인해 부모 컴포넌트(`MainPage.tsx`)로부터 `onShowTestPoiList` 콜백이 적시에 전달되지 못해 `undefined`로 호출되었을 경우 `TypeError: onShowTestPoiList is not a function` 예외가 발생할 수 있습니다.

### 수정 계획
1. **방어적 프로그래밍 적용 (콜백 안전 호출)**
   - `LeftToolbarProps` 인터페이스에서 `onShowTestPoiList` 프로퍼티를 선택적(Optional) 프로퍼티인 `onShowTestPoiList?: () => void`로 변경합니다.
   - `LeftToolbar` 함수 정의부 구조 분해 할당 단계에서 기본 빈 함수(`() => {}`)를 디폴트 값으로 할당합니다: `onShowTestPoiList = () => {}`
   - `handleToolClick` 메서드 내에서 콜백을 호출할 때 옵셔널 체이닝(`onShowTestPoiList?.()`)을 적용하여 안전하게 호출하도록 수정합니다.
2. **콘솔 로그 검증**
   - 만약 콜백이 `undefined`일 경우 개발 단계에서 원인을 즉시 식별할 수 있도록 디버깅용 `console.warn` 또는 `console.error` 경고를 출력하도록 보완합니다.
---
## 개선사항1

### 요구사항
- 목업데이터에 visible: boolean 속성을 추가하고 초기값 모두 true로 설정
- 현재 목업 데이터에 id로 보여지는 컨트롤 오른쪽에 체크박스 같은 토글 형식의 컨트롤 추가
- 토글 상태 변경시 목업데이터내 속성값을 변경하고 콘솔창에 해당되는 목업데이터 출력
---
## 개선사항1 구현 계획

### 1. 목업 데이터 상태 관리화 및 `visible` 속성 추가
- `TestPoiListDialog.tsx` 내부에서 정적으로 관리되던 `MOCK_POI_DATA`를 컴포넌트 내 상태(State)인 `poiList`로 관리하도록 변경합니다.
- `MockPoi` 인터페이스 및 목업 데이터 객체 각각에 `visible: boolean` 속성을 추가하고 초기값을 `true`로 설정합니다.

### 2. POI 항목 우측에 토글(체크박스) 컨트롤 추가
- 각 POI ID 텍스트 오른쪽에 Flexbox 배치를 활용하여 토글 컨트롤(체크박스 `<input type="checkbox" />`)을 렌더링합니다.
- 체크박스의 `checked` 상태를 `poi.visible` 값과 바인딩합니다.

### 3. 상태 변경 이벤트 및 콘솔 출력 로직 구현
- 체크박스 클릭(onChange 이벤트) 시, 해당 POI의 `visible` 값을 반전시키는 `handleToggleVisible(id: string)` 함수를 호출합니다.
- 변경된 POI 상태를 React State(`poiList`)에 반영하여 화면을 갱신합니다.
- 상태 변경 시 해당 POI 데이터의 객체를 복사/갱신하여 콘솔 창(`console.log`)에 출력합니다.

---
## 중복 로그 출력 분석 및 수정 계획

### 오류 원인 분석
- `console.log` 출력이 `setPoiList` 상태 업데이트 콜백 함수(`setPoiList(prevList => prevList.map(...))`) 내부에서 처리되고 있습니다.
- React의 **StrictMode** 환경에서는 컴포넌트의 순수성 검사(Side-effects 감지)를 위해 상태 업데이트 콜백 함수를 의도적으로 2회 실행(Double-invocation)합니다. 이로 인해 단 한 번의 토글 클릭 시에도 `console.log`가 2번 실행되어 콘솔창에 중복 출력되는 현상이 발생합니다.

### 수정 계획
1. **로그 출력 위치 이동 (상태 업데이트 콜백 외부로 분리)**
   - `handleToggleVisible` 및 `handleToggleCategoryVisible` 함수 내에서 `console.log` 호출 로직을 `setPoiList(...)` 호출 이전의 이벤트 핸들러 영역으로 이동시킵니다.
   - 상태 업데이트 콜백은 상태 객체를 리턴하는 순수 함수 역할만 수행하도록 하고, 변경 예정인 데이터를 먼저 계산하여 외부에서 출력하도록 구현하여 중복 로깅을 방지합니다.

---
## 카테고리/POI 독립 이벤트 처리 및 수정 계획

### 요구사항 및 설계 방향
- 카테고리 체크박스 조작과 개별 POI 체크박스 조작이 상호 독립적으로 작용하도록 분리합니다.
  - 카테고리를 토글해도 하위 POI들의 `visible` 상태가 변하지 않으며, 카테고리 고유의 `visible` 상태만 변경 및 출력됩니다.
  - 개별 POI를 토글해도 카테고리 상태에 영향을 주지 않으며, 해당 POI의 `visible` 상태만 독립적으로 변경 및 출력됩니다.

### 수정 계획
1. **카테고리 상태의 별도 관리**
   - 카테고리 각각의 가시성 상태를 관리할 React State인 `categoryVisibleMap: Record<string, boolean>`을 추가로 정의합니다.
2. **독립 이벤트 핸들러 구현**
   - **카테고리 토글 (`handleToggleCategoryVisible`)**: `categoryVisibleMap`에서 해당 카테고리의 값을 토글하고 변경된 카테고리 상태 객체(예: `{ category: "사무실 (Office)", visible: false }`)를 콘솔에 **1회** 출력합니다. (하위 POI 리스트는 일괄 변경되지 않습니다.)
   - **POI 토글 (`handleToggleVisible`)**: `poiList`에서 해당 POI의 가시성을 토글하고 변경된 POI 상태 객체(예: `{ id: "poi_office_01", category: "사무실 (Office)", visible: false }`)를 콘솔에 **1회** 출력합니다. (카테고리 상태와 무관하게 동작합니다.)
3. **중복 로깅 문제 해결**
   - `console.log` 출력 코드를 React의 `setState` 콜백 함수 바깥으로 완전히 격리시켜 StrictMode에서 이중 호출되는 현상을 원천 방지합니다.
---
## 개선사항2

### 요구사항
- 초기 설정 데이터를 INITIAL_POI_DATA에서 poiManager.ts파일내 PoiManager클래스가 가지고 있는 poiList에 대응하여 초기값을 세팅하도록 함
- 팝업창 초기화시 PoiManager에 'onPoiAdded'와 'onPoiRemoved'이벤트에 대응하여 항목이 추가되거나 제거될 수 있도록 함
- 카테고리의 체크박스 상태 변경시에는 PoiManager의 setVisibleCategory함수를 이용하도록 함

---
## 개선사항2 구현 계획

### 1. PoiManager 실데이터 바인딩 및 이벤트 동기화
- `TestPoiListDialog.tsx` 오픈 시(`open === true`) `editor.PoiManager.poiList`에서 데이터를 추출하여 `poiList` React State를 동적으로 갱신합니다.
- `editor.PoiManager`의 `'onPoiAdded'` 및 `'onPoiRemoved'` 이벤트 리스너를 동적으로 등록/해제하는 라이프사이클을 작성하여, 팝업이 열려 있는 상태에서 POI가 동적으로 추가되거나 삭제될 때 UI 목록도 실시간 반영되도록 동기화합니다.
- 에디터 인스턴스 또는 실데이터가 로딩되지 않았을 경우를 대비해 기존의 `INITIAL_POI_DATA` 목업 데이터를 fallback으로 사용합니다.

### 2. 가시성 제어 시 에디터 코어 기능 연동
- 카테고리 체크박스를 조작할 때(`handleToggleCategoryVisible`) `editor.PoiManager.setVisibleCategory(categoryName, targetVisibility)`를 호출하여 3D 씬의 카테고리별 가시성을 업데이트합니다. 팝업 UI 상태에서도 해당 카테고리와 하위 POI들의 `visible` 상태를 일괄 갱신하며, StrictMode 중복 로깅 부작용 없이 변경 사항을 콘솔에 1회 출력합니다.
- 개별 POI 체크박스를 조작할 때(`handleToggleVisible`) `editor.PoiManager.setVisible(id, targetVisibility)`를 호출하여 3D 씬 내 개별 POI 가시성을 동기화하고, 콘솔창에 1회 변경 로그를 정상 출력합니다.
---
## 작업 완료 정리

### 1. 팝업 노출 시 TypeError 오류 수정
- **원인**: LeftToolbar.tsx에서 `onShowTestPoiList` 콜백이 정의되지 않았거나 로딩이 덜 끝난 상황에서 호출될 시 `TypeError: onShowTestPoiList is not a function`이 발생할 수 있는 잠재 위험 요소를 식별했습니다.
- **조치**: `LeftToolbarProps` 인터페이스에서 `onShowTestPoiList` 프로퍼티를 선택적(`?`) 프로퍼티로 변경하고 기본값으로 빈 함수(`() => {}`)를 설정하였으며, 호출처에 옵셔널 체이닝(`onShowTestPoiList?.()`)을 적용해 안전하게 실행되도록 방어 코드를 작성했습니다.

### 2. 가시성 체크박스 탑재 및 StrictMode 중복 로깅 해결 (개선사항1)
- **독립 상태 제어**: 카테고리 체크박스와 POI 체크박스의 토글 이벤트 처리가 완전히 개별적으로 작동할 수 있도록 팝업 컴포넌트 내에 `categoryVisibleMap: Record<string, boolean>` 상태를 분리해 도입했습니다.
- **중복 로그 제거**: React StrictMode 환경의 순수 함수 이중 실행(Double-invocation) 특성으로 인해 로그가 2회 찍히는 문제를 해결하기 위해, `console.log` 호출 위치를 `setState` 콜백 함수 내부에서 이벤트 핸들러 시작점(상태 업데이트 외부)으로 안전하게 이격시켜 1회만 출력되도록 수정했습니다.

### 3. 에디터 코어 실데이터 및 동적 이벤트 연동 (개선사항2)
- **실데이터 초기 바인딩**: 팝업이 활성화되는 초기 시점에 `editor.PoiManager.poiList`로부터 실제 POI 데이터를 가져와 리스트와 카테고리 상태를 갱신합니다. 에디터가 없거나 리스트가 빈 상태에서는 기존의 `INITIAL_POI_DATA`를 fallback 기본값으로 로드하도록 방어했습니다.
- **동적 추가/제거 이벤트 연동**: 팝업 활성화 중에 `PoiManager`에 `'onPoiAdded'` 및 `'onPoiRemoved'` 이벤트 리스너를 바인딩하여 3D 씬 내 POI 생성/삭제 정보가 팝업 목록 UI에도 실시간으로 동기화되도록 연동했고, 팝업이 닫힐 때 리스너를 안전하게 해제하여 메모리 누수를 원천 방지했습니다.
- **가시성 제어 실시간 동기화**: 
  - 카테고리 체크박스 토글 시 `editor.PoiManager.setVisibleCategory`를 실행하여 3D 씬에 반영하고, 동시에 팝업 UI에서도 하위 POI들의 체크박스 가시성 값을 일괄 동기화했습니다.
  - 개별 POI 체크박스 토글 시 `editor.PoiManager.setVisible`을 실행하여 3D 씬 내 해당 POI 아이콘의 실시간 On/Off 가시성 효과를 연결했습니다.