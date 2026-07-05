/**
 * Node Palette — 좌측 패널.
 * 템플릿 레지스트리(TEMPLATE_GROUPS)의 9개 그룹·28개 템플릿을 접기/펼치기 가능한
 * 섹션으로 표시하고, 각 템플릿을 캔버스로 드래그(HTML5 DnD)할 수 있는 소스로 제공한다.
 * dataTransfer 계약: setData(TEMPLATE_DRAG_MIME, templateId) — 캔버스 drop과 일치해야 한다.
 */
import { useState } from "react";
import type { DragEvent } from "react";
import { TEMPLATE_GROUPS } from "../../domain";
import type { NodeTemplate, NodeTemplateGroup } from "../../domain";
import { TEMPLATE_DRAG_MIME } from "../state/editorTypes";

/** 팔레트 아이템 드래그 시작 — templateId를 dataTransfer에 싣는다. */
function handleTemplateDragStart(
  event: DragEvent<HTMLLIElement>,
  template: NodeTemplate,
) {
  event.dataTransfer.setData(TEMPLATE_DRAG_MIME, template.templateId);
  event.dataTransfer.effectAllowed = "move";
}

function NodePalette() {
  /** 접힌 그룹 집합 — 기본은 전체 펼침. */
  const [collapsedGroups, setCollapsedGroups] = useState<
    Set<NodeTemplateGroup>
  >(new Set());
  /** hover 배경 처리용(inline style 관례 유지) — 현재 hover 중인 아이템/헤더. */
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(
    null,
  );
  const [hoveredGroup, setHoveredGroup] = useState<NodeTemplateGroup | null>(
    null,
  );

  const toggleGroup = (group: NodeTemplateGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

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
        {TEMPLATE_GROUPS.map(({ group, label, templates }) => {
          const isCollapsed = collapsedGroups.has(group);
          const isHeaderHovered = hoveredGroup === group;
          // 디자인 시스템 Accordion 토큰 — 열림 헤더/닫힘 헤더 hover 상태.
          const headerBackground = isCollapsed
            ? isHeaderHovered
              ? "var(--color-bg-accordion-closed-hover)"
              : "transparent"
            : isHeaderHovered
              ? "var(--color-bg-accordion-open-hover)"
              : "var(--color-bg-accordion-open)";
          return (
            <section key={group} style={{ padding: "4px 0" }}>
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                onMouseEnter={() => setHoveredGroup(group)}
                onMouseLeave={() => setHoveredGroup(null)}
                aria-expanded={!isCollapsed}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  width: "100%",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 16px",
                  background: headerBackground,
                  textAlign: "left",
                }}
              >
                <span
                  aria-hidden
                  className="typo-text-sm"
                  style={{
                    flexShrink: 0,
                    color: "var(--color-text-subtle)",
                    transform: isCollapsed ? "rotate(-90deg)" : "none",
                    transition: "transform 0.15s ease",
                  }}
                >
                  ▾
                </span>
                <span
                  className="typo-text-sm font-bold"
                  style={{
                    color: "var(--color-text-subtle)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </span>
              </button>
              {!isCollapsed && (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {templates.map((template) => (
                    <li
                      key={template.templateId}
                      draggable
                      onDragStart={(event) =>
                        handleTemplateDragStart(event, template)
                      }
                      onMouseEnter={() =>
                        setHoveredTemplateId(template.templateId)
                      }
                      onMouseLeave={() => setHoveredTemplateId(null)}
                      title={template.description}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 16px",
                        cursor: "grab",
                        background:
                          hoveredTemplateId === template.templateId
                            ? "var(--color-bg-subtle)"
                            : "transparent",
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
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

export default NodePalette;
