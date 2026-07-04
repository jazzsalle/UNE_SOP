# Topology
---

## 목적
- 길찾기등의 기능을 구현하기 위한 토폴로지 노드, 링크 기능 구현
- recast-navigation js를 사용하여 길찾기용 데이터 생성

## 요청사항
- topologyDataGenerator.ts파일내 TopologyDataGenerator클래스 calculateConvexPolygon함수에 아래 조건을 만족하는 함수 구현 요청
  - 전달받은 result에 대해서 NavMesh폴리곤을 삼각형 데이터로 구성하여 콘솔창에 출력

## 구현 계획
1. **NavMesh 데이터 획득**:
   - `@recast-navigation/core` 패키지에서 `getNavMeshPositionsAndIndices` 함수를 임포트합니다.
   - `calculateConvexPolygon(result)` 함수 내에서 `result.success`일 경우, `result.navMesh` 객체를 `getNavMeshPositionsAndIndices(result.navMesh)`에 전달하여 `[positions, indices]` 데이터를 추출합니다.

2. **삼각형 데이터 구성 및 가공**:
   - `indices` 배열은 삼각형의 정점 인덱스들을 3개씩 차례로 나열한 평탄한(flattened) 배열입니다.
   - `indices` 배열을 3개씩 순회하며 하나의 삼각형을 정의합니다.
   - 각 정점 인덱스 `idx`에 대해 `positions` 배열의 `[idx * 3]`, `[idx * 3 + 1]`, `[idx * 3 + 2]` 값을 각각 정점의 `(x, y, z)` 좌표로 매핑하여 3차원 벡터(또는 Three.js의 `Vector3`) 객체로 구성합니다.
   - 각 삼각형의 세 정점 좌표 및 중심점을 포함하는 구조의 데이터 객체를 생성합니다.

3. **콘솔 출력**:
   - 구성한 모든 삼각형 데이터를 순회하며 보기 쉽게 포맷팅하여 콘솔창에 출력(`console.log`)합니다.

4. **함수 호출 연동**:
   - `TopologyDataGenerator.generate` 메서드 내에서 `result.success` 판정 이후 `this.calculateConvexPolygon(result)`를 호출하여 실제 출력이 진행될 수 있도록 연동합니다.

## 구현 결과
- **[topologyDataGenerator.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/topology/topologyDataGenerator.ts)** 파일에서:
  - `@recast-navigation/core` 패키지로부터 `getNavMeshPositionsAndIndices` 함수를 가져왔습니다.
  - Three.js의 `Vector3` 클래스를 값 타입으로 임포트하여 인스턴스를 직접 생성할 수 있도록 수정했습니다.
  - `calculateConvexPolygon` 함수에 전달된 `result.navMesh`에서 `positions`와 `indices` 배열을 얻어, 각 삼각형(3개의 정점 쌍)에 대응하는 `p1`, `p2`, `p3` 좌표를 `Vector3` 객체로 추출했습니다.
  - 정점들의 산술 평균값으로 중심점(`center`) 좌표를 구했습니다.
  - 생성된 데이터를 파일에 선언되어 있는 `NavMeshConvexRegionData` 인터페이스 구조(center, polygonPoints)에 맞춰 `triangles` 배열로 구성하고 `console.log`로 출력하도록 구현하였습니다.
  - `generate` 함수 성공 분기 내에서 `this.calculateConvexPolygon(result)`가 실행되도록 연동하였습니다.
- TypeScript 컴파일러(`npx tsc --noEmit`)를 이용해 문법적 오류가 없음을 정상적으로 확인하였습니다.
---
## 요청사항
- 계산된 삼각형들이 인접한 삼각형들에 대해 Convex 폴리곤집합으로 구성되게끔 수정
---
## 구현 계획 (삼각형 병합을 통한 Convex 폴리곤 구성 알고리즘)

1. **초기 데이터 준비**:
   - `getNavMeshPositionsAndIndices(result.navMesh)`로 얻은 `positions`와 `indices`를 기반으로, 개별 삼각형을 나타내는 `Vector3[]` 리스트인 `trianglesList`를 구성합니다.

2. **반복적인 병합 프로세스 수행**:
   - `trianglesList`가 비어있지 않은 동안 아래 루프를 반복합니다.
     - `trianglesList`에서 0번째 삼각형을 꺼내어 임시 다각형 정점 목록(`currentRegionPoints`)으로 지정하고 목록에서 제거합니다.
     - 더 이상 인접하면서 Convex 조건이 유지되는 삼각형을 찾을 수 없을 때까지 다음 탐색을 반복합니다:
       - `trianglesList`에 남은 삼각형 중 현재 다각형(`currentRegionPoints`)과 정점을 2개 이상 공유하는(즉, 한 변 이상 맞닿아 있는) 삼각형을 찾습니다.
       - 맞닿아 있는 삼각형과 다각형을 병합하여 새로운 정점 목록(`mergedPoints`)을 생성합니다.
         - *병합 알고리즘*: 다각형과 삼각형의 모든 선분(Edge) 중 중복되는(맞닿는) 선분을 제외한 나머지 선분들을 찾고, 이 선분들을 체이닝(Chaining)하여 새로운 외곽선 정점 목록을 완성합니다.
       - 병합된 다각형(`mergedPoints`)의 모든 인접한 세 정점의 외적(Cross Product) 부호가 일치하는지 확인하여 볼록(Convex) 다각형인지 검사합니다.
       - 만약 Convex라면, `currentRegionPoints`를 `mergedPoints`로 갱신하고, 해당 삼각형을 `trianglesList`에서 영구 제거한 뒤 인접 탐색을 처음부터 다시 시작합니다.
     - 더 이상 병합 가능한 삼각형이 없으면, 완성된 다각형의 모든 정점 평균으로 중심점(`center`)을 구하고 `finalRegions` 결과 배열에 추가합니다.

3. **결과 출력 및 검증**:
   - 최종적으로 생성된 볼록 다각형 집합(`finalRegions`)을 콘솔창에 출력합니다.
   - `npx tsc --noEmit` 명령어로 컴파일 에러 여부를 검증합니다.

## 구현 결과 (삼각형 병합을 통한 Convex 폴리곤 구성 알고리즘)
- **[topologyDataGenerator.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/topology/topologyDataGenerator.ts)** 파일에서:
  - `TopologyDataGenerator` 클래스 내에 `isSamePoint`, `isSameEdge`, `mergePolygonAndTriangle`, `isConvex` 등의 헬퍼 정적 메서드를 새롭게 구현하였습니다.
  - `isSamePoint`는 Vector3 좌표에 대해 EPSILON 오차 한계를 두어 동일한 점인지 식별합니다.
  - `mergePolygonAndTriangle`은 다각형의 선분들과 삼각형의 선분들 중 겹치는 공유 변을 제외한 나머지 경계선 선분들을 찾아 연결하여(chaining) 병합된 정점 시퀀스를 반환합니다.
  - `isConvex`는 병합된 다각형의 임의의 인접한 세 정점에 대하여 XZ 평면에서의 외적(2D Cross Product) 부호를 계산하여 오목한 모서리가 존재하지 않고 볼록한지 검사합니다.
  - `calculateConvexPolygon` 메서드에서, 전체 삼각형 목록(`trianglesList`)을 구성한 후 순차적으로 0번째 삼각형을 시작점으로 잡고, 맞닿아 있으면서 병합 후 Convex 조건이 유지되는 삼각형을 찾아 하나씩 점진적으로 흡수하며 확장되게끔 구현하였습니다.
  - 병합이 완료되어 더 이상 합쳐질 삼각형이 없을 경우 중심점(`center`) 좌표와 정점 목록(`polygonPoints`)을 `NavMeshConvexRegionData`로 가공하여 `finalRegions` 결과 리스트에 별도 추가 및 수집합니다.
  - 최종 수집된 볼록 다각형 영역 데이터를 콘솔창에 출력하도록 연동 및 수정하였습니다.
- TypeScript 컴파일러(`npx tsc --noEmit`)를 이용해 타입 및 문법적 오류가 전혀 없음을 정상적으로 재확인하였습니다.
---
## 요청사항
- connectNeighbors 함수내에 아래 조건을 만족하는 코드 작성 요청
  - 전달받은 convexRegions 배열내의 각각의 영역에 대해 영역 폴리곤의 선분 일부가 맞닿아 있거나 떨어져 있는 경우로 가정함
  - 떨어져 있는 경우는 제외하고 폴리곤의 일부 선분이 맞닿아 있다면 neighbors에 해당 name을 추가하도록 처리
---
## 구현 계획 (Convex 영역 인접 이웃 연결)

1. **선분 맞닿음 판정 알고리즘 수립**:
   - 두 다각형 영역 `A`와 `B`에 대해 각각의 경계 선분(Edge) 쌍을 비교합니다.
   - 두 선분 `S1 = (a1, a2)`과 `S2 = (b1, b2)`가 맞닿아 있는지 검사하기 위해 XZ 평면에서의 선분 중첩(Overlap) 및 평행도(Collinearity) 검사를 수행하는 헬퍼 메서드 `segmentsTouch`를 구현합니다.
     - 두 선분의 Y축(높이) 차이가 허용 오차(예: `0.1`)보다 큰 경우 인접하지 않은 것으로 판정합니다.
     - `b1`과 `b2`에서 line `S1`에 내린 수선의 발까지의 거리가 매우 작고(`1e-4` 이내), 투영된 파라미터 영역이 `[0, 1]` 범위 내에서 일정 길이(`1e-3` 이상) 중첩되는지 확인합니다.
   - 다각형 A의 임의의 선분과 다각형 B의 임의의 선분이 `segmentsTouch` 조건을 만족하면 두 다각형은 서로 인접한(Neighbor) 것으로 판단합니다.

2. **인접 이웃 연결 로직 구현 (`connectNeighbors`)**:
   - `convexRegions` 배열 내의 모든 영역 쌍 `(regionA, regionB)`에 대해 루프를 돌며 인접 여부를 확인합니다.
   - 인접한 경우, `regionA.neighbors` 배열에 `regionB.name`이 포함되어 있지 않다면 추가하고, 역방향인 `regionB.neighbors` 배열에도 `regionA.name`을 추가합니다.

3. **연동 및 검증**:
   - `calculateConvexPolygon` 함수의 반환 전 단계에서 `this.connectNeighbors(finalRegions)`를 호출하도록 연동합니다.
   - `npx tsc --noEmit`을 통하여 최종 구현물의 컴파일 오류가 없는지 검증합니다.

## 구현 결과 (Convex 영역 인접 이웃 연결)
- **[topologyDataGenerator.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/topology/topologyDataGenerator.ts)** 파일에서:
  - `segmentsTouch` 정적 메서드를 구현하여 두 3D 선분이 XZ 평면에서 서로 일치하거나 겹치는지(Collinear Overlap)를 투영법을 사용하여 판정하게 하였습니다. 높이 차이 Y축도 오차 `0.1` 이내로 검사하도록 제어했습니다.
  - `isNeighbor` 정적 메서드를 구현하여 다각형 A의 모든 변과 다각형 B의 모든 변 조합을 `segmentsTouch`로 검사함으로써 두 영역이 한 선분의 일부를 공유하여 맞닿아 있는지 식별하도록 하였습니다.
  - `connectNeighbors` 메서드 내에서 모든 영역 쌍 `(regionA, regionB)`에 대해 `isNeighbor` 판정을 수행하고, 조건 만족 시 서로의 `neighbors` 배열에 상대방의 `name`(UUID)을 누락 없이 추가하도록 구현했습니다.
  - `calculateConvexPolygon`의 반환 직전에 `this.connectNeighbors(finalRegions)`를 호출하도록 연동하여 반환되는 `NavMeshConvexRegionData[]` 인스턴스들의 이웃 목록 정보가 완벽히 구성되게 하였습니다.
- TypeScript 컴파일러(`npx tsc --noEmit`)로 빌드 안정성을 정상적으로 재확인하였습니다.
---
## 개선사항
- TopologyDataGenerator.calculateVerticalPath함수에 아래 조건을 만족하는 코드 작성 요청
  - 전달받은 _stairs에 대해 NavMeshConvexRegionData를 생성하여 regions에 추가하고 추가된 데이터 배열을 반환
  - stair에 대한 RegionData는 위치점을 기준으로 총 3개가 생성됨
  - stair의 로컬 좌표 기준으로 0번째는 [0, stepHeight, stepWidth * 0.5], 2번째는 [geometryBoundingSize.x - stepDepth, geometryBoundingSize.y, stepWidth * 0.5]로 생성되도록함
  - stair의 로컬 좌표 기준으로 1번째는 0번쨰와 2번째의 중점으로 처리
  - 계산된 좌표를 월드계 기준으로 변환하고 regions에 추가하여 데이터 배열 반환

---
## 구현 계획 (수직 경로 노드 생성 및 연동)

1. **임포트 추가 및 변경**:
   - `topologyDataGenerator.ts` 파일 상단에 `Stair` 클래스와 `StairData` 인터페이스 임포트를 추가합니다.
     - `import {Stair} from "../structures/stair/stair";`
     - `import type {StairData} from "../definitions";`

2. **계단 수집 로직 추가 (`generate` 함수 내)**:
   - `_floorManager`를 순회하며 각 층의 하위 객체 중 `Stair` 인스턴스들을 수집합니다.
     ```typescript
     const stairs: Stair[] = [];
     for (const [floorName, floor] of _floorManager.Floors) {
         floor.traverse(child => {
             if (child instanceof Stair) {
                 stairs.push(child);
             }
         });
     }
     ```

3. **`calculateVerticalPath` 세부 로직 구현**:
   - 전달받은 `_stairs` 배열을 순회하며 각 `Stair`에 대해:
     - `stair.stairMesh`가 존재하는지 검사하고 바운딩 박스를 계산해 `geometryBoundingSize`를 구합니다.
     - `stair.StructureData`를 `StairData`로 캐스팅하여 `stepHeight`, `stepDepth`, `stepWidth` 등의 구조 데이터를 획득합니다.
     - 개선사항 수식에 맞춰 계단의 로컬 좌표계 기준 3개 위치점(`p0_local`, `p2_local`, `p1_local`(중점))을 생성합니다.
     - `stair.updateMatrixWorld(true)`를 호출하여 계단의 월드 변환 행렬을 동기화하고, 로컬 좌표들을 `applyMatrix4(stair.matrixWorld)`를 통해 월드 좌표로 변환합니다.
     - 각 위치점 주변의 발판 영역(Tread)을 대변할 로컬 폴리곤 정점 목록(`poly0_local`, `poly1_local`, `poly2_local`)을 생성하고 이를 월드 좌표로 변환합니다.
     - 변환된 월드 정점들과 월드 중심 좌표를 사용하여 3개의 `NavMeshConvexRegionData` 객체를 생성합니다.
     - 생성된 3개의 영역 노드 간 이웃 관계를 수동으로 연결(`region0.neighbors.push(region1.name)` 등)합니다.
     - 새로 생성한 3개의 RegionData를 `regions` 배열에 추가합니다.
   - 가공 완료된 `regions` 배열을 반환합니다.

4. **토폴로지 생성 흐름 연동**:
   - `generate` 메서드 내에서 `calculateConvexPolygon(result)` 호출 후, 반환된 바닥 영역 목록과 수집된 `stairs`를 매개변수로 하여 `calculateVerticalPath`를 호출합니다.
   - 수직 경로 영역들이 추가된 최종 `convexRegions` 배열에 대해 `connectNeighbors(convexRegions)`를 재차 호출하여, 계단 진입/진출 노(0번, 2번)와 기존 바닥 NavMesh 영역들 간의 연결 관계가 기하학적으로 연동되도록 유도합니다.

5. **검증**:
   - `npx tsc --noEmit` 명령어를 실행하여 구문 오류 및 컴파일 타임 에러가 없는지 체크합니다.
---
## 개선사항
- Stair에 대한 수직 경로 생성시 Convex 영역 인접 이웃 연결을 아래 조건하에 수행하도록 개선 요청
  - 시작점 p0의 y높이 기준으로 오차범위 0.1사이에 있는 Region Data 수집
  - 수집한 Region Data중에 center가 p0과 가장 가까운것을 찾아 neightbor로 선정하여 목록에 추가

---
## 구현 계획 (Stair 최인접 바닥 영역 연결 개선)

1. **`calculateVerticalPath` 개선**:
   - `regions`에 계단 영역(region0, region1, region2)을 추가하기 직전에, 기존 바닥 영역들을 탐색하여 최인접 이웃 연결을 처리합니다.
   - **시작점 p0 연결**:
     - 기존 `regions` 중 Y축 오차가 `0.1` 이내인 영역(`Math.abs(r.center.y - p0_world.y) <= 0.1`)만 필터링합니다.
     - 필터링된 영역들 중 `p0_world`와의 3D 거리(`p0_world.distanceTo(r.center)`)가 가장 작은 영역을 검색합니다.
     - 최인접 영역이 존재하면 해당 영역과 `region0` 간의 `neighbors` 리스트에 서로의 `name`을 상호 등록합니다.
   - **종료점 p2 연결**:
     - 기존 `regions` 중 Y축 오차가 `0.1` 이내인 영역(`Math.abs(r.center.y - p2_world.y) <= 0.1`)만 필터링합니다.
     - 필터링된 영역들 중 `p2_world`와의 3D 거리(`p2_world.distanceTo(r.center)`)가 가장 작은 영역을 검색합니다.
     - 최인접 영역이 존재하면 해당 영역과 `region2` 간의 `neighbors` 리스트에 서로의 `name`을 상호 등록합니다.

2. **토폴로지 생성 흐름 확인**:
   - 수동 연결로 계단 노드와 바닥 노드 간의 링크가 보장되므로, 불필요한 기하 충돌 기반의 `connectNeighbors` 재호출을 제거하거나 최소화합니다.

3. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit` 명령을 사용하여 변경된 코드에 대한 타입 안전성 및 컴파일 에러 유무를 확인합니다.

## 계산조건수정
- 시작점 p0에 대해 수집한 Region Data 각각의 Polygon 외각을 이루는 선분에 시작점 p0를 투영
- p0와 투영한 점과의 거리를 계산하고 저장
- 모든 Region Data에 같은 루틴을 수행하고 거리가 가장 가까운 Region을 neighbor로 선정
- 종료점 p2에 대해서도 동일한 작업 수행

---
## 구현 계획 (투영 최단 거리 기반 최인접 바닥 영역 연결)

1. **최단 거리 기하학 헬퍼 메서드 추가**:
   - `topologyDataGenerator.ts` 클래스 내에 두 개의 정적 헬퍼 메서드를 추가합니다:
     *   `distancePointToSegment(p, a, b)`: 점 `p`에서 선분 `(a, b)`까지의 3차원 최단 거리를 구합니다. (선분 사영 벡터 정규화 및 clamp 연산 적용)
     *   `distancePointToPolygonBoundary(p, points)`: 점 `p`에서 다각형 외곽선들(`points`) 중 가장 가까운 변까지의 최단 거리를 전수 조사하여 계산합니다.

2. **`calculateVerticalPath` 내 이웃 연동 로직 개정**:
   - **시작점 p0 연결**:
     - 기존 바닥 `regions` 목록 중 Y축 높이 차이가 `0.1` 이내인 노드들을 필터링합니다.
     - 각 필터링된 영역 `r`에 대해 `distancePointToPolygonBoundary(p0_world, r.polygonPoints)`를 호출하여 점 `p0`에서 해당 영역 외곽선까지의 최단 거리 $d_0$를 구합니다.
     - $d_0$가 가장 최소인 바닥 영역(`nearestRegion`)을 선별하여 서로의 `neighbors` 배열에 UUID를 상호 연동합니다.
   - **종료점 p2 연결**:
     - 기존 바닥 `regions` 목록 중 Y축 높이 차이가 `0.1` 이내인 노드들을 필터링합니다.
     - 각 필터링된 영역 `r`에 대해 `distancePointToPolygonBoundary(p2_world, r.polygonPoints)`를 호출하여 점 `p2`에서 해당 영역 외곽선까지의 최단 거리 $d_2$를 구합니다.
     - $d_2$가 가장 최소인 바닥 영역(`nearestRegion`)을 선별하여 서로의 `neighbors` 배열에 UUID를 상호 연동합니다.

3. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit`을 수행하여 구문 오류 및 컴파일 타임 에러를 검증합니다.

---
## 구현 계획 (종료점 p2의 Y축 오차 범위 조정)

1. **오차 범위 값 변경**:
   - `topologyDataGenerator.ts` 파일의 `calculateVerticalPath` 내 종료점 `p2`를 타겟팅하여 최인접 바닥 영역을 필터링하는 조건에서 Y축 오차 범위 값을 기존 `0.1`에서 `0.2`로 변경합니다.
     - 수정 전: `Math.abs(r.center.y - p2_world.y) <= 0.1`
     - 수정 후: `Math.abs(r.center.y - p2_world.y) <= 0.2`

2. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit`을 통해 빌드가 정상적으로 수행되는지 검사합니다.

---
## 구현 계획 (TopologyDataGenerator 내 미주석 함수에 대한 문서화)

1. **JSDoc/TSDoc 주석 추가**:
   - `topologyDataGenerator.ts` 클래스 내에 선언된 주석 미기재 정적 메서드들에 상세한 주석을 기술합니다.
     *   `isSamePoint`: 두 3차원 위치 좌표가 허용오차 내에서 동일한 점인지 판별하는 주석 추가.
     *   `isSameEdge`: 두 선분이 동일한 선분인지(시작/끝 바뀜 포함) 판별하는 주석 추가.
     *   `mergePolygonAndTriangle`: 다각형과 삼각형을 융합하여 공유 선분을 제외한 외곽선 정점 배열을 반환하는 주석 추가.
     *   `isConvex`: XZ 평면(2D) 기준 다각형의 외적 부호를 활용해 볼록성을 판별하는 주석 추가.
     *   `segmentsTouch`: 두 3D 선분이 XZ 평면 투영 및 Y축 높이 차이 한계 하에 맞닿아 있는지 검증하는 주석 추가.
     *   `isNeighbor`: 두 다각형의 모든 변 쌍을 검사하여 서로 인접했는지 판별하는 주석 추가.
     *   `connectNeighbors`: 모든 볼록 다각형 영역 간의 인접 여부를 전수 검사하여 이웃 목록을 상호 매핑하는 주석 추가.
     *   `calculateConvexPolygon`: NavMesh 빌드 결과로부터 삼각형들을 반복 병합하여 볼록 다각형 영역 분할 결과를 계산하는 핵심 메서드 주석 추가.
     *   `distancePointToSegment`: 점과 3D 선분 간의 최단 거리를 정사영 방식으로 계산하는 주석 추가.
     *   `distancePointToPolygonBoundary`: 점과 다각형 둘레(외곽 선분들) 간의 최단 거리를 계산하는 주석 추가.
     *   `calculateVerticalPath`: 수직 이동 경로인 계단 객체(Stair)를 수집하여 3개 지점의 수직 이동 노드를 생성하고 거리 투영 기법으로 기존 바닥 노드와 연동하는 주석 추가.

2. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit`을 호출하여 주석 추가 작업이 빌드 상 문제를 일으키지 않는지 체크합니다.
---
## 기능구현
- topologyManager.ts파일 TopologyManager의 generate() 함수내 하단에 아래 내용을 만족하는 코드 작성 요청
  - TooplogyManager클래스내 nodes변수 기준 TopologyNode의 worldPosition위치에 InstancedMesh를 사용한 구체 생성
  - InstancedMesh에 최대 개수를 정하지만 추후 별도의 함수호출을 통해 추가되거나 제거되어 최대 개수가 변경될 가능성이 있음
  - InstancedMesh에 대해서 instanceId와 TopologyNode.id가 일치하도록 구현되어야함(LibraryObject, LibraryCreator등 라이브러리 기능 관련 참고할것)
  - 생성된 InstancedMesh는 TopologyManager내 systemObjectGroup에 추가할것
- 추가적으로 TopologyManager에 필요한 함수
  - addNode(data: TopologyNode) => 토폴로지 노드 추가
  - removeNode(nodeId: string) => nodeId에 해당하는 토폴로지 노드 제거
  - clear() => 모든 토폴로지 노드 제거
  - setPosition(nodeId: string, worldPos: Vector3) => nodeId에 해당하는 토폴로지 노드의 worldPosition을 worldPos로 설정(Vector3.clone()으로)

---
## 구현 계획 (구체 InstancedMesh화 및 노드 관리 API 구현)

1. **`topologyDataGenerator.ts` 내 성공 시 결과 리턴 적용**:
   - `generate` 메서드 성공 분기 말단(165라인 부근)에 `return convexRegions;` 구문을 추가하여 바닥 및 계단 노드가 연동된 노드 데이터를 외부로 올바르게 넘겨주도록 변경합니다.

2. **`topologyManager.ts` 임포트 및 필드 보강**:
   - `three` 모듈로부터 `InstancedMesh`, `SphereGeometry`, `MeshStandardMaterial`, `Object3D`, `Vector3` 등을 임포트 목록에 추가합니다.
   - `TopologyNode` 인터페이스 임포트 구문을 추가합니다:
     `import type { TopologyNode } from "./topologyNode";`
   - `TopologyManager` 클래스 멤버에 다음 변수들을 추가합니다:
     *   `public nodes: TopologyNode[] = [];`
     *   `private instancedMesh: InstancedMesh | null = null;`
     *   `private maxCount: number = 1000;`

3. **`TopologyManager.rebuildMesh` 메서드 구현**:
   - 기존의 `instancedMesh`가 씬에 등록되어 있다면 파기(`dispose`) 및 parent 제거를 실행합니다.
   - `nodes` 배열의 2배 크기(최소 1000)를 갖는 `maxCount` 크기의 신규 `InstancedMesh`를 빌드합니다. (구체 형태의 `SphereGeometry(0.1, 16, 16)` 및 기본 재질 이용)
   - 노드 인덱스 `i`가 `instanceId`가 되도록 맵핑하여 `setMatrixAt`을 수행합니다.
   - 사용하지 않는 잉여 인스턴스는 스케일을 `(0, 0, 0)`으로 만들어 화면에서 보이지 않도록 숨깁니다.
   - 갱신 완료된 메쉬를 `systemObjectGroup`에 부착합니다.

4. **`TopologyManager.generate` 개정**:
   - `TopologyDataGenerator.generate(...)`를 실행하여 획득한 영역 목록(`regions`)을 `TopologyNode[]` 구조로 파싱하고 `linkNodes` 이웃 링크 구조를 맵핑한 뒤 `this.nodes`에 할당합니다.
   - `this.rebuildMesh()`를 호출하여 그래픽을 동기화합니다.

5. **노드 관리 API 추가**:
   - `addNode(data: TopologyNode)`: 노드를 배열에 추가하고 여유 인스턴스 범위 내에서 단일 업데이트(또는 크기 초과 시 rebuild)합니다.
   - `removeNode(nodeId: string)`: 노드와 다른 이웃들의 링크 목록에서 해당 노드를 삭제한 뒤 `rebuildMesh`로 동기화합니다.
   - `clear()`: 노드 목록을 비우고 `rebuildMesh`를 수행합니다.
   - `setPosition(nodeId: string, worldPos: Vector3)`: 해당 노드의 좌표를 복사(`worldPos.clone()`)하고 InstancedMesh의 행렬을 단일 갱신합니다.

6. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit`을 통해 타입 안전성과 빌드 성공을 검증합니다.
---
## Cell(Grid) 기반 생성

## 요청사항
- topologyDataGenerator.ts파일내 TopologyDataGenerator클래스 calculateCellRegions의 함수내 코드 작성
- NavMesh위에 전달된 _cellInterval만큼 XZ좌표기준으로 바둑판 형식의 RegionData생성

## 동작흐름
1. NavMesh의 월드 바운딩 계산
2. NavMesh의 월드 바운딩을 기준으로 XZ좌표를 _cellInterval만큼으로 나누어 바둑판 Grid 형식으로 RegionData 생성
3. 생성되는 RegionData는 NavMesh 위에 있으며 월드바운딩내에서 NavMesh위에 위치하지 않은곳은 생성하지 않음
4. XZ평면 기준으로 동일한 위치의 다른 높이의 다층 구조(건물의 1층,2층등)를 고려하여 NavMesh의 모든 폴리곤에 대해 월드바운딩의 XZ최소->XZ최대 범위까지 바둑판형식으로 생성
5. 완료후 ReginoData배열 반환

---
## 구현 계획 (Cell Grid 기반 토폴로지 생성)

1. **`calculateCellRegions` 세부 로직 구현**:
   - `getNavMeshPositionsAndIndices(result.navMesh)`로 구한 정점 리스트 전체를 순회해 최소/최대 X, Y, Z 바운딩 영역을 획득합니다.
   - 모든 인덱스 버퍼를 활용해 NavMesh 상의 개별 3D 삼각형(`a, b, c`) 데이터 리스트를 전수 구성합니다.
   - 최소 $X$에서 최대 $X$까지, 최소 $Z$에서 최대 $Z$까지 `_cellInterval` 단위로 증가하는 XZ 평면 이중 격자 루프를 생성합니다.
   - 각 격자 위치 $(x, z)$ 마다 모든 NavMesh 삼각형들을 훑으며, 해당 점이 삼각형 투영 면적(2D) 내에 속하는지 무게중심 좌표계(Barycentric Coordinates)를 계산하여 검증합니다.
   - 범위 내에 속할 경우, 해당 삼각형 평면의 정점들을 기반으로 점의 보간된 Y축 높이 $y$를 계산해 3D 격자점 $(x, y, z)$를 결정합니다. (이를 통해 1층, 2층 등의 다층 격자점이 독립적으로 모두 식별됩니다.)
   - 정점 공유 경계선에서의 중복 검출을 방지하기 위해, 동일 $(x, z)$ 좌표이면서 Y축 높이 차이가 `0.1` 이내인 노드는 하나로 중복 제거(Deduplication)를 수행합니다.
   - 수집된 격자점마다 셀의 너비/깊이(`_cellInterval`)를 갖는 평면 사각형 정점 배열을 구성해 `polygonPoints`에 할당하고 `NavMeshConvexRegionData`로 인스턴스화합니다.
   - 최종적으로 생성된 셀 영역들에 대해 `connectNeighbors(cellRegions)`를 호출해, 맞닿은 격자 셀들끼리 이웃(`neighbors`) 관계를 자동 연결한 뒤 반환합니다.

2. **빌드 및 컴파일 검증**:
   - `cmd.exe /c npx tsc --noEmit` 명령어로 최종 구현 소스에 대한 타입 완성도를 검증합니다.

---
## 구현 계획 수립 이력 (2026-06-23)
- 'Cell(Grid) 기반 생성'을 위한 기하 연산 설계(바운딩 박스 생성, 이중 격자 루프, Barycentric Coordinates 활용 다층 높이 보간, 중복 제거, 사각형 셀 외각 정점 생성, 이웃 연결) 수립 및 아티팩트 [implementation_plan.md](file:///C:/Users/BaekInSun/.gemini/antigravity/brain/bff144de-1718-4569-b7f7-694fe3434ea2/implementation_plan.md) 갱신 완료.
---
## 객체 확장 적용

## 요청사항
- Stair와 비슷하게 TopologyDataGenerator.calculateVerticalPath에 Ramp도 적용되도록 기능 추가

---
## 구현 계획 (객체 확장 적용 - 수직 이동 경로 Ramp 통합)

1. **`calculateVerticalPath` 다형성 지원 및 Ramp 적용**:
   - `TopologyDataGenerator.calculateVerticalPath` 메서드의 시그니처에 `_ramps?: Ramp[]` 매개변수를 추가합니다.
   - `_floorManager`를 순회할 때 `Stair`뿐만 아니라 `Ramp` 인스턴스도 동일하게 식별하여 `ramps` 배열에 수집하고, `calculateVerticalPath`에 인자로 전달하도록 수정합니다.
   - `calculateVerticalPath` 내부에서 `_ramps` 배열을 순회하며 각 Ramp에 대한 토폴로지 노드(진입, 중점, 진출)를 생성하는 독립 루프를 구현합니다.
   - `RampData`의 `stepWidth` 및 `stepDepth`를 기하 기준값으로 삼고(디폴트 `0.3`), 계단과 일관된 구조로 3D 로컬 좌표 및 다각형 정점을 형성하여 월드 좌표로 투영 변환합니다.
   - `distancePointToPolygonBoundary` 함수를 통해 수평/수직 오차 한계 내에 있는 인접 바닥 노드를 검출하고, 양방향으로 이웃(neighbors) 연결을 매핑합니다.

2. **임포트 구성**:
   - `topologyDataGenerator.ts` 파일 내에 `Ramp` 클래스와 `RampData` 인터페이스의 임포트 경로를 추가합니다.

3. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit` 명령어로 최종 구현 소스에 대한 타입 완성도 및 빌드 여부를 점검합니다.
---
## 객체 확장 적용(Escalator)

## 요청사항
- Ramp, Stair와 동일하게 Escalator도 처리
- 다만 Escalator의 경우 Escalator.topologyNodePoints라는 변수의 미리 계산된 토폴로지 노드위치점이 있고 0번째점이 Ramp, Stair의 p0에 매칭, 배열의 마지막점이 Ramp, Stair의 p1에 매치됨
- Escalator.topologyNodePoints는 Escalator의 로컬좌표계 기준이므로 실제 처리시에는 월드좌표계로 전환해서 사용해야함

---
## 구현 계획 (객체 확장 적용 - 수직 이동 경로 Escalator 통합)

1. **`calculateVerticalPath` 다형성 확장 및 Escalator 적용**:
   - `TopologyDataGenerator.calculateVerticalPath` 메서드의 시그니처에 `_escalators?: Escalator[]` 매개변수를 추가합니다.
   - `_floorManager`를 순회할 때 `Stair`, `Ramp`뿐만 아니라 `Escalator` 인스턴스도 함께 식별하여 `escalators` 배열에 수집하고, `calculateVerticalPath`에 인자로 전달하도록 수정합니다.
   - `calculateVerticalPath` 내부에서 `_escalators` 배열을 순회하며 각 에스컬레이터에 대한 토폴로지 노드 체인을 생성하는 독립 루프를 구현합니다.
   - `escalator.topologyNodePoints` 로컬 점 배열을 월드 행렬(`escalator.matrixWorld`)을 적용하여 3차원 월드 좌표로 매핑합니다.
   - 각 월드 노드점을 기준으로 가로 `0.5` / 세로 `0.3` 의 사각형 정점을 형성하여 영역 다각형 정점 목록(`polygonPoints`)을 빌드합니다.
   - 체인의 첫 번째 점(0번째) 및 마지막 점에 대해 Y축 허용 오차 `0.5` 이내의 최단 거리 바닥 노드를 검출하고, 양방향으로 이웃(neighbors) 연결을 매핑합니다.
   - 내부 노드들은 순차적으로 체인 연결 관계(`neighbors` 링킹)를 완성하여 최종 영역 리스트에 추가합니다.

2. **임포트 구성**:
   - `topologyDataGenerator.ts` 파일 내에 `Escalator` 클래스의 임포트 경로를 추가합니다.

3. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit` 명령어로 최종 구현 소스에 대한 타입 완성도 및 빌드 여부를 점검합니다.
---
## 2026-06-25 - 백인선 - 요청사항
- src/WebEditor/topology/topologyManager.ts 파일 TopologyManager클래스의 generate함수와 generateCell함수 호출시 층이름입력에 대한 처리 요청
- src/WebEditor/topology/topologyNode.ts 파일의 TopologyNode인터페이스중 floorName에 대응
- src/WebEditor/floor/floor.ts 파일 Floor클래스에서 (position.y) 에서 (position.y + floor.height) 사이에 존재하는 노드는 해당 Floor에 속하는 것으로 간주하고 Floor클래스 .name을 FloorName으로 입력 

---
## 구현 계획 (층 이름 매핑 처리 - 작업자-Antigravity)
1. **층 식별 로직 구현**:
   - `TopologyManager` 클래스 내 `generate` 및 `generateCell` 함수 내부에서 노드를 생성할 때, 해당 노드의 월드 좌표 Y값(`node.worldPosition.y`)을 바탕으로 소속된 층을 판단합니다.
   - `floorManager.Floors.values()`를 순회하며 `floor.position.y <= worldPosition.y && worldPosition.y <= floor.position.y + floor.FloorHeight` 범위를 검사합니다.
   - 조건에 만족하는 첫 번째 층을 찾으면 해당 `floor.name`을 노드의 `floorName`으로 할당합니다. 조건에 맞는 층이 없으면 기본값인 빈 문자열(`""`)을 지정합니다.

2. **직렬화 처리**:
   - `exportNodes` 및 `importNodes` 함수에서도 `floorName` 정보를 정상적으로 저장하고 불러오도록 반영합니다.

3. **빌드 검증**:
   - `npx tsc --noEmit`을 통해 컴파일 에러 여부를 검증합니다.

## 진행 상황
- [x] 구현 계획 수립 및 승인 완료
- [x] TopologyManager 내 구현 완료
- [x] npx tsc --noEmit 컴파일 검증 통과 완료

## 구현 결과 (층 이름 매핑 처리 - 작업자-Antigravity)
- **[topologyManager.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/topology/topologyManager.ts)** 파일에서:
  - `generate()` 및 `generateCell()` 메서드 내부의 노드 생성 루프에서 각 노드의 월드 좌표 `y` 값이 어떤 `Floor`의 `position.y` ~ `position.y + floor.FloorHeight` 범위에 들어오는지 판단하여 일치하는 층의 `name`을 `floorName`으로 설정해 주도록 수정했습니다.
  - `exportNodes()` 및 `importNodes()` 메서드에서 `floorName` 속성이 정상적으로 저장(직렬화)되고 복원(역직렬화)되도록 코드 구성을 보완했습니다.
- TypeScript 컴파일러(`npx tsc --noEmit`)를 호출하여 문법적인 오류가 없음을 완전히 확인하였습니다. 
---
## 2026-06-25 - 백인선 - 요청사항
- 직전작업과 유사하게 TopologyNode 인터페이스에 추가된 slabName에 대한 처리 작업 요청
- floorName이 결정되면 어느 층에 속하는지 알게 되는것이므로 해당 층의 Slab를 수집하고, SlabData Shape에 대해 TopologyNode를 포함하는지 검사를 수행해서 포함된다면 해당 Slab의 name을 TopologyNode.slabName으로 지정
- 포함되는지 확인하는 작업의 의사코드는 다음과 같음
  1. SlabData의 Shape를 XZ평면으로 계산(Shape의 특정 축을 뒤집어야 할 수 있으므로 src/WebEditor/structures/slab/slab.ts 파일 Slab클래스의 updateSlabGeometry참고할것)
  2. TopologyNode.worldPosition의 XZ좌표가 Slab의 XZ평면에 계산된 Shape 내부에 포함되는지 검사(Hole체크하지 않음)

---
## 구현 계획 (Slab 이름 매핑 처리 - 작업자-Antigravity)
1. **임포트 및 헬퍼 구현**:
   - `Slab` 및 `SlabData`를 `topologyManager.ts`에 임포트합니다.
   - 레이 캐스팅 알고리즘 기반의 다각형 내 점 포함 판정 함수 `isPointInPolygon`을 파일 내에 구현합니다.

2. **Slab 및 노드 위치 판정 로직**:
   - `generate()` 및 `generateCell()` 내부에서 각 노드의 `floorName`이 식별되면 해당 `Floor` 객체를 찾습니다.
   - `floor.getStructureObjects()`에서 `Slab` 인스턴스들을 필터링하여 수집합니다.
   - 수집된 각 `Slab`에 대해 `slab.updateMatrixWorld(true)`를 한 뒤, `slab.worldToLocal(worldPos.clone())`을 호출해 노드의 로컬 좌표 `localPos`를 계산합니다.
   - `(slab.StructureData as SlabData).shape.getPoints()`를 사용해 2D 경계점들을 가져오고, `(localPos.x, -localPos.z)`가 해당 다각형 영역 내부에 존재하는지 검증합니다.
   - 포함된 첫 번째 Slab의 `name`을 `slabName` 속성에 저장합니다.

3. **직렬화 처리**:
   - `exportNodes` 및 `importNodes` 함수에서도 `slabName` 정보가 유실되지 않도록 직렬화/역직렬화 대상을 추가합니다.

4. **빌드 검증**:
   - `npx tsc --noEmit`을 통해 컴파일 에러 여부를 검증합니다.

## 진행 상황
- [x] 구현 계획 수립 및 승인 완료
- [x] TopologyManager 내 구현 완료
- [x] npx tsc --noEmit 컴파일 검증 통과 완료

## 구현 결과 (Slab 이름 매핑 처리 - 작업자-Antigravity)
- **[topologyManager.ts](file:///c:/Users/User/Documents/Dev/UNE/webeditor/src/WebEditor/topology/topologyManager.ts)** 파일에서:
  - `generate()` 및 `generateCell()` 함수에 각 노드의 `floorName`이 식별되면 해당 `Floor` 객체로부터 수집한 `Slab` 객체들의 shape 범위 내에 포함되는지 검사하여 일치하는 `Slab` 인스턴스의 `name`을 `slabName` 속성에 저장해 주도록 구현하였습니다.
  - XZ 평면에서의 다각형 내부 포함 판정을 위해 레이 캐스팅 알고리즘 기반의 `isPointInPolygon` 파일 스코프 헬퍼 함수를 추가하고, Slab 객체의 `worldToLocal` 변환을 활용하여 3D 월드 좌표가 Slab 로컬 및 Shape 기준의 XZ 2D 좌표 `(localPos.x, -localPos.z)`로 매핑되도록 처리했습니다.
  - `exportNodes()` 및 `importNodes()` 메서드에서 `slabName` 속성이 정상적으로 저장(직렬화)되고 복원(역직렬화)되도록 코드 구성을 보완했습니다.
- TypeScript 컴파일러(`npx tsc --noEmit`)를 호출하여 문법적인 오류가 없음을 완전히 확인하였습니다.
---
## 2026-06-25 - 백인선 - 요청사항
- src/WebEditor/topology/topologyNode.ts 파일내 TopologyNode 인터페이스중 nodeTypeCode 속성에 대한 값 입력 처리 작업 요청
- src/WebEditor/topology/topologyDataGenerator.ts 파일내 TopologyDataGenerator클래스의 calculateVerticalPath 메서드에 대해서 상생된 토폴로지 노드 타입은 아래중 하나로 처리
  - stair -> nodeTypeCode = 'stair'
  - ramp -> nodeTypeCode = 'ramp'
  - escalator -> nodeTypeCode = 'escalator'
- calculateVerticalPath 외에서 생성되는 토폴로지 노드의 nodeTypeCode 는 'normal'로 지정
- 작업된 nodeTypeCode가 ProjectImporter와 ProjectExporter에 대해서 대응되도록 TopologyManager.exportNodes, TopologyManager.importNodes도 처리되도록 요청

---
## 구현 계획 (nodeTypeCode 값 입력 처리 - 작업자: Claude Code)

### 사전 분석
- `TopologyNode` 인터페이스에는 이미 `nodeTypeCode: string` 속성이 존재함(`topologyNode.ts:30`). 인터페이스 추가 작업은 불필요.
- 생성기가 다루는 `NavMeshConvexRegionData` 타입(`topologyDataGenerator.ts:17`)에는 `nodeTypeCode` 필드가 없음. `calculateVerticalPath`에서 결정한 타입을 `TopologyManager`까지 전달하려면 이 타입에 필드를 추가해야 함.
- `ProjectExporter`(`projectExporter.ts:279`)와 `ProjectImporter`(`projectImporter.ts:937`)는 `exportNodes()`/`importNodes()` 반환 배열을 그대로 통과시킴. 따라서 직렬화/역직렬화 필드 처리는 `TopologyManager.exportNodes`/`importNodes` 내부에서만 추가하면 되며 두 Project 파일 자체는 수정 불필요(검증만 수행).

### 작업 항목
1. **`topologyDataGenerator.ts` - 타입 확장**:
   - `NavMeshConvexRegionData` 타입에 `nodeTypeCode: string` 필드를 추가합니다.
2. **`topologyDataGenerator.ts` - 일반 노드 'normal' 지정**:
   - `calculateConvexPolygon`의 `finalRegions.push({...})`와 `calculateCellRegions`의 `cellRegions.push({...})` 생성부에 `nodeTypeCode: 'normal'`을 추가합니다.
3. **`topologyDataGenerator.ts` - 수직 경로 노드 타입 지정 (`calculateVerticalPath`)**:
   - Stair 루프에서 생성하는 region0/region1/region2 → `nodeTypeCode: 'stair'`
   - Ramp 루프에서 생성하는 region0/region1/region2 → `nodeTypeCode: 'ramp'`
   - Escalator 루프에서 생성하는 체인 노드 → `nodeTypeCode: 'escalator'`
4. **`topologyManager.ts` - 노드 생성부 매핑**:
   - `generate()` 및 `generateCell()`의 `this.nodes.set(...)` 노드 객체 생성부에 `nodeTypeCode: region.nodeTypeCode` (값이 없을 경우 `'normal'`)를 추가합니다.
5. **`topologyManager.ts` - 직렬화 처리**:
   - `exportNodes()` 반환 객체에 `nodeTypeCode: node.nodeTypeCode`를 추가합니다.
   - `importNodes()` 노드 복원부에 `nodeTypeCode: nodeData.nodeTypeCode || 'normal'`을 추가합니다.
6. **`projectExporter.ts` / `projectImporter.ts` - 통과 확인**:
   - 두 파일은 배열을 통째로 전달하므로 수정이 필요 없음을 최종 확인합니다.
7. **빌드 검증**:
   - `cmd.exe /c npx tsc --noEmit`으로 타입/컴파일 오류가 없는지 검증합니다.

### 진행 상황
- [x] 구현 계획 수립
- [x] topologyDataGenerator.ts 수정 (타입 확장 + normal/stair/ramp/escalator 지정)
- [x] topologyManager.ts 수정 (노드 생성 매핑 + 직렬화)
- [x] projectExporter/importer 통과 확인
- [x] npx tsc --noEmit 컴파일 검증 통과

## 구현 결과 (nodeTypeCode 값 입력 처리 - 작업자: Claude Code)
- **[topologyDataGenerator.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/topology/topologyDataGenerator.ts)** 파일에서:
  - `NavMeshConvexRegionData` 타입에 `nodeTypeCode: string` 필드를 추가하여, 생성기에서 결정한 노드 유형을 `TopologyManager`까지 전달할 수 있는 통로를 마련했습니다.
  - `calculateConvexPolygon`(Convex 병합 방식)과 `calculateCellRegions`(Cell Grid 방식)에서 생성하는 바닥 영역에 `nodeTypeCode: 'normal'`을 지정했습니다.
  - `calculateVerticalPath` 내에서 Stair 루프의 region0/1/2에는 `'stair'`, Ramp 루프의 region0/1/2에는 `'ramp'`, Escalator 체인 노드에는 `'escalator'`를 각각 지정했습니다.
- **[topologyManager.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/topology/topologyManager.ts)** 파일에서:
  - `generate()` 및 `generateCell()`의 노드 생성부에서 `nodeTypeCode: region.nodeTypeCode || 'normal'`을 매핑하여 각 `TopologyNode`에 유형 코드가 채워지도록 했습니다.
  - `exportNodes()`에 `nodeTypeCode`를 직렬화 대상으로 추가하고, `importNodes()`에서는 `nodeData.nodeTypeCode || 'normal'`로 역직렬화하여 하위 호환(과거 데이터에 필드가 없는 경우)을 보장했습니다.
- **[projectExporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectExporter.ts)** / **[projectImporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectImporter.ts)**:
  - 두 파일은 `topologyManager.exportNodes()`의 반환 배열을 `topologyNodes`로 통째로 저장하고, 로드 시 `topologyManager.importNodes()`로 그대로 전달하는 구조입니다. 필드 단위 처리가 `TopologyManager` 내부에서 완결되므로 두 Project 파일은 수정이 불필요함을 확인했습니다.
- **테스트 결과**: `cmd.exe /c npx tsc --noEmit` 실행 결과 출력 없이 정상 종료되어 타입/컴파일 오류가 없음을 확인했습니다.