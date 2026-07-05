/**
 * 통합 시나리오 타입 — 공간(siteUfid)·SOP 시드(seedId)·토폴로지·이벤트(eventId)·
 * 담당자(contactIds)를 하나로 묶는 엔드투엔드 데모 시나리오 계약.
 * 시나리오 실행기(Phase 9 T4)가 이 정의를 읽어 단계별로 데모를 구동한다.
 */

/** 토폴로지 준비 방식 — 샘플 셋 사용 또는 공간 footprint 기반 임의 생성. */
export type ScenarioTopologySpec =
  | {
      /** 기존 샘플 토폴로지 셋을 그대로 사용한다. */
      mode: "sample";
      /** 사용할 토폴로지 셋 id — topology 레지스트리의 실존 값. */
      setId: string;
    }
  | {
      /** generateTopology로 사이트 공간에서 토폴로지를 임의 생성한다. */
      mode: "generate";
      /** 생성 옵션 — 미지정 시 생성기 기본값 사용. */
      options?: {
        /** PRNG 시드 — 지정 시 결정적 생성. */
        seed?: number;
        /** 복도 백본 노드 간격(m). */
        corridorSpacing?: number;
      };
    };

/** 시나리오 안내 단계 1건 — 실행기 UI가 순서대로 표시하는 데모 서술. */
export interface ScenarioStep {
  /** 단계 제목. */
  title: string;
  /** 단계 설명 — 조작 안내 서술. */
  description: string;
}

/** 통합 시나리오 정의 — 참조 id는 전부 실존해야 한다(integratedScenarios.ts에서 검증). */
export interface ScenarioDefinition {
  /** 시나리오 고유 id — `scn-*` 형식. */
  scenarioId: string;
  /** 표시 이름. */
  name: string;
  /** 시나리오 개요 설명. */
  description: string;
  /** 대상 사이트 UFID — spatial getSite의 실존 값. */
  siteUfid: string;
  /** 로드할 도메인 템플릿 시드 id — DOMAIN_TEMPLATE_SEEDS의 실존 값. */
  seedId: string;
  /** 토폴로지 준비 방식. */
  topology: ScenarioTopologySpec;
  /** 시뮬레이션에 투입할 이벤트 id — ALL_SAMPLE_EVENTS의 실존 값. */
  eventId: string;
  /** 시나리오에 참여하는 담당자 id 목록 — SEED_CONTACTS의 실존 값. */
  contactIds: string[];
  /** 데모 안내 단계 목록 — 7단계 내외 서술. */
  steps: ScenarioStep[];
}
