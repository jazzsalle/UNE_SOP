/**
 * Space Scope 노드 전용 공간 피커 — 공간 레지스트리(registry.ts) 기반으로
 * siteId(사이트 셀렉트) / spaceIds(층 필터 + 공간 체크리스트)를 함께 편집한다.
 * PropertyInspector가 space_scope 노드의 siteId 키 위치에서 이 컴포넌트로 라우팅한다.
 * 기존 값이 레지스트리에 없어도 값은 보존하고 "미등록 id" 경고만 표시한다(파괴적 변경 금지).
 */
import { useState, type CSSProperties } from "react";
import {
  divisionLabel,
  findSpace,
  getFloors,
  getSite,
  getSpaces,
  getSpatialSites,
} from "../../../domain";
import { fieldInputStyle } from "./PropertyField";

interface SpaceScopeFieldsProps {
  siteId: string;
  spaceIds: string[];
  onSiteIdChange: (siteId: string) => void;
  onSpaceIdsChange: (spaceIds: string[]) => void;
}

/** 필드 라벨 공통 스타일 — PropertyField의 키 라벨 관례와 동일. */
const fieldLabelStyle: CSSProperties = {
  color: "var(--color-text-subtle)",
};

/** 미등록 id 경고 텍스트 스타일 — danger 토큰만 사용. */
export const unregisteredWarningStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-danger)",
};

/** 스크롤 가능한 체크리스트 컨테이너 — 높이 제한(~160px) + 토큰 보더. */
export const checklistContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  maxHeight: 160,
  overflowY: "auto",
  padding: 4,
  background: "var(--color-bg-surface)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-control)",
};

/** 체크리스트 행(checkbox + 본문) 공통 스타일. */
export const checklistRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 6,
  padding: "4px 4px",
  borderRadius: "var(--radius-control)",
  color: "var(--color-text-default)",
  cursor: "pointer",
};

/** 체크박스 accent — 인스펙터 boolean 필드와 동일 토큰. */
export const checkboxStyle: CSSProperties = {
  marginTop: 2,
  accentColor: "var(--color-border-focus)",
};

/** 문자열 배열에서 id를 추가/제거한 새 배열을 반환한다 (나머지 원소 보존). */
export function toggleId(ids: string[], id: string, checked: boolean): string[] {
  if (checked) {
    return ids.includes(id) ? ids : [...ids, id];
  }
  return ids.filter((item) => item !== id);
}

/** Space Scope 노드의 siteId + spaceIds 편집 폼. */
function SpaceScopeFields({
  siteId,
  spaceIds,
  onSiteIdChange,
  onSpaceIdsChange,
}: SpaceScopeFieldsProps) {
  // 층 필터 — 편집기 로컬 상태(properties에 저장하지 않음). "" = 전체 층.
  const [floorFilter, setFloorFilter] = useState("");

  const sites = getSpatialSites();
  const site = siteId ? getSite(siteId) : null;
  const siteUnregistered = siteId !== "" && site === null;

  // 체크리스트 후보 — 등록 사이트일 때만 층 필터를 적용해 조회.
  const floors = site ? getFloors(siteId) : [];
  const listedSpaces = site
    ? getSpaces(siteId, floorFilter || undefined)
    : [];

  // 현재 사이트 공간 목록에 없는 기존 선택값 — 미등록/타 사이트 공간으로 분리 표시.
  const siteSpaceIdSet = new Set(
    (site ? getSpaces(siteId) : []).map((space) => space.primaryKey),
  );
  const externalIds = spaceIds.filter((id) => !siteSpaceIdSet.has(id));

  return (
    <>
      {/* siteId — 사이트 셀렉트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="typo-text-sm font-bold" style={fieldLabelStyle}>
          siteId
        </span>
        <select
          className="inspector-input typo-text-md"
          style={fieldInputStyle}
          value={siteId}
          onChange={(event) => onSiteIdChange(event.target.value)}
        >
          <option value="">사이트 선택 안 함 (빈 값)</option>
          {sites.map((option) => (
            <option key={option.ufid} value={option.ufid}>
              {option.name} ({option.ufid})
            </option>
          ))}
          {/* 미등록 기존 값 보존용 옵션 — 셀렉트가 현재 값을 표시할 수 있게 유지 */}
          {siteUnregistered && (
            <option value={siteId}>{siteId} (미등록)</option>
          )}
        </select>
        {siteUnregistered && (
          <p className="typo-text-sm" style={unregisteredWarningStyle}>
            미등록 siteId입니다 — 값은 보존됩니다
          </p>
        )}
      </div>

      {/* spaceIds — 층 필터 + 공간 체크리스트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="typo-text-sm font-bold" style={fieldLabelStyle}>
          spaceIds
        </span>
        {site ? (
          <>
            <select
              className="inspector-input typo-text-md"
              style={fieldInputStyle}
              value={floorFilter}
              onChange={(event) => setFloorFilter(event.target.value)}
              aria-label="층 필터"
            >
              <option value="">전체 층</option>
              {floors.map((floor) => (
                <option key={floor.floorCode} value={floor.floorCode}>
                  {floor.name} ({floor.floorCode})
                </option>
              ))}
            </select>
            {listedSpaces.length === 0 ? (
              <p
                className="typo-text-sm"
                style={{ margin: 0, color: "var(--color-text-placeholder)" }}
              >
                선택 가능한 공간이 없습니다
              </p>
            ) : (
              <div style={checklistContainerStyle}>
                {listedSpaces.map((space) => (
                  <label
                    key={space.primaryKey}
                    className="typo-text-sm"
                    style={checklistRowStyle}
                  >
                    <input
                      type="checkbox"
                      style={checkboxStyle}
                      checked={spaceIds.includes(space.primaryKey)}
                      onChange={(event) =>
                        onSpaceIdsChange(
                          toggleId(
                            spaceIds,
                            space.primaryKey,
                            event.target.checked,
                          ),
                        )
                      }
                    />
                    <span
                      style={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <span>{space.name}</span>
                      <span style={{ color: "var(--color-text-subtle)" }}>
                        {divisionLabel(space.division) ?? space.division} ·{" "}
                        {space.kind}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </>
        ) : (
          <p
            className="typo-text-sm"
            style={{ margin: 0, color: "var(--color-text-placeholder)" }}
          >
            사이트를 먼저 선택하세요
          </p>
        )}

        {/* 현재 사이트 목록 밖의 기존 선택값 — 값 보존 + 경고/보조 표시 */}
        {externalIds.length > 0 && (
          <div style={checklistContainerStyle}>
            {externalIds.map((id) => {
              const resolved = findSpace(id);
              return (
                <label key={id} className="typo-text-sm" style={checklistRowStyle}>
                  <input
                    type="checkbox"
                    style={checkboxStyle}
                    checked
                    onChange={() =>
                      onSpaceIdsChange(toggleId(spaceIds, id, false))
                    }
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
                        다른 사이트의 공간 ({resolved.ufid})
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
      </div>
    </>
  );
}

export default SpaceScopeFields;
