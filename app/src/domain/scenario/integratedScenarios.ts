/**
 * 통합 시나리오 정의 — 엔드투엔드 데모 2종.
 * ① 검증용 건물 야간 순찰 종합 데모 (로봇개 패트롤 시드 + 토폴로지 임의 생성)
 * ② LH2 누출 대응 데모 (액화수소 플랜트 시드 + 토폴로지 임의 생성)
 * 모듈 로드 시 참조 무결성(seedId/eventId/siteUfid/contactIds)을 검증한다 —
 * robotPatrol.ts의 spaceIdOf 패턴과 동일하게 미존재 시 즉시 Error.
 */
import { findContact } from "../contacts";
import { ALL_SAMPLE_EVENTS, getSeed } from "../seeds";
import { getSite, LH2_PLANT_UFID, VERIFICATION_UFID } from "../spatial";
import type { ScenarioDefinition } from "./scenarioTypes";

/** seedId 실존 검증 — DOMAIN_TEMPLATE_SEEDS에 없으면 Error. */
function seedIdOf(seedId: string): string {
  if (!getSeed(seedId)) {
    throw new Error(`존재하지 않는 도메인 템플릿 시드입니다: "${seedId}"`);
  }
  return seedId;
}

/** eventId 실존 검증 — ALL_SAMPLE_EVENTS에 없으면 Error. */
function eventIdOf(eventId: string): string {
  if (!ALL_SAMPLE_EVENTS.some((event) => event.eventId === eventId)) {
    throw new Error(`존재하지 않는 샘플 이벤트입니다: "${eventId}"`);
  }
  return eventId;
}

/** siteUfid 실존 검증 — spatial 레지스트리에 없으면 Error. */
function siteUfidOf(ufid: string): string {
  if (!getSite(ufid)) {
    throw new Error(`존재하지 않는 사이트 UFID입니다: "${ufid}"`);
  }
  return ufid;
}

/** contactIds 실존 검증 — SEED_CONTACTS에 없는 id가 있으면 Error. */
function contactIdsOf(contactIds: string[]): string[] {
  for (const contactId of contactIds) {
    if (!findContact(contactId)) {
      throw new Error(`존재하지 않는 담당자입니다: "${contactId}"`);
    }
  }
  return contactIds;
}

/** 통합 시나리오 2종 — 시나리오 실행기 선택 목록 순서. */
export const INTEGRATED_SCENARIOS: readonly ScenarioDefinition[] = [
  {
    scenarioId: "scn-verification-patrol",
    name: "검증용 건물 야간 순찰 종합 데모",
    description:
      "검증용 표준 건물의 공간에서 토폴로지를 임의 생성하고, 로봇개 야간 순찰 SOP를 로드해 " +
      "순찰 경로 배정 → 검증·컴파일 → 순찰 실행 → 안전관리자 전파·회신 → 대시보드 점검까지 " +
      "전체 흐름을 시연한다.",
    siteUfid: siteUfidOf(VERIFICATION_UFID),
    seedId: seedIdOf("seed-robot-patrol"),
    topology: { mode: "generate", options: { seed: 20260705 } },
    eventId: eventIdOf("EVT-PATROL-001"),
    contactIds: contactIdsOf(["ct-vrf-001", "ct-vrf-002", "ct-vrf-003", "ct-vrf-004"]),
    steps: [
      {
        title: "시나리오 개요 확인",
        description:
          "검증용 표준 건물(2층)과 담당자 명단(로봇개 R-01·통합관제실·안전관리자)을 확인한다.",
      },
      {
        title: "토폴로지 임의 생성",
        description:
          "건물 공간 footprint에서 내비 토폴로지(노드·링크)를 임의 생성하고 공간 모델 뷰에서 확인한다.",
      },
      {
        title: "야간 순찰 SOP 로드",
        description:
          "로봇개 패트롤 시드를 Studio에 로드하고, 순찰 경로를 방금 생성한 토폴로지의 노드로 배정한다.",
      },
      {
        title: "검증·컴파일",
        description: "그래프를 검증(이슈 0 확인)하고 ExecutionPlan으로 컴파일한다.",
      },
      {
        title: "순찰 실행",
        description:
          "야간 순찰 지시 이벤트(EVT-PATROL-001)로 실행을 시작하고 로봇개의 순찰 경로 로그를 확인한다.",
      },
      {
        title: "전파 수신·조치결과 회신",
        description: "현장 회신 뷰에서 안전관리자가 전파를 수신하고 점검 결과를 회신한다.",
      },
      {
        title: "대시보드 점검",
        description: "전자상황판 대시보드에서 장소·시간·임무내용·상황전파 이력을 최종 점검한다.",
      },
    ],
  },
  {
    scenarioId: "scn-lh2-leak",
    name: "LH2 누출 대응 데모",
    description:
      "액화수소 플랜트 저장구역의 수소 누출 감지 이벤트를 투입해 밸브 차단·환기 조치 SOP 실행 → " +
      "담당자 전파·회신 → 상황판 기록까지의 누출 대응 흐름을 시연한다.",
    siteUfid: siteUfidOf(LH2_PLANT_UFID),
    seedId: seedIdOf("seed-lh2-plant"),
    topology: { mode: "generate", options: { seed: 20260705 } },
    eventId: eventIdOf("EVT-LH2-001"),
    contactIds: contactIdsOf(["ct-lh2-001", "ct-lh2-002", "ct-lh2-003"]),
    steps: [
      {
        title: "시나리오 개요 확인",
        description:
          "액화수소 플랜트(저장구역·펌프실·통제실)와 담당자 명단(현장 안전관리자·설비 담당·통합방재실장)을 확인한다.",
      },
      {
        title: "토폴로지 임의 생성",
        description: "플랜트 공간 footprint에서 토폴로지를 임의 생성하고 공간 모델 뷰에서 확인한다.",
      },
      {
        title: "누출 대응 SOP 로드",
        description: "액화수소 플랜트 시드(누출 감지 → 차단·환기 → 전파 → 상황판)를 Studio에 로드한다.",
      },
      {
        title: "검증·컴파일",
        description: "그래프를 검증(이슈 0 확인)하고 ExecutionPlan으로 컴파일한다.",
      },
      {
        title: "누출 이벤트 실행",
        description: "수소 누출 감지 이벤트(EVT-LH2-001)로 실행을 시작하고 임무 배정 결과를 확인한다.",
      },
      {
        title: "전파 수신·조치결과 회신",
        description: "현장 회신 뷰에서 현장 안전관리자가 전파를 수신하고 차단 조치 결과를 회신한다.",
      },
      {
        title: "대시보드 점검",
        description: "전자상황판 대시보드에서 누출 대응 이력과 상황전파 현황을 최종 점검한다.",
      },
    ],
  },
];
