# 토폴로지 경로 테스트

## 목적
- 생성한 토폴로지 노드들에 대해 A*기반의 길찾기 테스트 수행

## 기능
- 선택한 시작노드-종료노드에 대해 길찾기를 수행하고 결과를 화면상에 표시
- 길찾기 결과가 성공할 경우엔 계산된 결과를 따라 흘러가는 객체의 애니메이션 표현

## 요청사항
- 경로 찾기는 '경로 테스트 실행' 버튼을 클릭하여 수행
- 경로 찾기에 성공할 경우 경유지점을 표시하는 곳에 시작 노드 부터 종료 노드까지의 노드 목록 표시하고 색상을 녹색 계열로(현재 색상 유지) 설정
- 경로 찾기에 성공한 경우 경로에 해당하는 TopologNode 들의 TopologyNode.worldPosition을 기준으로 three.js Curve를 구성하고 TubeGeometry를 사용하여 경로형태를 가시화 할 것
- 경로 찾기에 성공한 경우 경로따라 움직이는 객체 표현을 three.js 애드온중 InstancedFlow를 사용하여 표현하고 geometry는 ConeGeometry를 사용할 것
- 경로 찾기에 성공항 경우 생성된 경로 형태에 해당하는 객체와 애니메이션 표현을 위한 InstancedFlow 객체는 별도 함수를 통해 수동 메모리 해제, 가시화 On/Off가 가능해야함
- 경로 찾기에 실패할경우 경유지점을 표시하는 곳에 '경로찾기에 실패하였습니다.' 문구를 출력하고 색상을 붉은색 계열로 설정


## 작업 진행 지침
- 작업이 진행될때 계획, 진행상황, 테스트 결과등은 이 문서에 한국어로 계속 추가되면서 작성될 수 있도록하고 항목 타이틀에 작업자를 명시할것

---

## 계획 (작업자: Claude)

### 설계 개요
A* 길찾기 → 경로 시각화(TubeGeometry) → 경로 추종 애니메이션(InstancedFlow)을 분리된 모듈로 구성하고, 테스트 탭 버튼/결과 표시와 연동한다.

1. **A* 길찾기** — 신규 `topology/topologyPathFinder.ts`
   - 이웃(neighbors) 그래프를 간선으로, 노드 간 `worldPosition` 유클리드 거리를 간선 비용/휴리스틱으로 사용.
   - `findPath(nodes, startId, endId)` → 시작→종료 순서 `TopologyNode[]` 또는 실패 시 `null`.
2. **경로 시각화/애니메이션** — 신규 `topology/topologyPathVisualizer.ts`
   - 경로 노드 worldPosition으로 `CatmullRomCurve3` 구성 → `TubeGeometry`(녹색 계열)로 경로 가시화.
   - `InstancedFlow`(three addons `CurveModifier`) + `ConeGeometry`로 경로를 따라 흐르는 객체 표현. Cone 장축을 곡선 진행축(+X)에 맞추기 위해 `rotateZ(-π/2)`.
   - `build(path)` / `update(delta)`(흐름 이동) / `setVisible(on/off)` / `dispose()`(수동 메모리 해제) 제공.
3. **매니저/에디터 연동**
   - `TopologyManager`: `runPathTest(start,end)`(성공 시 시각화 생성 + 경로 요약 반환, 실패 시 시각화 해제 후 null), `setPathVisible()`, `clearPath()`, `updatePathFlow(delta)` 추가. 노드 재생성/초기화/불러오기 시 기존 경로 자동 해제.
   - `WebEditor`: `onRenderBefore` 이벤트에 `updatePathFlow(deltaTime)` 연결(흐름 애니메이션 구동).
4. **패널(TestTab)**
   - '경로 테스트 실행' 버튼 클릭 → `runPathTest` 수행. 시작/종료 미선택 시 버튼 비활성.
   - 성공: 결과 카드(녹색 계열, 현재 teal 스타일 유지)에 시작→종료 노드 목록(displayName) 표시 + 경유 수.
   - 실패: 붉은색 계열 카드에 '경로찾기에 실패하였습니다.' 표시.
   - 시작/종료 변경 시 결과/시각화 초기화, 탭 이탈(언마운트) 시 경로 메모리 해제.

### 변경/추가 파일
- (신규) `topology/topologyPathFinder.ts`, `topology/topologyPathVisualizer.ts`
- `topology/topologyManager.ts`(경로 API 추가), `webEditor.ts`(프레임 업데이트 연결), `app/components/panels/TopologyPanel.tsx`(버튼/결과 연동)

## 진행 상황 (작업자: Claude)
- [x] A* 길찾기 모듈 구현
- [x] 경로 시각화(TubeGeometry)/흐름(InstancedFlow+Cone) 모듈 구현 (on/off·dispose 포함)
- [x] TopologyManager 경로 API 및 WebEditor 프레임 업데이트 연동
- [x] TestTab 버튼/결과 카드(성공 녹색·실패 붉은색) 연동
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

## 테스트 체크리스트 (작업자: Claude)
- [x] 시작/종료 노드를 선택하고 '경로 테스트 실행' 클릭 시 경로 탐색이 수행된다.
- [x] 성공 시 경유 표시 영역에 시작→종료 노드 목록(displayName)이 녹색 계열로 표시된다.
- [x] 성공 시 경로를 따라 TubeGeometry 경로와 Cone(InstancedFlow) 흐름 애니메이션이 보인다.
- [x] 실패(연결 없음) 시 '경로찾기에 실패하였습니다.'가 붉은색 계열로 표시된다.
- [x] 시작/종료 변경 시 이전 결과/경로 시각화가 초기화된다.
- [x] 노드 재생성(자동/Cell)·초기화 시 기존 경로 시각화가 사라진다.
- [x] 테스트 탭을 벗어나면 경로 시각화 메모리가 해제된다(누수 없음).
---
## 2026-06-26 개선사항(백인선)

## 개요
- 토폴로지 테스트 할때 선택한 시작 노드, 종료 노드에 대한 가시화 표현

## 요청사항
- 토폴로지 패널 테스트 탭에서 시작 노드를 지정하거나 종료 노드를 지정하면, 지정한 노드위에 텍스트 출력
- 텍스트는 GTAO 패스를 우회하기 위해 별도 정의된 definitions.ts내 GTAOBypassText를 사용하고, 관련된 참고할 파일은 distanceDimensin.ts를 살펴볼것
- 시작 노드를 지정하면 해당 노드 위에 '시작' 이라는 텍스트를 출력
- 종료 노드를 지정하면 해당 노드 위에 '종료' 라는 텍스트를 출력

### 계획 (작업자: Claude)
- 시작/종료 노드 "지정 즉시"(드롭다운 선택 시점) 해당 노드 위에 라벨 표시. (경로 테스트 실행과 무관)
1. **라벨 모듈** — 신규 `topology/topologyEndpointLabels.ts`
   - GTAO 패스 우회를 위해 `definitions.ts`의 `GTAOBypassText`(troika Text 상속) 사용. 텍스트 설정/정렬은 `distanceDimension.ts` 패턴(anchor center/middle, bold, lookAt로 위 방향 정렬) 준수.
   - '시작'(녹색)/'종료'(붉은색) 텍스트 2개를 보유. `setStart(node|null)`/`setEnd(node|null)`로 노드 위(worldPosition + Y오프셋)에 배치·표시, null이면 숨김. `clear()`/`dispose()` 제공.
2. **매니저 연동** — `TopologyManager`
   - `TopologyEndpointLabels`를 생성자에서 생성(systemObjectGroup에 부착).
   - `setPathTestStartNode(id|null)`/`setPathTestEndNode(id|null)`/`clearPathTestLabels()` 추가.
   - 노드 재생성/초기화/불러오기 시 라벨도 함께 숨김 처리.
3. **패널(TestTab)**
   - 시작/종료 드롭다운 값 변경 시 `setPathTestStartNode`/`setPathTestEndNode` 호출하여 라벨 표시/이동/숨김.
   - 탭 이탈(언마운트) 시 라벨도 해제(`clearPathTestLabels`).

### 변경/추가 파일
- (신규) `topology/topologyEndpointLabels.ts`
- `topology/topologyManager.ts`(라벨 API/생성/정리), `app/components/panels/TopologyPanel.tsx`(드롭다운 선택→라벨 연동)

### 진행 상황 (작업자: Claude)
- [x] `GTAOBypassText` 기반 시작/종료 라벨 모듈 구현
- [x] TopologyManager 라벨 API 및 노드 변경 시 정리 연동
- [x] TestTab 드롭다운 선택 → 라벨 표시/숨김 연동
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

### 테스트 체크리스트 (작업자: Claude)
- [x] 시작 노드를 지정하면 해당 노드 위에 '시작'(녹색) 텍스트가 표시된다.
- [x] 종료 노드를 지정하면 해당 노드 위에 '종료'(붉은색) 텍스트가 표시된다.
- [x] 시작/종료 노드를 변경하면 라벨이 새 노드 위치로 이동한다.
- [x] 선택을 해제하거나 해당 노드가 삭제되면 라벨이 사라진다.
- [x] 노드 재생성(자동/Cell)·초기화 시 라벨이 사라진다.
- [x] 테스트 탭을 벗어나면 라벨이 사라진다(누수 없음).
- [x] GTAO 적용 화면에서도 텍스트가 가려지지 않고 정상 출력된다.

---
## 2026-06-26 개선사항(백인선)
- 표시되는 텍스트의 높이를 더 높이고, 토폴로지 노드와 텍스트 사이에 ConeGeometry를 사용하여 시각적인 효과를 추가한다.

## 요청사항
- ConeGeometry를 사용한 메시는 뾰족한 부분이 아래를 향하도록(토폴로지 노드를 향하도록 할것)
- ConeGeometry를 사용한 메시는 Y값을 기준으로 지정한 높이 범위내에서 위아래로 움직임

### 계획 (작업자: Claude)
- 기존 `topology/topologyEndpointLabels.ts`의 시작/종료 표식을 "텍스트 + 콘 마커" 세트로 확장.
1. **텍스트 높이 상향** — 텍스트를 노드 위 `textHeight = 1.4`로 더 높이 배치.
2. **콘 마커 추가** — 시작/종료 각각 `ConeGeometry` 메시 추가.
   - 뾰족한 끝이 아래(노드 방향)를 향하도록 `geometry.rotateX(Math.PI)`.
   - 색상은 텍스트와 동일(시작 녹색/종료 붉은색), `MeshStandardMaterial`(emissive 적용).
3. **상하 진동(bobbing)** — 콘의 Y를 지정 범위(`coneBobMin=0.4 ~ coneBobMax=0.9`, 노드 기준) 안에서 sin 기반으로 진동.
   - `TopologyEndpointLabels.update(delta)` 추가, 시작/종료 위상 분리(0, π).
   - `TopologyManager.updatePathTestLabels(delta)` → `WebEditor`의 `onRenderBefore`에 연결하여 매 프레임 구동.
- 표식(텍스트+콘)은 기존 `setStart/setEnd`로 함께 표시/이동/숨김되므로 패널(TestTab) 추가 변경 없음.

### 변경 파일
- `topology/topologyEndpointLabels.ts`(콘 마커/진동 추가, 텍스트 높이 상향)
- `topology/topologyManager.ts`(`updatePathTestLabels` 추가), `webEditor.ts`(프레임 업데이트 연결)

### 진행 상황 (작업자: Claude)
- [x] 텍스트 높이 상향 및 시작/종료 콘 마커(아래 방향) 추가
- [x] 콘 Y 범위 상하 진동 애니메이션 및 프레임 업데이트 연동
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

### 테스트 체크리스트 (작업자: Claude)
- [x] 시작/종료 노드 지정 시 텍스트가 이전보다 더 높은 위치에 표시된다.
- [x] 노드와 텍스트 사이에 콘 마커가 표시되고 뾰족한 끝이 노드(아래)를 향한다.
- [x] 콘 마커가 지정한 Y 범위 안에서 위아래로 부드럽게 진동한다.
- [x] 시작=녹색, 종료=붉은색으로 텍스트/콘 색상이 일치한다.
- [x] 선택 해제/노드 삭제/재생성/초기화/탭 이탈 시 텍스트와 콘이 함께 사라진다.

---
## 2026-06-26 개선사항(백인선)

## 개요
- ConeGeometry의 움직이는 속도 조절 가능하도록
- InstancedFlow의 이동하는 물체 개수 조절과 일정한 속도로 이동하도록

## 요청사항
- coneBobMin, coneBobMax 외에 coneBobSpeedRadio 변수를 추가하여 배율에 따라 움직임 속도가 달라지도록(1.0=정상속도, 2.0=2배속도, 0.5=0.5배속도)
- InstancedFlow에서 흐르는 객체의 최대 개수를 조절 할 수 있도록 하여 지정한 개수만큼의 물체가 경로를 따라 다니도록 수정 요청
- InstancedFlow에서 경로의 최대 거리에 따라서 이동 속도가 달라지는데 거리에 상관없이 일정한 속도로 이동하도록 수정 요청
  - 거리값을 초당 이동속도를 기준으로 하는 변수를 생성하고 m기준 초당 1.5m를 이동하는 값을 기본값으로 할 것
- 각 변수들은 추후에 UI를 통해 노출을 하여 값을 조정할수 있도록 할 예정이나 지금 당장은 내부적으로 선언하여 사용만 할 것

### 계획 (작업자: Claude)
1. **콘 진동 속도 배율** — `topology/topologyEndpointLabels.ts`
   - 기존 `bobSpeed`(기본 rad/s)는 유지하고 `coneBobSpeedRadio`(기본 1.0) 변수를 추가.
   - 진동 위상 증가에 배율 적용: `phase += delta * bobSpeed * coneBobSpeedRadio` (1.0=정상, 2.0=2배, 0.5=0.5배).
2. **흐름 객체 개수** — `topology/topologyPathVisualizer.ts`
   - `flowObjectCount`(기본 3) 추가. `InstancedFlow(count, 1, ...)`로 생성하고 `moveIndividualAlongCurve(i, i/count)`로 곡선 위 균등 배치.
3. **경로 길이 무관 일정 속도** — `topology/topologyPathVisualizer.ts`
   - `flowSpeedMps`(기본 1.5 m/s) 추가, 빌드 시 `curveLength = curve.getLength()` 저장(월드 1unit=1m).
   - 매 프레임 `moveAlongCurve((flowSpeedMps / curveLength) * delta)` → 정규화 오프셋으로 변환하여 경로 길이와 무관하게 일정한 m/s 유지.
- 세 변수 모두 추후 UI 노출을 고려해 내부 필드(가변)로 선언만 하고 현재는 기본값 사용. 패널/매니저 추가 API 변경 없음.

### 변경 파일
- `topology/topologyEndpointLabels.ts`(`coneBobSpeedRadio` 추가)
- `topology/topologyPathVisualizer.ts`(`flowObjectCount`/`flowSpeedMps`/`curveLength` 추가, 균등 배치 및 일정 속도)

### 진행 상황 (작업자: Claude)
- [x] `coneBobSpeedRadio` 진동 속도 배율 적용
- [x] `flowObjectCount` 흐름 객체 개수 및 균등 배치 적용
- [x] `flowSpeedMps`(기본 1.5m/s) 경로 길이 무관 일정 속도 적용
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

### 테스트 체크리스트 (작업자: Claude)
- [x] `coneBobSpeedRadio` 값 변경(코드상)으로 콘 진동 속도가 배율대로 달라진다.
- [x] `flowObjectCount` 값만큼의 흐름 객체가 경로 위에 균등 간격으로 표시된다.
- [x] 짧은 경로와 긴 경로의 흐름 객체 이동 속도가 동일(약 1.5m/s)하게 보인다.
- [x] 기존 동작(경로 시각화/해제/탭 이탈 정리)에 회귀가 없다.

---
## 2026-06-26 개선사항(백인선) — 흐름 객체 이음새 찢김 수정

## 개요
- InstancedFlow 흐름 객체가 종료지점→시작지점으로 순환(wrap)할 때 메시가 찢어진 듯 늘어나는 현상 수정

## 원인
- InstancedFlow(CurveModifier)는 콘을 버텍스 셰이더에서 곡선 모양으로 휘게 만들며, 진행 오프셋을 `mod`로 순환시킨다.
- 우리 경로는 **열린 곡선(시작≠종료)** 이라, 콘이 이음새(끝↔시작 경계)를 걸치는 순간 콘의 앞/뒤 버텍스가 곡선의 시작점과 끝점으로 각각 매핑되어 그 사이가 늘어나 보인다(찢김). (닫힌 곡선이면 끝=시작이라 발생하지 않음)

## 해결 — 벤딩 OFF(강체 배치) + 끝단 스케일 페이드 (escalatorSteps.ts 참고)
시행착오 끝에, 근본 원인이 **벤딩(`flow.value>0`)** 임을 확인하고 escalatorSteps.ts의 검증된 사용 방식을 채택.

- **시행착오**
  1. per-instance `aVisible` 속성 + JS 판정(`(pathOffset+offset)%1`) → JS 추정과 셰이더 실제 래핑이 어긋나 찢김 잔존(tear.png).
  2. 셰이더 내부 값으로 이음새 컬링 → 짧은 경로에서 `seam` 비율이 과도해지는 등으로 화살표가 전부 사라짐.
- **최종 (정상 동작)**
  - **벤딩 비활성화** `flow.uniforms.flow.value = 0`: 인스턴스를 곡선 위 한 점에 **강체로 배치**(메시가 휘지 않음). 휘지 않으니 이음새 순환 시에도 **찢김이 원천적으로 발생하지 않음**.
  - 기본 스플라인 텍스처 basis=(tangent, normal, binormal) → 콘 로컬 +X(뾰족한 끝, `rotateZ(-π/2)`)가 진행방향을 향함(화살표 방향 정상).
  - **끝단 스케일 페이드**: `onBeforeCompile`로 `tParam = mt/textureStacks`(곡선상 0~1 위치)에서 `smoothstep` 기반 `scaleFactor`를 계산해 단면에 곱함 → 곡선 양 끝에서 크기가 0으로 수렴(=스케일 0)하여 순환 시 팝 없이 부드럽게 사라지/나타남. `fadeStartWidth`/`fadeEndWidth`(기본 0.06, 추후 UI 노출).
  - 일정 속도(`flowSpeedMps`)·개수(`flowObjectCount`)·균등 배치는 유지.

### 변경 파일
- `topology/topologyPathVisualizer.ts`(벤딩 OFF, `applyScaleFade` 셰이더 주입, `fadeStartWidth`/`fadeEndWidth` 추가)

### 진행 상황 (작업자: Claude)
- [x] (1차) per-instance 가시성 + JS 판정 — 어긋남으로 미해결
- [x] (2차) 셰이더 내부 컬링 — 일부 경로에서 전부 사라짐(미해결)
- [x] (최종) 벤딩 OFF + 끝단 스케일 페이드 적용
- [x] 콘 색상을 경로(튜브)보다 어둡게 조정
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

### 테스트 체크리스트 (작업자: Claude)
- [x] 화살표가 정상적으로 보이고 진행방향을 향한다.
- [x] 종료→시작 순환 시 찢어짐이 없고, 끝단에서 부드럽게 사라졌다 나타난다.
- [x] 흐름 객체 여러 개(기본 5개)가 각자 순환 시점에 동일하게 처리된다.
- [x] 일정 속도/개수/진동 등 기존 동작에 회귀가 없다.
- [x] 콘 색상이 경로보다 어둡게 구분된다.

---
## 2026-06-26 개선사항(백인선)
- 토폴로지 노드 테스트 기능에서 시작 노드와 종료 노드 선택을 드롭다운 선택에서 three.js화면상 마우스 클릭을 통한 노드 선택 항목 추가
- 토폴로지 패널-생성 탭-노드 편집-선택 에서의 클릭동작과 같은 동작으로 노드를 선택 할 수 있어야함
- 토폴로지 패널-테스트 탭에서 시작노드와 종료노드를 선택하는 드롭다운 위에 버튼 두개 추가
  - '시작 노드 선택하기' 버튼 클릭->시작 노드 선택 상태로 진입 후 마우스 클릭으로 노드를 선택하면 시작 노드 드롭다운에서 해당 노드를 선택한 것처럼 동작할 것
  - '종료 노드 선택하기' 버튼 클릭->종료 노드 선택 상태로 진입 후 마우스 클릭으로 노드를 선택하면 종료 노드 드롭다운에서 해당 노드를 선택한 것처럼 동작할 것

### 계획 (작업자: Claude)
- 생성 탭 '선택'과 동일한 클릭 플로우(ObjectSelector 배타 모드 + 호버 하이라이트)를 재사용하되, **단발성 pick**으로 동작시켜 클릭 1회로 시작/종료 노드를 지정.
1. **매니저** — `topology/topologyManager.ts`
   - `pathPickEnabled` 플래그 + `PathPickEnabled` getter/setter(전환 시 호버/선택 잔여 정리), `isSelectAvailable`에 포함.
   - `onPathTestNodePicked: { nodeId }` 이벤트 추가. `setMaterialSelected`에 pick 분기: 클릭 노드 ID를 발행하고 선택 상태로 만들지 않음. 드래그/Shift 다중선택 차단.
2. **에디터** — `webEditor.ts`: `setTopologyNodeEditMode`에 `"pathPick"` 모드 추가(배타 선택 활성).
3. **패널(TestTab)** — `topology/...TopologyPanel.tsx`
   - 드롭다운 위에 '시작/종료 노드 선택하기' 버튼 2개. 클릭 시 해당 대상 pick 모드 토글(`setTopologyNodeEditMode("pathPick")`).
   - `onPathTestNodePicked` 구독 → 현재 대상(start/end)에 노드 반영(드롭다운 값 갱신) 후 모드 종료. 상호 배제(반대편과 동일 노드면 무시). Esc로 취소, 탭 이탈 시 모드 복귀.

### 변경 파일
- `topology/topologyManager.ts`(pathPick 모드/이벤트), `webEditor.ts`(`pathPick` 모드), `app/components/panels/TopologyPanel.tsx`(버튼/구독/Esc)

### 진행 상황 (작업자: Claude)
- [x] 매니저 pathPick 모드 + `onPathTestNodePicked` 이벤트 구현
- [x] WebEditor `pathPick` 모드 연결
- [x] TestTab 버튼/클릭 선택 반영/Esc·상호배제 처리
- [x] `npx tsc --noEmit` 타입체크 통과 (에러 없음)
- [x] 브라우저 런타임 동작 확인 완료 (사용자 확인)

### 테스트 체크리스트 (작업자: Claude)
- [x] '시작 노드 선택하기' 클릭 후 3D 노드를 클릭하면 시작 노드 드롭다운에 반영된다.
- [x] '종료 노드 선택하기' 클릭 후 3D 노드를 클릭하면 종료 노드 드롭다운에 반영된다.
- [x] 선택 모드에서 노드 위 호버 시 하이라이트가 표시된다(생성 탭 '선택'과 동일 동작).
- [x] 반대편 노드와 동일한 노드는 클릭으로 지정되지 않는다(상호 배제).
- [x] Esc 또는 버튼 재클릭으로 선택 모드가 취소된다.
- [x] 클릭 지정 후에도 시작/종료 라벨·경로 테스트가 정상 동작한다.