import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from ".";
import { Badge } from "../badges/Badge";
import { Button } from "../buttons/Button";
import { IconButton } from "../buttons/IconButton";
import { IconMoreVertical, IconEditLine } from "../Icons";

const meta: Meta<typeof Card> = {
  title: "COMPONENTS/Card",
  component: Card,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["vertical", "horizontal"],
      description: "레이아웃 방향",
    },
    cardStyle: {
      control: { type: "select" },
      options: ["elevated", "fill", "outline"],
      description: "시각적 스타일",
    },
    selected: {
      control: { type: "boolean" },
      description: "선택 상태",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

// 공통 미디어 플레이스홀더 — absolute inset-0으로 CardMedia(relative) 전체 채움
const MediaPlaceholder = () => (
  <div className="absolute inset-0 bg-[var(--color-bg-muted)] flex items-center justify-center">
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="4" fill="var(--color-bg-subtle)" />
      <path
        d="M20 44L28 32L34 40L40 30L44 44H20Z"
        fill="var(--color-border-strong)"
        opacity="0.5"
      />
      <circle
        cx="26"
        cy="26"
        r="4"
        fill="var(--color-border-strong)"
        opacity="0.5"
      />
    </svg>
  </div>
);

// 공통 액션 버튼
const HeaderActions = () => (
  <>
    <IconButton
      size="2xs"
      variant="ghost"
      color="grayscale"
      icon={<IconEditLine />}
    />
    <IconButton
      size="2xs"
      variant="ghost"
      color="grayscale"
      icon={<IconMoreVertical />}
    />
  </>
);

export const Default: Story = {
  name: "props test",
  args: {
    variant: "vertical",
    cardStyle: "elevated",
    selected: false,
    disabled: false,
  },
  render: (args) => (
    <Card
      {...args}
      className={args.variant === "horizontal" ? "w-[502rem]" : "w-[340rem]"}
    >
      <Card.Media>
        <MediaPlaceholder />
      </Card.Media>
      <Card.Header
        title="카드 제목"
        subtitle="카드 부제목 텍스트"
        badge={
          <Badge
            label="Badge"
            variant="solid-pastel"
            color="primary"
            size="sm"
          />
        }
        actions={<HeaderActions />}
      />
      <Card.Body>
        <p className="typo-text-sm text-[var(--color-text-secondary)]">
          카드 본문 콘텐츠 영역입니다. 텍스트, 리스트, 메타데이터 등을 자유롭게
          배치할 수 있습니다.
        </p>
      </Card.Body>
      <Card.Footer>
        <Button variant="ghost" color="grayscale" size="2xs">
          취소
        </Button>
        <Button variant="ghost" color="primary" size="2xs">
          확인
        </Button>
      </Card.Footer>
    </Card>
  ),
};

export const Styles: Story = {
  name: "style",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-[24rem] items-start flex-wrap">
      {(["elevated", "fill", "outline"] as const).map((cardStyle) => (
        <div key={cardStyle} className="flex flex-col gap-[12rem] items-center">
          <span className="typo-text-sm font-medium text-[var(--color-text-default)] capitalize">
            {cardStyle}
          </span>
          <Card cardStyle={cardStyle} className="w-[280rem]">
            <Card.Header
              title="카드 제목"
              subtitle="카드 부제목"
              badge={
                <Badge
                  label="Badge"
                  variant="solid-pastel"
                  color="primary"
                  size="sm"
                />
              }
            />
            <Card.Body>
              <p className="typo-text-sm text-[var(--color-text-secondary)]">
                본문 콘텐츠 영역
              </p>
            </Card.Body>
            <Card.Footer>
              <Button variant="ghost" color="primary" size="2xs">
                확인
              </Button>
            </Card.Footer>
          </Card>
        </div>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  name: "variant",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[32rem]">
      {/* 세로형 */}
      <div className="flex flex-col gap-[12rem]">
        <span className="typo-text-lg font-medium text-[var(--color-text-default)]">
          Vertical
        </span>
        <Card cardStyle="elevated" className="w-[340rem]">
          <Card.Media>
            <MediaPlaceholder />
          </Card.Media>
          <Card.Header
            title="세로형 카드"
            subtitle="미디어 + 헤더 + 바디 + 푸터 조합"
          />
          <Card.Body>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              본문 콘텐츠 영역
            </p>
          </Card.Body>
          <Card.Footer>
            <Button variant="ghost" color="grayscale" size="2xs">
              취소
            </Button>
            <Button variant="ghost" color="primary" size="2xs">
              확인
            </Button>
          </Card.Footer>
        </Card>
      </div>

      {/* 가로형 */}
      <div className="flex flex-col gap-[12rem]">
        <span className="typo-text-lg font-medium text-[var(--color-text-default)]">
          Horizontal
        </span>
        <Card variant="horizontal" cardStyle="elevated" className="w-[502rem]">
          <Card.Media>
            <MediaPlaceholder />
          </Card.Media>
          <Card.Header
            title="가로형 카드"
            subtitle="좌측 미디어, 우측 콘텐츠"
            badge={
              <Badge
                label="Badge"
                variant="solid-pastel"
                color="primary"
                size="sm"
              />
            }
            actions={<HeaderActions />}
          />
          <Card.Body>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              카드 본문 콘텐츠 영역입니다. 텍스트, 리스트, 메타데이터 등을
              자유롭게 배치할 수 있습니다.
            </p>
          </Card.Body>
          <Card.Footer>
            <div className="flex-1">
              <Badge
                label="레이블"
                variant="dot-accent"
                color="grayscale"
                size="md"
              />
            </div>
            <div className="flex gap-[8rem]">
              <Button variant="ghost" color="grayscale" size="2xs">
                버튼이름
              </Button>
              <Button variant="ghost" color="primary" size="2xs">
                버튼이름
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </div>
  ),
};

export const HeaderDivider: Story = {
  name: "header divider",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-[24rem] items-start">
      <div className="flex flex-col gap-[12rem] items-center">
        <span className="typo-text-sm font-medium text-[var(--color-text-default)]">
          None
        </span>
        <Card className="w-[280rem]">
          <Card.Header title="헤더 제목" subtitle="부제목" />
          <Card.Body>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              본문 영역
            </p>
          </Card.Body>
        </Card>
      </div>
      <div className="flex flex-col gap-[12rem] items-center">
        <span className="typo-text-sm font-medium text-[var(--color-text-default)]">
          Line
        </span>
        <Card className="w-[280rem]">
          <Card.Header title="헤더 제목" subtitle="부제목" divider />
          <Card.Body>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              본문 영역
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  ),
};

export const BodyDivider: Story = {
  name: "body divider",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-[24rem] items-start">
      <div className="flex flex-col gap-[12rem] items-center">
        <span className="typo-text-sm font-medium text-[var(--color-text-default)]">
          None
        </span>
        <Card className="w-[280rem]">
          <Card.Header title="헤더 제목" />
          <Card.Body>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              본문 영역
            </p>
          </Card.Body>
          <Card.Footer>
            <Button variant="ghost" color="primary" size="2xs">
              확인
            </Button>
          </Card.Footer>
        </Card>
      </div>
      <div className="flex flex-col gap-[12rem] items-center">
        <span className="typo-text-sm font-medium text-[var(--color-text-default)]">
          Line
        </span>
        <Card className="w-[280rem]">
          <Card.Header title="헤더 제목" />
          <Card.Body divider>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              본문 영역
            </p>
          </Card.Body>
          <Card.Footer>
            <Button variant="ghost" color="primary" size="2xs">
              확인
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </div>
  ),
};

export const SelectedAndDisabled: Story = {
  name: "selected & disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-[24rem] items-start flex-wrap">
      {(
        [
          { label: "Default", selected: false, disabled: false },
          { label: "Selected", selected: true, disabled: false },
          { label: "Disabled", selected: false, disabled: true },
        ] as { label: string; selected: boolean; disabled: boolean }[]
      ).map(({ label, selected, disabled }) => (
        <div key={label} className="flex flex-col gap-[12rem] items-center">
          <span className="typo-text-sm font-medium text-[var(--color-text-default)]">
            {label}
          </span>
          <Card
            cardStyle="elevated"
            selected={selected}
            disabled={disabled}
            className="w-[240rem]"
          >
            <Card.Header title="카드 제목" subtitle="부제목" />
            <Card.Body>
              <p className="typo-text-sm text-[var(--color-text-secondary)]">
                본문 영역
              </p>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  name: "interactive",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-[24rem] items-start flex-wrap">
      {(["elevated", "fill", "outline"] as const).map((cardStyle) => (
        <div key={cardStyle} className="flex flex-col gap-[12rem] items-center">
          <span className="typo-text-sm font-medium text-[var(--color-text-default)] capitalize">
            {cardStyle}
          </span>
          <Card
            cardStyle={cardStyle}
            onClick={() => alert(`${cardStyle} 카드 클릭!`)}
            className="w-[240rem]"
          >
            <Card.Header
              title="클릭 가능한 카드"
              subtitle="hover / active / focus 상태 확인"
            />
            <Card.Body>
              <p className="typo-text-sm text-[var(--color-text-secondary)]">
                클릭해 보세요
              </p>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  ),
};

export const CompositionExamples: Story = {
  name: "composition",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-[24rem] items-start flex-wrap">
      {/* 정보형: Header + Body */}
      <div className="flex flex-col gap-[8rem]">
        <span className="typo-text-sm text-[var(--color-text-secondary)]">
          정보형 (Header + Body)
        </span>
        <Card className="w-[280rem]">
          <Card.Header
            title="공지사항"
            subtitle="2026.05.14"
            badge={
              <Badge label="긴급" variant="solid" color="error" size="sm" />
            }
          />
          <Card.Body>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              시스템 점검으로 인해 서비스가 일시 중단됩니다.
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* 이미지 중심: Media + Header */}
      <div className="flex flex-col gap-[8rem]">
        <span className="typo-text-sm text-[var(--color-text-secondary)]">
          이미지 중심 (Media + Header)
        </span>
        <Card className="w-[280rem]">
          <Card.Media>
            <MediaPlaceholder />
          </Card.Media>
          <Card.Header title="이미지 카드" subtitle="미디어 + 헤더 조합" />
        </Card>
      </div>

      {/* 액션형: Body + Footer */}
      <div className="flex flex-col gap-[8rem]">
        <span className="typo-text-sm text-[var(--color-text-secondary)]">
          액션형 (Body + Footer)
        </span>
        <Card className="w-[280rem]">
          <Card.Body divider>
            <p className="typo-text-sm text-[var(--color-text-secondary)]">
              작업을 계속 진행하시겠습니까?
            </p>
          </Card.Body>
          <Card.Footer>
            <Button variant="ghost" color="grayscale" size="2xs">
              취소
            </Button>
            <Button variant="ghost" color="primary" size="2xs">
              확인
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </div>
  ),
};
