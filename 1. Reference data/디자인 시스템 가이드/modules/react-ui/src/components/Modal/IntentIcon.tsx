import { IconInfoCircleFill } from "../Icons/IconInfoCircleFill";
import { IconCheckFill } from "../Icons/IconCheckFill";
import { IconWarningFill } from "../Icons/IconWarningFill";
import type { ModalIntent } from "./types";
import { IconSeriousFill } from "../Icons";

/**
 * IntentIcon — 모달 의도(intent)에 따른 아이콘
 *
 * | intent  | 아이콘              | light           | dark           |
 * |---------|---------------------|-----------------|----------------|
 * | info    | IconInfoCircleFill  | light-blue-500  | light-blue-300 |
 * | success | IconCheckFill       | green-500       | green-300      |
 * | warning | IconWarningFill     | orange-400      | yellow-200     |
 * | delete  | IconXCircle         | red-500         | red-300        |
 */
export function IntentIcon({ intent }: { intent: ModalIntent }) {
  switch (intent) {
    case "info":
      return (
        <IconInfoCircleFill
          size={32}
          className="text-[var(--color-icon-info)]"
        />
      );
    case "success":
      return (
        <IconCheckFill
          size={32}
          className="text-[var(--color-icon-success)]"
        />
      );
    case "warning":
      return (
        // TODO: 시맨틱 토큰 미정의 — warning intent icon용 --color-icon-warning 사용 (orange-400 → warning 근사치)
        <IconWarningFill
          size={32}
          className="text-[var(--color-icon-warning)]"
        />
      );
    case "delete":
      return (
        <IconSeriousFill
          size={32}
          className="text-[var(--color-icon-danger)]"
        />
      );
  }
}
