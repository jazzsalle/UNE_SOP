/**
 * 담당자 모듈 배럴 — 담당자 타입, 시드 데이터, 조회 헬퍼를 재수출한다.
 * React 무의존 순수 모듈 — 편집기/시나리오 레이어가 이 진입점으로 접근한다.
 */
import type { ContactPerson } from "./contactTypes";
import { SEED_CONTACTS } from "./seedContacts";

export type * from "./contactTypes";
export { SEED_CONTACTS } from "./seedContacts";

/** 담당자 목록 조회 — siteUfid 지정 시 해당 사이트 소속만, 미지정 시 전체. */
export function getContacts(siteUfid?: string): ContactPerson[] {
  if (siteUfid === undefined) {
    return [...SEED_CONTACTS];
  }
  return SEED_CONTACTS.filter((contact) => contact.siteUfid === siteUfid);
}

/** contactId로 담당자를 조회한다. 없으면 undefined. */
export function findContact(contactId: string): ContactPerson | undefined {
  return SEED_CONTACTS.find((contact) => contact.contactId === contactId);
}
