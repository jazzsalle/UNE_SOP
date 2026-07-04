# TestPoiMetadata

## 목적
Poi.metadata에 값을 설정하기 위한 팝업창 구현

## 요청사항
- 팝업창 관련 코드는 TestPoiMetadata.tsx에 작성할것
- 좌측 툴바에서 'POI 메타데이터 설정' 버튼을 누르면 팝업창이 보여야함
- 'POI 메타데이터 설정' 버튼 클릭시의 동작은 'POI 목록보기'버튼의 동작과 동일하나 보여지는 팝업을 TestPoiMetadata로 변경
- 아래 구성 요소 필요
  - '테스트용 Poi 메타데이터'의 텍스트를 가지는 타이틀바
  - 타이틀바 우측에 팝업창 닫기 동작을 하는 x 버튼
  - 메타데이터 입력을 할 수 있는 멀티라인 텍스트 입력창
  - 확인, 취소버튼
- 타이틀바 기준으로 팝업창 드래그하여 이동 기능
- 팝업창 우하단 기준으로 팝업창 크기변경 핸들 기능
- 레이아웃을 및 버튼 기능을 확인할 것이므로 WebEditor의 PoiManager와 연계하지말고 확인 버튼을 누르면 텍스트 입력창의 내용을 콘솔로 출력할 것
---
## 구현 계획

### 1. 팝업 컴포넌트 구현 ([TestPoiMetadata.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/components/dialogs/TestPoiMetadata.tsx))
- `useDragResize` 훅을 임포트하여 팝업창의 드래그 이동(타이틀바 기준) 및 크기 조절(우하단 리사이즈 핸들 기준) 기능 적용.
- `@une-front/react-ui`에서 제공하는 `Button`, `Textarea`, `IconX` 등의 UI 컴포넌트를 사용하여 아래와 같이 구조를 정의:
  - **헤더**: '테스트용 Poi 메타데이터' 타이틀 텍스트와 우측 닫기(X) 버튼 배치.
  - **콘텐츠 영역**: 멀티라인 텍스트 입력을 위한 `Textarea` 컴포넌트 배치. 입력값 상태(`metadata`)는 React State(`useState`)로 관리.
  - **푸터**: 확인, 취소 버튼 배치.
- 확인 버튼 클릭 시, 입력창의 내용을 콘솔에 출력(`console.log`)하고 `onClose()` 호출하여 팝업 종료.
- 취소 버튼 또는 X 버튼 클릭 시, 변경값 없이 `onClose()` 호출하여 팝업 종료.

### 2. 좌측 툴바 연동 ([LeftToolbar.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/pages/main/LeftToolbar.tsx))
- `LeftToolbarProps` 인터페이스에 팝업 노출 콜백 `onShowTestPoiMetadata?: () => void` 추가.
- `handleToolClick` 메서드 내에서 `modeKey`가 `"showTestPoiMetadataDialog"`일 때 `onShowTestPoiMetadata` 콜백 함수를 호출하도록 구현 (에디터 모드 전환 방지를 위해 조기 반환 처리).

### 3. 메인 에디터 연동 ([MainPage.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/pages/main/MainPage.tsx))
- 팝업 노출 여부 상태(`testPoiMetadataOpen`)를 React State로 관리.
- `LeftToolbar` 컴포넌트에 `onShowTestPoiMetadata={() => setTestPoiMetadataOpen(true)}` 프로퍼티 전달.
- `MainPage` 하단에 `<TestPoiMetadata editor={editor} open={testPoiMetadataOpen} onClose={() => setTestPoiMetadataOpen(false)} />` 컴포넌트 배치.

---
## 작업 완료 정리

### 1. 팝업 컴포넌트 구현 ([TestPoiMetadata.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/components/dialogs/TestPoiMetadata.tsx))
- `useDragResize` 훅을 연동하여 팝업창 드래그 및 크기 조절 기능이 원활히 동작하도록 구현했습니다.
- `@une-front/react-ui` 라이브러리의 `Button`, `Textarea`, `IconX` 컴포넌트를 레이아웃에 탑재했습니다.
- 입력창의 내용(`metadata`)을 `useState` 상태로 바인딩하여 관리하도록 했습니다.
- 확인 버튼 선택 시 입력창의 내용을 콘솔(`console.log`)로 안전하게 1회 출력하고 팝업창을 닫도록 구성했습니다.
- 취소 및 닫기(X) 버튼을 선택하면 상태 변경 없이 팝업창만 닫힙니다.

### 2. 좌측 툴바 연동 ([LeftToolbar.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/pages/main/LeftToolbar.tsx))
- `LeftToolbarProps` 인터페이스와 함수 정의부(디폴트 매개변수 포함)에 `onShowTestPoiMetadata?: () => void` 콜백 프로퍼티를 추가했습니다.
- `handleToolClick` 메서드 내에 `showTestPoiMetadataDialog` 조건 분기를 추가하여, 해당 버튼 클릭 시 에디터 그리기 모드로의 불필요한 전환 없이 콜백만 즉시 안전하게 실행(early return)되도록 구현했습니다.
- `useCallback` 의존성 배열에 `onShowTestPoiMetadata` 콜백 함수를 정상적으로 바인딩했습니다.

### 3. 메인 에디터 연동 ([MainPage.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/pages/main/MainPage.tsx))
- 메인 페이지 상태로 `testPoiMetadataOpen` Boolean 값을 추가했습니다.
- `LeftToolbar` 컴포넌트 호출부에 `onShowTestPoiMetadata={() => setTestPoiMetadataOpen(true)}` 이벤트 핸들러를 바인딩했습니다.
- `MainPage` 하단에 `<TestPoiMetadata>`를 배치하여 팝업창의 생명주기를 연동했습니다.

---
## 개선사항
- TestPoiMetadata 컴포넌트에 ObjectSelector의 'onObjectSelectionChanged' 이벤트처리기를 등록하고 아래 조건을 모두 만족하면 해당 Poi의 metadata속성을 텍스트입력창에 설정하도록함
  - 선택한 객체가 1개이면서 PoiManager일 경우
  - PoiManager의 poiList중 속성값 selected가 true 인스턴스가 1개인경우
- 그리고 확인 버튼을 클릭하면 해당 Poi의 metadata에 텍스트 입력창의 내용을 설정하도록 함
- 취소버튼 클릭시에는 아무동작없이 팝업창 닫기만 수행

---
## 개선사항 구현 계획

### 1. 선택 이벤트 핸들러 및 초기값 동기화 (`TestPoiMetadata.tsx`)
- `PoiManager` 클래스 타입을 임포트하여 인스턴스 검사에 활용합니다.
- `useEffect` 훅 내부에서 `editor.ObjectSelector`에 `'onObjectSelectionChanged'` 이벤트 리스너를 등록합니다.
- 동기화 함수(`syncSelection`)를 정의하고, 선택 변경 이벤트 핸들러 및 마운트/오픈 시 초기 상태 연동을 위해 호출합니다.
- 동기화 함수 로직:
  1. 선택된 객체들(`editor.ObjectSelector.SelectedObjects`)의 개수가 정확히 1개이고, 그 객체가 `PoiManager` 타입인지 확인합니다.
  2. 만족하는 경우 `poiManager.poiList`에서 `selected` 속성이 `true`인 POI 객체의 개수가 1개인지 필터링합니다.
  3. 모든 조건 충족 시, 해당 POI 객체의 `metadata` 속성값을 다이렉트로 읽어 텍스트 입력창의 상태(`metadata` state)에 설정합니다.
  4. 조건을 만족하지 못하면 메타데이터 입력창의 상태값을 빈 문자열(`""`)로 리셋합니다.
- 컴포넌트 언마운트 또는 팝업이 닫힐 때 이벤트 리스너를 안전하게 제거합니다.

### 2. 메타데이터 갱신 적용 (`TestPoiMetadata.tsx`)
- 확인 버튼 클릭 이벤트 핸들러(`handleConfirm`) 내에서 위 동기화 조건과 동일하게 선택된 단일 POI가 존재하는지 확인합니다.
- 조건 만족 시, 해당 POI 객체의 `metadata` 속성에 현재 텍스트 입력창의 수정된 상태값을 대입하여 설정합니다.
- 이후 `onClose()`를 호출해 팝업을 안전하게 종료합니다.
- 취소 버튼 클릭 시에는 다른 갱신 작업 없이 `onClose()`를 호출해 팝업창만 닫히도록 유지합니다.

---
## 개선사항 작업 완료 정리

### 1. 선택 이벤트 핸들러 및 초기값 동기화 ([TestPoiMetadata.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/components/dialogs/TestPoiMetadata.tsx))
- `PoiManager` 클래스 타입을 임포트하여 선택된 객체의 인스턴스 타입 비교 검사를 구현했습니다.
- `useEffect` 내에서 `editor.ObjectSelector`에 `'onObjectSelectionChanged'` 이벤트 처리기(`syncSelection`)를 등록했습니다.
- 선택 변경 이벤트 감지 및 컴포넌트 오픈 시 `syncSelection`을 수행하며, 아래 세 가지 조건을 모두 확인합니다:
  1. `editor.ObjectSelector.SelectedObjects`의 길이가 1개인지 확인.
  2. 선택된 객체가 `PoiManager` 타입인지 확인.
  3. `poiManager.poiList`에서 `selected === true`인 POI가 정확히 1개인지 필터링.
- 세 가지 조건을 모두 통과하면 해당 POI 객체의 `metadata`를 React state에 설정하고, 그렇지 않으면 `""`로 초기화하도록 설계했습니다.
- 팝업 종료 또는 언마운트 시 선택 변경 이벤트 리스너가 제거되도록 반환(clean-up) 함수를 추가했습니다.

### 2. 메타데이터 갱신 적용 ([TestPoiMetadata.tsx](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/app/components/dialogs/TestPoiMetadata.tsx))
- 확인 버튼 클릭 시(`handleConfirm`) 동일한 선택 조건을 거쳐 현재 선택되어 있는 단일 POI 객체를 탐색한 후, 그 POI 객체의 `metadata` 속성값에 입력창 상태값(`metadata`)을 직접 대입하여 업데이트하도록 구현했습니다.
- 취소 버튼(`handleCancel`) 및 X 버튼 클릭 시에는 에디터 내 데이터의 갱신 동작 없이 `onClose()`만 실행하여 팝업창을 닫도록 안전하게 고정했습니다.