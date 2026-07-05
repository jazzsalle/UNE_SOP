/**
 * AppViewContext — 글로벌 뷰 전환 상태를 App 밖(시나리오 실행기/튜토리얼)에서도
 * 제어할 수 있도록 노출하는 얇은 컨텍스트 (Phase 9 결정 2).
 * activeView state의 소유자는 App이며, 이 컨텍스트는 그 값을 그대로 중계한다.
 */
import { createContext, useContext } from "react";

/** 앱 글로벌 뷰 식별자 — Phase 9에서 "scenario"(시나리오 실행기) 추가. */
export type AppView = "studio" | "dashboard" | "responder" | "spatial" | "scenario";

export interface AppViewApi {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export const AppViewContext = createContext<AppViewApi | null>(null);

/** 앱 뷰 전환 훅 — AppViewContext.Provider 밖에서 호출하면 throw. */
export function useAppView(): AppViewApi {
  const api = useContext(AppViewContext);
  if (!api) {
    throw new Error("useAppView()는 AppViewContext.Provider 내부에서만 호출할 수 있습니다.");
  }
  return api;
}
