/**
 * 담당자 마스터 시드 — 검증용 건물 + 시드 사이트 4종별 담당자 mock 데이터.
 * role 문자열은 시드 그래프(seeds/*)에서 실제 사용되는 assigneeRole/escalateToRole을
 * 커버한다 (검증: 로봇개 R-01·통합관제실·통합관제실장 / LH2: 현장 안전관리자·설비 담당·
 * 통합방재실장 / 발전소: 발전운전원·운전제어 담당 / 학교: 층별 대피 유도요원·보건 담당·
 * 담임교사 / 사업장: 보건관리자·작업반장). 이름·전화번호는 전부 mock.
 */
import {
  LH2_PLANT_UFID,
  POWER_PLANT_UFID,
  SCHOOL_UFID,
  VERIFICATION_UFID,
  WORKPLACE_UFID,
} from "../spatial";
import type { ContactPerson } from "./contactTypes";

/** 전체 담당자 시드 — 사이트 5곳 × 3~5명. */
export const SEED_CONTACTS: readonly ContactPerson[] = [
  // ── 검증용 표준 건물 (로봇개 패트롤 시드 정합) ─────────────────────────────
  {
    contactId: "ct-vrf-001",
    name: "로봇개 R-01",
    role: "로봇개 R-01",
    department: "무인순찰", // 로봇도 담당자 개념으로 등록 — 순찰 임무 수행 주체.
    phone: "010-0100-0001",
    siteUfid: VERIFICATION_UFID,
  },
  {
    contactId: "ct-vrf-002",
    name: "김관제",
    role: "통합관제실",
    department: "통합관제실",
    phone: "010-0100-0002",
    siteUfid: VERIFICATION_UFID,
  },
  {
    contactId: "ct-vrf-003",
    name: "박실장",
    role: "통합관제실장",
    department: "통합관제실",
    phone: "010-0100-0003",
    siteUfid: VERIFICATION_UFID,
  },
  {
    contactId: "ct-vrf-004",
    name: "이안전",
    role: "안전관리자",
    department: "시설안전팀",
    phone: "010-0100-0004",
    siteUfid: VERIFICATION_UFID,
  },
  // ── 액화수소 플랜트 (LH2 시드 정합) ─────────────────────────────────────────
  {
    contactId: "ct-lh2-001",
    name: "정현장",
    role: "현장 안전관리자",
    department: "안전환경팀",
    phone: "010-0200-0001",
    siteUfid: LH2_PLANT_UFID,
  },
  {
    contactId: "ct-lh2-002",
    name: "최설비",
    role: "설비 담당",
    department: "설비운영팀",
    phone: "010-0200-0002",
    siteUfid: LH2_PLANT_UFID,
  },
  {
    contactId: "ct-lh2-003",
    name: "한방재",
    role: "통합방재실장",
    department: "통합방재실",
    phone: "010-0200-0003",
    siteUfid: LH2_PLANT_UFID,
  },
  // ── 발전소 (발전소 시드 정합) ───────────────────────────────────────────────
  {
    contactId: "ct-pwr-001",
    name: "오운전",
    role: "발전운전원",
    department: "발전운영부",
    phone: "010-0300-0001",
    siteUfid: POWER_PLANT_UFID,
  },
  {
    contactId: "ct-pwr-002",
    name: "서제어",
    role: "운전제어 담당",
    department: "운전제어팀",
    phone: "010-0300-0002",
    siteUfid: POWER_PLANT_UFID,
  },
  {
    contactId: "ct-pwr-003",
    name: "남책임",
    role: "발전부 책임자",
    department: "발전운영부",
    phone: "010-0300-0003",
    siteUfid: POWER_PLANT_UFID,
  },
  // ── 학교/안전한국훈련장 (훈련 시드 정합) ────────────────────────────────────
  {
    contactId: "ct-sch-001",
    name: "유유도",
    role: "층별 대피 유도요원",
    department: "교직원", // 교직원이 대피 유도요원을 겸임하는 mock 구성.
    phone: "010-0400-0001",
    siteUfid: SCHOOL_UFID,
  },
  {
    contactId: "ct-sch-002",
    name: "문보건",
    role: "보건 담당",
    department: "보건실",
    phone: "010-0400-0002",
    siteUfid: SCHOOL_UFID,
  },
  {
    contactId: "ct-sch-003",
    name: "장담임",
    role: "담임교사",
    department: "교직원",
    phone: "010-0400-0003",
    siteUfid: SCHOOL_UFID,
  },
  {
    contactId: "ct-sch-004",
    name: "권안전",
    role: "안전관리자",
    department: "행정실",
    phone: "010-0400-0004",
    siteUfid: SCHOOL_UFID,
  },
  // ── 일반 사업장 (사업장 시드 정합) ──────────────────────────────────────────
  {
    contactId: "ct-wrk-001",
    name: "조보건",
    role: "보건관리자",
    department: "안전보건팀",
    phone: "010-0500-0001",
    siteUfid: WORKPLACE_UFID,
  },
  {
    contactId: "ct-wrk-002",
    name: "임반장",
    role: "작업반장",
    department: "생산1팀",
    phone: "010-0500-0002",
    siteUfid: WORKPLACE_UFID,
  },
  {
    contactId: "ct-wrk-003",
    name: "신안전",
    role: "안전관리자",
    department: "안전보건팀",
    phone: "010-0500-0003",
    siteUfid: WORKPLACE_UFID,
  },
];
