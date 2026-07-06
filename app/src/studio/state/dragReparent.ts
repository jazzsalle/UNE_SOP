/**
 * dragReparent — 노드 드래그 종료 시 SOP Group 탈착(detach)/부착(attach)을 판정하는 순수 모듈.
 * 판정 기준은 **드롭 시점의 마우스 포인터 위치**(flow 좌표)가 그룹 프레임 rect 안/밖인지다 —
 * 커서 아래 프레임이 드롭 대상이라는 규약(Figma식)이라 노드가 프레임에 걸쳐 있어도 예측 가능하다.
 * 포인터 좌표를 얻을 수 없으면 노드 중심점으로 폴백한다. (에러3: 중심점 기준일 때
 * 포인터가 프레임 안이어도 노드 중심이 rect 밖이면 attach가 조용히 실패했다.)
 * 그룹은 항상 최상위 노드라는 전제 — 중첩 그룹 없음.
 * RF v12 규칙: 부모(그룹) 노드는 배열에서 자식보다 앞에 와야 한다 — attach는 자식을
 * 배열 끝으로 이동시켜 규칙을 보장하고, detach는 순서 변경이 필요 없다.
 */
import type { XYPosition } from "@xyflow/react";
import type { StudioNode } from "./editorTypes";

/** 노드의 렌더 크기 — 측정값(measured) 우선, 없으면 style의 숫자 값 폴백. */
export function nodeSize(node: StudioNode): { width: number; height: number } {
  const styleWidth =
    typeof node.style?.width === "number" ? node.style.width : 0;
  const styleHeight =
    typeof node.style?.height === "number" ? node.style.height : 0;
  return {
    width: node.measured?.width ?? styleWidth,
    height: node.measured?.height ?? styleHeight,
  };
}

/** point가 노드(그룹 프레임) rect 안에 있는지 — position + 렌더 크기 기준. */
function containsPoint(node: StudioNode, point: XYPosition): boolean {
  const { width, height } = nodeSize(node);
  return (
    point.x >= node.position.x &&
    point.x <= node.position.x + width &&
    point.y >= node.position.y &&
    point.y <= node.position.y + height
  );
}

/**
 * 좌표(flow 좌표계)를 포함하는 펼쳐진 SOP Group 프레임을 찾는다.
 * 겹칠 경우 배열 뒤쪽(위에 그려지는) 그룹을 우선한다. excludeIds는 후보에서 제외. 없으면 null.
 */
export function findExpandedGroupAt(
  nodes: StudioNode[],
  point: XYPosition,
  excludeIds?: ReadonlySet<string>,
): StudioNode | null {
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    if (
      node.type !== "sopGroup" ||
      node.data.graphNode.collapsed ||
      excludeIds?.has(node.id)
    ) {
      continue;
    }
    if (containsPoint(node, point)) {
      return node;
    }
  }
  return null;
}

/** 그룹에서 분리 — parentId/extent 제거 + 절대좌표 전환 (배열 순서는 그대로 유효). */
function detach(
  nodes: StudioNode[],
  dragged: StudioNode,
  absolute: XYPosition,
): StudioNode[] {
  const { parentId: _parentId, extent: _extent, ...rest } = dragged;
  const next: StudioNode = { ...rest, position: absolute };
  return nodes.map((node) => (node.id === dragged.id ? next : node));
}

/** attach 시 그룹 프레임 자동 확장 여백(px) — graphIO.toStudioGraph의 로드 시 보정과 동일 규약. */
const GROUP_FIT_PADDING = 16;

/**
 * 그룹에 부착 — parentId 부여 + 부모 상대좌표 전환, 배열 끝으로 이동(부모 앞 규칙 보장).
 * 부착한 자식이 프레임을 넘치면 그룹 크기를 확장한다(style + graphNode.size 동기화 —
 * groupCollapse가 펼침 복원 시 graphNode.size를 소스로 쓰기 때문).
 */
function attach(
  nodes: StudioNode[],
  dragged: StudioNode,
  group: StudioNode,
  absolute: XYPosition,
): StudioNode[] {
  const { extent: _extent, ...rest } = dragged;
  const relative: XYPosition = {
    x: absolute.x - group.position.x,
    y: absolute.y - group.position.y,
  };
  const next: StudioNode = { ...rest, parentId: group.id, position: relative };

  const childSize = nodeSize(dragged);
  const groupSize = nodeSize(group);
  const width = Math.max(
    groupSize.width,
    relative.x + childSize.width + GROUP_FIT_PADDING,
  );
  const height = Math.max(
    groupSize.height,
    relative.y + childSize.height + GROUP_FIT_PADDING,
  );
  const expandedGroup: StudioNode =
    width !== groupSize.width || height !== groupSize.height
      ? {
          ...group,
          style: { ...group.style, width, height },
          data: {
            graphNode: { ...group.data.graphNode, size: { width, height } },
          },
        }
      : group;

  return [
    ...nodes
      .filter((node) => node.id !== dragged.id)
      .map((node) => (node.id === group.id ? expandedGroup : node)),
    next,
  ];
}

/**
 * 드래그 종료된 노드의 그룹 탈착/부착을 판정해 새 노드 배열을 반환한다. 변화 없으면 null.
 * 판정점은 드롭 시점의 포인터 위치(dropPoint, flow 좌표) — 없으면 노드 중심점 폴백.
 * - 그룹 자식: 판정점이 부모 프레임 밖이면 detach (다른 펼쳐진 그룹 위면 그 그룹으로 재부착).
 * - 독립 sop_task: 판정점이 펼쳐진 그룹 프레임 안이면 해당 그룹에 attach.
 */
export function resolveDragReparent(
  nodes: StudioNode[],
  draggedId: string,
  dropPoint?: XYPosition,
): StudioNode[] | null {
  const dragged = nodes.find((node) => node.id === draggedId);
  if (!dragged || dragged.type === "sopGroup") {
    return null;
  }

  const parent = dragged.parentId
    ? nodes.find((node) => node.id === dragged.parentId)
    : undefined;
  // 그룹 자식의 position은 부모 상대좌표 — 판정은 절대좌표로 통일한다.
  const absolute: XYPosition = parent
    ? {
        x: parent.position.x + dragged.position.x,
        y: parent.position.y + dragged.position.y,
      }
    : { ...dragged.position };
  const size = nodeSize(dragged);
  const point: XYPosition = dropPoint ?? {
    x: absolute.x + size.width / 2,
    y: absolute.y + size.height / 2,
  };

  if (parent) {
    if (containsPoint(parent, point)) {
      return null; // 여전히 부모 프레임 안 — 유지.
    }
    const nextGroup = findExpandedGroupAt(
      nodes,
      point,
      new Set([draggedId, parent.id]),
    );
    return nextGroup
      ? attach(nodes, dragged, nextGroup, absolute)
      : detach(nodes, dragged, absolute);
  }

  if (dragged.data.graphNode.type !== "sop_task") {
    return null;
  }
  const group = findExpandedGroupAt(nodes, point, new Set([draggedId]));
  return group ? attach(nodes, dragged, group, absolute) : null;
}
