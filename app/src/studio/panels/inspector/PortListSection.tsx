/**
 * Property Inspector의 포트 목록 섹션 — 선택 노드의 입출력 포트를 방향별로
 * 읽기전용 나열한다. dataType 뱃지 색은 flowTokens의 PORT_COLOR_TOKEN을 따른다.
 */
import type { NodePort } from "../../../domain";
import { PORT_COLOR_TOKEN } from "../../state/flowTokens";

/** 포트 한 개 행 — 라벨(+required `*`)과 dataType 뱃지. */
function PortRow({ port }: { port: NodePort }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "4px 0",
      }}
    >
      <span
        className="typo-text-md"
        style={{ color: "var(--color-text-default)" }}
      >
        {port.label}
        {port.required && (
          <span
            aria-label="필수 포트"
            style={{ color: "var(--color-text-danger)" }}
          >
            {" *"}
          </span>
        )}
      </span>
      <span
        className="typo-text-sm"
        style={{
          flexShrink: 0,
          padding: "1px 8px",
          borderRadius: "var(--radius-control)",
          background: `var(${PORT_COLOR_TOKEN[port.dataType]})`,
          color: "var(--color-text-on-brand)",
        }}
      >
        {port.dataType}
      </span>
    </li>
  );
}

/** 방향별 소제목 + 포트 행 목록. */
function DirectionGroup({
  title,
  ports,
}: {
  title: string;
  ports: NodePort[];
}) {
  if (ports.length === 0) {
    return null;
  }
  return (
    <div>
      <h4
        className="typo-text-sm font-bold"
        style={{
          margin: "0 0 2px",
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </h4>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {ports.map((port) => (
          <PortRow key={port.id} port={port} />
        ))}
      </ul>
    </div>
  );
}

/** 포트 목록 섹션 (읽기전용). */
function PortListSection({ ports }: { ports: NodePort[] }) {
  const inputs = ports.filter((port) => port.direction === "input");
  const outputs = ports.filter((port) => port.direction === "output");

  if (ports.length === 0) {
    return (
      <p
        className="typo-text-sm"
        style={{ margin: 0, color: "var(--color-text-placeholder)" }}
      >
        포트가 없습니다
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <DirectionGroup title="Input" ports={inputs} />
      <DirectionGroup title="Output" ports={outputs} />
    </div>
  );
}

export default PortListSection;
