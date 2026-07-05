/**
 * ContactRoster — 시나리오 참여 담당자 명단 카드 목록 (Phase 9 T4).
 * 이름/역할/부서/연락처를 카드로 표시한다. 담당자 role은 시드 그래프의
 * assigneeRole/escalateToRole 문자열과 정합하므로 회신 명의 확인에 쓰인다.
 * 컨테이너에 튜토리얼 계약 id `scenario-contacts`를 부여한다.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import type { ContactPerson } from "../domain";

interface ContactRosterProps {
  contacts: ContactPerson[];
}

function ContactRoster({ contacts }: ContactRosterProps) {
  return (
    <section
      className="contact-roster"
      data-tutorial-id="scenario-contacts"
      aria-label="시나리오 담당자 명단"
    >
      <h3 className="contact-roster__title typo-text-md font-bold">
        담당자
        <span className="contact-roster__count typo-text-sm">{contacts.length}명</span>
      </h3>
      {contacts.length === 0 ? (
        <p className="scenario-empty typo-text-sm">등록된 담당자가 없습니다</p>
      ) : (
        <ul className="contact-roster__list">
          {contacts.map((contact) => (
            <li key={contact.contactId} className="contact-card">
              <div className="contact-card__top">
                <span className="contact-card__name typo-text-md font-bold">{contact.name}</span>
                <span className="scenario-badge scenario-badge--brand typo-text-sm font-bold">
                  {contact.role}
                </span>
              </div>
              <div className="contact-card__meta typo-text-sm">
                <span className="contact-card__department">{contact.department}</span>
                <span className="contact-card__phone">{contact.phone}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ContactRoster;
