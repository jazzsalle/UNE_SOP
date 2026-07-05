/**
 * SOP 커스텀 노드(일반 13종 공용) — accent 헤더(라벨 + nodeType 뱃지)와
 * 좌 input / 우 output 타입드 포트 핸들 행을 렌더한다.
 * 렌더 소스는 `data.graphNode`(도메인 모델)이며 React Flow는 표시 레이어일 뿐이다.
 */
import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { NODE_TEMPLATES } from "../../../domain";
import type { NodeType } from "../../../domain";
import type { StudioNode } from "../../state/editorTypes";
import PortHandle from "./PortHandle";
import "./nodes.css";

/** nodeType → 템플릿 accent 색 토큰 맵 — 같은 nodeType의 첫 템플릿 기준으로 1회 계산. */
const ACCENT_TOKEN_BY_TYPE: Partial<Record<NodeType, string>> = {};
for (const template of NODE_TEMPLATES) {
  if (template.accentColorToken && !(template.nodeType in ACCENT_TOKEN_BY_TYPE)) {
    ACCENT_TOKEN_BY_TYPE[template.nodeType] = template.accentColorToken;
  }
}

/** 노드 타입의 accent 색 토큰(CSS 변수명)을 반환한다. 템플릿에 없으면 중립 토큰 폴백. */
export function accentTokenForNodeType(type: NodeType): string {
  return ACCENT_TOKEN_BY_TYPE[type] ?? "--color-bg-neutral";
}

const SOPNode = memo(function SOPNode({ data, selected }: NodeProps<StudioNode>) {
  const { graphNode } = data;
  const inputs = graphNode.ports.filter((port) => port.direction === "input");
  const outputs = graphNode.ports.filter((port) => port.direction === "output");

  return (
    <div className={`sop-node${selected ? " sop-node--selected" : ""}`}>
      <header
        className="sop-node__header"
        style={{ background: `var(${accentTokenForNodeType(graphNode.type)})` }}
      >
        <span className="typo-text-md font-bold sop-node__label" title={graphNode.label}>
          {graphNode.label}
        </span>
        <span className="typo-text-sm sop-node__type-badge">{graphNode.type}</span>
      </header>
      <div className="sop-node__ports">
        {inputs.map((port, index) => (
          <PortHandle key={port.id} port={port} index={index} total={inputs.length} />
        ))}
        {outputs.map((port, index) => (
          <PortHandle key={port.id} port={port} index={index} total={outputs.length} />
        ))}
      </div>
    </div>
  );
});

export default SOPNode;
