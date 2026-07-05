/**
 * EventContext 시뮬레이터 다이얼로그 — 샘플 EventContext 선택/편집 후 시뮬레이션을 실행한다.
 * simulateDialogOpen이 false면 null을 반환하는 자체 게이트라 레이아웃에 상시 마운트해도 된다.
 * 실행 시 useStudio().runSimulate(ctx, { branchOutcome }) 호출 후 닫힌다 (결과 표시는 RuntimePreviewPanel).
 */
import { useEffect, useState } from "react";
import {
  ALL_SAMPLE_EVENTS,
  getSite,
  getSpaces,
  getSpatialSites,
} from "../../domain";
import type { EventContext, Severity } from "../../domain";
import type { SimulateOptions } from "../../engine";
import { useStudio } from "../state/GraphStudioContext";
import "./runtime/runtime.css";

const SEVERITY_OPTIONS: Severity[] = [
  "INFO",
  "CAUTION",
  "WARNING",
  "DANGER",
  "CRITICAL",
];

const SOURCE_OPTIONS: EventContext["source"][] = [
  "sensor",
  "manual",
  "ai",
  "simulation",
];

/** 게이트 컴포넌트 — 닫힌 상태에서는 폼을 언마운트해 재오픈 시 상태가 초기화되게 한다. */
function SimulateDialog() {
  const { simulateDialogOpen } = useStudio();
  if (!simulateDialogOpen) {
    return null;
  }
  return <SimulateDialogBody />;
}

/** 다이얼로그 본체 — 열려 있는 동안만 마운트되는 폼 상태 보유부. */
function SimulateDialogBody() {
  const { setSimulateDialogOpen, runSimulate } = useStudio();

  // 폼 상태 — 샘플 선택 시 일괄 채워지고 이후 개별 편집 가능.
  const [sampleEventId, setSampleEventId] = useState("");
  const [eventId, setEventId] = useState("");
  const [eventType, setEventType] = useState("");
  const [severity, setSeverity] = useState<Severity>("WARNING");
  const [source, setSource] = useState<EventContext["source"]>("simulation");
  const [spaceId, setSpaceId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [siteId, setSiteId] = useState("");
  // 폼에 노출하지 않지만 샘플에서 승계하는 필드 (없으면 실행 시 기본값 생성).
  const [occurredAt, setOccurredAt] = useState("");
  const [measuredText, setMeasuredText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [branchOutcome, setBranchOutcome] =
    useState<SimulateOptions["branchOutcome"]>("responded");

  const close = () => setSimulateDialogOpen(false);

  // ── 공간 레지스트리 기반 siteId/spaceId 선택 목록 (Phase 6) ──
  const spatialSites = getSpatialSites();
  const siteRegistered = siteId !== "" && getSite(siteId) !== null;
  // 사이트 미선택 시 전체 사이트의 공간을 "사이트명 · 공간명"으로 노출한다.
  const spaceOptions = siteRegistered
    ? getSpaces(siteId).map((space) => ({
        value: space.primaryKey,
        label: space.name,
      }))
    : spatialSites.flatMap((site) =>
        getSpaces(site.ufid).map((space) => ({
          value: space.primaryKey,
          label: `${site.name} · ${space.name}`,
        })),
      );
  const spaceUnlisted =
    spaceId !== "" &&
    !spaceOptions.some((option) => option.value === spaceId);

  /** 사이트 변경 — 새 사이트 공간 목록에 없는 spaceId는 초기화한다. */
  const handleSiteSelect = (next: string) => {
    setSiteId(next);
    if (
      next !== "" &&
      getSite(next) !== null &&
      !getSpaces(next).some((space) => space.primaryKey === spaceId)
    ) {
      setSpaceId("");
    }
  };

  // Esc 키로 닫기.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSimulateDialogOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSimulateDialogOpen]);

  /** 샘플 선택 → 폼 전체 필드를 해당 EventContext 값으로 채운다. */
  const handleSampleSelect = (nextId: string) => {
    setSampleEventId(nextId);
    const sample = ALL_SAMPLE_EVENTS.find((ev) => ev.eventId === nextId);
    if (!sample) {
      return;
    }
    setEventId(sample.eventId);
    setEventType(sample.eventType);
    setSeverity(sample.severity);
    setSource(sample.source);
    setSpaceId(sample.spaceId ?? "");
    setAssetId(sample.assetId ?? "");
    setSiteId(sample.siteId ?? "");
    setOccurredAt(sample.occurredAt);
    setMeasuredText(
      sample.measuredValues
        ? JSON.stringify(sample.measuredValues, null, 2)
        : "",
    );
    setJsonError(null);
  };

  /**
   * measuredValues textarea 파싱 — 빈 문자열이면 undefined, JSON 객체가 아니거나
   * 파싱 실패면 null 반환 + 인라인 오류 세팅.
   */
  const parseMeasuredValues = ():
    | EventContext["measuredValues"]
    | null
    | undefined => {
    const text = measuredText.trim();
    if (!text) {
      setJsonError(null);
      return undefined;
    }
    try {
      const parsed: unknown = JSON.parse(text);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setJsonError("JSON 객체 형태여야 합니다 (예: {\"h2_ppm\": 1200})");
        return null;
      }
      setJsonError(null);
      return parsed as EventContext["measuredValues"];
    } catch (error) {
      setJsonError(
        `JSON 파싱 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  };

  /** [시뮬레이션 실행] — EventContext 조립 → runSimulate → 닫기. */
  const handleRun = () => {
    const measuredValues = parseMeasuredValues();
    if (measuredValues === null) {
      return; // 파싱 실패 — 인라인 오류 표시 유지.
    }
    const ctx: EventContext = {
      eventId: eventId.trim() || `EVT-SIM-${Date.now()}`,
      eventType: eventType.trim(),
      severity,
      occurredAt: occurredAt || new Date().toISOString(),
      siteId: siteId || undefined,
      spaceId: spaceId.trim() || undefined,
      assetId: assetId.trim() || undefined,
      source,
      measuredValues,
    };
    runSimulate(ctx, { branchOutcome });
    close();
  };

  return (
    <div className="sim-dialog__overlay" role="dialog" aria-modal="true">
      {/* 배경막 클릭 시 닫기 — 본체 클릭은 backdrop과 분리돼 있어 전파 문제 없음. */}
      <div className="sim-dialog__backdrop" onClick={close} />
      <div className="sim-dialog">
        <header className="sim-dialog__header">
          <h2 className="sim-dialog__title typo-title-sm font-bold">
            EventContext 시뮬레이터
          </h2>
          <button
            type="button"
            className="sim-dialog__close typo-text-lg"
            onClick={close}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="sim-dialog__form">
          <div className="sim-dialog__field">
            <label className="sim-dialog__label typo-text-sm font-bold">
              샘플 이벤트
            </label>
            <select
              className="sim-dialog__select typo-text-md"
              value={sampleEventId}
              onChange={(event) => handleSampleSelect(event.target.value)}
            >
              <option value="">샘플 선택…</option>
              {ALL_SAMPLE_EVENTS.map((sample) => (
                <option key={sample.eventId} value={sample.eventId}>
                  {sample.eventId} · {sample.eventType} ({sample.severity})
                </option>
              ))}
            </select>
          </div>

          <div className="sim-dialog__row">
            <div className="sim-dialog__field">
              <label className="sim-dialog__label typo-text-sm font-bold">
                eventType
              </label>
              <input
                type="text"
                className="sim-dialog__input typo-text-md"
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                placeholder="GAS_LEAK"
              />
            </div>
            <div className="sim-dialog__field">
              <label className="sim-dialog__label typo-text-sm font-bold">
                severity
              </label>
              <select
                className="sim-dialog__select typo-text-md"
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value as Severity)
                }
              >
                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sim-dialog__row">
            <div className="sim-dialog__field">
              <label className="sim-dialog__label typo-text-sm font-bold">
                source
              </label>
              <select
                className="sim-dialog__select typo-text-md"
                value={source}
                onChange={(event) =>
                  setSource(event.target.value as EventContext["source"])
                }
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="sim-dialog__field">
              <label className="sim-dialog__label typo-text-sm font-bold">
                siteId
              </label>
              <select
                className="sim-dialog__select typo-text-md"
                value={siteId}
                onChange={(event) => handleSiteSelect(event.target.value)}
              >
                <option value="">사이트 없음 (빈 값)</option>
                {spatialSites.map((site) => (
                  <option key={site.ufid} value={site.ufid}>
                    {site.name} ({site.ufid})
                  </option>
                ))}
                {/* 레지스트리 밖 기존 값(샘플 승계 등) 보존용 옵션 */}
                {siteId !== "" && !siteRegistered && (
                  <option value={siteId}>{siteId} (미등록)</option>
                )}
              </select>
            </div>
          </div>

          <div className="sim-dialog__field">
            <label className="sim-dialog__label typo-text-sm font-bold">
              spaceId
            </label>
            <select
              className="sim-dialog__select typo-text-md"
              value={spaceId}
              onChange={(event) => setSpaceId(event.target.value)}
            >
              <option value="">공간 없음 (빈 값)</option>
              {spaceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              {/* 레지스트리 밖 기존 값(샘플 승계 등) 보존용 옵션 */}
              {spaceUnlisted && (
                <option value={spaceId}>{spaceId} (미등록)</option>
              )}
            </select>
          </div>

          <div className="sim-dialog__field">
            <label className="sim-dialog__label typo-text-sm font-bold">
              assetId
            </label>
            <input
              type="text"
              className="sim-dialog__input typo-text-md"
              value={assetId}
              onChange={(event) => setAssetId(event.target.value)}
              placeholder="M_B00200000001AULH2F01F01_SFFC_9900001"
            />
          </div>

          <div className="sim-dialog__field">
            <label className="sim-dialog__label typo-text-sm font-bold">
              measuredValues (JSON)
            </label>
            <textarea
              className={`sim-dialog__textarea typo-text-sm${jsonError ? " sim-dialog__textarea--error" : ""}`}
              value={measuredText}
              onChange={(event) => setMeasuredText(event.target.value)}
              onBlur={parseMeasuredValues}
              placeholder='{"h2_ppm": 1200}'
              spellCheck={false}
            />
            {jsonError && (
              <p className="sim-dialog__error typo-text-sm">{jsonError}</p>
            )}
          </div>

          <div className="sim-dialog__field">
            <span className="sim-dialog__label typo-text-sm font-bold">
              응답 분기 (branch)
            </span>
            <div className="sim-dialog__radio-group">
              <label className="sim-dialog__radio typo-text-md">
                <input
                  type="radio"
                  name="branchOutcome"
                  value="responded"
                  checked={branchOutcome === "responded"}
                  onChange={() => setBranchOutcome("responded")}
                />
                응답 수신
              </label>
              <label className="sim-dialog__radio typo-text-md">
                <input
                  type="radio"
                  name="branchOutcome"
                  value="timeout"
                  checked={branchOutcome === "timeout"}
                  onChange={() => setBranchOutcome("timeout")}
                />
                미응답 (timeout)
              </label>
            </div>
          </div>
        </div>

        <footer className="sim-dialog__footer">
          <button
            type="button"
            className="sim-dialog__btn sim-dialog__btn--cancel typo-text-md"
            onClick={close}
          >
            취소
          </button>
          <button
            type="button"
            className="sim-dialog__btn sim-dialog__btn--run typo-text-md font-bold"
            onClick={handleRun}
          >
            시뮬레이션 실행
          </button>
        </footer>
      </div>
    </div>
  );
}

export default SimulateDialog;
