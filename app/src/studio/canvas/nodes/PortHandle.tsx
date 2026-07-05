/**
 * 타입드 포트 핸들 — 포트 라벨 행과 React Flow Handle을 함께 렌더한다.
 * input 포트는 좌측(target)/output 포트는 우측(source)에 정렬되며,
 * 핸들 색은 PortDataType별 디자인 토큰(PORT_COLOR_TOKEN)으로 지정한다.
 */
import { Handle, Position } from "@xyflow/react";
import type { NodePort } from "../../../domain";
import { PORT_COLOR_TOKEN } from "../../state/flowTokens";

interface PortHandleProps {
  port: NodePort;
  /** 같은 방향 포트 내 순번 — 퍼센트 분산 배치 방식으로 전환할 때 사용(행 레이아웃에서는 미사용). */
  index?: number;
  /** 같은 방향 포트 총 개수 — index와 동일하게 예비 계약으로 유지. */
  total?: number;
}

/** 포트 1개 = 행 1개 — 행이 노드 전체 폭을 차지해 핸들이 노드 테두리에 걸치도록 정렬한다. */
function PortHandle({ port }: PortHandleProps) {
  const isInput = port.direction === "input";
  const tooltip = `${port.label} (${port.dataType})`;
  return (
    <div className={`sop-port-row sop-port-row--${port.direction}`} title={tooltip}>
      <Handle
        id={port.id}
        type={isInput ? "target" : "source"}
        position={isInput ? Position.Left : Position.Right}
        className="sop-port-handle"
        title={tooltip}
        style={{ background: `var(${PORT_COLOR_TOKEN[port.dataType]})` }}
      />
      <span className="typo-text-sm sop-port-label">{port.label}</span>
    </div>
  );
}

export default PortHandle;
