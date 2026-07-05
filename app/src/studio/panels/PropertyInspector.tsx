/**
 * Property Inspector — 우측 패널.
 * 선택 노드의 타입/id/label/description/properties를 표시·편집하고,
 * 변경을 GraphStudioContext 액션으로 즉시 노드 상태에 반영한다.
 * 포트 목록은 읽기전용으로 나열한다.
 */
import { NODE_TEMPLATES } from "../../domain";
import type { NodeType } from "../../domain";
import { useStudio } from "../state/GraphStudioContext";
import PortListSection from "./inspector/PortListSection";
import PropertyField, { fieldInputStyle } from "./inspector/PropertyField";

/**
 * 입력 focus/placeholder 상태 스타일 — inline style로 표현할 수 없는
 * 의사 클래스만 여기서 토큰으로 지정한다. (hex/rgb 하드코딩 금지)
 */
const inspectorInputCss = `
.inspector-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}
.inspector-input::placeholder {
  color: var(--color-text-placeholder);
}
`;

/** nodeType의 accent 색 토큰 — NODE_TEMPLATES에서 첫 템플릿의 accentColorToken 조회. */
function accentTokenForType(nodeType: NodeType): string {
  const template = NODE_TEMPLATES.find((t) => t.nodeType === nodeType);
  return template?.accentColorToken ?? "--color-bg-neutral";
}

/** 섹션 소제목 — 팔레트 그룹 헤더와 동일 관례(uppercase + subtle). */
function SectionTitle({ children }: { children: string }) {
  return (
    <h3
      className="typo-text-sm font-bold"
      style={{
        margin: "0 0 6px",
        color: "var(--color-text-subtle)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </h3>
  );
}

/** 선택 노드의 편집 폼 본문 — 상위에서 key={노드 id}로 리마운트된다. */
function NodeDetailForm() {
  const {
    selectedNode,
    updateNodeLabel,
    updateNodeDescription,
    updateNodeProperty,
  } = useStudio();

  if (!selectedNode) {
    return null;
  }

  const { graphNode } = selectedNode.data;
  const propertyEntries = Object.entries(graphNode.properties);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
      }}
    >
      {/* 노드 타입 뱃지 + id (읽기전용) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          className="typo-text-sm font-bold"
          style={{
            alignSelf: "flex-start",
            padding: "2px 10px",
            borderRadius: "var(--radius-control)",
            background: `var(${accentTokenForType(graphNode.type)})`,
            color: "var(--color-text-on-brand)",
          }}
        >
          {graphNode.type}
        </span>
        <span
          className="typo-text-sm"
          style={{ color: "var(--color-text-placeholder)" }}
          title={graphNode.id}
        >
          {graphNode.id}
        </span>
      </div>

      {/* label / description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label
          className="typo-text-sm font-bold"
          htmlFor="inspector-node-label"
          style={{ color: "var(--color-text-subtle)" }}
        >
          Label
        </label>
        <input
          id="inspector-node-label"
          type="text"
          className="inspector-input typo-text-md"
          style={fieldInputStyle}
          value={graphNode.label}
          placeholder="노드 이름"
          onChange={(event) =>
            updateNodeLabel(selectedNode.id, event.target.value)
          }
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label
          className="typo-text-sm font-bold"
          htmlFor="inspector-node-description"
          style={{ color: "var(--color-text-subtle)" }}
        >
          Description
        </label>
        <textarea
          id="inspector-node-description"
          className="inspector-input typo-text-md"
          style={{ ...fieldInputStyle, resize: "vertical", minHeight: 60 }}
          value={graphNode.description ?? ""}
          rows={3}
          placeholder="노드 설명"
          onChange={(event) =>
            updateNodeDescription(selectedNode.id, event.target.value)
          }
        />
      </div>

      {/* properties */}
      <section>
        <SectionTitle>Properties</SectionTitle>
        {propertyEntries.length === 0 ? (
          <p
            className="typo-text-sm"
            style={{ margin: 0, color: "var(--color-text-placeholder)" }}
          >
            편집 가능한 속성이 없습니다
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {propertyEntries.map(([key, value]) => (
              <PropertyField
                key={key}
                propKey={key}
                value={value}
                onChange={(next) =>
                  updateNodeProperty(selectedNode.id, key, next)
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* ports (읽기전용) */}
      <section>
        <SectionTitle>Ports</SectionTitle>
        <PortListSection ports={graphNode.ports} />
      </section>
    </div>
  );
}

function PropertyInspector() {
  const { selectedNode } = useStudio();

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "var(--color-bg-surface)",
        borderLeft: "1px solid var(--color-border-subtle)",
      }}
    >
      <style>{inspectorInputCss}</style>
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2
          className="typo-text-lg font-bold"
          style={{ margin: 0, color: "var(--color-text-default)" }}
        >
          Property Inspector
        </h2>
      </header>
      {selectedNode ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {/* 선택 노드 변경 시 controlled 필드 리마운트를 위한 key */}
          <NodeDetailForm key={selectedNode.id} />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <p
            className="typo-text-md"
            style={{ margin: 0, color: "var(--color-text-placeholder)" }}
          >
            노드를 선택하세요
          </p>
        </div>
      )}
    </aside>
  );
}

export default PropertyInspector;
