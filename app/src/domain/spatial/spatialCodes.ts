/**
 * 공간 스키마 분류 코드 상수 테이블 — 「실내공간정보 구축 작업규정」
 * 별표 2(레이어 분류체계), 별표 5(레이어 명명규칙·시설구분코드), 별표 6(속성입력 코드값) 근거.
 * 순수 상수·조회 함수만 제공하며 React/xyflow에 의존하지 않는다.
 */

import type {
  DirCode,
  HcpCode,
  QalCode,
  SktCode,
  SlpCode,
  SpatialClassify,
  SpatialDivision,
  SpatialDivisionMajor,
} from "./spatialTypes";

/** DIVISION 코드 1건의 정보 — 한글명(중분류/용도) + 소속 대분류(주체). */
export interface SpatialDivisionInfo {
  /** 중분류(용도) 한글명 — 별표 2. */
  label: string;
  /** 소속 대분류(주체) — 별표 2: 개방/고유/관리. */
  major: SpatialDivisionMajor;
}

/** 대분류(주체) 한글명 — 별표 2. */
export const DIVISION_MAJOR_LABELS: Readonly<Record<SpatialDivisionMajor, string>> = {
  open: "개방",
  private: "고유",
  management: "관리",
};

/**
 * DIVISION 코드 테이블(12종) — 별표 5·6, CHAR(2). 코드↔한글명↔대분류.
 * 대분류→중분류 매핑(별표 2): 개방={이동,안내,편의,운수,안전,소방,판매,의료},
 * 고유={주거,업무}, 관리={관리,구조}.
 */
export const DIVISION_CODES: Readonly<Record<SpatialDivision, SpatialDivisionInfo>> = {
  MV: { label: "이동", major: "open" },
  IF: { label: "안내", major: "open" },
  CV: { label: "편의", major: "open" },
  TP: { label: "운수", major: "open" },
  SF: { label: "안전", major: "open" },
  FF: { label: "소방", major: "open" },
  SL: { label: "판매", major: "open" },
  MD: { label: "의료", major: "open" },
  HS: { label: "주거", major: "private" },
  BS: { label: "업무", major: "private" },
  MN: { label: "관리", major: "management" },
  IS: { label: "구조", major: "management" },
};

/**
 * CLASSIFY 코드 테이블(8종) — 별표 6 기준, CHAR(2).
 * 주의: 별표 5 레이어코드에는 RM을 제외한 7종만 등장하며, 별표 6(속성입력)이 공간(RM)을 추가한다.
 */
export const CLASSIFY_CODES: Readonly<Record<SpatialClassify, string>> = {
  RM: "공간",
  FC: "시설물",
  CL: "천정",
  WL: "벽",
  FL: "바닥",
  DR: "문",
  WD: "창문",
  PL: "기둥",
};

/**
 * 시설구분코드 전표 — 별표 5 라, division별 CHAR(2)→한글명.
 * 전표가 정의된 8개 division(이동/안내/편의/운수/안전/소방/판매/관리)만 수록하며,
 * 미수록 division의 시설구분코드는 형식(2자리 숫자)만 검증한다.
 */
export const FACILITY_KIND_CODES: Readonly<
  Partial<Record<SpatialDivision, Readonly<Record<string, string>>>>
> = {
  MV: {
    "01": "계단",
    "02": "에스컬레이터",
    "03": "무빙워크",
    "04": "엘리베이터",
    "05": "펜스",
    "06": "개찰구",
    "07": "장애인보도블럭",
    "08": "휠체어리프트",
    "09": "경사로",
    "99": "기타",
  },
  IF: {
    "01": "점자길",
    "02": "표지판",
    "03": "안내도",
    "04": "전광판",
    "05": "디지털뷰",
    "06": "게시판",
    "07": "시각장애인용안내장치",
    "08": "지하철승하차위치",
    "99": "기타",
  },
  CV: {
    "01": "공중전화",
    "02": "사물함",
    "03": "즉석사진기",
    "04": "생수대",
    "05": "정수기",
    "06": "현금인출기",
    "07": "휴지통",
    "08": "벤치",
    "09": "체육시설",
    "10": "물품보관함",
    "99": "기타",
  },
  TP: {
    "01": "입국심사대",
    "02": "출국심사대",
    "03": "개찰구",
    "04": "스크린도어",
    "05": "안전선",
    "99": "기타",
  },
  SF: {
    "01": "보안검색대",
    "02": "CCTV",
    "99": "기타",
  },
  FF: {
    "01": "구호물품보관함",
    "02": "긴급전화",
    "03": "비상벨",
    "04": "비상용모래함",
    "05": "소화기",
    "06": "비상조명",
    "07": "비상구",
    "08": "심장제세동기",
    "09": "소화전",
    "10": "방화셔터",
    "11": "완강기",
    "99": "기타",
  },
  SL: {
    "01": "자판기",
    "02": "매표기",
    "99": "기타",
  },
  MN: {
    "01": "보일러",
    "02": "변전기",
    "99": "기타",
  },
};

/**
 * 재질(QAL) 코드 테이블 — 별표 6, CHAR(6).
 * 원문의 "방화 → QALQ001" 표기는 6자리 체계와 불일치하는 오탈자로 판단해 QAL001로 정규화했다.
 */
export const QAL_CODES: Readonly<Record<QalCode, string>> = {
  QAL000: "미분류",
  QAL001: "방화",
  QAL002: "유리",
  QAL003: "철재",
  QAL004: "나무",
  QAL005: "콘크리트",
  QAL006: "종이",
  QAL007: "플라스틱",
  QAL999: "기타",
};

/** 경사(SLP) 코드 테이블 — 별표 6, CHAR(6). */
export const SLP_CODES: Readonly<Record<SlpCode, string>> = {
  SLP000: "미분류",
  SLP001: "경사로없음",
  SLP002: "휠체어",
  SLP003: "자전거",
  SLP004: "통합",
  SLP999: "기타",
};

/** 진행방향(DIR) 코드 테이블 — 별표 6, CHAR(6). */
export const DIR_CODES: Readonly<Record<DirCode, string>> = {
  DIR000: "미분류",
  DIR001: "상행",
  DIR002: "하행",
  DIR003: "양방향",
  DIR999: "기타",
};

/** 내외부(SKT) 코드 테이블 — 별표 6, CHAR(6). */
export const SKT_CODES: Readonly<Record<SktCode, string>> = {
  SKT000: "미분류",
  SKT001: "내부",
  SKT002: "외부",
  SKT999: "기타",
};

/** 장애인 이동(HANDICAP) 코드 테이블 — 별표 6, CHAR(6). */
export const HCP_CODES: Readonly<Record<HcpCode, string>> = {
  HCP000: "이동가능",
  HCP001: "전용",
  HCP002: "이동불가",
};

/** 속성 코드 접두(3자리)→테이블 매핑 — attributeLabel 조회용. */
const ATTRIBUTE_TABLES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  QAL: QAL_CODES,
  SLP: SLP_CODES,
  DIR: DIR_CODES,
  SKT: SKT_CODES,
  HCP: HCP_CODES,
};

/** DIVISION 코드의 중분류 한글명을 반환한다. 미등록 코드는 null. */
export function divisionLabel(code: string): string | null {
  const info = (DIVISION_CODES as Record<string, SpatialDivisionInfo>)[code];
  return info ? info.label : null;
}

/** CLASSIFY 코드의 소분류 한글명을 반환한다. 미등록 코드는 null. */
export function classifyLabel(code: string): string | null {
  const label = (CLASSIFY_CODES as Record<string, string>)[code];
  return label ?? null;
}

/** division별 시설구분코드의 한글명을 반환한다. 전표 미수록 division/코드는 null. */
export function facilityKindLabel(division: string, facilityCode: string): string | null {
  const table = (FACILITY_KIND_CODES as Record<string, Readonly<Record<string, string>>>)[division];
  return table?.[facilityCode] ?? null;
}

/** QAL/SLP/DIR/SKT/HCP 속성 코드(CHAR 6)의 한글명을 반환한다. 미등록 코드는 null. */
export function attributeLabel(code: string): string | null {
  const table = ATTRIBUTE_TABLES[code.slice(0, 3)];
  return table?.[code] ?? null;
}
