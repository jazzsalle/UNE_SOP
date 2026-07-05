/**
 * SpatialModelPage — 공간 모델 검증 뷰 (Phase 6 Task T7).
 * 「실내공간정보 구축 작업규정」 기반 공간 스키마(domain/spatial 레지스트리)를
 * 사이트 셀렉트 + 층 탭 + 좌(SVG 층 평면)/우(선택 상세) 레이아웃으로 점검한다.
 * Phase 7: 토폴로지 오버레이 — 셋 선택 시 현재 층 노드/링크(deriveLinks 파생)를
 * FloorPlanSvg에 겹쳐 그리고, webbuilder export JSON 임포트(TopologyImportDialog)를 지원한다.
 * Phase 9(T5): "2D 평면 | 3D 뷰" 토글 — 3D 모드는 SpaceViewer3D(순수 WebGL)로 전환하고,
 * subscribeTopologySets 구독으로 시나리오 실행기가 생성한 셋도 셀렉트에 즉시 반영한다.
 * 층 탭은 2D/3D 공용 — 3D 모드에서는 선택 층만 렌더하고, 3D 전용 "전체 건물" 탭을
 * 층 탭 행에 추가해 전 층(explode)을 본다. 2D는 층 평면 개념이라 전체 탭이 없으며
 * 2D로 전환하면 기존 floorCode 층 탭 동작으로 자연 복귀한다(단순한 쪽 선택).
 * 데이터는 정적 레지스트리 조회 전용 — SOPGraph/React Flow 편집 상태와 무관하다.
 */
import { useEffect, useMemo, useState } from "react";
import {
  divisionLabel,
  getFacilities,
  getFloors,
  getSpaces,
  getSpatialSites,
} from "../domain/spatial";
import {
  deriveLinks,
  getTopologySets,
  removeImportedSet,
  subscribeTopologySets,
} from "../domain/topology";
import type { TopologyLink, TopologyNodeData, TopologySet } from "../domain/topology";
import FloorPlanSvg, { type PlanSelection } from "./FloorPlanSvg";
import SpaceDetailPanel from "./SpaceDetailPanel";
import SpaceViewer3D from "./SpaceViewer3D";
import TopologyImportDialog from "./TopologyImportDialog";
import "./spatial.css";

/** division 코드 → 색 매핑 CSS 클래스(spatial.css `.spatial-division--*`). */
function divisionClass(division: string): string {
  return `spatial-division--${division.toLowerCase()}`;
}

/** 사이트에 노출할 토폴로지 셋 — siteUfid 일치 셋 + 임포트 셋(사이트 미상 포함 전부). */
function setsForSite(siteUfid: string): TopologySet[] {
  return getTopologySets().filter(
    (set) => set.source === "imported" || set.siteUfid === siteUfid,
  );
}

/** FloorPlanSvg에 전달할 층별 오버레이 조각 — 노드/링크/타층 상대 노드. */
interface FloorTopology {
  nodes: TopologyNodeData[];
  links: TopologyLink[];
  offFloorNodes: TopologyNodeData[];
}

const EMPTY_FLOOR_TOPOLOGY: FloorTopology = { nodes: [], links: [], offFloorNodes: [] };

/**
 * 셋 전체에서 현재 층 오버레이를 계산한다.
 * 링크는 양끝이 현재 층인 것 + 한쪽만 현재 층인 vertical(계단 등 층간 연결)만 남기고,
 * vertical의 타층 끝 노드는 점선 스터브 방향/툴팁 계산용으로 별도 전달한다.
 */
function buildFloorTopology(set: TopologySet | null, floorCode: string): FloorTopology {
  if (!set) {
    return EMPTY_FLOOR_TOPOLOGY;
  }
  const nodes = set.nodes.filter((node) => node.floorName === floorCode);
  const onFloor = new Set(nodes.map((node) => node.id));
  const links = deriveLinks(set.nodes).filter((link) => {
    const sourceOn = onFloor.has(link.sourceId);
    const targetOn = onFloor.has(link.targetId);
    return (sourceOn && targetOn) || (link.vertical && sourceOn !== targetOn);
  });
  const nodeById = new Map(set.nodes.map((node) => [node.id, node]));
  const offFloorNodes: TopologyNodeData[] = [];
  for (const link of links) {
    for (const endId of [link.sourceId, link.targetId]) {
      if (!onFloor.has(endId)) {
        const node = nodeById.get(endId);
        if (node && !offFloorNodes.some((existing) => existing.id === node.id)) {
          offFloorNodes.push(node);
        }
      }
    }
  }
  return { nodes, links, offFloorNodes };
}

function SpatialModelPage() {
  // 등록 사이트 목록 — 정적 레지스트리라 최초 1회만 조회
  const sites = useMemo(() => getSpatialSites(), []);

  // 선택 사이트 UFID (기본: 첫 사이트 = 검증용 건물)
  const [siteUfid, setSiteUfid] = useState<string>(sites[0]?.ufid ?? "");
  // 선택 층 FLOOR 코드
  const [floorCode, setFloorCode] = useState<string>(
    () => getFloors(sites[0]?.ufid ?? "")[0]?.floorCode ?? "",
  );
  // 평면에서 선택한 공간/시설물/토폴로지 노드
  const [selection, setSelection] = useState<PlanSelection | null>(null);
  // 토폴로지 오버레이 셋 id — "" = 표시 안 함
  const [topologySetId, setTopologySetId] = useState<string>("");
  // 임포트 다이얼로그 열림 여부
  const [importOpen, setImportOpen] = useState(false);
  // 레지스트리 변경(임포트/생성/삭제) 재조회 트리거 — 레지스트리는 모듈 상태라 버전으로 무효화
  const [topoVersion, setTopoVersion] = useState(0);
  // 평면(2D)/입체(3D) 뷰 모드 — 3D는 SpaceViewer3D(순수 WebGL) 렌더
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  // 3D 전용 "전체 건물" 모드 — true면 전 층 explode 렌더(2D에서는 무시됨)
  const [wholeBuilding, setWholeBuilding] = useState(false);

  // 레지스트리 구독 — 시나리오 실행기(registerGeneratedSet) 등 외부 변경도 즉시 반영 (Phase 9)
  useEffect(
    () => subscribeTopologySets(() => setTopoVersion((version) => version + 1)),
    [],
  );

  const site = sites.find((s) => s.ufid === siteUfid) ?? null;
  const floors = useMemo(() => getFloors(siteUfid), [siteUfid]);
  const spaces = useMemo(() => getSpaces(siteUfid, floorCode), [siteUfid, floorCode]);

  // 선택 층의 시설물 — 시설물은 층 필드가 없어 소속 공간의 층으로 필터
  const facilities = useMemo(() => {
    const spaceIds = new Set(spaces.map((space) => space.primaryKey));
    return getFacilities(siteUfid).filter((facility) => spaceIds.has(facility.spaceId));
  }, [siteUfid, spaces]);

  // 현재 층에 등장하는 division 목록(범례용) — 등장 순서 유지 중복 제거
  const legendDivisions = useMemo(
    () => [...new Set(spaces.map((space) => space.division))],
    [spaces],
  );

  // 현재 사이트에 노출할 토폴로지 셋(샘플=사이트 일치 / 임포트=전부) — 임포트·삭제 시 재조회
  const topologySets = useMemo(() => setsForSite(siteUfid), [siteUfid, topoVersion]);
  const selectedTopologySet = topologySets.find((set) => set.setId === topologySetId) ?? null;

  // 현재 층 오버레이 조각 — 노드/링크/타층 상대 노드
  const floorTopology = useMemo(
    () => buildFloorTopology(selectedTopologySet, floorCode),
    [selectedTopologySet, floorCode],
  );

  /** 사이트 변경 — 층을 새 사이트의 첫 층으로 재설정하고 선택·비노출 토폴로지 셋을 해제한다. */
  const handleSiteChange = (ufid: string) => {
    setSiteUfid(ufid);
    setFloorCode(getFloors(ufid)[0]?.floorCode ?? "");
    setSelection(null);
    setWholeBuilding(false);
    if (!setsForSite(ufid).some((set) => set.setId === topologySetId)) {
      setTopologySetId("");
    }
  };

  /** 층 변경 — 선택을 해제하고 전체 건물 모드도 벗어난다(단일 층 3D 필터). */
  const handleFloorChange = (code: string) => {
    setFloorCode(code);
    setSelection(null);
    setWholeBuilding(false);
  };

  /** 토폴로지 셋 변경 — 이전 셋의 노드 선택은 무효라 topology 선택만 해제한다. */
  const handleTopologySetChange = (setId: string) => {
    setTopologySetId(setId);
    if (selection?.kind === "topology") {
      setSelection(null);
    }
  };

  /** 임포트 셋 삭제 — 레지스트리에서 제거 후 선택 해제(목록 갱신은 구독이 처리). */
  const handleRemoveImportedSet = () => {
    if (!selectedTopologySet || selectedTopologySet.source !== "imported") {
      return;
    }
    removeImportedSet(selectedTopologySet.setId);
    setTopologySetId("");
    if (selection?.kind === "topology") {
      setSelection(null);
    }
  };

  /** 임포트 성공 — 임포트된 셋 자동 선택 + 다이얼로그 닫기(목록 갱신은 구독이 처리). */
  const handleImported = (set: TopologySet) => {
    setTopologySetId(set.setId);
    if (selection?.kind === "topology") {
      setSelection(null);
    }
    setImportOpen(false);
  };

  return (
    <section className="spatial-page">
      <header className="spatial-page__header">
        <h2 className="spatial-page__title typo-title-sm font-bold">
          공간 모델 — 표준 공간 스키마 검증
        </h2>
        <p className="spatial-page__subtitle typo-text-sm">
          실내공간정보 구축 작업규정(별표 2·3·5·6) 기반 건물/층/공간/시설물 데이터를
          층 평면으로 점검합니다
        </p>
      </header>

      {/* 사이트 셀렉트 + 층 탭 + 토폴로지 셋 셀렉트 툴바 */}
      <div className="spatial-page__toolbar">
        <label className="spatial-page__site-label typo-text-sm" htmlFor="spatial-site-select">
          사이트
        </label>
        <select
          id="spatial-site-select"
          className="spatial-page__site-select typo-text-md"
          value={siteUfid}
          onChange={(event) => handleSiteChange(event.target.value)}
        >
          {sites.map((s) => (
            <option key={s.ufid} value={s.ufid}>
              {s.name} ({s.ufid})
            </option>
          ))}
        </select>

        {/* 층 탭 — 선택 사이트의 FLOOR 코드 목록. 3D 모드에서는 선택 층만 렌더하며,
            전 층을 explode로 보는 3D 전용 "전체 건물" 탭이 추가된다 */}
        <div className="spatial-page__floor-tabs" role="tablist" aria-label="층 선택">
          {floors.map((floor) => {
            const active =
              floor.floorCode === floorCode && !(viewMode === "3d" && wholeBuilding);
            return (
              <button
                key={floor.floorCode}
                type="button"
                role="tab"
                aria-selected={active}
                className={`spatial-page__floor-tab typo-text-md${
                  active ? " spatial-page__floor-tab--active font-bold" : ""
                }`}
                onClick={() => handleFloorChange(floor.floorCode)}
              >
                {floor.name} ({floor.floorCode})
              </button>
            );
          })}
          {viewMode === "3d" && (
            <button
              type="button"
              role="tab"
              aria-selected={wholeBuilding}
              className={`spatial-page__floor-tab typo-text-md${
                wholeBuilding ? " spatial-page__floor-tab--active font-bold" : ""
              }`}
              onClick={() => setWholeBuilding(true)}
            >
              전체 건물
            </button>
          )}
        </div>

        {/* 2D 평면 | 3D 뷰 토글 (Phase 9 T5) — 3D는 순수 WebGL SpaceViewer3D */}
        <div
          className="spatial-page__view-toggle"
          role="group"
          aria-label="뷰 모드"
          data-tutorial-id="spatial-3d-toggle"
        >
          {(
            [
              { mode: "2d", label: "2D 평면" },
              { mode: "3d", label: "3D 뷰" },
            ] as const
          ).map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              aria-pressed={viewMode === mode}
              className={`spatial-page__view-btn typo-text-sm${
                viewMode === mode ? " spatial-page__view-btn--active font-bold" : ""
              }`}
              onClick={() => setViewMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 토폴로지 오버레이 셋 선택 + 임포트/삭제 (Phase 7) */}
        <div className="spatial-page__topo-group">
          <label className="spatial-page__site-label typo-text-sm" htmlFor="spatial-topo-select">
            토폴로지
          </label>
          <select
            id="spatial-topo-select"
            data-tutorial-id="spatial-topo-select"
            className="spatial-page__site-select typo-text-md"
            value={topologySetId}
            onChange={(event) => handleTopologySetChange(event.target.value)}
          >
            <option value="">표시 안 함</option>
            {topologySets.map((set) => (
              <option key={set.setId} value={set.setId}>
                {set.name}
                {set.source === "imported" ? " (임포트)" : ""}
              </option>
            ))}
          </select>
          {selectedTopologySet?.source === "imported" && (
            <button
              type="button"
              className="spatial-page__topo-btn spatial-page__topo-btn--danger typo-text-sm"
              onClick={handleRemoveImportedSet}
            >
              셋 삭제
            </button>
          )}
          <button
            type="button"
            className="spatial-page__topo-btn typo-text-sm"
            onClick={() => setImportOpen(true)}
          >
            토폴로지 임포트
          </button>
        </div>
      </div>

      <div className="spatial-page__body">
        {/* 좌: 2D = SVG 층 평면 + division 범례 / 3D = WebGL 뷰어(층 표시는 뷰어 내부 체크박스) */}
        <div className="spatial-page__plan-area">
          {viewMode === "2d" ? (
            <>
              <p className="spatial-page__plan-note typo-text-sm">
                {site
                  ? `${site.name} · 공간 ${spaces.length}개 · 시설물 ${facilities.length}개${
                      selectedTopologySet ? ` · 토폴로지 노드 ${floorTopology.nodes.length}개` : ""
                    } — 폴리곤/마커를 클릭해 상세를 확인하세요`
                  : "등록된 사이트가 없습니다"}
              </p>
              <FloorPlanSvg
                spaces={spaces}
                facilities={facilities}
                selection={selection}
                onSelect={setSelection}
                topologyNodes={floorTopology.nodes}
                topologyLinks={floorTopology.links}
                offFloorNodes={floorTopology.offFloorNodes}
              />
              {/* division 채움색 범례 — 현재 층에 등장하는 용도만 표시 */}
              {legendDivisions.length > 0 && (
                <ul className="spatial-legend">
                  {legendDivisions.map((division) => (
                    <li key={division} className="spatial-legend__item typo-text-sm">
                      <span className={`spatial-legend__swatch ${divisionClass(division)}`} />
                      {division} {divisionLabel(division) ?? ""}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <p className="spatial-page__plan-note typo-text-sm">
                {site
                  ? `${site.name} · 3D 뷰 (${
                      wholeBuilding
                        ? "전체 건물"
                        : floors.find((floor) => floor.floorCode === floorCode)?.name ??
                          floorCode
                    })${
                      selectedTopologySet ? ` · 토폴로지 「${selectedTopologySet.name}」` : ""
                    } — 층 슬래브/공간 프리즘/시설물·토폴로지 마커를 입체로 점검하세요`
                  : "등록된 사이트가 없습니다"}
              </p>
              <SpaceViewer3D
                siteUfid={siteUfid}
                topologySetId={topologySetId || null}
                floorCode={wholeBuilding ? null : floorCode}
              />
            </>
          )}
        </div>

        {/* 우: 선택 공간/시설물/토폴로지 노드 상세 */}
        <SpaceDetailPanel selection={selection} topologySetId={topologySetId || undefined} />
      </div>

      {/* 토폴로지 임포트 다이얼로그 — 닫힘 시 언마운트해 폼 상태를 초기화 */}
      {importOpen && (
        <TopologyImportDialog
          siteUfid={siteUfid}
          onClose={() => setImportOpen(false)}
          onImported={handleImported}
        />
      )}
    </section>
  );
}

export default SpatialModelPage;
