/**
 * Validation / Compile Panel — 하단 패널.
 * validateGraph → compileGraph 결과 표시는 Phase 4에서 구현한다.
 */
function ValidationPanel() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border-subtle)",
      }}
    >
      <header
        style={{
          padding: "8px 16px",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2
          className="typo-text-lg font-bold"
          style={{ margin: 0, color: "var(--color-text-default)" }}
        >
          Validation / Compile
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
          검증 결과가 여기에 표시됩니다
        </p>
      </div>
    </section>
  );
}

export default ValidationPanel;
