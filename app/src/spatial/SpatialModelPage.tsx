/**
 * SpatialModelPage — 공간 모델 검증 뷰 (Phase 6 Task T7).
 * 「실내공간정보 구축 작업규정」 기반 공간 스키마(domain/spatial 레지스트리)를
 * 사이트 셀렉트 + 층 탭 + 좌(SVG 층 평면)/우(선택 상세) 레이아웃으로 점검한다.
 * 데이터는 정적 레지스트리 조회 전용 — SOPGraph/React Flow 편집 상태와 무관하다.
 */
import { useMemo, useState } from "react";
import {
  divisionLabel,
  getFacilities,
  getFloors,
  getSpaces,
  getSpatialSites,
} from "../domain/spatial";
import FloorPlanSvg, { type PlanSelection } from "./FloorPlanSvg";
import SpaceDetailPanel from "./SpaceDetailPanel";
import "./spatial.css";

/** division 코드 → 색 매핑 CSS 클래스(spatial.css `.spatial-division--*`). */
function divisionClass(division: string): string {
  return `spatial-division--${division.toLowerCase()}`;
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
  // 평면에서 선택한 공간/시설물
  const [selection, setSelection] = useState<PlanSelection | null>(null);

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

  /** 사이트 변경 — 층을 새 사이트의 첫 층으로 재설정하고 선택을 해제한다. */
  const handleSiteChange = (ufid: string) => {
    setSiteUfid(ufid);
    setFloorCode(getFloors(ufid)[0]?.floorCode ?? "");
    setSelection(null);
  };

  /** 층 변경 — 선택을 해제한다. */
  const handleFloorChange = (code: string) => {
    setFloorCode(code);
    setSelection(null);
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

      {/* 사이트 셀렉트 + 층 탭 툴바 */}
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

        {/* 층 탭 — 선택 사이트의 FLOOR 코드 목록 */}
        <div className="spatial-page__floor-tabs" role="tablist" aria-label="층 선택">
          {floors.map((floor) => {
            const active = floor.floorCode === floorCode;
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
        </div>
      </div>

      <div className="spatial-page__body">
        {/* 좌: SVG 층 평면 + division 범례 */}
        <div className="spatial-page__plan-area">
          <p className="spatial-page__plan-note typo-text-sm">
            {site
              ? `${site.name} · 공간 ${spaces.length}개 · 시설물 ${facilities.length}개 — 폴리곤/마커를 클릭해 상세를 확인하세요`
              : "등록된 사이트가 없습니다"}
          </p>
          <FloorPlanSvg
            spaces={spaces}
            facilities={facilities}
            selection={selection}
            onSelect={setSelection}
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
        </div>

        {/* 우: 선택 공간/시설물 상세 */}
        <SpaceDetailPanel selection={selection} />
      </div>
    </section>
  );
}

export default SpatialModelPage;
