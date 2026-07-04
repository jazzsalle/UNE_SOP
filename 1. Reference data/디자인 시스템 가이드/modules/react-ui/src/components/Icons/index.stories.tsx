import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from ".";
import type { IconProps, IconSize } from "./types";
import { useState } from "react";
import { cn } from "@/utils/cn";

const meta: Meta = {
  title: "FOUNDATIONS/icons✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
        기본 사이즈가 24×24인 SVG 아이콘 컴포넌트입니다. 
        size prop으로 크기를 변경할 수 있으며, pathFill 로 색상을 변경할 수 있습니다. 
        currentColor를 사용하여 부모의 색상을 상속합니다.
        pathfill 에 hex 코드 또는 색상 디자인토큰을 설정해보세요.
        e.g) #579ffb 또는 var(--dark-blue-500)
        `,
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const IconGrid = ({
  icons,
  label,
  pathFill,
  size,
}: {
  icons: [string, string, React.FC<IconProps>][];
  label: string;
  pathFill?: string;
  size?: IconSize;
}) => (
  <div className="mb-[32rem]">
    <p className="text-[14rem] font-semibold text-[var(--grayscale-700)] mb-[12rem]">
      {label} ({icons.length})
    </p>
    <div className="flex flex-wrap gap-[16rem]">
      {icons.map(([IconName, FigmaName, IconComponent]) => (
        <div
          key={IconName}
          className="flex flex-col items-center gap-[6rem] w-[80rem]"
        >
          {/* Icon Box */}
          <div
            className={cn(
              "flex items-center justify-center w-[40rem] h-[40rem] rounded-[8rem]",
              "bg-[var(--grayscale-25)] dark:bg-[var(--grayscale-800)]",
            )}
          >
            <IconComponent pathFill={pathFill} size={size} />
          </div>
          {/* Icon Component Name */}
          <p className="text-[10rem] text-[var(--grayscale-500)] text-center leading-tight break-all">
            {IconName.replace("Icon", "")}
          </p>
          {/* Icon Figma Name */}
          <p className="text-[10rem] text-[var(--grayscale-500)] text-center leading-tight break-all">
            {FigmaName}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// 알림 관련 아이콘
const noticeIcons: [string, string, React.FC<IconProps>][] = [
  ["IconCheckFill", "완료_Fill", Icons.IconCheckFill],
  ["IconCheckLine", "완료_Line", Icons.IconCheckLine],
  ["IconWarningFill", "경고_Fill", Icons.IconWarningFill],
  ["IconWarningLine", "경고_Line", Icons.IconWarningLine],
  ["IconSeriousFill", "심각_Fill", Icons.IconSeriousFill],
  ["IconSeriousLine", "심각_Line", Icons.IconSeriousLine],
  ["IconInfoCircleFill", "정보_Fill", Icons.IconInfoCircleFill],
  ["IconInfoCircleLine", "정보_Line", Icons.IconInfoCircleLine],
  ["IconQuestionCircleFill", "도움_Fill", Icons.IconQuestionCircleFill],
  ["IconQuestionCircleLine", "도움_Line", Icons.IconQuestionCircleLine],
  ["IconQuestion", "물음표", Icons.IconQuestion],
  ["IconAlarmFill", "알림_Fill", Icons.IconAlarmFill],
  ["IconAlarmLine", "알림_Line", Icons.IconAlarmLine],
  ["IconAlarmOnFill", "알림 미확인_Fill", Icons.IconAlarmOnFill],
  ["IconAlarmOnLine", "알림 미확인_Line", Icons.IconAlarmOnLine],
  ["IconAlarmOffFill", "알림 끄기_Fill", Icons.IconAlarmOffFill],
  ["IconAlarmOffLine", "알림 끄기_Line", Icons.IconAlarmOffLine],
];

// 입력 관련 아이콘
const inputIcons: [string, string, React.FC<IconProps>][] = [
  ["IconEditFill", "수정_Fill", Icons.IconEditFill],
  ["IconEditLine", "수정_Line", Icons.IconEditLine],
  ["IconEditOffFill", "수정 취소_Fill", Icons.IconEditOffFill],
  ["IconEditOffLine", "수정 취소_Line", Icons.IconEditOffLine],
  ["IconAttachment", "첨부파일", Icons.IconAttachment],
  ["IconLink", "링크", Icons.IconLink],
  ["IconAddLink", "링크 추가", Icons.IconAddLink],
  ["IconUnlink", "링크 해제", Icons.IconUnlink],
  ["IconBinFill", "삭제_Fill", Icons.IconBinFill],
  ["IconBinLine", "삭제_Line", Icons.IconBinLine],
  ["IconCopy", "복사", Icons.IconCopy],
  ["IconCut", "잘라내기", Icons.IconCut],
  ["IconPaste", "붙여넣기", Icons.IconPaste],
  ["IconJustify", "양쪽 정렬", Icons.IconJustify],
  ["IconAlignLeft", "좌측 정렬", Icons.IconAlignLeft],
  ["IconAlignRight", "우측 정렬", Icons.IconAlignRight],
  ["IconAlignCenter", "가운데 정렬", Icons.IconAlignCenter],
  ["IconBold", "굵게", Icons.IconBold],
  ["IconStrikeThrough", "취소선", Icons.IconStrikeThrough],
  ["IconNumbering", "넘버링", Icons.IconNumbering],
  ["IconItalics", "기울임", Icons.IconItalics],
  ["IconUnderline", "밑줄", Icons.IconUnderline],
  // 타이틀
  ["IconDrawTable", "표그리기", Icons.IconDrawTable],
  ["IconLineThickness", "선굵기", Icons.IconLineThickness],
  ["IconFontSize", "텍스트 크기", Icons.IconFontSize],
  ["IconPainting", "색상", Icons.IconPainting],
  ["IconThumbsUpFill", "좋아요_Fill", Icons.IconThumbsUpFill],
  ["IconThumbsUpLine", "좋아요_Line", Icons.IconThumbsUpLine],
  ["IconStarFill", "별_Fill", Icons.IconStarFill],
  ["IconStarLine", "별_Line", Icons.IconStarLine],
  ["IconStarCircle", "동그라미별", Icons.IconStarCircle],
  ["IconHeartFill", "하트_Fill", Icons.IconHeartFill],
  ["IconHeartLine", "하트_Line", Icons.IconHeartLine],
  ["IconX", "엑스", Icons.IconX],
  ["IconXCircle", "동그라미엑스", Icons.IconXCircle],
  ["IconPlus", "플러스", Icons.IconPlus],
  ["IconMinus", "마이너스", Icons.IconMinus],
  ["IconDivider", "일자", Icons.IconDivider],
  ["IconCheck", "체크", Icons.IconCheck],
  ["IconOCircle", "동그라미원", Icons.IconOCircle],
  ["IconGrouping", "그룹화", Icons.IconGrouping],
  ["IconUngroup", "그룹 해제", Icons.IconUngroup],
  ["IconClock", "시간", Icons.IconClock],
  ["IconCalendar", "달력", Icons.IconCalendar],
  ["IconPause", "일시정지", Icons.IconPause],
  ["IconSolidCaretRight", "재생 1", Icons.IconSolidCaretRight],
  ["IconPlayCircle", "재생 2", Icons.IconPlayCircle],
  ["IconSolidCaretLeft", "뒤로", Icons.IconSolidCaretLeft],
  ["IconPower", "전원", Icons.IconPower],
  ["IconStopCircle", "정지", Icons.IconStopCircle],
  ["IconRocket", "실행", Icons.IconRocket],
  ["IconEditLength", "길이 수정", Icons.IconEditLength],
];

// 뷰 관련 아이콘
const viewIcons: [string, string, React.FC<IconProps>][] = [
  ["IconListFill", "리스트형_Fill", Icons.IconListFill],
  ["IconListLine", "리스트형_Line", Icons.IconListLine],
  ["IconGridFill", "그리드형_Fill", Icons.IconGridFill],
  ["IconGridLine", "그리드형_Line", Icons.IconGridLine],
  ["IconPieChart", "그래프", Icons.IconPieChart],
  ["IconFilter", "필터", Icons.IconFilter],

  // 정렬 1
  // 정렬 2

  ["IconEqualCircle", "동등", Icons.IconEqualCircle],

  // 리스트_탑

  ["IconZoomIn", "줌인", Icons.IconZoomIn],
  ["IconZoomOut", "줌아웃", Icons.IconZoomOut],
  ["IconSearch", "검색", Icons.IconSearch],
  ["IconViewPassword", "비밀번호 보기", Icons.IconViewPassword],
  ["IconHidePassword", "비밀번호 숨기기", Icons.IconHidePassword],
  ["IconFullScreen", "풀스크린", Icons.IconFullScreen],
  ["IconFullScreenClose", "축소", Icons.IconFullScreenClose],
  ["IconScreenAdjustment", "화면 조정", Icons.IconScreenAdjustment],
  ["IconLock", "잠김", Icons.IconLock],
  ["IconUnlock", "열림", Icons.IconUnlock],
  ["IconDefaultView", "기본뷰로 지정", Icons.IconDefaultView],
  ["Icon3DControl", "자동회전", Icons.Icon3DControl],
  ["Icon3dRotateOn", "즉시회전 on", Icons.Icon3dRotateOn],
  ["Icon3dRotateOff", "즉시회전 off", Icons.Icon3dRotateOff],
  ["IconComeIn", "출입", Icons.IconComeIn],
  ["IconExit", "로그아웃", Icons.IconExit],
  ["IconChangeSite", "사이트", Icons.IconChangeSite],
  ["Icon3d", "3D", Icons.Icon3d],
  ["IconLinkMove", "이동", Icons.IconLinkMove],
  ["IconPath", "경로", Icons.IconPath],
];

// 방향 관련 아이콘
const directionIcons: [string, string, React.FC<IconProps>][] = [
  ["IconUndo", "실행취소", Icons.IconUndo],
  ["IconRedo", "재실행", Icons.IconRedo],
  ["IconChevronFarUp", "맨 위", Icons.IconChevronFarUp],
  ["IconChevronFarDown", "맨 아래", Icons.IconChevronFarDown],
  ["IconChevronUp", "위", Icons.IconChevronUp],
  ["IconChevronLeft", "왼쪽", Icons.IconChevronLeft],
  ["IconChevronDown", "아래", Icons.IconChevronDown],
  ["IconChevronRight", "오른쪽", Icons.IconChevronRight],
  ["IconDoubleChevronUp", "위_더블", Icons.IconDoubleChevronUp],
  ["IconDoubleChevronLeft", "왼쪽_더블", Icons.IconDoubleChevronLeft],
  ["IconDoubleChevronDown", "아래_더블", Icons.IconDoubleChevronDown],
  ["IconDoubleChevronRight", "오른쪽_더블", Icons.IconDoubleChevronRight],
  ["IconArrowUp", "화살표_위", Icons.IconArrowUp],
  ["IconArrowLeft", "화살표_왼쪽", Icons.IconArrowLeft],
  ["IconArrowDown", "화살표_아래", Icons.IconArrowDown],
  ["IconArrowRight", "화살표_오른쪽", Icons.IconArrowRight],
  ["IconChangeOrder", "순서변경", Icons.IconChangeOrder],
  ["IconBentArrow", "꺽인 화살표", Icons.IconBentArrow],
  ["IconReset", "초기화", Icons.IconReset],
  ["IconChange", "변경", Icons.IconChange],
  ["IconChangeCheck", "변경완료", Icons.IconChangeCheck],
  ["IconChangeCircle", "동그라미 변경", Icons.IconChangeCircle],
  ["IconLoading", "로딩", Icons.IconLoading],
  ["IconUpgrade", "업그레이드", Icons.IconUpgrade],
  ["IconCaretUp", "닫기", Icons.IconCaretUp],
  ["IconCaretDown", "열기", Icons.IconCaretDown],
];

// 파일 관련 아이콘
const fileIcons: [string, string, React.FC<IconProps>][] = [
  ["IconFileUpload", "파일 업로드", Icons.IconFileUpload],
  ["IconFileDownload", "파일 다운로드", Icons.IconFileDownload],
  ["IconCloudUpload", "클라우드 업로드", Icons.IconCloudUpload],
  ["IconCloudDownload", "클라우드 다운로드", Icons.IconCloudDownload],
  ["IconMail", "메일", Icons.IconMail],
  ["IconSendMail", "메일 전송", Icons.IconSendMail],
  ["IconShare", "공유", Icons.IconShare],
  ["IconSend", "전송", Icons.IconSend],
  ["IconMessage", "메세지", Icons.IconMessage],
  ["IconCall", "전화", Icons.IconCall],
  ["IconFolderFill", "폴더_Fill", Icons.IconFolderFill],
  ["IconFolderLine", "폴더_Line", Icons.IconFolderLine],
  ["IconOpenNewTab", "새탭 열기", Icons.IconOpenNewTab],
  ["IconLoad", "불러오기", Icons.IconLoad],
  ["IconExport", "내보내기", Icons.IconExport],
  ["IconPicture", "사진", Icons.IconPicture],
  ["IconPrint", "프린트", Icons.IconPrint],
  ["IconPax", "팩스", Icons.IconPax],
  ["IconCameraFill", "카메라_Fill", Icons.IconCameraFill],
  ["IconCameraLine", "카메라_Line", Icons.IconCameraLine],
  ["IconFlashlightOn", "플래쉬 on", Icons.IconFlashlightOn],
  ["IconFlashlightOff", "플래쉬 off", Icons.IconFlashlightOff],
  ["IconDocument", "문서", Icons.IconDocument],
  ["IconNoticeBoard", "게시판", Icons.IconNoticeBoard],
  ["IconDocsCheck", "점검", Icons.IconDocsCheck],

  // 작업허가서
  // 점검 1
  // 점검 2
  // 점검 3
  // 서명, 결재 1
  // 서명, 결재 2
  // 외주점검보고서

  ["IconMemo", "메모", Icons.IconMemo],
  ["IconTag", "태그", Icons.IconTag],
  ["IconStorageFill", "보관함_Fill", Icons.IconStorageFill],
  ["IconStorageLine", "보관함_Line", Icons.IconStorageLine],
];

// 메뉴 관련 아이콘
const menuIcons: [string, string, React.FC<IconProps>][] = [
  ["IconHomeFill", "홈_Fill", Icons.IconHomeFill],
  ["IconHomeLine", "홈_Line", Icons.IconHomeLine],

  // 로고
  // 메뉴 1
  // 메뉴 2

  ["IconMoreVertical", "더보기 메뉴 1", Icons.IconMoreVertical],
  ["IconMoreHorizontal", "더보기 메뉴 2", Icons.IconMoreHorizontal],
  ["IconProfileFill", "아이디_Fill", Icons.IconProfileFill],
  ["IconProfileLine", "아이디_Line", Icons.IconProfileLine],
  ["IconProfileCircle", "프로필", Icons.IconProfileCircle],
  ["IconBuilding2", "사업장", Icons.IconBuilding2],
  ["IconSetting", "설정", Icons.IconSetting],
  ["IconProfileCheck", "프로필확인", Icons.IconProfileCheck],
  ["IconProfileSetting", "프로필설정", Icons.IconProfileSetting],
  ["IconInjury", "부상", Icons.IconInjury],
  ["IconSafety", "안전", Icons.IconSafety],
  ["IconSafetyProfile", "계정보호", Icons.IconSafetyProfile],
  ["IconIndustrialSafe", "산업 안전", Icons.IconIndustrialSafe],

  // 작업
  // 툴

  ["IconEducation", "", Icons.IconEducation],
];

// 기타 아이콘
const otherIcons: [string, string, React.FC<IconProps>][] = [
  // 차렷

  ["IconRunner", "달리기", Icons.IconRunner],

  // 사람

  ["IconMarket", "마켓", Icons.IconMarket],
  ["IconDatabase1", "데이터 1", Icons.IconDatabase1],
  ["IconDatabase2", "데이터 2", Icons.IconDatabase2],
  ["IconPiggyBank", "돼지", Icons.IconPiggyBank],
  ["IconDollar", "돈", Icons.IconDollar],
  ["IconFlag", "깃발", Icons.IconFlag],
  ["IconGift", "선물", Icons.IconGift],
  ["IconPin", "핀", Icons.IconPin],
  ["IconAnnouncement", "공지사항", Icons.IconAnnouncement],
  ["IconFingerprint", "지문", Icons.IconFingerprint],
  ["IconCard", "카드", Icons.IconCard],
  ["IconFacialRecognition", "얼굴", Icons.IconFacialRecognition],
  ["IconResize", "사이즈조절", Icons.IconResize],
  ["IconMoon", "달", Icons.IconMoon],
  ["IconProhibition", "금지", Icons.IconProhibition],
  ["IconLayerFill", "레이어_Fill", Icons.IconLayerFill],
  ["IconLayerLine", "레이어_Line", Icons.IconLayerLine],
  ["IconRocketLine", "로켓_Line", Icons.IconRocketLine],
  ["IconDot", "점", Icons.IconDot],
];

// 관제 아이콘
const monitoringIcons: [string, string, React.FC<IconProps>][] = [
  ["IconPoiFill", "위치_Fill", Icons.IconPoiFill],
  ["IconPoiLine", "위치_Line", Icons.IconPoiLine],
  ["IconMonitoringFill", "모니터링_Fill", Icons.IconMonitoringFill],
  ["IconMonitoringLine", "모니터링_Line", Icons.IconMonitoringLine],
  ["IconDonutChartFill", "대시보드_Fill", Icons.IconDonutChartFill],
  ["IconDonutChartLine", "대시보드_Line", Icons.IconDonutChartLine],
  ["IconWarningLightFill", "사이렌_Fill", Icons.IconWarningLightFill],
  ["IconWarningLightLine", "사이렌_Line", Icons.IconWarningLightLine],
  ["IconMapFill", "맵_Fill", Icons.IconMapFill],
  ["IconMapLine", "맵_Line", Icons.IconMapLine],
  ["IconWalkietalkieFill", "수동신고_Fill", Icons.IconWalkietalkieFill],
  ["IconWalkietalkieLine", "수동신고_Line", Icons.IconWalkietalkieLine],
  ["Icon3dAuthoringFill", "3D 저작_Fill", Icons.Icon3dAuthoringFill],
  ["Icon3dAuthoringLine", "3D 저작_Line", Icons.Icon3dAuthoringLine],
  ["IconBuildingFill", "건물_Fill", Icons.IconBuildingFill],
  ["IconBuildingLine", "건물_Line", Icons.IconBuildingLine],
  ["IconThermometerFill", "온도", Icons.IconThermometerFill],
  ["IconTelecomTray", "통신 트레이", Icons.IconTelecomTray],
  ["IconPowerTray", "전력 트레이", Icons.IconPowerTray],
  ["Icon360Camera", "360도 카메라", Icons.Icon360Camera],
  ["IconSensor", "센서", Icons.IconSensor],
  ["IconFacility", "설비", Icons.IconFacility],
  ["IconAreaName", "구역명", Icons.IconAreaName],
];

// 알람 유형 아이콘
const alarmIcons: [string, string, React.FC<IconProps>][] = [
  ["IconWind", "대기측정", Icons.IconWind],
  ["IconAirPollutionFill", "대기오염_Fill", Icons.IconAirPollutionFill],
  ["IconWaterDropFill", "수질_Fill", Icons.IconWaterDropFill],
  ["IconWaterDropLine", "수질_LIne", Icons.IconWaterDropLine],
  ["IconSunFill", "기상_Fill", Icons.IconSunFill],
  ["IconSunLine", "기상_Line", Icons.IconSunLine],
  ["IconCctvFill", "CCTV_Fill", Icons.IconCctvFill],
  ["IconCctvLine", "CCTV_Line", Icons.IconCctvLine],
  ["IconThermalCamera", "열화상카메라", Icons.IconThermalCamera],
  ["IconStinkFill", "악취_Fill", Icons.IconStinkFill],
  ["IconGasFill", "가스_Fill", Icons.IconGasFill],
  ["IconGasLine", "가스_Line", Icons.IconGasLine],
  ["IconSkeletonFill", "누출_Fill", Icons.IconSkeletonFill],
  ["IconSkeletonLine", "누출_Line", Icons.IconSkeletonLine],
  ["IconIotFill", "Iot_Fill", Icons.IconIotFill],
  ["IconIotLine", "Iot_Line", Icons.IconIotLine],
  ["IconFireFill", "화재_Fill", Icons.IconFireFill],
  ["IconFireLine", "화재_Line", Icons.IconFireLine],
  ["IconEmergencyFill", "비상벨_Fill", Icons.IconEmergencyFill],
  ["IconEmergencyLine", "비상벨_Line", Icons.IconEmergencyLine],
  ["IconWorkerFill", "작업자_Fill", Icons.IconWorkerFill],
  ["IconWorkerLine", "작업자_Line", Icons.IconWorkerLine],
  ["IconDoorFill", "문_Fill", Icons.IconDoorFill],
  ["IconDoorLine", "문_Line", Icons.IconDoorLine],
  ["IconFloodFill", "홍수_Fill", Icons.IconFloodFill],
  ["IconFloodLine", "홍수_Line", Icons.IconFloodLine],
  ["IconFootprint", "발자국", Icons.IconFootprint],
  ["IconThunderbolt", "번개", Icons.IconThunderbolt],
];

const filterIcons = (
  icons: [string, string, React.FC<IconProps>][],
  query: string,
) =>
  query
    ? icons.filter(
        ([name, figma]) =>
          name.toLowerCase().includes(query.toLowerCase()) ||
          figma.toLowerCase().includes(query.toLowerCase()),
      )
    : icons;

const categories = [
  { icons: noticeIcons, label: "알림 관련 아이콘" },
  { icons: inputIcons, label: "입력 관련 아이콘" },
  { icons: viewIcons, label: "뷰 관련 아이콘" },
  { icons: directionIcons, label: "방향 관련 아이콘" },
  { icons: fileIcons, label: "파일 관련 아이콘" },
  { icons: menuIcons, label: "메뉴 관련 아이콘" },
  { icons: otherIcons, label: "기타 아이콘" },
  { icons: monitoringIcons, label: "관제 아이콘" },
  { icons: alarmIcons, label: "알람 유형 아이콘" },
] as const;

export const Default: Story = {
  name: "all icons",
  args: {
    pathFill: "var(--light-blue-500)",
    size: 24,
  },
  argTypes: {
    pathFill: {
      control: "text",
      description: "SVG path fill 색상 (예: var(--red-500), #ff0000)",
    },
    size: {
      control: { type: "inline-radio" },
      options: [12, 16, 20, 24, 28, 32, 36, 40],
      description: "아이콘 크기 (px = rem)",
    },
  },
  render: (args: { pathFill?: string; size?: IconSize }) => {
    const [query, setQuery] = useState("");
    const filteredCategories = categories
      .map(({ icons, label }) => ({ icons: filterIcons(icons, query), label }))
      .filter(({ icons }) => icons.length > 0);
    const totalCount = filteredCategories.reduce(
      (sum, { icons }) => sum + icons.length,
      0,
    );

    return (
      <div className="w-full h-[-webkit-fill-available]">
        <div>
          <input
            type="text"
            placeholder="아이콘 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-[24rem] px-[12rem] py-[8rem] border border-[var(--grayscale-200)] rounded-[8rem] text-[14rem] w-[300rem] outline-none focus:border-[var(--blue-500)]"
          />
          <p className="text-[12rem] text-[var(--grayscale-400)] mb-[16rem]">
            총 {totalCount}개 아이콘
          </p>
        </div>
        <div>
          {filteredCategories.map(({ icons, label }) => (
            <IconGrid
              key={label}
              icons={icons}
              label={label}
              pathFill={args.pathFill || undefined}
              size={args.size}
            />
          ))}
        </div>
      </div>
    );
  },
};

const allCategoryIcons = [
  ...noticeIcons,
  ...inputIcons,
  ...viewIcons,
  ...directionIcons,
  ...fileIcons,
  ...menuIcons,
  ...otherIcons,
  ...monitoringIcons,
  ...alarmIcons,
];
const fillIcons = allCategoryIcons.filter(([name]) => name.endsWith("Fill"));
const lineIcons = allCategoryIcons.filter(([name]) => name.endsWith("Line"));
const otherIcons2 = allCategoryIcons.filter(
  ([name]) => !name.endsWith("Fill") && !name.endsWith("Line"),
);

export const ByStyle: Story = {
  name: "fill / line / others",
  render: () => (
    <div>
      <IconGrid icons={fillIcons} label="Fill" />
      <IconGrid icons={lineIcons} label="Line" />
      <IconGrid icons={otherIcons2} label="Others" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-end gap-[16rem]">
      {([12, 16, 20, 24, 28, 32, 36, 40] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-[8rem]">
          <Icons.IconHomeFill size={size} />
          <span className="text-[11rem] text-[var(--grayscale-500)]">
            {size}px
          </span>
        </div>
      ))}
    </div>
  ),
};
