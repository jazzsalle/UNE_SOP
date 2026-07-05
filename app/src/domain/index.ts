/**
 * 도메인 모듈 배럴 — 코어 타입, 노드 템플릿 레지스트리, 노드 팩토리, 도메인 시드를 재수출한다.
 * 외부 레이어(편집기/실행 로직)는 이 진입점을 통해 도메인 모델에 접근한다.
 */
export type * from "./types";
export * from "./templates";
export * from "./factory";
export * from "./seeds";
export * from "./spatial";
export * from "./topology";
export * from "./contacts";
export * from "./scenario";
