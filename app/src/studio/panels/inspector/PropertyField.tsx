/**
 * Property Inspector의 속성 편집 필드 — properties 각 키를 값 타입에 따라
 * 적절한 controlled 입력으로 렌더한다. 선택 노드 변경 시 상위에서
 * `key={selectedNode.id}`로 리마운트되므로 내부 로컬 상태는 노드 간에 새지 않는다.
 */
import { useState, type CSSProperties } from "react";

interface PropertyFieldProps {
  propKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** 긴 문장형 문자열로 취급해 textarea로 렌더할 키 판별 (instructions/message/template 류). */
function isLongTextKey(propKey: string): boolean {
  const lower = propKey.toLowerCase();
  return (
    lower === "instructions" ||
    lower.includes("message") ||
    lower.includes("template")
  );
}

/** 원소가 모두 원시값(string/number/boolean)인 배열인지 — 콤마 구분 텍스트 편집 가능 여부. */
function isPrimitiveArray(value: unknown[]): boolean {
  return value.every(
    (item) =>
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean",
  );
}

/** 입력 공통 스타일 — 토큰만 사용. focus/placeholder 상태는 inspector.css 참조. */
export const fieldInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "6px 8px",
  background: "var(--color-bg-surface)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-control)",
  color: "var(--color-text-default)",
  font: "inherit",
};

/** 읽기전용 JSON 표시 스타일 — 편집 불가 값(object/객체 배열)용. */
const jsonPreStyle: CSSProperties = {
  margin: 0,
  padding: "6px 8px",
  background: "var(--color-bg-subtle)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-control)",
  color: "var(--color-text-subtle)",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

/** 원시값 배열의 콤마 구분 텍스트 편집기 — 로컬 raw 텍스트로 타이핑을 보존한다. */
function PrimitiveArrayInput({
  value,
  onChange,
}: {
  value: unknown[];
  onChange: (value: unknown) => void;
}) {
  const [raw, setRaw] = useState(value.map(String).join(", "));
  return (
    <input
      type="text"
      className="inspector-input typo-text-md"
      style={fieldInputStyle}
      value={raw}
      placeholder="쉼표로 구분해 입력"
      onChange={(event) => {
        const next = event.target.value;
        setRaw(next);
        onChange(
          next
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

/** 값 타입별 편집 컨트롤 렌더. */
function FieldControl({ propKey, value, onChange }: PropertyFieldProps) {
  if (typeof value === "string") {
    if (isLongTextKey(propKey)) {
      return (
        <textarea
          className="inspector-input typo-text-md"
          style={{ ...fieldInputStyle, resize: "vertical", minHeight: 60 }}
          value={value}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }
    return (
      <input
        type="text"
        className="inspector-input typo-text-md"
        style={fieldInputStyle}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (typeof value === "number") {
    return (
      <input
        type="number"
        className="inspector-input typo-text-md"
        style={fieldInputStyle}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isNaN(next)) {
            onChange(next);
          }
        }}
      />
    );
  }

  if (typeof value === "boolean") {
    return (
      <label
        className="typo-text-md"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--color-text-default)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          style={{ accentColor: "var(--color-border-focus)" }}
        />
        {value ? "true" : "false"}
      </label>
    );
  }

  if (Array.isArray(value)) {
    if (isPrimitiveArray(value)) {
      return <PrimitiveArrayInput value={value} onChange={onChange} />;
    }
    return (
      <pre className="typo-text-sm" style={jsonPreStyle}>
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  // 그 외 object(null 포함) — 읽기전용 JSON.
  return (
    <pre className="typo-text-sm" style={jsonPreStyle}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

/** 속성 한 개의 라벨 + 편집 컨트롤. */
function PropertyField({ propKey, value, onChange }: PropertyFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        className="typo-text-sm font-bold"
        style={{ color: "var(--color-text-subtle)" }}
      >
        {propKey}
      </span>
      <FieldControl propKey={propKey} value={value} onChange={onChange} />
    </div>
  );
}

export default PropertyField;
