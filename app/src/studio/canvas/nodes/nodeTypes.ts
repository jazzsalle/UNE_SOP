/**
 * React Flow 커스텀 노드 타입 레지스트리 — 캔버스(<ReactFlow nodeTypes={...}>)에
 * 컴포넌트 밖 상수로 전달해야 리렌더 경고가 없다.
 */
import SOPNode from "./SOPNode";
import SOPGroupNode from "./SOPGroupNode";

export const nodeTypes = {
  sopNode: SOPNode,
  sopGroup: SOPGroupNode,
};
