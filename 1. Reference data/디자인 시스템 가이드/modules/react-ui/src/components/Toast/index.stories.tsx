import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider, useToast } from ".";
import type { ToastCloseReason, ToastProviderProps } from ".";
import { Button } from "../buttons/Button";

const meta: Meta = {
  title: "OVERLAY/Toast✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "화면 상단/하단에 일시적으로 표시되는 알림 토스트입니다. ToastProvider로 감싼 뒤 useToast() 훅으로 사용합니다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj;

const StaticToasts = () => {
  const { toast } = useToast();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    toast("아이콘 없는 메시지입니다.", { intent: "none", duration: 0 });
    toast("정보 메시지입니다.", { intent: "info", duration: 0 });
    toast("저장되었습니다.", { intent: "success", duration: 0 });
    toast("주의가 필요합니다.", { intent: "warning", duration: 0 });
    toast("오류가 발생했습니다.", { intent: "error", duration: 0 });
  }, [toast]);

  return (
    <p className="text-[14rem] text-[var(--grayscale-500)]">
      상단에 4가지 intent 토스트가 표시됩니다.
    </p>
  );
};

export const PropsTest: Story = {
  name: "props test",
  // tags: ["!autodocs"],
  render: () => {
    const positions = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ] as const;
    const intents = ["none", "info", "success", "warning", "error"] as const;

    const [position, setPosition] =
      useState<ToastProviderProps["position"]>("top-center");
    const [intent, setIntent] = useState<(typeof intents)[number]>("info");
    const [duration, setDuration] = useState(3000);
    const [message, setMessage] = useState("토스트 메시지입니다.");
    const [zIndex, setZIndex] = useState(60);

    const Trigger = () => {
      const { toast, dismissAll } = useToast();
      return (
        <div className="flex gap-[8rem]">
          <Button
            size="sm"
            onClick={() => toast(message, { intent, duration })}
          >
            토스트 띄우기
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={() => {
              toast(message, { intent, duration: 0 });
              // 수동 닫기: 닫기 버튼(X)으로만 닫을 수 있는 토스트
            }}
          >
            수동 닫기 토스트
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={dismissAll}
          >
            모두 닫기
          </Button>
        </div>
      );
    };

    const controlStyle =
      "px-[8rem] py-[4rem] rounded-[4rem] border border-[var(--grayscale-300)] dark:border-[var(--grayscale-600)] text-[13rem] text-[var(--grayscale-900)] dark:text-white bg-white dark:bg-[var(--grayscale-800)]";

    return (
      <div className="flex flex-col gap-[16rem]">
        <div className="flex flex-wrap flex-col gap-[12rem]">
          <label className="flex items-center gap-[6rem] text-[13rem] text-[var(--grayscale-900)] dark:text-white">
            position
            <select
              className={controlStyle}
              value={position}
              onChange={(e) =>
                setPosition(e.target.value as ToastProviderProps["position"])
              }
            >
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-[6rem] text-[13rem] text-[var(--grayscale-900)] dark:text-white">
            intent
            <select
              className={controlStyle}
              value={intent}
              onChange={(e) =>
                setIntent(e.target.value as (typeof intents)[number])
              }
            >
              {intents.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-[6rem] text-[13rem] text-[var(--grayscale-900)] dark:text-white">
            duration (ms)
            <input
              type="number"
              className={controlStyle}
              style={{ width: 80 }}
              value={duration}
              step={500}
              min={0}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>

          <label className="flex items-center gap-[6rem] text-[13rem] text-[var(--grayscale-900)] dark:text-white">
            message
            <input
              type="text"
              className={controlStyle}
              style={{ width: 200 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-[6rem] text-[13rem] text-[var(--grayscale-900)] dark:text-white">
            zIndex
            <input
              type="number"
              className={controlStyle}
              style={{ width: 80 }}
              value={zIndex}
              step={10}
              min={0}
              onChange={(e) => setZIndex(Number(e.target.value))}
            />
          </label>
        </div>

        <ToastProvider position={position} duration={duration} zIndex={zIndex}>
          <Trigger />
        </ToastProvider>
      </div>
    );
  },
};

export const ZIndex: Story = {
  name: "z-index",
  parameters: {
    docs: {
      description: {
        story:
          "`zIndex` prop으로 토스트 컨테이너의 z-index를 조정할 수 있습니다. 기본값은 60입니다. 다른 오버레이(모달, 커스텀 딤 등) 위나 아래로 배치해야 할 때 사용하세요.",
      },
    },
  },
  render: () => {
    const [zIndex, setZIndex] = useState(60);

    const Trigger = () => {
      const { toast } = useToast();
      return (
        <Button size="2xs" onClick={() => toast("현재 zIndex로 토스트 표시", { intent: "info" })}>
          토스트 띄우기
        </Button>
      );
    };

    return (
      <div className="flex flex-col gap-[16rem]">
        {/* z-index 비교 설명 */}
        <div className="flex flex-col gap-[8rem] text-[13rem] text-[var(--grayscale-900)] dark:text-white">
          <p>아래 회색 박스는 <code>z-index: 50</code> 오버레이입니다.</p>
          <p>
            토스트 <code>zIndex</code>를 50 미만으로 낮추면 오버레이 뒤로, 50
            이상이면 앞으로 나타납니다.
          </p>
        </div>

        {/* 컨트롤 */}
        <div className="flex items-center gap-[8rem]">
          <Button
            size="sm"
            variant={zIndex === 40 ? "fill" : "outline"}
            color="grayscale"
            onClick={() => setZIndex(40)}
          >
            zIndex = 40 (뒤)
          </Button>
          <Button
            size="sm"
            variant={zIndex === 60 ? "fill" : "outline"}
            color="grayscale"
            onClick={() => setZIndex(60)}
          >
            zIndex = 60 (앞, 기본)
          </Button>
        </div>

        {/* 가상 오버레이 (z-50 고정, 토스트 등장 영역을 덮음) */}
        <div
          style={{ zIndex: 50 }}
          className="fixed top-[48rem] left-1/2 -translate-x-1/2 w-[540rem] h-[80rem] rounded-[8rem] bg-[var(--grayscale-500)]/90 flex items-center justify-center text-[14rem] text-white pointer-events-none"
        >
          z-index: 50 오버레이 (토스트 등장 영역)
        </div>

        <ToastProvider position="top-center" zIndex={zIndex}>
          <Trigger />
        </ToastProvider>
      </div>
    );
  },
};

export const Dismissible: Story = {
  name: "닫기 버튼 표시",
  parameters: {
    docs: {
      description: {
        story:
          "`dismissible` 옵션으로 닫기(X) 버튼 표시 여부를 토스트별로 제어할 수 있습니다. 미지정 시 기본 동작은 **활성 토스트가 2개 이상이거나 `duration: 0`(자동 닫힘 없음)** 일 때 자동 표시입니다. `dismissible: true`/`false`로 명시적으로 override 할 수 있습니다.",
      },
    },
  },
  render: () => {
    const Trigger = () => {
      const { toast } = useToast();
      return (
        <div className="flex flex-wrap gap-[8rem]">
          <Button
            size="sm"
            onClick={() =>
              toast("기본 동작 — 단일 + duration>0이면 X 숨김", {
                intent: "info",
                duration: 5000,
              })
            }
          >
            기본 (X 숨김)
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={() =>
              toast("duration:0 → 단독이어도 X 자동 표시", {
                intent: "warning",
                duration: 0,
              })
            }
          >
            duration:0 (자동 X)
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={() =>
              toast("dismissible:true → 항상 X 표시", {
                intent: "success",
                duration: 5000,
                dismissible: true,
              })
            }
          >
            dismissible: true
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={() => {
              // 2개를 연달아 띄우는데 두 번째는 dismissible:false로 X 숨김
              toast("일반 토스트 (2개+ 이므로 X 표시됨)", {
                intent: "info",
                duration: 0,
              });
              toast("dismissible:false → 강제로 X 숨김", {
                intent: "error",
                duration: 0,
                dismissible: false,
              });
            }}
          >
            dismissible: false (2개 중 하나 숨김)
          </Button>
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-[16rem]">
        <p className="text-[13rem] text-[var(--grayscale-900)] dark:text-white">
          각 버튼을 눌러 닫기(X) 버튼 표시 규칙을 확인해 보세요. 여러 개를 동시에
          띄우면 기본 동작이 달라집니다.
        </p>
        <ToastProvider position="top-center" duration={3000}>
          <Trigger />
        </ToastProvider>
      </div>
    );
  },
};

export const OnClose: Story = {
  name: "onClose 콜백",
  parameters: {
    docs: {
      description: {
        story:
          "`onClose(reason)` 콜백으로 토스트가 닫힐 때 후속 동작을 실행할 수 있습니다. `reason`은 닫힌 원인을 나타냅니다: `timeout`(자동), `manual`(X 버튼), `programmatic`(dismiss/dismissAll 또는 maxToasts 초과). 필요에 따라 `reason`을 분기하거나 무시하고 사용하세요.",
      },
    },
  },
  render: () => {
    // 닫힘 이벤트 로그
    const [log, setLog] = useState<
      { id: number; message: string; reason: ToastCloseReason }[]
    >([]);
    const counterRef = useRef(0);

    const Trigger = () => {
      const { toast, dismissAll } = useToast();

      // onClose 콜백: 로그에 닫힘 이력 추가
      const handleClose = (message: string) => (reason: ToastCloseReason) => {
        setLog((prev) => [
          { id: counterRef.current++, message, reason },
          ...prev,
        ]);
      };

      return (
        <div className="flex flex-wrap gap-[8rem]">
          <Button
            size="sm"
            onClick={() =>
              toast("2초 후 자동으로 닫힙니다", {
                intent: "info",
                duration: 2000,
                onClose: handleClose("자동 닫힘 테스트"),
              })
            }
          >
            자동 닫힘 (timeout)
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={() =>
              toast("X 버튼을 눌러 닫아보세요", {
                intent: "warning",
                duration: 0,
                onClose: handleClose("수동 닫힘 테스트"),
              })
            }
          >
            수동 닫힘 (manual)
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={() => {
              // 띄운 직후 1초 뒤 dismissAll 호출
              toast("1초 후 코드로 닫힙니다", {
                intent: "success",
                duration: 0,
                onClose: handleClose("programmatic 닫힘 테스트"),
              });
              setTimeout(() => dismissAll(), 1000);
            }}
          >
            코드로 닫기 (programmatic)
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="grayscale"
            onClick={() => setLog([])}
          >
            로그 비우기
          </Button>
        </div>
      );
    };

    // reason별 배지 색상
    const reasonColor: Record<ToastCloseReason, string> = {
      timeout:
        "bg-[var(--light-blue-100)] text-[var(--light-blue-700)] dark:bg-[var(--dark-blue-700)] dark:text-[var(--dark-blue-100)]",
      manual:
        "bg-[var(--yellow-100)] text-[var(--yellow-700)] dark:bg-[var(--yellow-700)] dark:text-[var(--yellow-100)]",
      programmatic:
        "bg-[var(--grayscale-100)] text-[var(--grayscale-700)] dark:bg-[var(--grayscale-700)] dark:text-[var(--grayscale-100)]",
    };

    return (
      <div className="flex flex-col gap-[16rem]">
        <p className="text-[13rem] text-[var(--grayscale-900)] dark:text-white">
          토스트를 띄운 뒤 닫혔을 때 <code>onClose(reason)</code>가 호출되며,
          아래에 이력이 쌓입니다.
        </p>

        <ToastProvider position="top-center" duration={3000}>
          <Trigger />
        </ToastProvider>

        {/* 닫힘 이력 로그 */}
        <div className="flex flex-col gap-[6rem] mt-[8rem] p-[12rem] rounded-[6rem] border border-[var(--grayscale-200)] dark:border-[var(--grayscale-700)] bg-[var(--grayscale-25)] dark:bg-[var(--grayscale-800)]">
          <div className="text-[12rem] font-medium text-[var(--grayscale-700)] dark:text-[var(--grayscale-200)]">
            onClose 이벤트 로그 ({log.length})
          </div>
          {log.length === 0 ? (
            <p className="text-[13rem] text-[var(--grayscale-500)]">
              아직 닫힘 이벤트가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-[4rem] max-h-[240rem] overflow-auto">
              {log.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-[8rem] text-[13rem] text-[var(--grayscale-900)] dark:text-white"
                >
                  <span
                    className={`px-[6rem] py-[2rem] rounded-[4rem] text-[11rem] font-medium ${reasonColor[entry.reason]}`}
                  >
                    {entry.reason}
                  </span>
                  <span>{entry.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
};

export const Static: Story = {
  name: "display",
  tags: ["!autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider maxToasts={0}>
        <Story />
      </ToastProvider>
    ),
  ],
  render: () => <StaticToasts />,
};
