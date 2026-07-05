/**
 * 도메인 시드 배럴 — 5종 도메인 템플릿 시드 레지스트리와 조회 헬퍼를 제공한다.
 * (액화수소 플랜트 / 발전소 / 안전한국훈련 / 일반 사업장 / 로봇개 패트롤)
 */
import type { EventContext } from "../types";
import type { DomainTemplateSeed } from "./seedTypes";
import { LH2_PLANT_SEED } from "./lh2Plant";
import { POWER_PLANT_SEED } from "./powerPlant";
import { SAFETY_KOREA_DRILL_SEED } from "./safetyKoreaDrill";
import { GENERAL_WORKPLACE_SEED } from "./generalWorkplace";
import { ROBOT_PATROL_SEED } from "./robotPatrol";

export * from "./seedTypes";
export { LH2_PLANT_SEED } from "./lh2Plant";
export { POWER_PLANT_SEED } from "./powerPlant";
export { SAFETY_KOREA_DRILL_SEED } from "./safetyKoreaDrill";
export { GENERAL_WORKPLACE_SEED } from "./generalWorkplace";
export { ROBOT_PATROL_SEED } from "./robotPatrol";

/** 전체 도메인 템플릿 시드 5종 — 툴바 템플릿 선택 목록 순서. */
export const DOMAIN_TEMPLATE_SEEDS: DomainTemplateSeed[] = [
  LH2_PLANT_SEED,
  POWER_PLANT_SEED,
  SAFETY_KOREA_DRILL_SEED,
  GENERAL_WORKPLACE_SEED,
  ROBOT_PATROL_SEED,
];

/** seedId로 도메인 템플릿 시드를 조회한다. 없으면 undefined. */
export function getSeed(seedId: string): DomainTemplateSeed | undefined {
  return DOMAIN_TEMPLATE_SEEDS.find((seed) => seed.seedId === seedId);
}

/** 전체 시드의 샘플 EventContext 평탄화 목록 — 시뮬레이터 샘플 선택용. */
export const ALL_SAMPLE_EVENTS: EventContext[] = DOMAIN_TEMPLATE_SEEDS.flatMap(
  (seed) => seed.sampleEvents,
);
