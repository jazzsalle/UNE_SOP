/**
 * Studio Toolbar — 헤더 우측 실행 도구 모음.
 * 좌: 그래프 이름 인라인 편집 + 도메인 뱃지 / 우: 도메인 템플릿 로드,
 * Validate(outline) → Compile(primary) → Simulate(info) 버튼과 결과 요약 뱃지.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 * 버튼 위계는 디자인 가이드 Button SPEC(primary/outline) 관례를 따른다.
 */
import { useState, type CSSProperties } from "react";
import { DOMAIN_TEMPLATE_SEEDS } from "../../domain";
import { useStudio } from "../state/GraphStudioContext";

/** 버튼 공통 스타일 — 높이/패딩/라운드는 디자인 가이드 sm 버튼 규격에 맞춘다. */
const buttonBase: CSSProperties = {
  height: 32,
  padding: "0 12px",
  borderRadius: 6,
  border: "1px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

/** outline 버튼 — Validate 등 보조 액션. */
const outlineButton: CSSProperties = {
  ...buttonBase,
  background: "var(--color-bg-surface)",
  border: "1px solid var(--color-border-default)",
  color: "var(--color-text-default)",
};

/** primary 버튼 — Compile (주 액션). */
const primaryButton: CSSProperties = {
  ...buttonBase,
  background: "var(--color-bg-brand)",
  color: "var(--color-text-on-brand)",
};

/** info 버튼 — Simulate (시뮬레이터 다이얼로그 열기). */
const infoButton: CSSProperties = {
  ...buttonBase,
  background: "var(--color-bg-info)",
  color: "var(--color-text-on-brand)",
};

/** 뱃지 공통 스타일 — subtle 배경 + 상태 텍스트 색. */
const badgeBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 10,
  whiteSpace: "nowrap",
};

function StudioToolbar() {
  const {
    nodes,
    graphMeta,
    updateGraphMeta,
    validationResult,
    simulation,
    setSimulateDialogOpen,
    runValidate,
    runCompile,
    clearSimulation,
    loadDomainTemplate,
  } = useStudio();

  /** 템플릿 select 표시값 — 로드 확정 시에만 갱신한다 (confirm 취소 시 유지). */
  const [selectedSeedId, setSelectedSeedId] = useState("");

  /** 템플릿 선택 → 캔버스에 노드가 있으면 대체 여부를 확인 후 로드. */
  const handleTemplateSelect = (seedId: string) => {
    if (!seedId) {
      return;
    }
    if (
      nodes.length > 0 &&
      !window.confirm(
        "현재 캔버스의 노드/엣지를 선택한 템플릿으로 대체합니다. 계속할까요?",
      )
    ) {
      return;
    }
    setSelectedSeedId(seedId);
    loadDomainTemplate(seedId);
  };

  // Validate/Compile 결과 요약 — 오류/경고 건수 뱃지.
  const errorCount =
    validationResult?.issues.filter((issue) => issue.level === "error")
      .length ?? 0;
  const warningCount =
    validationResult?.issues.filter((issue) => issue.level === "warning")
      .length ?? 0;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginLeft: 24,
      }}
    >
      {/* 좌측: 그래프 이름 + 도메인 뱃지 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <input
          type="text"
          value={graphMeta.name}
          onChange={(event) => updateGraphMeta({ name: event.target.value })}
          aria-label="그래프 이름"
          className="typo-text-md"
          style={{
            width: 220,
            height: 32,
            padding: "0 10px",
            borderRadius: 6,
            border: "1px solid var(--color-border-default)",
            background: "var(--color-bg-surface)",
            color: "var(--color-text-default)",
          }}
        />
        <span
          className="typo-text-sm font-bold"
          style={{
            ...badgeBase,
            background: "var(--color-bg-brand-subtle)",
            color: "var(--color-text-brand)",
          }}
        >
          {graphMeta.domain}
        </span>
      </div>

      {/* 우측: 템플릿 로드 + 실행 버튼 + 결과 요약 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <select
          value={selectedSeedId}
          onChange={(event) => handleTemplateSelect(event.target.value)}
          aria-label="도메인 템플릿 선택"
          className="typo-text-md"
          style={{
            height: 32,
            padding: "0 8px",
            borderRadius: 6,
            border: "1px solid var(--color-border-default)",
            background: "var(--color-bg-surface)",
            color: selectedSeedId
              ? "var(--color-text-default)"
              : "var(--color-text-placeholder)",
            cursor: "pointer",
          }}
        >
          <option value="">도메인 템플릿 로드…</option>
          {DOMAIN_TEMPLATE_SEEDS.map((seed) => (
            <option key={seed.seedId} value={seed.seedId}>
              {seed.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => runValidate()}
          className="typo-text-md font-bold"
          style={outlineButton}
        >
          Validate
        </button>
        <button
          type="button"
          onClick={() => runCompile()}
          className="typo-text-md font-bold"
          style={primaryButton}
        >
          Compile
        </button>
        <button
          type="button"
          onClick={() => setSimulateDialogOpen(true)}
          className="typo-text-md font-bold"
          style={infoButton}
        >
          Simulate
        </button>

        {validationResult && (
          <span
            className="typo-text-sm font-bold"
            style={{
              ...badgeBase,
              background:
                errorCount > 0
                  ? "var(--color-bg-danger-subtle)"
                  : warningCount > 0
                    ? "var(--color-bg-warning-subtle)"
                    : "var(--color-bg-success-subtle)",
              color:
                errorCount > 0
                  ? "var(--color-text-danger)"
                  : warningCount > 0
                    ? "var(--color-text-warning)"
                    : "var(--color-text-success)",
            }}
          >
            {errorCount === 0 && warningCount === 0
              ? "검증 통과"
              : `오류 ${errorCount} · 경고 ${warningCount}`}
          </span>
        )}

        {simulation && (
          <button
            type="button"
            onClick={clearSimulation}
            className="typo-text-md"
            style={outlineButton}
          >
            하이라이트 해제
          </button>
        )}
      </div>
    </div>
  );
}

export default StudioToolbar;
