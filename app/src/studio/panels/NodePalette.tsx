/**
 * Node Palette — 좌측 패널.
 * 템플릿 레지스트리(TEMPLATE_GROUPS)의 9개 그룹·28개 템플릿을 정적 목록으로 표시한다.
 * (드래그앤드롭·그룹 접기는 Phase 3 범위)
 */
import { TEMPLATE_GROUPS } from "../../domain";

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
          minHeight: 0,
          overflowY: "auto",
          padding: "8px 0 16px",
        }}
      >
        {TEMPLATE_GROUPS.map(({ group, label, templates }) => (
          <section key={group} style={{ padding: "8px 0" }}>
            <h3
              className="typo-text-sm font-bold"
              style={{
                margin: 0,
                padding: "4px 16px",
                color: "var(--color-text-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {templates.map((template) => (
                <li
                  key={template.templateId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 16px",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      width: 4,
                      height: 16,
                      borderRadius: 2,
                      background: template.accentColorToken
                        ? `var(${template.accentColorToken})`
                        : "var(--color-bg-neutral)",
                    }}
                  />
                  <span
                    className="typo-text-md"
                    style={{ color: "var(--color-text-default)" }}
                  >
                    {template.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}

export default NodePalette;
