/**
 * 담당자 마스터 타입 — 사이트별 담당자(사람·로봇)를 표현하는 seed data 계약.
 * 통합 시나리오(scenario/*)가 contactIds로 참조하며, 시드 그래프의
 * assigneeRole/escalateToRole 문자열과 role이 정합하도록 유지한다.
 */

/** 담당자 1인 — 로봇(예: "로봇개 R-01")도 담당자 개념으로 등록할 수 있다. */
export interface ContactPerson {
  /** 담당자 고유 id — `ct-<사이트약어>-NNN` 형식. */
  contactId: string;
  /** 표시 이름 (mock). */
  name: string;
  /** 역할 — 시드 그래프의 assigneeRole/escalateToRole 문자열과 일치시킨다. */
  role: string;
  /** 소속 부서 (mock). */
  department: string;
  /** 연락처 전화번호 — mock 값. 실제 SMS 발송 없음(1차 POC 규칙). */
  phone: string;
  /** 소속 사이트 UFID — spatial 레지스트리(getSite)의 실존 값. */
  siteUfid: string;
}
