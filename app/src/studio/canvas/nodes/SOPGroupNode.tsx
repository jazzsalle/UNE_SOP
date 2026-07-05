/**
 * SOP Group 커스텀 노드 — 여러 SOP Task를 담는 접기/펼치기 프레임.
 * 펼침: 자식 노드가 실제 배치되는 반투명 프레임 제공(자식은 RF parentId로 내부에 렌더).
 * 접힘: 자식 Task 라벨의 요약 목록 표시(자식/엣지 hidden 동기화는 toggleGroupCollapse가 수행).
 * 포트 핸들은 접힘/펼침 모두 유지해 기존 연결을 보존한다.
 */
import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { StudioNode } from "../../state/editorTypes";
import { useStudio } from "../../state/GraphStudioContext";
import PortHandle from "./PortHandle";
import { accentTokenForNodeType } from "./SOPNode";
import "./nodes.css";

const SOPGroupNode = memo(function SOPGroupNode({ id, data, selected }: NodeProps<StudioNode>) {
  const { getGroupChildren, toggleGroupCollapse } = useStudio();
  const { graphNode } = data;
  const collapsed = graphNode.collapsed ?? false;
  const children = getGroupChildren(id);
  const inputs = graphNode.ports.filter((port) => port.direction === "input");
  const outputs = graphNode.ports.filter((port) => port.direction === "output");

  return (
    <div className={`sop-group-node${selected ? " sop-group-node--selected" : ""}`}>
      <header
        className="sop-group-node__header"
        style={{ background: `var(${accentTokenForNodeType(graphNode.type)})` }}
      >
        <span className="typo-text-md font-bold sop-node__label" title={graphNode.label}>
          {graphNode.label}
        </span>
        <span className="typo-text-sm sop-node__type-badge">Task {children.length}</span>
        <button
          type="button"
          className="nodrag sop-group-node__collapse-btn"
          title={collapsed ? "그룹 펼치기" : "그룹 접기"}
          aria-label={collapsed ? "그룹 펼치기" : "그룹 접기"}
          aria-expanded={!collapsed}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            toggleGroupCollapse(id);
          }}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </header>
      <div className="sop-group-node__ports">
        {inputs.map((port, index) => (
          <PortHandle key={port.id} port={port} index={index} total={inputs.length} />
        ))}
        {outputs.map((port, index) => (
          <PortHandle key={port.id} port={port} index={index} total={outputs.length} />
        ))}
      </div>
      {collapsed ? (
        children.length > 0 ? (
          <ul className="sop-group-node__summary">
            {children.map((child, index) => (
              <li key={child.id} className="typo-text-sm">
                <span className="sop-group-node__summary-index">{index + 1}</span>
                <span className="sop-group-node__summary-label" title={child.label}>
                  {child.label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="typo-text-sm sop-group-node__empty">포함된 Task 없음</p>
        )
      ) : (
        <div className="sop-group-node__frame" aria-hidden />
      )}
    </div>
  );
});

export default SOPGroupNode;
