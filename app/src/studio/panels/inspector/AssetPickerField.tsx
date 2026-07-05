/**
 * Asset Filter 노드 전용 시설물 피커 — 공간 레지스트리 기반 다중 선택 체크리스트.
 * 같은 그래프의 space_scope 노드에서 등록된 siteId를 찾아 해당 사이트 시설물로
 * 후보를 좁히고, 사이트 문맥이 없으면 전체 시설물 목록을 보여준다.
 * 레지스트리에 없는 기존 값은 "미등록 id" 경고와 함께 보존하며(파괴적 변경 금지),
 * 임의 asset id를 위한 자유 입력 폴백을 유지한다.
 */
import { useState } from "react";
import {
  divisionLabel,
  findFacility,
  getFacilities,
  getSite,
  getSpatialSites,
} from "../../../domain";
import type { SpatialFacility } from "../../../domain";
import { useStudio } from "../../state/GraphStudioContext";
import { fieldInputStyle } from "./PropertyField";
import {
  checkboxStyle,
  checklistContainerStyle,
  checklistRowStyle,
  toggleId,
} from "./SpaceScopeFields";

interface AssetPickerFieldProps {
  assetIds: string[];
  onChange: (assetIds: string[]) => void;
}

/**
 * 그래프의 space_scope 노드들에서 등록된 siteId(UFID) 집합을 수집한다.
 * asset_filter 노드 자체에는 siteId가 없어 그래프 문맥에서 유추한다.
 */
function collectScopeSiteIds(
  nodes: ReturnType<typeof useStudio>["nodes"],
): string[] {
  const siteIds = new Set<string>();
  for (const node of nodes) {
    const { graphNode } = node.data;
    if (graphNode.type !== "space_scope") {
      continue;
    }
    const siteId = graphNode.properties["siteId"];
    if (typeof siteId === "string" && siteId !== "" && getSite(siteId)) {
      siteIds.add(siteId);
    }
  }
  return [...siteIds];
}

/** Asset Filter 노드의 assetIds 편집 폼 — 체크리스트 + 자유 입력 폴백. */
function AssetPickerField({ assetIds, onChange }: AssetPickerFieldProps) {
  const { nodes } = useStudio();
  const [freeText, setFreeText] = useState("");

  // 사이트 문맥 — space_scope 노드의 siteId 합집합. 없으면 전체 사이트.
  const scopeSiteIds = collectScopeSiteIds(nodes);
  const contextSiteIds =
    scopeSiteIds.length > 0
      ? scopeSiteIds
      : getSpatialSites().map((site) => site.ufid);
  const facilities: SpatialFacility[] = contextSiteIds.flatMap((ufid) =>
    getFacilities(ufid),
  );

  // 후보 목록 밖의 기존 선택값 — 미등록/타 사이트 시설물로 분리 표시.
  const listedCodeSet = new Set(facilities.map((f) => f.objectCode));
  const externalIds = assetIds.filter((id) => !listedCodeSet.has(id));

  /** 자유 입력 폴백 — 임의 asset id를 배열에 추가한다(중복 제외). */
  const addFreeId = () => {
    const id = freeText.trim();
    if (!id) {
      return;
    }
    onChange(toggleId(assetIds, id, true));
    setFreeText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        className="typo-text-sm font-bold"
        style={{ color: "var(--color-text-subtle)" }}
      >
        assetIds
      </span>
      <span
        className="typo-text-sm"
        style={{ color: "var(--color-text-placeholder)" }}
      >
        {scopeSiteIds.length > 0
          ? "그래프의 Space Scope 사이트 기준 시설물"
          : "전체 등록 시설물"}
      </span>

      {facilities.length === 0 ? (
        <p
          className="typo-text-sm"
          style={{ margin: 0, color: "var(--color-text-placeholder)" }}
        >
          선택 가능한 시설물이 없습니다
        </p>
      ) : (
        <div style={checklistContainerStyle}>
          {facilities.map((facility) => (
            <label
              key={facility.objectCode}
              className="typo-text-sm"
              style={checklistRowStyle}
            >
              <input
                type="checkbox"
                style={checkboxStyle}
                checked={assetIds.includes(facility.objectCode)}
                onChange={(event) =>
                  onChange(
                    toggleId(
                      assetIds,
                      facility.objectCode,
                      event.target.checked,
                    ),
                  )
                }
              />
              <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span>{facility.name}</span>
                <span style={{ color: "var(--color-text-subtle)" }}>
                  {divisionLabel(facility.division) ?? facility.division} ·{" "}
                  {facility.kind}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      {/* 후보 목록 밖의 기존 선택값 — 값 보존 + 경고/보조 표시 */}
      {externalIds.length > 0 && (
        <div style={checklistContainerStyle}>
          {externalIds.map((id) => {
            const resolved = findFacility(id);
            return (
              <label key={id} className="typo-text-sm" style={checklistRowStyle}>
                <input
                  type="checkbox"
                  style={checkboxStyle}
                  checked
                  onChange={() => onChange(toggleId(assetIds, id, false))}
                />
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    wordBreak: "break-all",
                  }}
                >
                  <span>{resolved ? resolved.name : id}</span>
                  {resolved ? (
                    <span style={{ color: "var(--color-text-subtle)" }}>
                      사이트 문맥 밖의 시설물
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-danger)" }}>
                      미등록 id — 값은 보존됩니다
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* 자유 입력 폴백 — 레지스트리 밖 asset id 추가 */}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          className="inspector-input typo-text-md"
          style={{ ...fieldInputStyle, flex: 1 }}
          value={freeText}
          placeholder="asset id 직접 입력"
          onChange={(event) => setFreeText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addFreeId();
            }
          }}
        />
        <button
          type="button"
          className="typo-text-sm font-bold"
          style={{
            padding: "6px 10px",
            background: "var(--color-bg-neutral)",
            color: "var(--color-text-on-brand)",
            border: "none",
            borderRadius: "var(--radius-control)",
            cursor: "pointer",
          }}
          onClick={addFreeId}
        >
          추가
        </button>
      </div>
    </div>
  );
}

export default AssetPickerField;
