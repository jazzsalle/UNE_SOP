/**
 * Node Palette — 좌측 패널.
 * Phase 2에서 노드 템플릿 목록이 채워지기 전까지 빈 placeholder를 표시한다.
 */
function NodePalette() {
  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "var(--color-bg-surface)",
        borderRight: "1px solid var(--color-border-subtle)",
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
          Node Palette
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
          노드 템플릿이 없습니다
        </p>
      </div>
    </aside>
  );
}

export default NodePalette;
