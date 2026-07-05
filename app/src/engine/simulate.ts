/**
 * simulate — EventContext 시뮬레이션 진입점.
 * 현재는 compileGraph 호출 래퍼다. 향후 2단계(SOP 실행기)에서 "컴파일(계획 수립)"과
 * "실행(상태 진행)"을 분리할 때, 이 모듈이 실행기 쪽 진입점으로 확장될 예정이다.
 */
import type { EventContext, SOPGraph } from "../domain";
import type { SimulateOptions, SimulationResult } from "./types";
import { compileGraph } from "./compileGraph";

/** SOPGraph에 EventContext를 주입해 시뮬레이션한다. 기본 시나리오는 "응답 수신". */
export function simulate(
  graph: SOPGraph,
  ctx: EventContext,
  opts: SimulateOptions = { branchOutcome: "responded" },
): SimulationResult {
  return compileGraph(graph, ctx, opts);
}
