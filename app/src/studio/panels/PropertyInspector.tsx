/**
 * Property Inspector — 우측 패널.
 * 선택된 노드의 속성 편집 UI는 Phase 3에서 구현한다.
 */
function PropertyInspector() {
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
    </aside>
  );
}

export default PropertyInspector;
