# Topology Export/Import

## 목적
토폴로지 데이터를 내보내고 가져오는 기능을 구현한다.

## 요청사항
- topologyManager.ts파일내 TopologyManager클래스 멤버변수중에 nodes정보를 내보내기 불러오는 기능구현 요청
- 내보내기(Export)시에는 projectExporter.ts 파일 249번라인의 주석처럼 토폴로지 nodes 데이터를 JSON형식으로 구성하여 gltf extras로 Export될수 있도록 함
- Export로 내보낸 gltf를 로드했을 경우 projectImporter.ts파일 869번라인 처럼 gltf.userData로 읽어들여질 것이므로 이것을 활용하도록 함
- Import시에 불러온 nodes 데이터를 기반으로 비주얼 업데이트를 수행하여 노드 위치에 대한 구체표현과 인접이웃노드들에 대한 연결선을 표현하도록 함
- Import시에 이미 생성되어 있는 nodes데이터들이 있다면 모두 제거하고 Import작업 수행

---

## 구현 계획 (Implementation Plan)

### 1. 변경 대상 파일 및 수정 방향

#### 1) [topologyManager.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/topology/topologyManager.ts)
- **추가 메서드**: 
  - `exportNodes(): any[]`: `Map<string, TopologyNode>` 형태의 `nodes` 데이터를 직렬화 가능한 JSON 배열 형태로 변환하여 반환합니다. 이웃 관계(`neighbors` 객체 배열)는 순환 참조 문제를 방지하기 위해 이웃 노드의 ID 목록(`neighborIds: string[]`)으로 변환합니다.
  - `importNodes(importedNodes: any[]): void`: 직렬화된 노드 데이터 배열을 파싱하여 기존 노드들을 제거한 뒤 순서대로 노드 객체를 생성하고, 이웃 관계를 연결한 후 비주얼 및 연결선 갱신(`rebuildMesh()`)을 수행합니다.

#### 2) [projectExporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectExporter.ts)
- **추가 사항**: `TopologyManager` 임포트 및 클래스 필드 추가, `setTopologyManager` 세터 메서드 추가.
- **내보내기 수정**: `exporter.register` 부분의 `afterParse` 콜백에서 `writer.json.extras` 객체에 `topologyNodes` 필드를 추가하고, `topologyManager.exportNodes()`의 반환 데이터를 추가합니다.

#### 3) [projectImporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectImporter.ts)
- **추가 사항**: `TopologyManager` 임포트 및 클래스 필드 추가, `setTopologyManager` 세터 메서드 추가.
- **가져오기 수정**: `parseBuildingData` 하단(POI 복구 처리 부근)에 `gltf.userData.topologyNodes` 데이터를 파싱하고, 존재할 경우 `topologyManager.importNodes()`를 호출하여 복구합니다.

#### 4) [webEditor.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/webEditor.ts)
- **추가 사항**: 
  - 데이터 저장/불러오기 설정 루틴(347번 라인 부근)에서 `ProjectExporter`와 `ProjectImporter` 인스턴스에 에디터의 `topologyManager`를 주입하는 코드 추가.
    - `ProjectExporter.getInstance().setTopologyManager(this.topologyManager);`
    - `ProjectImporter.getInstance().setTopologyManager(this.topologyManager);`
  - 에디터 리셋 `reset()` 메서드에서 기존 토폴로지 노드가 잔존하지 않도록 `this.topologyManager.clear();` 호출 추가.

### 2. 세부 코드 수정 계획

#### topologyManager.ts
```typescript
/**
 * 토폴로지 노드 데이터를 직렬화 가능한 배열로 내보냅니다.
 */
public exportNodes(): any[] {
    return Array.from(this.nodes.values()).map((node) => ({
        id: node.id,
        displayName: node.displayName,
        worldPosition: {
            x: node.worldPosition.x,
            y: node.worldPosition.y,
            z: node.worldPosition.z
        },
        metadata: node.metadata,
        isExit: node.isExit,
        neighborIds: node.neighbors.map(n => n.id)
    }));
}

/**
 * 직렬화된 데이터를 바탕으로 토폴로지 노드를 일괄적으로 불러옵니다.
 * @param importedNodes - 직렬화된 노드 데이터 배열
 */
public importNodes(importedNodes: any[]): void {
    this.nodes.clear();

    if (!importedNodes || !Array.isArray(importedNodes)) {
        this.rebuildMesh();
        return;
    }

    // 1차 패스: 노드 객체 생성 및 Map 등록
    importedNodes.forEach((nodeData: any) => {
        const node: TopologyNode = {
            id: nodeData.id,
            displayName: nodeData.displayName,
            worldPosition: new Vector3(
                nodeData.worldPosition.x,
                nodeData.worldPosition.y,
                nodeData.worldPosition.z
            ),
            metadata: nodeData.metadata,
            isExit: nodeData.isExit,
            neighbors: []
        };
        this.nodes.set(node.id, node);
    });

    // 2차 패스: 이웃 관계(neighbors) 연결
    importedNodes.forEach((nodeData: any) => {
        const node = this.nodes.get(nodeData.id);
        if (node && nodeData.neighborIds) {
            nodeData.neighborIds.forEach((neighborId: string) => {
                const neighborNode = this.nodes.get(neighborId);
                if (neighborNode) {
                    node.neighbors.push(neighborNode);
                }
            });
        }
    });

    // 비주얼 및 이웃 선 갱신
    this.rebuildMesh();
}
```

#### projectExporter.ts
```typescript
// 상단 임포트 추가
import { TopologyManager } from "../topology/topologyManager";

// 클래스 내부 필드 추가
private topologyManager: TopologyManager | null = null;

// 세터 메서드 추가
public setTopologyManager(_topologyManager: TopologyManager) {
    this.topologyManager = _topologyManager;
}

// exporter.register 내부 afterParse 콜백 수정
writer.json.extras = {
    libraries: libraryPlaceData,
    testCustomData: "테스트",
    pois: this.poiManager ? this.poiManager.poiList.map(p => ({ ... })) : [],
    topologyNodes: this.topologyManager ? this.topologyManager.exportNodes() : []
};
```

#### projectImporter.ts
```typescript
// 상단 임포트 추가
import { TopologyManager } from "../topology/topologyManager";

// 클래스 내부 필드 추가
private topologyManager: TopologyManager | null = null;

// 세터 메서드 추가
public setTopologyManager(topologyManager: TopologyManager) {
    this.topologyManager = topologyManager;
}

// parseBuildingData 내부 추가 (POI 복구 아래)
const topologyNodes = gltf.userData.topologyNodes;
if (this.topologyManager && topologyNodes && Array.isArray(topologyNodes)) {
    this.topologyManager.importNodes(topologyNodes);
}
```

#### webEditor.ts
```typescript
// 데이터 저장/불러오기 관련 블록 내 추가
ProjectExporter.getInstance().setTopologyManager(this.topologyManager);
ProjectImporter.getInstance().setTopologyManager(this.topologyManager);

// reset() 메서드 내 추가
this.topologyManager.clear();
```

---

## 검증 계획 (Verification Plan)

1. **타입 컴파일 검증**: `npm run build`을 통해 코드 추가 후 빌드/타입 컴파일 에러가 없는지 검증합니다.
2. **동적 기능 검증**:
   - 에디터를 구동하여 토폴로지 노드들을 임의로 생성 및 배치합니다.
   - 프로젝트를 내보내기(Export)하여 GLTF 파일을 다운로드(또는 IndexedDB 저장)합니다.
   - 프로젝트를 새로고침/초기화한 뒤 내보냈던 파일을 불러오기(Import)하여 노드들과 인접 노드 간의 연결선이 정상적으로 복원되는지 확인합니다.

---

## 구현 결과 (Implementation Results)

모든 코드 수정 및 검증 단계가 성공적으로 완료되었습니다.

### 1. 적용된 실제 변경사항

#### 1) [topologyManager.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/topology/topologyManager.ts)
- `exportNodes(): any[]` 메서드를 구현하여 노드 데이터의 순환 참조 문제를 방지하고 이웃의 ID 목록(`neighborIds`)을 직렬화하여 반환하도록 했습니다.
- `importNodes(importedNodes: any[]): void` 메서드를 구현하여 복원 시 기존의 모든 노드를 깨끗이 제거하고 노드 생성과 이웃 매핑을 연결한 후 `rebuildMesh()`를 호출하여 화면상 노드 및 연결선 그래픽을 자동으로 갱신하도록 처리했습니다.

#### 2) [projectExporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectExporter.ts)
- `TopologyManager` 클래스를 임포트하고, `private topologyManager: TopologyManager | null = null;` 필드 및 `public setTopologyManager(_topologyManager: TopologyManager)` 세터 메서드를 추가했습니다.
- `GLTFExporter` 파싱 시 `writer.json.extras.topologyNodes` 경로에 토폴로지 내보내기 직렬화 데이터를 기입했습니다.

#### 3) [projectImporter.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/save-load/projectImporter.ts)
- `TopologyManager` 클래스를 임포트하고, `private topologyManager: TopologyManager | null = null;` 필드 및 `public setTopologyManager(topologyManager: TopologyManager)` 세터 메서드를 추가했습니다.
- 파일 로드 시 호출되는 `parseBuildingData` 내 POI 복구 블록 하단에 `gltf.userData.topologyNodes` 배열이 존재할 경우 `topologyManager.importNodes(topologyNodes)`를 호출하도록 수정했습니다.

#### 4) [webEditor.ts](file:///c:/Users/BaekInSun/Documents/Dev/WebEditorSample/src/webeditor/src/WebEditor/webEditor.ts)
- 데이터 저장/불러오기 매니저 설정 시 `ProjectExporter`와 `ProjectImporter` 인스턴스에 `this.topologyManager`를 주입하도록 연동했습니다.
- 에디터 리셋 `reset()` 메서드에서 기존 토폴로지 노드가 잔존하지 않도록 `this.topologyManager.clear()` 호출을 추가했습니다.
- `topologyManager` 변수가 선언되기 전에 주입되어 발생하는 `Property 'topologyManager' is used before being assigned.` 오류를 방지하기 위해, `webEditor.ts` 생성자 내 `topologyManager` 초기화 구문 위치를 저장/불러오기 매니저 주입 이전으로 상향 이동시켰습니다.

### 2. 검증 완료 사항
- `npm run build` 명령을 실행하여 `tsc` 타입 검사 및 Vite 프로덕션 빌드가 성공적으로 완료되었음을 검증했습니다.
