/**
 * 통합 시나리오 모듈 배럴 — 시나리오 타입, 정의 2종, 조회 헬퍼를 재수출한다.
 * React 무의존 순수 모듈 — 시나리오 실행기(Phase 9 T4)가 이 진입점으로 접근한다.
 */
import type { ScenarioDefinition } from "./scenarioTypes";
import { INTEGRATED_SCENARIOS } from "./integratedScenarios";

export type * from "./scenarioTypes";
export { INTEGRATED_SCENARIOS } from "./integratedScenarios";

/** scenarioId로 통합 시나리오를 조회한다. 없으면 undefined. */
export function getScenario(scenarioId: string): ScenarioDefinition | undefined {
  return INTEGRATED_SCENARIOS.find((scenario) => scenario.scenarioId === scenarioId);
}
