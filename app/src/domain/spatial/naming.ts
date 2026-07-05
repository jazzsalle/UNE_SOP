/**
 * 공간 명명규칙 생성·파싱 순수 함수 모듈 — 「실내공간정보 구축 작업규정」 별표 5·6 근거.
 * 명명규칙 4종:
 *   ① 레이어코드(별표 5)      : `L_` + UFID(17) + `_` + FLOOR(6) + `_` + DIVISION(2) + `_` + CLASSIFY(2)
 *   ② 3차원객체코드(별표 5 나) : `M_` + UFID(17)+FLOOR(6) + `_` + DIVISION(2)+CLASSIFY(2) + `_` + 시설구분(2)+일련번호(5)
 *                               (UFID와 FLOOR 사이에 구분자 없음에 주의)
 *   ③ 3차원텍스쳐코드(별표 5)  : `T_` + ②와 동일 본문 + `_` + 텍스처번호(2) — 1차 POC 미사용으로 미구현
 *   ④ 공간 기본키(별표 6)      : 레이어코드 + `_` + 일련번호(5)
 * 생성(build*)과 파싱(parse*)은 왕복 정합을 보장한다. 파싱 실패 시 null을 반환하고,
 * 생성 함수는 잘못된 입력에 대해 Error를 던진다.
 */

import { CLASSIFY_CODES, DIVISION_CODES } from "./spatialCodes";
import type { FloorPrefix, SpatialClassify, SpatialDivision } from "./spatialTypes";

/** UFID(공간객체등록번호) 고정 길이 — 별표 5, CHAR(17) mock. */
export const UFID_LENGTH = 17;

/** UFID 형식 — 영대문자·숫자 17자 고정. 예: `B00100000001AULW1`. */
const UFID_PATTERN = /^[A-Z0-9]{17}$/;

/** FLOOR 코드 형식(CHAR 6) — 시작층(접두 B/F/L + 2자리)+끝층(동일 구조). 예: `F01F01`, `B01F01`. */
const FLOOR_CODE_PATTERN = /^[BFL]\d{2}[BFL]\d{2}$/;

/** 시설구분코드 형식 — 별표 5 라, 2자리 숫자. */
const FACILITY_CODE_PATTERN = /^\d{2}$/;

/** ① 레이어코드 형식 — 그룹: UFID / FLOOR / DIVISION / CLASSIFY. */
const LAYER_CODE_PATTERN = /^L_([A-Z0-9]{17})_([BFL]\d{2}[BFL]\d{2})_([A-Z]{2})_([A-Z]{2})$/;

/** ② 3차원객체코드 형식 — `M_` 이후 UFID(17)+FLOOR(6)가 구분자 없이 붙는다. */
const OBJECT_CODE_PATTERN =
  /^M_([A-Z0-9]{17})([BFL]\d{2}[BFL]\d{2})_([A-Z]{2})([A-Z]{2})_(\d{2})(\d{5})$/;

/** ④ 공간 기본키 형식 — 그룹: 레이어코드 / 일련번호(5). */
const SPACE_PRIMARY_KEY_PATTERN =
  /^(L_[A-Z0-9]{17}_[BFL]\d{2}[BFL]\d{2}_[A-Z]{2}_[A-Z]{2})_(\d{5})$/;

/** parseLayerCode 결과 — 레이어코드의 표준 분해. */
export interface ParsedLayerCode {
  ufid: string;
  floorCode: string;
  division: SpatialDivision;
  classify: SpatialClassify;
}

/** parseObjectCode 결과 — 3차원객체코드의 표준 분해. serial은 5자리 zero-pad 문자열. */
export interface ParsedObjectCode {
  ufid: string;
  floorCode: string;
  division: SpatialDivision;
  classify: SpatialClassify;
  facilityCode: string;
  serial: string;
}

/** parseSpacePrimaryKey 결과 — 기본키의 레이어코드 분해 + 일련번호. */
export interface ParsedSpacePrimaryKey {
  layerCode: string;
  ufid: string;
  floorCode: string;
  division: SpatialDivision;
  classify: SpatialClassify;
  serial: string;
}

/** 유효한 DIVISION 코드(12종)인지 판정한다. */
function isDivision(code: string): code is SpatialDivision {
  return code in DIVISION_CODES;
}

/** 유효한 CLASSIFY 코드(8종)인지 판정한다. */
function isClassify(code: string): code is SpatialClassify {
  return code in CLASSIFY_CODES;
}

/** 정수 n을 자릿수 width로 zero-pad한다. 범위 초과 시 Error. */
function padNumber(n: number, width: number, label: string): string {
  if (!Number.isInteger(n) || n < 0 || n >= 10 ** width) {
    throw new Error(`${label}는 0 이상 ${10 ** width - 1} 이하의 정수여야 합니다: ${n}`);
  }
  return String(n).padStart(width, "0");
}

/** UFID 형식(영대문자·숫자 17자)을 검증한다. 위반 시 Error. */
function assertUfid(ufid: string): void {
  if (!UFID_PATTERN.test(ufid)) {
    throw new Error(`UFID는 영대문자·숫자 ${UFID_LENGTH}자 고정입니다: "${ufid}"`);
  }
}

/** FLOOR 코드 형식(CHAR 6)을 검증한다. 위반 시 Error. */
function assertFloorCode(floorCode: string): void {
  if (!FLOOR_CODE_PATTERN.test(floorCode)) {
    throw new Error(`FLOOR 코드는 [BFL]NN[BFL]NN 6자 형식입니다: "${floorCode}"`);
  }
}

/** DIVISION·CLASSIFY 코드 유효성을 검증한다. 위반 시 Error. */
function assertDivisionClassify(division: string, classify: string): void {
  if (!isDivision(division)) {
    throw new Error(`유효하지 않은 DIVISION 코드입니다: "${division}"`);
  }
  if (!isClassify(classify)) {
    throw new Error(`유효하지 않은 CLASSIFY 코드입니다: "${classify}"`);
  }
}

/**
 * FLOOR 코드(CHAR 6)를 생성한다 — 별표 5: 시작층(3)+끝층(3), 단일층은 동일 코드 반복.
 * 예: buildFloorCode("B", 1) → `B01B01`, buildFloorCode("F", 1) → `F01F01`.
 */
export function buildFloorCode(prefix: FloorPrefix, n: number): string {
  const half = `${prefix}${padNumber(n, 2, "층 번호")}`;
  return `${half}${half}`;
}

/**
 * ① 레이어코드를 생성한다 — 별표 5.
 * 예: buildLayerCode("B00100000001AULW1", "F01F01", "SL", "FC") → `L_B00100000001AULW1_F01F01_SL_FC`.
 */
export function buildLayerCode(
  ufid: string,
  floorCode: string,
  division: SpatialDivision,
  classify: SpatialClassify,
): string {
  assertUfid(ufid);
  assertFloorCode(floorCode);
  assertDivisionClassify(division, classify);
  return `L_${ufid}_${floorCode}_${division}_${classify}`;
}

/**
 * ② 3차원객체코드를 생성한다 — 별표 5 나. UFID와 FLOOR는 구분자 없이 결합한다.
 * serial은 5자리 zero-pad. 예: 소화기(FF/05) → `M_B00100000001AULW1F01F01_FFFC_0500001`.
 * 시설구분코드는 전표 미수록 division이 있어 형식(2자리 숫자)만 검증한다.
 */
export function buildObjectCode(
  ufid: string,
  floorCode: string,
  division: SpatialDivision,
  classify: SpatialClassify,
  facilityCode: string,
  serial: number,
): string {
  assertUfid(ufid);
  assertFloorCode(floorCode);
  assertDivisionClassify(division, classify);
  if (!FACILITY_CODE_PATTERN.test(facilityCode)) {
    throw new Error(`시설구분코드는 2자리 숫자입니다: "${facilityCode}"`);
  }
  return `M_${ufid}${floorCode}_${division}${classify}_${facilityCode}${padNumber(serial, 5, "일련번호")}`;
}

/**
 * ④ 공간 기본키를 생성한다 — 별표 6: 레이어코드 + `_` + 일련번호(5).
 * 예: `L_B00100000001AULW1_F01F01_BS_RM_00001`.
 * 구성 길이: `L_`(2)+UFID(17)+`_`(1)+FLOOR(6)+`_`(1)+DIVISION(2)+`_`(1)+CLASSIFY(2)+`_`(1)+SERIAL(5) = 38자
 * (별표 6은 CHAR(41)로 표기하나 UFID 17자 mock 기준 구성요소 합은 38자 — T1 분석 문서 참조).
 */
export function buildSpacePrimaryKey(layerCode: string, serial: number): string {
  if (parseLayerCode(layerCode) === null) {
    throw new Error(`유효하지 않은 레이어코드입니다: "${layerCode}"`);
  }
  return `${layerCode}_${padNumber(serial, 5, "일련번호")}`;
}

/** ① 레이어코드를 파싱한다. 형식·코드 불일치 시 null. */
export function parseLayerCode(code: string): ParsedLayerCode | null {
  const match = LAYER_CODE_PATTERN.exec(code);
  if (!match) return null;
  const [, ufid, floorCode, division, classify] = match;
  if (!isDivision(division) || !isClassify(classify)) return null;
  return { ufid, floorCode, division, classify };
}

/** ② 3차원객체코드를 파싱한다. `M_` 이후 UFID(17)+FLOOR(6)가 붙어 있음에 주의. 실패 시 null. */
export function parseObjectCode(code: string): ParsedObjectCode | null {
  const match = OBJECT_CODE_PATTERN.exec(code);
  if (!match) return null;
  const [, ufid, floorCode, division, classify, facilityCode, serial] = match;
  if (!isDivision(division) || !isClassify(classify)) return null;
  return { ufid, floorCode, division, classify, facilityCode, serial };
}

/** ④ 공간 기본키를 파싱한다 — 레이어코드 분해 결과와 일련번호를 함께 반환. 실패 시 null. */
export function parseSpacePrimaryKey(code: string): ParsedSpacePrimaryKey | null {
  const match = SPACE_PRIMARY_KEY_PATTERN.exec(code);
  if (!match) return null;
  const [, layerCode, serial] = match;
  const parsed = parseLayerCode(layerCode);
  if (!parsed) return null;
  return { layerCode, ...parsed, serial };
}
