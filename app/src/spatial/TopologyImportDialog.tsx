/**
 * TopologyImportDialog — webbuilder export JSON을 임포트해 토폴로지 셋으로 등록한다.
 * 이름 입력 + JSON textarea + .json 파일 선택(FileReader) 3입력을 받아
 * importTopologySet(레지스트리)을 호출하고, 성공 시 onImported로 셋을 넘겨 부모가
 * 닫기·자동 선택을 처리하며 실패 시 파서 errors 목록을 danger 토큰으로 표시한다.
 * 오버레이/본체 구조는 SimulateDialog 관례(runtime.css `.sim-dialog__*`)를 재사용한다.
 */
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { importTopologySet } from "../domain/topology";
import type { TopologySet } from "../domain/topology";
import "../studio/panels/runtime/runtime.css";
import "./spatial.css";

interface TopologyImportDialogProps {
  /** 임포트 셋에 기록할 대상 사이트 UFID — 현재 공간 모델 뷰의 선택 사이트. */
  siteUfid: string;
  /** 닫기(취소/배경막/Esc) 통지. */
  onClose: () => void;
  /** 임포트 성공 통지 — 부모가 셋 목록 갱신 + 자동 선택 + 닫기를 수행한다. */
  onImported: (set: TopologySet) => void;
}

function TopologyImportDialog({ siteUfid, onClose, onImported }: TopologyImportDialogProps) {
  const [name, setName] = useState("");
  const [jsonText, setJsonText] = useState("");
  // importTopologySet 실패 시 파서 오류 목록 — 성공/재시도 시 초기화
  const [errors, setErrors] = useState<string[]>([]);

  // Esc 키로 닫기 — SimulateDialog와 동일 관례.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  /** .json 파일 선택 — FileReader로 본문을 textarea에 채우고, 이름 미입력 시 파일명 승계. */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setJsonText(typeof reader.result === "string" ? reader.result : "");
      setErrors([]);
      setName((prev) => prev.trim() || file.name.replace(/\.json$/i, ""));
    };
    reader.readAsText(file);
  };

  /** [임포트] — 레지스트리 등록·영속. 성공 시 부모 통지, 실패 시 errors 표시. */
  const handleImport = () => {
    const result = importTopologySet({ name, siteUfid, json: jsonText });
    if ("errors" in result) {
      setErrors(result.errors);
      return;
    }
    onImported(result.set);
  };

  return (
    <div className="sim-dialog__overlay" role="dialog" aria-modal="true">
      {/* 배경막 클릭 시 닫기 — 본체 클릭은 backdrop과 분리돼 있어 전파 문제 없음. */}
      <div className="sim-dialog__backdrop" onClick={onClose} />
      <div className="sim-dialog">
        <header className="sim-dialog__header">
          <h2 className="sim-dialog__title typo-title-sm font-bold">토폴로지 임포트</h2>
          <button
            type="button"
            className="sim-dialog__close typo-text-lg"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="sim-dialog__form">
          <div className="sim-dialog__field">
            <label className="sim-dialog__label typo-text-sm font-bold" htmlFor="topo-import-name">
              셋 이름
            </label>
            <input
              id="topo-import-name"
              type="text"
              className="sim-dialog__input typo-text-md"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 본관 1~3층 토폴로지"
            />
          </div>

          <div className="sim-dialog__field">
            <label className="sim-dialog__label typo-text-sm font-bold" htmlFor="topo-import-file">
              .json 파일 선택
            </label>
            <input
              id="topo-import-file"
              type="file"
              accept=".json,application/json"
              className="topology-import__file typo-text-sm"
              onChange={handleFileChange}
            />
          </div>

          <div className="sim-dialog__field">
            <label className="sim-dialog__label typo-text-sm font-bold" htmlFor="topo-import-json">
              webbuilder export JSON
            </label>
            <textarea
              id="topo-import-json"
              className={`sim-dialog__textarea topology-import__textarea typo-text-sm${
                errors.length > 0 ? " sim-dialog__textarea--error" : ""
              }`}
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                setErrors([]);
              }}
              placeholder='[{"id": "...", "displayName": "...", "worldPosition": {"x": 0, "y": 0.2, "z": 0}, ...}] 또는 {"topologyNodes": [...]} / gltf extras 형태'
              spellCheck={false}
            />
            {errors.length > 0 && (
              <ul className="topology-import__errors">
                {errors.map((error, index) => (
                  <li key={index} className="sim-dialog__error typo-text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="sim-dialog__footer">
          <button
            type="button"
            className="sim-dialog__btn sim-dialog__btn--cancel typo-text-md"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="sim-dialog__btn sim-dialog__btn--run typo-text-md font-bold"
            onClick={handleImport}
          >
            임포트
          </button>
        </footer>
      </div>
    </div>
  );
}

export default TopologyImportDialog;
