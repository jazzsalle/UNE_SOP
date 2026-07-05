# webbuilder 토폴로지 분석 — 개요

> **원본**: `1. Reference data/workplans_webbuilder/` (TopologyPlans/ 12개 + POI·슬래브 관련 4개, 총 16개 워크플랜 문서)
> **작성일**: 2026-07-05
> **목적**: 개발팀 3D 웹 저작도구(webbuilder)의 토폴로지(내비 메시 기반 노드/링크) 기능을 분석하고, 본 프로젝트(Visual SOP Graph Studio)의 토폴로지 연동 스키마 설계(Phase 7 / 4단계) 근거를 정리한다.

## 1. 토폴로지란 — 개념과 목적

webbuilder의 토폴로지는 **실내 길찾기(pathfinding)를 위한 노드/링크 그래프**다.

- 목적: "길찾기등의 기능을 구현하기 위한 토폴로지 노드, 링크 기능 구현. recast-navigation js를 사용하여 길찾기용 데이터 생성" (`TopologyPlans/topologyplan.md` 서두)
- **노드**: 3D 공간(three.js 월드 좌표) 위의 이동 가능 지점. 바닥(NavMesh 영역/격자 셀/수동 배치)과 수직 이동 시설(계단·경사로·에스컬레이터) 위에 생성된다.
- **링크**: 별도 엔티티가 아니라 각 노드의 **이웃 목록(`neighbors` → 직렬화 시 `neighborIds`)** 으로 표현된다 (`TopologyPlans/topologyexportimport.md`). 상호 참조 여부에 따라 양방향(both)/단방향(one-way)이 판별된다 (`TopologyPlans/TopologyPropertyPanel.md`).
- **경로 탐색**: 이웃 그래프 + 노드 간 유클리드 거리 비용의 A* (`TopologyPlans/TopologyTest.md`).

즉 webbuilder는 토폴로지의 **생산(저작) 도구**이고, 본 프로젝트는 export된 노드/링크 JSON을 **소비**하여 SOP 그래프(로봇개 패트롤 임무 등)와 연동한다.

## 2. 본 분석 문서 구성

| 문서 | 내용 |
|---|---|
| [00_overview.md](./00_overview.md) | (본 문서) 토폴로지 개념·목적, webbuilder 기능 지형도, 원본 문서 목록 |
| [01_webbuilder_analysis.md](./01_webbuilder_analysis.md) | 노드 데이터 구조(9필드), 생성 방식 3종, 수직 연결 알고리즘, 층/슬래브 매핑, export/import 포맷, 방향성 규칙, A* 경로 탐색, POI·slabTypeCode 요약 |
| [02_schema_mapping.md](./02_schema_mapping.md) | 본 프로젝트 매핑 설계 — 좌표 변환, floorName↔FLOOR 코드·slabName↔공간 기본키 가정, TopologySet 컨테이너, SOP 연동 방식(sop_task patrol), 시뮬레이션/실행기 반영 |

## 3. 원본 문서 목록 (16개)

`1. Reference data/workplans_webbuilder/` 하위:

### TopologyPlans/ (12개)

- `Summary.md` — 토폴로지 작업 요약(2026-06-25~26): 항목 1~8 인덱스 + 커밋 이력 + 공통 설계 메모
- `topologyplan.md` — 토폴로지 생성 코어: NavMesh convex 병합, Cell(Grid) 생성, 수직 경로(Stair/Ramp/Escalator), 이웃 연결, floorName/slabName/nodeTypeCode 매핑
- `topologyNodeCreator.md` — 수동 노드 생성기(TopologyNodeCreator) + Undo/Redo
- `TopologyNodeSelect.md` — 노드 선택(클릭/드래그/Shift 토글, InstancedMesh 색상 3단계, 배타 선택 모드)
- `TopologyNodeConnect.md` — 노드 1:1 상호 연결(클릭-클릭)
- `TopologyNodeDisconnect.md` — 노드 연결 초기화(해당 노드의 모든 연결 해제)
- `TopologyNodeDisconnectSingle.md` — 노드 간 단일 연결 해제(클릭-클릭)
- `TopologyNodeDelete.md` — 선택 노드 삭제(Delete 키) + 양방향 엣지 복원 Undo
- `TopologyNodeList.md` — 패널 노드 목록(연결/고립 분류) + 테스트 탭 드롭다운 연계
- `TopologyPropertyPanel.md` — 노드 속성창(출구 노드 Switch, 이웃 목록 both/one-way 뱃지, metadata 메모)
- `TopologyTest.md` — A* 경로 테스트 + 경로 시각화(TubeGeometry/InstancedFlow) + 시작/종료 표식 + 클릭 pick
- `topologyexportimport.md` — 노드 직렬화(neighborIds) 및 gltf extras/userData 라운드트립

### 루트 (4개, 참고 자료)

- `poiexportimport.md` — POI export/import 포맷(id/displayName/position/floorName/slabName/category/metadata/visible/animType) + spaceName→slabName 개명 이력
- `slabTypeCode.md` — SlabData.slabTypeCode 필드(기본 'normal') 추가·유지 처리
- `testpoilistview.md` — 테스트용 POI 목록 팝업(카테고리 그룹, 가시성 토글)
- `testpoimetadata.md` — 테스트용 POI metadata 설정 팝업

## 4. webbuilder 기능 지형도

각 기능이 어느 원본 문서에 근거하는지 매핑한 표. (경로는 `TopologyPlans/` 기준, 루트 문서는 파일명만 표기)

| # | 기능 | 요약 | 근거 문서 |
|---|---|---|---|
| 1 | 노드 생성 — NavMesh 자동 | recast-navigation NavMesh 삼각형을 Convex 폴리곤으로 병합해 영역 중심마다 노드 생성, 맞닿은 영역끼리 이웃 연결 | `topologyplan.md` |
| 2 | 노드 생성 — Cell(Grid) | NavMesh 바운딩을 `_cellInterval` 간격 XZ 격자로 순회, NavMesh 위 격자점마다 노드 생성(다층 지원) | `topologyplan.md` (Cell(Grid) 기반 생성 절) |
| 3 | 노드 생성 — 수동 | '생성' 모드에서 3D 뷰 좌클릭으로 개별 노드 생성(Y +0.2m 보정, 클릭당 Undo 1건) | `topologyNodeCreator.md` |
| 4 | 수직 연결 (Stair/Ramp/Escalator) | 수직 이동 시설 1개당 노드 3개 체인(p0/p1/p2) 생성 후 양끝을 최인접 바닥 노드와 양방향 연결 | `topologyplan.md` (수직 경로 절 3회 개정), `Summary.md` |
| 5 | 노드 선택 | 클릭/드래그 박스/Shift 다중 토글. 기본 파랑→호버 연붉음→선택 진붉음. '선택' 모드에서만 배타 선택 | `TopologyNodeSelect.md`, `Summary.md` §1 |
| 6 | 노드 연결 | 클릭-클릭 1:1 상호 연결(서로의 neighbors에 추가). 중복/자기연결 가드, Undo/Redo(`ConnectTopologyNodeCommand`) | `TopologyNodeConnect.md`, `Summary.md` §4 |
| 7 | 연결 초기화(전체 해제) | 노드 클릭 즉시 그 노드의 나가는+들어오는 엣지 전부 제거(`ClearConnectionTopologyNodeCommand`) | `TopologyNodeDisconnect.md`, `Summary.md` §3 |
| 8 | 연결 해제(단일) | 클릭-클릭으로 두 노드 간 상호 이웃 관계만 제거(`DisconnectTopologyNodeCommand`) | `TopologyNodeDisconnectSingle.md`, `Summary.md` §5 |
| 9 | 노드 삭제 | 선택 노드 Delete 키 제거. 스냅샷(나가는/들어오는 엣지)으로 Undo 시 양방향 복원 | `TopologyNodeDelete.md`, `Summary.md` §2 |
| 10 | 노드 목록 | 패널에 연결된/고립된 노드 목록(displayName, neighbors 유무 분류), 목록↔3D 선택 양방향 동기화 | `TopologyNodeList.md`, `Summary.md` §6·§7 |
| 11 | 속성창 | 단일 노드 선택 시 표출. 출구 노드 Switch(isExit + nodeTypeCode 'exit' 전환/복원), 이웃 목록 both(↔)/one-way(→) 뱃지 + 해제, metadata 메모 저장 | `TopologyPropertyPanel.md` |
| 12 | 경로 테스트 | 시작/종료 노드(드롭다운·3D 클릭 pick) 지정 → A* 탐색 → 경유 노드 목록 + TubeGeometry 경로 + InstancedFlow 흐름 애니메이션(1.5m/s) | `TopologyTest.md`, `Summary.md` §8 |
| 13 | 임포트/익스포트 | `exportNodes()` 직렬화(neighbors→neighborIds) → gltf `extras.topologyNodes`. 로드 시 `gltf.userData.topologyNodes` → `importNodes()` 2패스 복원 | `topologyexportimport.md` |
| 14 | (참고) POI 임포트/익스포트 | POI 배열을 gltf `extras.pois`/`userData.pois`로 라운드트립. slabName 결정 루틴을 토폴로지와 공유(`slabUtil.ts`) | `poiexportimport.md` |
| 15 | (참고) 슬래브 타입 코드 | `SlabData.slabTypeCode`(기본 'normal') — 생성/편집/undo/import·export 전 구간 유실 방지 | `slabTypeCode.md` |
| 16 | (참고) POI 테스트 UI | POI 목록 팝업(카테고리 가시성 토글), POI metadata 설정 팝업 | `testpoilistview.md`, `testpoimetadata.md` |

## 5. 편집 모드 체계 (참고)

webbuilder는 토폴로지 편집을 `setTopologyNodeEditMode(mode)` 단일 진입점으로 통합했다 (`TopologyNodeDisconnect.md`, `Summary.md` 공통 설계 메모). 모드 값: `'none' | 'select' | 'disconnect' | 'connect' | 'disconnect_edge' | 'pathPick'`. 모드 활성 시 토폴로지 노드만 선택 가능한 배타 모드(`ObjectSelector.setExclusiveSelectable`)로 동작한다. 본 프로젝트는 소비측이므로 편집 모드는 구현 대상이 아니며, 데이터 계약(01 문서)과 방향성/수직 연결 의미론만 가져온다.
