# Phase 7 계획 — webbuilder 토폴로지 연동 (4단계)

> planner subagent 산출물 (2026-07-05). `/phase-run 7` 실행 기록. planner가 workplans_webbuilder 문서 16종을 직접 읽고 데이터 계약을 추출해 인라인함.

## 공유 설계 결정 (모든 태스크가 따를 계약)

**A. webbuilder 토폴로지 노드 export 포맷** (`topologyexportimport.md`의 `exportNodes()` + 이후 이력에서 추가된 `floorName`/`slabName`/`nodeTypeCode` 필드, gltf `extras.topologyNodes`로 직렬화):

```json
{
  "id": "uuid",
  "displayName": "노드 표시명",
  "worldPosition": { "x": 0, "y": 0.2, "z": 0 },
  "metadata": {},
  "isExit": false,
  "floorName": "층 이름",
  "slabName": "슬래브 이름",
  "nodeTypeCode": "normal | stair | ramp | escalator | exit",
  "neighborIds": ["uuid", "..."]
}
```
- **링크는 별도 엔티티가 아니라 `neighborIds`로 표현**된다(순환참조 방지 직렬화). 방향성: 두 노드가 서로를 이웃으로 가지면 `both(↔)`, 한쪽만이면 `one-way(→)` (TopologyPropertyPanel.md).
- **수직 연결**(topologyplan.md): Stair/Ramp/Escalator 1개당 노드 3개 체인 — p0(하층 진입), p1(중점), p2(상층 진출). p0/p2는 같은 높이(Y오차 p0≤0.1, p2≤0.2, escalator≤0.5)의 바닥 노드 중 **폴리곤 외곽선 투영 최단거리** 노드와 양방향 연결. `nodeTypeCode`는 stair/ramp/escalator.
- **층 매핑**: 노드 y가 `floor.position.y ~ floor.position.y + FloorHeight` 범위면 그 층의 `floorName` 부여.
- **생성 방식** 3종: NavMesh convex 병합(recast-navigation), Cell/Grid, 수동 생성(Y +0.2m 보정).
- **경로 탐색**: A* — 이웃 그래프 + `worldPosition` 유클리드 거리 cost/휴리스틱 (`topologyPathFinder.ts`, Summary.md §8).
- **좌표계**: three.js Y-up. XZ평면 = 평면도, Y = 높이. 우리 평면 좌표 매핑은 **plan.x = world.x, plan.y = −world.z**.

**B. SOP 그래프 연동 방식 — 신규 NodeType 추가하지 않음.** `sop_task` + `taskKind:"patrol"`의 신규 템플릿 `tpl-sop-patrol`을 SOP 그룹에 추가한다. 근거: ① NodeType 유니온 변경은 normalize/validate/compile/포트 호환/노드 렌더 전반에 파급, ② sop_task는 이미 buildMissions→RuntimeMission→실행기 상태 전이가 완비되어 "패트롤 = 임무"라는 의미와 정확히 일치, ③ 기존 `taskKind:"checklist"` 선례. 패트롤 속성 계약:

```ts
defaultProperties: {
  title: "", assigneeRole: "로봇개", dueMinutes: 30, instructions: "",
  taskKind: "patrol",
  topologySetId: "",        // TopologySet.setId
  startNodeId: "",          // 토폴로지 노드 id
  endNodeId: "",
  checkpointNodeIds: [],    // 점검 포인트 노드 id 배열
}
// ports: tpl-sop-task와 동일 (trigger_in: execution_flow(required) / mission_out: mission / status_out: mission_status)
```

**C. 신규 npm 의존성 없음.** recast-navigation은 webbuilder(생산측) 도구이고, 본 도구는 export된 노드/링크 JSON을 소비만 한다. A*는 순수 TS 자체 구현.

**D. 샘플 데이터 가정**: `floorName` = 우리 FLOOR 코드(`B01B01`/`F01F01`/`F02F02`), `slabName` = 공간 기본키(spaceId)로 매핑해 저작(분석 문서에 가정 명기).

---

### Task T1: webbuilder 토폴로지 분석 문서 [PARALLEL]
- 목표: 합격 기준 1 충족 — 16개 workplans 문서를 분석해 정리 문서 작성.
- 대상 파일 (신규):
  - `docs/topology/00_overview.md` — 토폴로지 개념·목적(길찾기), webbuilder 기능 지형도(생성/선택/연결/해제/삭제/목록/속성창/경로테스트/임포트·익스포트)
  - `docs/topology/01_webbuilder_analysis.md` — 노드 데이터 구조(계약 A 9필드 표), 생성 방식 3종, 수직 연결 알고리즘, 층/슬래브 매핑 규칙, export/import 포맷(gltf extras `topologyNodes`), A* 경로 탐색, POI 포맷과 slabTypeCode 참고
  - `docs/topology/02_schema_mapping.md` — 본 프로젝트 매핑 설계: 좌표 변환(plan.y=−world.z), floorName↔FLOOR 코드·slabName↔spaceId 가정, TopologySet 컨테이너 도입 이유, SOP 연동 방식(계약 B) 결정 근거
- 완료 기준: 3개 문서 존재, 원본 문서 경로 인용, 계약 A의 JSON 포맷·수직 연결 규칙·A* 방식이 표/코드블록으로 정리. 코드 변경 없음.

### Task T2: 토폴로지 도메인 스키마 + 샘플 셋 + 임포트/레지스트리/경로탐색 [PARALLEL]
- 목표: webbuilder export 포맷 호환 타입, 검증용 건물 기반 샘플 토폴로지 셋, JSON 임포트, 조회 레지스트리, A* 경로 탐색 — 순수 도메인 모듈(React/xyflow 무의존).
- 대상 파일 (신규 6 + 수정 1):
  - `app/src/domain/topology/topologyTypes.ts` — `TopologyNodeData`(계약 A 9필드, `nodeTypeCode: string` + `KnownNodeTypeCode` 유니온 별도), `TopologySet { setId, name, siteUfid, source: "sample"|"imported", nodes }`, `TopologyLink { sourceId, targetId, direction: "both"|"one-way", vertical: boolean }`, `toPlanPoint(worldPosition) => {x, y: -z}`
  - `app/src/domain/topology/importTopology.ts` — `parseTopologyNodes(json)`: ① bare 배열 ② `{topologyNodes:[...]}` ③ `{extras:{topologyNodes}}`/`{userData:{topologyNodes}}` 3형태 수용. 필수 필드 검증, 중복 id 거부, 미존재 neighborIds는 경고와 함께 제거. 결과 `{ nodes } | { errors }`
  - `app/src/domain/topology/pathFinder.ts` — `findPath(set, startId, endId): { nodeIds, distanceM } | null` (A*)
  - `app/src/domain/topology/deriveLinks.ts` — neighborIds→링크 도출(상호=both/한쪽=one-way, floorName 다르면 vertical), 중복 쌍 제거
  - `app/src/domain/topology/sample/verificationTopology.ts` — 샘플 셋 `topo-verification-building`(siteUfid B00100000001AULW1): B01B01 6노드(y=−3.3), F01F01 8노드(y=0.2, exit 1), F02F02 6노드(y=4.2). 계단 2세트(B1↔F1, F1↔F2 — 각 p0/p1/p2 체인 + 최인접 바닥 노드 양방향 연결). 점검 포인트 3~4개 `metadata:{checkpoint:true, facilityObjectCode}`. 수동 생성 관례(Y=바닥+0.2). B1↔F1↔F2 왕복 경로 연결 보장.
  - `app/src/domain/topology/registry.ts` + `index.ts` — `getTopologySets/getTopologySet/getTopologyNodes(setId, floorName?)/findTopologyNode/importTopologySet({name, siteUfid?, json})`(localStorage `sop-studio.topology-sets` 영속)/`removeImportedSet`, 로드 시 임포트 셋 복원
  - 수정: `app/src/domain/index.ts` — topology 재수출 (**T2만 수정**)
- 완료 기준: 빌드 통과. `findPath`로 B1→F2 경로가 계단 경유 산출. `parseTopologyNodes` 3형태 수용 + 불량 입력 errors.

### Task T3: 패트롤 노드 템플릿 + 검증 규칙 + 인스펙터 전용 필드 [AFTER: T2]
- 대상 파일 (수정 3 + 신규 1):
  - `app/src/domain/templates/sop.ts` — `tpl-sop-patrol` 추가(계약 B, label "Patrol Route")
  - `app/src/engine/validateGraph.ts` — 규칙 9 "패트롤 토폴로지 참조": (error) topologySetId/startNodeId/endNodeId 미지정·미존재, (error) findPath null, (warning) checkpointNodeIds 미존재 또는 경로 밖
  - 신규 `app/src/studio/panels/inspector/PatrolRouteFields.tsx` — 셋 select, 시작/종료 노드 select(상호 배제), 점검 포인트 체크 목록, findPath 미리보기(노드 체인 + 거리 m)
  - `app/src/studio/panels/PropertyInspector.tsx` — sop_task && taskKind==="patrol"일 때 4개 속성 라우팅(topologySetId 위치에서 렌더, 나머지 키 스킵 — SpaceScopeFields 관례)
- 완료 기준: 빌드 통과. 팔레트에 Patrol Route 표시·배치 가능, 인스펙터 경로 미리보기 갱신, 검증 오류 표시.

### Task T4: 로봇개 패트롤 시나리오 시드 (다섯 번째 도메인 템플릿) [AFTER: T3]
- 대상 파일: 신규 `app/src/domain/seeds/robotPatrol.ts` + 수정 `seedTypes.ts`(SeedDomain에 "robot_patrol") + `seeds/index.ts`(5번째 등록)
- 그래프: Event(patrol_request) → Space Scope(B00100000001AULW1) → Condition → SOP Group("야간 순찰": ① tpl-sop-patrol(topo-verification-building, 시작 F1/종료 F2, 점검 포인트, assigneeRole "로봇개 R-01") ② tpl-sop-checklist) → Notification → Branch → Situation Board. 샘플 EventContext 2건.
- 완료 기준: 빌드 통과. 툴바 5번째 시드 배치, Validate error 0.

### Task T5: 시뮬레이션/실행기 패트롤 경로 반영 [AFTER: T2] (T3·T4·T6과 병렬 — 파일 겹침 없음, 계약 B 준수)
- 대상 파일:
  - `app/src/domain/types.ts` — `RuntimeMission.patrol?: { topologySetId; routeNodeIds; checkpointNodeIds; distanceM }` (optional — 하위 호환)
  - `app/src/engine/runtimeMock.ts` — buildMissions: patrol이면 findPath로 route 계산해 mission.patrol 채움(미해석 시 undefined 무해 통과). buildTimeline: 경로 노드별 "패트롤 이동 — {displayName}" + 점검 포인트 "점검 수행 — {displayName}" 엔트리
  - `app/src/engine/executionTypes.ts` — ExecutionLogKind에 "PATROL_WAYPOINT"/"PATROL_CHECKPOINT"
  - `app/src/engine/executor.ts` — START_MISSION 시 patrol 있으면 route 순서대로 PATROL_WAYPOINT/PATROL_CHECKPOINT 로그
  - 필요 시 `ExecutionLogView.tsx`/`ExecutionLogTable.tsx` — 신규 kind 라벨/스타일 매핑
- 완료 기준: 빌드 통과. 패트롤 임무 시뮬레이션 타임라인 + 실행기 로그에 waypoint/checkpoint 반영. 기존 시드 4종 결과 불변.

### Task T6: 공간 모델 뷰 토폴로지 오버레이 + 임포트 UI [AFTER: T2] (T3·T5와 병렬)
- 대상 파일:
  - `app/src/spatial/SpatialModelPage.tsx` — 토폴로지 셋 select(사이트 일치 셋) + "토폴로지 임포트" 버튼, 층 탭으로 노드 필터(floorName===floorCode)
  - 신규 `app/src/spatial/TopologyImportDialog.tsx` — 이름 + JSON textarea + 파일 선택, importTopologySet, 성공/오류 표시
  - `app/src/spatial/FloorPlanSvg.tsx` — optional topologyNodes/topologyLinks props, toPlanPoint 투영, 링크 선(one-way 방향 표식, vertical 점선 스터브+title), 노드 원(nodeTypeCode별 클래스), PlanSelection에 {kind:"topology"}
  - `app/src/spatial/SpaceDetailPanel.tsx` — 토폴로지 노드 상세(id/displayName/floorName/slabName/nodeTypeCode/isExit/이웃 direction 뱃지/metadata)
  - `app/src/spatial/spatial.css` — .topology-node--*/.topology-link--* (전부 var() 토큰)
- 완료 기준: 빌드 통과. 샘플 셋 오버레이 + 층 전환 갱신 + 계단 타층 연결 점선 식별. JSON 임포트→목록 추가·영속. 기존 선택 동작 회귀 없음.

### Task T7: 통합 마감 — 빌드/회귀 검증 + 기록 [AFTER: T1~T6 전체]
- 대상 파일: `단계별 개발내용.txt`(4단계 조치 내역), 통합 중 발견된 불일치 수정(임의 파일)
- 완료 기준:
  - `cd app && npm run build` 성공(타입 에러 0)
  - 회귀: 기존 시드 4종 로드→Validate→Simulate→실행기, 전자상황판, 공간 모델 뷰 정상
  - 엔드투엔드: 로봇개 시드 로드 → 패트롤 경로 확인 → Validate 통과 → Simulate 타임라인 경로 순회/점검 → 실행기 로그·대시보드 반영 → 공간 모델 뷰 오버레이 확인
  - 신규 UI 하드코딩 hex/rgb 0건
  - Phase 7 체크리스트 4항목 자체 점검 결과 기재

---

**병렬 실행 요약**: T1 ∥ T2 → (T3 ∥ T5 ∥ T6) → T4 → T7. 병렬 태스크 간 파일 겹침 없음 — `domain/index.ts`는 T2 전용, `domain/types.ts`는 T5 전용, `domain/templates/sop.ts`·`PropertyInspector.tsx`는 T3 전용, `spatial/*`은 T6 전용, `seeds/*`는 T4 전용.
