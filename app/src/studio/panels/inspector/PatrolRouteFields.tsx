/**
 * Patrol Route 노드 전용 토폴로지 피커 — 토폴로지 레지스트리(topology/registry.ts) 기반으로
 * topologySetId(셋 셀렉트) / startNodeId·endNodeId(시작·종료 노드 셀렉트, 상호 배제) /
 * checkpointNodeIds(점검 포인트 체크리스트)를 함께 편집하고, 하단에 findPath 결과
 * (노드 체인 + 총 거리)를 미리보기한다.
 * PropertyInspector가 taskKind==="patrol"인 sop_task의 topologySetId 키 위치에서 라우팅한다.
 * 기존 값이 레지스트리에 없어도 값은 보존하고 "미등록 id" 경고만 표시한다(SpaceScopeFields 관례).
 */
import type { CSSProperties } from "react";
import {
  findPath,
  getTopologySet,
  getTopologySets,
} from "../../../domain";
import type { TopologyNodeData } from "../../../domain";
import { fieldInputStyle } from "./PropertyField";
import {
  checkboxStyle,
  checklistContainerStyle,
  checklistRowStyle,
  toggleId,
  unregisteredWarningStyle,
} from "./SpaceScopeFields";

interface PatrolRouteFieldsProps {
  topologySetId: string;
  startNodeId: string;
  endNodeId: string;
  checkpointNodeIds: string[];
  /** 4개 패트롤 속성 공용 변경 콜백 — PropertyInspector의 updateNodeProperty로 위임. */
  onPropertyChange: (key: string, value: unknown) => void;
}

/** 필드 라벨 공통 스타일 — PropertyField의 키 라벨 관례와 동일. */
const fieldLabelStyle: CSSProperties = {
  color: "var(--color-text-subtle)",
};

/** 선택 불가 안내 문구 스타일 — placeholder 토큰. */
const placeholderTextStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-placeholder)",
};

/** 경로 미리보기 박스 — 읽기전용 표시 영역(PropertyField의 JSON 표시 관례와 동일 토큰). */
const pathPreviewBoxStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "6px 8px",
  background: "var(--color-bg-subtle)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-control)",
};

/** 토폴로지 노드의 셀렉트/체크리스트 표시명 — displayName + floorName. */
function nodeOptionLabel(node: TopologyNodeData): string {
  return `${node.displayName} (${node.floorName})`;
}

/** metadata.checkpoint === true인 점검 포인트 노드 판별. */
function isCheckpointNode(node: TopologyNodeData): boolean {
  return node.metadata["checkpoint"] === true;
}

/** Patrol Route 노드의 topologySetId + startNodeId + endNodeId + checkpointNodeIds 편집 폼. */
function PatrolRouteFields({
  topologySetId,
  startNodeId,
  endNodeId,
  checkpointNodeIds,
  onPropertyChange,
}: PatrolRouteFieldsProps) {
  const sets = getTopologySets();
  const set = topologySetId ? getTopologySet(topologySetId) : null;
  const setUnregistered = topologySetId !== "" && set === null;

  const nodes = set?.nodes ?? [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  // 점검 포인트 체크리스트 — metadata.checkpoint 노드를 앞에 두되 모든 노드를 선택 가능하게 나열.
  const checklistNodes = [
    ...nodes.filter(isCheckpointNode),
    ...nodes.filter((node) => !isCheckpointNode(node)),
  ];

  const startNode = startNodeId ? nodeById.get(startNodeId) ?? null : null;
  const endNode = endNodeId ? nodeById.get(endNodeId) ?? null : null;
  // 셋 목록 밖의 기존 점검 포인트 선택값 — 값 보존 + 경고 표시.
  const externalCheckpointIds = checkpointNodeIds.filter((id) => !nodeById.has(id));

  // 경로 미리보기 — 셋·시작·종료가 모두 해석될 때만 계산한다.
  const path = set && startNode && endNode ? findPath(set, startNodeId, endNodeId) : null;

  /** 시작/종료 노드 셀렉트 한 개 — 상호 배제(상대 필드 값은 옵션에서 제외). */
  const renderEndpointSelect = (
    key: "startNodeId" | "endNodeId",
    labelKo: string,
    value: string,
    resolved: TopologyNodeData | null,
    excludeId: string,
  ) => {
    const unregistered = set !== null && value !== "" && resolved === null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="typo-text-sm font-bold" style={fieldLabelStyle}>
          {key}
        </span>
        {set ? (
          <>
            <select
              className="inspector-input typo-text-md"
              style={fieldInputStyle}
              value={value}
              aria-label={`패트롤 ${labelKo} 노드`}
              onChange={(event) => onPropertyChange(key, event.target.value)}
            >
              <option value="">{labelKo} 노드 선택 안 함 (빈 값)</option>
              {nodes
                .filter((node) => node.id !== excludeId)
                .map((node) => (
                  <option key={node.id} value={node.id}>
                    {nodeOptionLabel(node)}
                  </option>
                ))}
              {/* 미등록 기존 값 보존용 옵션 — 셀렉트가 현재 값을 표시할 수 있게 유지 */}
              {unregistered && <option value={value}>{value} (미등록)</option>}
            </select>
            {unregistered && (
              <p className="typo-text-sm" style={unregisteredWarningStyle}>
                미등록 {key}입니다 — 값은 보존됩니다
              </p>
            )}
          </>
        ) : (
          <p className="typo-text-sm" style={placeholderTextStyle}>
            토폴로지 셋을 먼저 선택하세요
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {/* topologySetId — 토폴로지 셋 셀렉트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="typo-text-sm font-bold" style={fieldLabelStyle}>
          topologySetId
        </span>
        <select
          className="inspector-input typo-text-md"
          style={fieldInputStyle}
          value={topologySetId}
          aria-label="토폴로지 셋"
          onChange={(event) => onPropertyChange("topologySetId", event.target.value)}
        >
          <option value="">토폴로지 셋 선택 안 함 (빈 값)</option>
          {sets.map((option) => (
            <option key={option.setId} value={option.setId}>
              {option.name} ({option.setId})
            </option>
          ))}
          {/* 미등록 기존 값 보존용 옵션 */}
          {setUnregistered && <option value={topologySetId}>{topologySetId} (미등록)</option>}
        </select>
        {setUnregistered && (
          <p className="typo-text-sm" style={unregisteredWarningStyle}>
            미등록 topologySetId입니다 — 값은 보존됩니다
          </p>
        )}
      </div>

      {/* startNodeId / endNodeId — 시작·종료 노드 셀렉트 (상호 배제) */}
      {renderEndpointSelect("startNodeId", "시작", startNodeId, startNode, endNodeId)}
      {renderEndpointSelect("endNodeId", "종료", endNodeId, endNode, startNodeId)}

      {/* checkpointNodeIds — 점검 포인트 체크리스트 (checkpoint 메타데이터 노드 우선) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="typo-text-sm font-bold" style={fieldLabelStyle}>
          checkpointNodeIds
        </span>
        {set ? (
          checklistNodes.length === 0 ? (
            <p className="typo-text-sm" style={placeholderTextStyle}>
              선택 가능한 토폴로지 노드가 없습니다
            </p>
          ) : (
            <div style={checklistContainerStyle}>
              {checklistNodes.map((node) => (
                <label key={node.id} className="typo-text-sm" style={checklistRowStyle}>
                  <input
                    type="checkbox"
                    style={checkboxStyle}
                    checked={checkpointNodeIds.includes(node.id)}
                    onChange={(event) =>
                      onPropertyChange(
                        "checkpointNodeIds",
                        toggleId(checkpointNodeIds, node.id, event.target.checked),
                      )
                    }
                  />
                  <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span>{nodeOptionLabel(node)}</span>
                    <span style={{ color: "var(--color-text-subtle)" }}>
                      {node.nodeTypeCode}
                      {isCheckpointNode(node) ? " · 점검 포인트" : ""}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )
        ) : (
          <p className="typo-text-sm" style={placeholderTextStyle}>
            토폴로지 셋을 먼저 선택하세요
          </p>
        )}

        {/* 셋 목록 밖의 기존 선택값 — 값 보존 + 경고 표시 */}
        {externalCheckpointIds.length > 0 && (
          <div style={checklistContainerStyle}>
            {externalCheckpointIds.map((id) => (
              <label key={id} className="typo-text-sm" style={checklistRowStyle}>
                <input
                  type="checkbox"
                  style={checkboxStyle}
                  checked
                  onChange={() =>
                    onPropertyChange("checkpointNodeIds", toggleId(checkpointNodeIds, id, false))
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
                  <span>{id}</span>
                  <span style={{ color: "var(--color-text-danger)" }}>
                    미등록 id — 값은 보존됩니다
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 경로 미리보기 — findPath 결과 노드 체인 + 총 거리(m) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="typo-text-sm font-bold" style={fieldLabelStyle}>
          경로 미리보기
        </span>
        {set && startNode && endNode ? (
          path ? (
            <div style={pathPreviewBoxStyle}>
              <p
                className="typo-text-sm"
                style={{ margin: 0, color: "var(--color-text-default)", wordBreak: "keep-all" }}
              >
                {path.nodeIds
                  .map((id) => nodeById.get(id)?.displayName ?? id)
                  .join(" → ")}
              </p>
              <p className="typo-text-sm" style={{ margin: 0, color: "var(--color-text-subtle)" }}>
                총 거리 {path.distanceM.toFixed(1)} m · 경유 노드 {path.nodeIds.length}개
              </p>
            </div>
          ) : (
            <p className="typo-text-sm" style={unregisteredWarningStyle}>
              경로를 찾을 수 없습니다 — 시작·종료 노드가 토폴로지에서 연결되어 있지 않습니다
            </p>
          )
        ) : (
          <p className="typo-text-sm" style={placeholderTextStyle}>
            토폴로지 셋과 시작·종료 노드를 선택하면 경로를 미리봅니다
          </p>
        )}
      </div>
    </>
  );
}

export default PatrolRouteFields;
