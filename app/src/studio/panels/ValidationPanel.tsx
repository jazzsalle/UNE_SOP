/**
 * Validation / Compile Panel — 하단 패널.
 * 좌: runValidate 결과 이슈 목록 (레벨별 색 점, 클릭 시 노드 선택 + 화면 중앙 이동)
 * 우: runCompile 산출 SOPGraph JSON 프리뷰 (복사/다운로드, localStorage 저장 캡션)
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (panels.css, hex/rgb 하드코딩 금지).
 */
import { useCallback, useMemo, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import type { ValidationIssue } from "../../domain";
import type { StudioEdge, StudioNode } from "../state/editorTypes";
import { useStudio } from "../state/GraphStudioContext";
import "./panels.css";

/** setCenter 폴백 크기 — 노드가 아직 측정되지 않았을 때 중앙 보정용. */
const FALLBACK_NODE_WIDTH = 200;
const FALLBACK_NODE_HEIGHT = 72;

/** style 값이 숫자일 때만 반환한다 ("100%" 같은 문자열은 무시). */
function numericStyle(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

/** 노드 중심의 캔버스 절대좌표 — 그룹 자식이면 부모 position을 합산한다. */
function nodeCenter(node: StudioNode, nodes: StudioNode[]): { x: number; y: number } {
  let { x, y } = node.position;
  if (node.parentId) {
    const parent = nodes.find((candidate) => candidate.id === node.parentId);
    if (parent) {
      x += parent.position.x;
      y += parent.position.y;
    }
  }
  const width =
    node.measured?.width ?? numericStyle(node.style?.width) ?? FALLBACK_NODE_WIDTH;
  const height =
    node.measured?.height ?? numericStyle(node.style?.height) ?? FALLBACK_NODE_HEIGHT;
  return { x: x + width / 2, y: y + height / 2 };
}

function ValidationPanel() {
  const { nodes, validationResult, compiledGraph, selectNode } = useStudio();
  const { setCenter } = useReactFlow<StudioNode, StudioEdge>();

  /** "복사" 직후 잠깐 "복사됨"으로 라벨을 바꾸는 피드백 상태. */
  const [copied, setCopied] = useState(false);

  const json = useMemo(
    () => (compiledGraph ? JSON.stringify(compiledGraph, null, 2) : ""),
    [compiledGraph],
  );

  /** 이슈 클릭 → 해당 노드 선택 + 화면 중앙 이동 (nodeId 없는 이슈는 클릭 불가). */
  const focusIssueNode = useCallback(
    (issue: ValidationIssue) => {
      if (!issue.nodeId) {
        return;
      }
      const node = nodes.find((candidate) => candidate.id === issue.nodeId);
      if (!node) {
        return;
      }
      selectNode(issue.nodeId);
      const center = nodeCenter(node, nodes);
      setCenter(center.x, center.y, { zoom: 1, duration: 300 });
    },
    [nodes, selectNode, setCenter],
  );

  const handleCopy = useCallback(() => {
    if (!json) {
      return;
    }
    void navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [json]);

  const handleDownload = useCallback(() => {
    if (!compiledGraph || !json) {
      return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${compiledGraph.graphId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [compiledGraph, json]);

  return (
    <section className="validation-panel">
      <header className="validation-panel__header">
        <h2 className="typo-text-lg font-bold validation-panel__title">
          Validation / Compile
        </h2>
        {validationResult && (
          <>
            <span
              className={`typo-text-sm font-bold validation-panel__badge ${
                validationResult.valid
                  ? "validation-panel__badge--valid"
                  : "validation-panel__badge--invalid"
              }`}
            >
              {validationResult.valid ? "유효" : "오류 있음"}
            </span>
            <span className="typo-text-sm validation-panel__timestamp">
              검증 {new Date(validationResult.validatedAt).toLocaleString("ko-KR")}
            </span>
          </>
        )}
      </header>

      <div className="validation-panel__body">
        {/* 좌: 검증 이슈 목록 */}
        <div className="validation-panel__column">
          <div className="validation-panel__column-header">
            <span className="typo-text-sm font-bold">
              검증 이슈
              {validationResult ? ` (${validationResult.issues.length})` : ""}
            </span>
          </div>
          {!validationResult ? (
            <p className="typo-text-md validation-panel__placeholder">
              Validate를 실행하면 검증 결과가 여기에 표시됩니다
            </p>
          ) : validationResult.issues.length === 0 ? (
            <p className="typo-text-md font-bold validation-panel__pass">
              검증 통과 — 발견된 이슈가 없습니다
            </p>
          ) : (
            <ul className="validation-issue-list">
              {validationResult.issues.map((issue, index) => {
                const content = (
                  <>
                    <span
                      className={`validation-issue__dot validation-issue__dot--${issue.level}`}
                      aria-label={issue.level}
                    />
                    <span className="typo-text-md validation-issue__message">
                      {issue.message}
                    </span>
                    {issue.nodeId && (
                      <span className="typo-text-sm validation-issue__node-id">
                        {issue.nodeId}
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={`${issue.level}-${issue.nodeId ?? issue.edgeId ?? "graph"}-${index}`}>
                    {issue.nodeId ? (
                      <button
                        type="button"
                        className="validation-issue"
                        onClick={() => focusIssueNode(issue)}
                        title="클릭하면 해당 노드로 이동합니다"
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="validation-issue">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 우: SOPGraph JSON 프리뷰 */}
        <div className="validation-panel__column">
          <div className="validation-panel__column-header">
            <span className="typo-text-sm font-bold">SOPGraph JSON</span>
            <span className="validation-panel__spacer" />
            {compiledGraph && (
              <>
                <span className="typo-text-sm json-preview__caption">
                  localStorage 저장됨 · {compiledGraph.updatedAt}
                </span>
                <span className="json-preview__actions">
                  <button
                    type="button"
                    className="typo-text-sm json-preview__button"
                    onClick={handleCopy}
                  >
                    {copied ? "복사됨" : "복사"}
                  </button>
                  <button
                    type="button"
                    className="typo-text-sm json-preview__button"
                    onClick={handleDownload}
                  >
                    다운로드
                  </button>
                </span>
              </>
            )}
          </div>
          {compiledGraph ? (
            <pre className="typo-text-sm json-preview__pre">{json}</pre>
          ) : (
            <p className="typo-text-md validation-panel__placeholder">
              Compile을 실행하면 SOPGraph JSON이 여기에 표시됩니다
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ValidationPanel;
