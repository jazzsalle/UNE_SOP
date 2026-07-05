/**
 * 공간 스키마 모듈 배럴 — 「실내공간정보 구축 작업규정」 기반 타입·분류 코드 테이블·명명규칙 함수와
 * 샘플 공간 모델(검증용 건물·시드 사이트)·조회 레지스트리를 재수출한다.
 * React/xyflow에 의존하지 않는 순수 도메인 모듈이다.
 */
export type * from "./spatialTypes";
export * from "./spatialCodes";
export * from "./naming";
export * from "./model/verificationBuilding";
export * from "./model/seedSites";
export * from "./registry";
