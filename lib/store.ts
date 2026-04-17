/**
 * 공유 데이터 스토어
 * 클라이언트 ↔ 관리자 ↔ 상담 페이지 간 localStorage 기반 동기화
 *
 * KEY 구조:
 *  - "users"           : UserRecord[]         전체 회원 목록
 *  - "userData"        : UserRecord           현재 로그인 클라이언트
 *  - "isLoggedIn"      : "true"               클라이언트 로그인 상태
 *  - "adminLoggedIn"   : "true"               관리자 로그인 상태
 *  - "adminAccounts"   : AdminAccount[]       관리자 계정 목록
 *  - "currentAdminId"  : string               현재 로그인한 관리자 ID
 *  - "fundMaster"      : FundProduct[]        자금 상품 마스터
 *  - "consultations"   : Consultation[]       상담 신청 목록
 */

// ────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────

export interface UserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  age: string;
  gender: string;
  annual_revenue: string;
  debt_policy: string;
  debt_bank1: string;
  debt_bank2: string;
  debt_card: string;
  nice_score: string;
  kcb_score: string;
  registeredAt: string;
  application?: Application;
  adminMemo?: string;
}

export interface Application {
  status: ApplicationStatus;
  funds: string[];
  date: string;
  updatedAt?: string;
}

export type ApplicationStatus =
  | "접수대기"
  | "접수완료"
  | "진행중"
  | "진행완료"
  | "집행완료"
  | "보완"
  | "반려";

export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "superadmin" | "admin";
  createdAt: string;
  lastLogin?: string;
}

/** 자금 상품 마스터 */
export interface FundProduct {
  id: string;                       // 고유 ID
  name: string;                     // 자금명
  institution: string;              // 취급 기관
  category: string;                 // 분류 (운전자금 / 시설자금 / 긴급자금 등)
  maxAmount: string;                // 최대 지원 한도 (원 단위 문자열)
  interestRate: string;             // 금리 (예: "2.5~3.5%")
  period: string;                   // 대출 기간 (예: "5년 (거치 2년)")
  eligibleGrades: string[];         // 적용 가능 SOHO 등급 ["A","B","C","D"]
  minRevenue: string;               // 최소 연매출 조건 (원, 0이면 제한 없음)
  maxDebt: string;                  // 최대 기대출 조건 (원, 0이면 제한 없음)
  minCreditScore: string;           // 최소 신용점수 조건 (NICE 기준)
  description: string;              // 자금 설명
  active: boolean;                  // 활성화 여부
  createdAt: string;
  updatedAt?: string;
}

// ────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────

export const STATUS_LIST: ApplicationStatus[] = [
  "접수대기", "접수완료", "진행중", "진행완료", "집행완료", "보완", "반려",
];

export const FUND_CATEGORIES = [
  "운전자금", "시설자금", "긴급자금", "성장지원", "창업지원", "보증부대출", "이차보전", "기타",
];

export const LOGO_B64 = "data:image/png;base64,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";

export const FONT = "'Noto Sans KR', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "접수대기": { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  "접수완료": { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD" },
  "진행중":   { bg: "#FEF9C3", text: "#92400E", border: "#FDE68A" },
  "진행완료": { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
  "집행완료": { bg: "#EDE9FE", text: "#6D28D9", border: "#C4B5FD" },
  "보완":     { bg: "#FFEDD5", text: "#C2410C", border: "#FED7AA" },
  "반려":     { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" },
};

// ────────────────────────────────────────────
// 자금 마스터 기본 데이터
// ────────────────────────────────────────────

const DEFAULT_FUNDS: FundProduct[] = [
  // ── 소상공인시장진흥공단 (소진공) ──────────────────────────────
  {
    id: "fund_001",
    name: "소진공 일반경영안정자금 (일반)",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~3.0% (정책금리)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "업력 제한 없이 대부분의 소상공인이 신청 가능한 기본 운전자금. 임대료·인건비·재료비 등 경영 전반 비용에 활용 가능. 연 최대 7천만 원, 연 2~3% 저금리. 소진공 직접대출 방식.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_002",
    name: "소진공 긴급경영안정자금",
    institution: "소상공인시장진흥공단",
    category: "긴급자금",
    maxAmount: "70000000",
    interestRate: "연 2.0% (고정)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "재해·재난·경기침체 등으로 매출이 급감한 소상공인 긴급 지원. 피해 발생 후 1년 이내 신청. 연 2% 고정금리, 전 등급 신청 가능. 소진공 직접대출.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_003",
    name: "소진공 신용취약 소상공인 자금",
    institution: "소상공인시장진흥공단",
    category: "긴급자금",
    maxAmount: "30000000",
    interestRate: "연 2.0% (고정)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "저신용·저소득 취약 소상공인 전용 자금. 신용점수가 낮아 민간 금융 이용이 어려운 소상공인에게 최대 3천만 원 지원. 연 2% 고정금리.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_004",
    name: "소진공 고금리 대환대출",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "50000000",
    interestRate: "연 2.5~3.5%",
    period: "5년 (거치 1년)",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "고금리(7% 이상) 대출을 정책금리 저금리로 전환하는 대환 전용 상품. 기존 고금리 부담 경감 목적. 최대 5천만 원. 2026년 신설 확대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_005",
    name: "소진공 성장촉진자금",
    institution: "소상공인시장진흥공단",
    category: "성장지원",
    maxAmount: "80000000",
    interestRate: "연 2.5~3.0%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "300000000",
    minCreditScore: "700",
    description: "매출 성장률이 높고 사업 경쟁력이 우수한 소상공인 대상. 연매출 1억 이상, NICE 700점 이상. 최대 8천만 원 지원. 시설·운전 복합 활용 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_006",
    name: "소진공 재도전 특별자금",
    institution: "소상공인시장진흥공단",
    category: "창업지원",
    maxAmount: "70000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "폐업 후 재창업한 소상공인 전용. 과거 폐업 이력에 불이익 없음. 성실경영 평가 기준 적용. 최대 7천만 원, 연 2~2.5% 저금리.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_007",
    name: "소진공 창업자금 (업력 1년 미만)",
    institution: "소상공인시장진흥공단",
    category: "창업지원",
    maxAmount: "100000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "50000000",
    minCreditScore: "0",
    description: "창업 1년 미만 초기 소상공인 전용. 사업계획서·대표자 신용 기반 심사. 최대 1억 원. 기대출 5천만 원 이하 조건. 전 등급 신청 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_008",
    name: "소진공 청년고용연계자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 1.5~2.5% (우대)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "600",
    description: "청년(만 34세 이하) 고용 소상공인 우대 자금. 청년 직원 1인 이상 채용 시 금리 우대 혜택. 최대 7천만 원, 연 1.5~2.5%.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_009",
    name: "소진공 장애인기업지원자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 2.0% (고정)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "장애인 대표자 또는 장애인 다수 고용 기업 전용. 연 2% 고정금리, 전 등급 신청 가능. 장애인 등록증 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_010",
    name: "소진공 디지털전환 지원자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "120000000",
    interestRate: "연 2.0~3.0%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "온라인 판로 개척·IT 시스템 도입 등 디지털 전환을 추진하는 소상공인 대상. 2025년 신설, 최대 1억 2천만 원. 키오스크·배달앱·온라인몰 구축 비용 포함.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 중소벤처기업진흥공단 (중진공) ──────────────────────────────
  {
    id: "fund_011",
    name: "중진공 창업기반지원자금 (일반)",
    institution: "중소벤처기업진흥공단",
    category: "창업지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.6%p",
    period: "10년 (거치 4년, 시설) / 5년 (거치 2년, 운전)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "650",
    description: "업력 7년 미만 창업기업 대상. 신산업 분야는 10년 미만. 연간 60억 원 한도 내에서 기준금리보다 0.6%p 낮은 금리로 대출. 직접·대리대출 방식.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_012",
    name: "중진공 청년전용창업자금",
    institution: "중소벤처기업진흥공단",
    category: "창업지원",
    maxAmount: "100000000",
    interestRate: "연 2.5% (고정)",
    period: "6년 (거치 3년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "대표자 만 39세 이하, 업력 3년 미만 기업 전용. 최대 1억 원(제조업 2억 원)을 연 2.5% 고정금리로 대출. 담보·신용점수 무관. 사업계획서 평가 중심.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_013",
    name: "중진공 개발기술사업화자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "3000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 4년, 시설) / 5년 (거치 2년, 운전)",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "특허 등록 기술 또는 정부 R&D 성공 기술 사업화 기업 대상. 최대 30억 원(혁신분야 60억). 기준금리 -0.3%p 우대금리 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_014",
    name: "중진공 혁신성장지원자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 +0~0.3%p",
    period: "10년 (거치 3년, 시설) / 5년 (거치 2년, 운전)",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "업력 7년 이상 성장 가능성이 높은 중소기업 대상. 연간 60억 원 한도. 스마트공장·AI·바이오·에너지 등 혁신 분야 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_015",
    name: "중진공 내수기업 수출기업화자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "500000000",
    interestRate: "기준금리 -0.3%p",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "650",
    description: "수출 실적 없거나 전년도 10만 불 미만 기업 대상. 해외 시장 개척 운전자금. 최대 5억 원. 수출 초보기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_016",
    name: "중진공 수출기업 글로벌화자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "3000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 3년, 시설) / 5년 (거치 2년, 운전)",
    eligibleGrades: ["A", "B"],
    minRevenue: "500000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "전년도 수출 10만 불 이상 기업 대상. 해외 마케팅·현지화·생산시설 구축 지원. 최대 30억 원(고성장 60억). 우대 금리 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_017",
    name: "중진공 제조현장 스마트화자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "스마트공장·자동화 설비 도입 기업 대상. 연간 100억 원 한도. 기준금리 -0.3%p 우대. 제조업 중소기업 시설자금 특화.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_018",
    name: "중진공 Net-zero 친환경자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "6000000000",
    interestRate: "이차보전 최대 3%p / 직접 기준금리 -0.3%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "탄소 저감 기술 사업화·친환경 공정 도입 기업 대상. 최대 60억 원 또는 시중은행 이자 최대 3%p 지원(이차보전). 탄소중립·ESG 경영 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_019",
    name: "중진공 재창업자금",
    institution: "중소벤처기업진흥공단",
    category: "창업지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 4년, 시설) / 5년 (거치 2년, 운전)",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "폐업 후 재창업 7년 미만 기업(성실경영평가 통과). 최대 60억 원. 기준금리 -0.3%p. 이전 폐업 사유·이력 불이익 없음.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_020",
    name: "중진공 사업전환자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "새로운 업종으로 전환하는 사업전환계획 승인 기업 대상. 최대 100억 원. 기준금리 -0.3%p 우대금리. 중기부 승인서 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_021",
    name: "중진공 통상변화대응자금",
    institution: "중소벤처기업진흥공단",
    category: "긴급자금",
    maxAmount: "6000000000",
    interestRate: "연 2.0% (고정)",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "FTA·관세 등 통상 환경 변화로 피해를 입은 기업 대상. 최대 60억 원, 연 2.0% 고정금리. 수출입 관련 피해 증빙 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_022",
    name: "중진공 긴급경영안정자금 (일시경영애로)",
    institution: "중소벤처기업진흥공단",
    category: "긴급자금",
    maxAmount: "1000000000",
    interestRate: "연 1.9~2.5% (고정)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "환율 급등·거래처 부도 등 일시적 경영애로 중소기업 대상. 최대 10억 원. 연 1.9% 고정금리. 매출 또는 영업이익 10% 이상 감소 기업 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_023",
    name: "중진공 구조개선전용자금",
    institution: "중소벤처기업진흥공단",
    category: "긴급자금",
    maxAmount: "6000000000",
    interestRate: "기준금리 +0~0.5%p",
    period: "10년 (거치 5년)",
    eligibleGrades: ["C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "경영 위기 징후가 있으나 회생 가능성이 인정된 기업 대상. 최대 60억 원. 구조개선계획서 필요. 금융기관 협의 후 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 신용보증기금 (신보) ──────────────────────────────────────
  {
    id: "fund_024",
    name: "신보 일반보증부대출",
    institution: "신용보증기금",
    category: "보증부대출",
    maxAmount: "3000000000",
    interestRate: "시중금리 -0.5~1.0%p (보증서 발급)",
    period: "7년 이내",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "100000000",
    maxDebt: "300000000",
    minCreditScore: "650",
    description: "신용보증기금 보증서를 통한 은행 대출. 담보 없이 신용·사업성 평가로 최대 30억 원. 시중금리 대비 0.5~1%p 우대. 보증료 연 0.5~1.5% 별도.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_025",
    name: "신보 스타트업 보증",
    institution: "신용보증기금",
    category: "창업지원",
    maxAmount: "500000000",
    interestRate: "시중금리 -1.0%p (보증서)",
    period: "5년 이내",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "창업 7년 미만 스타트업 전용 보증. 담보·매출 실적 없어도 기술성·사업성 평가로 지원. 최대 5억 원. 보증비율 95% 이상. 투자조건부 보증도 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_026",
    name: "신보 혁신창업 IP보증",
    institution: "신용보증기금",
    category: "창업지원",
    maxAmount: "1000000000",
    interestRate: "시중금리 -1.0%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "650",
    description: "특허·실용신안 등 지식재산권(IP) 보유 창업기업 전용. IP 가치 평가 기반 보증. 최대 10억 원. 기술력 중심 심사로 재무 부족 기업도 지원 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_027",
    name: "신보 소상공인 특례보증",
    institution: "신용보증기금",
    category: "보증부대출",
    maxAmount: "100000000",
    interestRate: "시중금리 -0.5%p",
    period: "5년 이내",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "500",
    description: "연매출 3억 원 이하 소규모 소상공인 대상 특례보증. 최대 1억 원. 보증비율 90% 이상. 저신용자도 사업성·업종별 위험도 기준으로 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_028",
    name: "신보 성장사다리 보증",
    institution: "신용보증기금",
    category: "성장지원",
    maxAmount: "7000000000",
    interestRate: "시중금리 -0.5~1.0%p",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "K1 이상 우수 신용등급 기업 대상 대규모 보증. 최대 70억 원(일반 최대 30억). 수출·혁신·ESG 기업 우대. 성장단계별 맞춤 보증 설계.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_029",
    name: "신보 디지털 소상공인 특례보증",
    institution: "신용보증기금",
    category: "보증부대출",
    maxAmount: "150000000",
    interestRate: "시중금리 -0.5%p",
    period: "5년 이내",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "550",
    description: "온라인 판매·디지털 플랫폼 기반 소상공인 전용 특례보증. 2025년 신설. 최대 1억 5천만 원. 스마트스토어·배달앱·SNS 판매 사업자 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 기술보증기금 (기보) ──────────────────────────────────────
  {
    id: "fund_030",
    name: "기보 기술평가보증",
    institution: "기술보증기금",
    category: "보증부대출",
    maxAmount: "3000000000",
    interestRate: "시중금리 -0.5~1.5%p (보증서)",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "700",
    description: "기술력 있는 중소기업 전용. 기술등급 평가(T등급) 기반 보증. 최대 30억 원(기술혁신 기업 최대 70억). 담보 없어도 기술성으로 지원. 보증료 연 0.5~2%.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_031",
    name: "기보 창업기업 보증",
    institution: "기술보증기금",
    category: "창업지원",
    maxAmount: "500000000",
    interestRate: "시중금리 -1.0%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "창업 7년 미만 기술기반 기업 전용. 매출 없어도 기술성·사업성으로 지원. 초기 기업 1~3억, 기술혁신형 5~10억. 보증비율 최대 100%.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_032",
    name: "기보 벤처기업 보증",
    institution: "기술보증기금",
    category: "성장지원",
    maxAmount: "5000000000",
    interestRate: "시중금리 -1.0~1.5%p",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "벤처기업 확인서 보유 기업 전용. 최대 50억 원. 기술성·성장성 우선 심사. 투자유치 연계 보증도 가능. 스케일업 단계 기업 적합.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_033",
    name: "기보 아기유니콘 특별보증",
    institution: "기술보증기금",
    category: "성장지원",
    maxAmount: "20000000000",
    interestRate: "시중금리 -1.5%p (최대)",
    period: "10년 이내",
    eligibleGrades: ["A"],
    minRevenue: "500000000",
    maxDebt: "0",
    minCreditScore: "800",
    description: "중기부 아기유니콘 선정 기업 전용. 최대 200억 원(특별 한도). 보증비율 85~100%. 글로벌 진출·대규모 투자 유치 연계 특화 상품.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 지역신용보증재단 ─────────────────────────────────────────
  {
    id: "fund_034",
    name: "지역신보 일반보증 대출",
    institution: "지역신용보증재단",
    category: "보증부대출",
    maxAmount: "100000000",
    interestRate: "시중금리 -0.3~0.5%p",
    period: "5년 이내",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "물적 담보 없는 지역 소기업·소상공인 전용. 사업성·신용 기반 보증. 최대 1억 원(지역별 상이). 보증비율 85~90%. 지역 경제 활성화 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_035",
    name: "지역신보 소상공인 희망보증",
    institution: "지역신용보증재단",
    category: "보증부대출",
    maxAmount: "50000000",
    interestRate: "시중금리 기준 (보증료 감면)",
    period: "5년 이내",
    eligibleGrades: ["C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "신용점수 하위 계층 저신용 소상공인 전용. 신용등급 7~10등급도 신청 가능. 최대 5천만 원. 보증료 감면 혜택. 은행 대출 거절 후 이용 권장.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_036",
    name: "지역신보 재창업 특례보증",
    institution: "지역신용보증재단",
    category: "창업지원",
    maxAmount: "70000000",
    interestRate: "시중금리 -0.3%p",
    period: "5년 이내",
    eligibleGrades: ["C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "폐업 후 재창업한 소상공인 전용. 과거 폐업 이력 불이익 없음. 최대 7천만 원. 재창업 교육 이수자 우대. 성실상환 이력 감안.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_037",
    name: "지역신보 서울시 이차보전 특례보증",
    institution: "지역신용보증재단 (서울)",
    category: "보증부대출",
    maxAmount: "100000000",
    interestRate: "시중금리 – 서울시 이자 일부 보전",
    period: "5년 이내",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "서울 소재 사업장 운영 소상공인 전용. 이자 일부를 서울시가 보전해주는 이차보전 방식. 최대 1억 원 이상. 서울신용보증재단 통해 신청.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 시중은행 소상공인 전용 상품 ──────────────────────────────
  {
    id: "fund_038",
    name: "IBK기업은행 IBK 성공두드림",
    institution: "IBK기업은행",
    category: "운전자금",
    maxAmount: "300000000",
    interestRate: "연 4.5~6.5%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "400000000",
    minCreditScore: "600",
    description: "창업 1년 이상 소상공인 대상. 성장가능성 평가 기반 최대 3억 원. 매출·신용 기반 신속 심사. IBK 주거래 고객 금리 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_039",
    name: "IBK기업은행 소호 스타트업론",
    institution: "IBK기업은행",
    category: "창업지원",
    maxAmount: "100000000",
    interestRate: "연 3.5~5.5%",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "550",
    description: "창업 3년 이내 소호 사업자 전용. 최대 1억 원. 사업계획서·대표자 신용 기반. 신보·기보 보증 연계 가능. 온라인 비대면 신청 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_040",
    name: "KB국민은행 KB SOHO 스피드론",
    institution: "KB국민은행",
    category: "운전자금",
    maxAmount: "50000000",
    interestRate: "연 4.5~7.5%",
    period: "3년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "200000000",
    minCreditScore: "600",
    description: "무서류·비대면 신속 심사 소상공인 대출. 최대 5천만 원. 사업자 카드매출·세금계산서 기반 한도 산정. 당일 심사·지급 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_041",
    name: "신한은행 신한 SOHO 사업자대출",
    institution: "신한은행",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 4.0~6.5%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "300000000",
    minCreditScore: "600",
    description: "PG(결제) 매출 기반 심사 소상공인 대출. 최대 1억 원. 신한카드 가맹점 추가 한도 우대. 배달앱·온라인몰 매출도 반영.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_042",
    name: "우리은행 우리 소상공인 파트너론",
    institution: "우리은행",
    category: "운전자금",
    maxAmount: "80000000",
    interestRate: "연 4.5~7.0%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "300000000",
    minCreditScore: "580",
    description: "카드매출 연동 한도 산정. 최근 3개월 카드매출 기준. 최대 8천만 원. 우리은행 주거래 고객 금리 우대. 음식점·소매업 특화.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_043",
    name: "하나은행 하나 소호 플러스론",
    institution: "하나은행",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 4.0~6.5%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "300000000",
    minCreditScore: "600",
    description: "소상공인 전용 사업자대출. 최대 1억 원. 하나카드 매출 기반 우대 한도. 전통시장·소상공인 밀집지역 특별 우대 금리 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_044",
    name: "NH농협은행 NH 소상공인 든든대출",
    institution: "NH농협은행",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 3.5~6.0%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "200000000",
    minCreditScore: "580",
    description: "농업인·농촌 지역 소상공인 우대. 최대 7천만 원. NH카드 가맹점 매출 기반 심사. 지역 농·축협 연계 특별 저금리 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 특수·특화 자금 ────────────────────────────────────────
  {
    id: "fund_045",
    name: "중기부 밸류체인 안정화자금",
    institution: "중소벤처기업진흥공단",
    category: "긴급자금",
    maxAmount: "3000000000",
    interestRate: "기준금리 -0.3%p",
    period: "7년 (거치 3년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "650",
    description: "글로벌 공급망(밸류체인) 충격으로 피해를 입은 중소기업 대상. 원자재·부품 조달 비용 지원. 최대 30억 원. 피해 증빙 서류 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_046",
    name: "소진공 전통시장 시설현대화자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "100000000",
    interestRate: "연 2.0~2.5%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "전통시장·상점가 입점 소상공인 시설 개선 전용. 인테리어·냉난방·위생설비 등 포함. 최대 1억 원. 전통시장 등록 사업장 필수.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_047",
    name: "소진공 여성기업 특별자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 1.8~2.5% (우대)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "여성 대표자 소상공인 전용 우대 자금. 최대 7천만 원, 금리 우대. 한국여성경제인협회·여성기업종합지원센터 연계 신청. 육아·경력단절 여성 재창업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_048",
    name: "소진공 시니어 소상공인 자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "50000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "만 60세 이상 시니어 소상공인 전용. 최대 5천만 원. 연 2~2.5% 저금리. 노인일자리 창출·유지 목적. 생계형 소상공인 우선 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_049",
    name: "중진공 AX 스프린트 우대트랙",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.6%p (최대)",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "AI·디지털 전환(AX) 추진 우수 중소기업 우대 트랙. 최대 60억 원, 기준금리 -0.6%p 최대 우대. AI 도입 계획서·실적 증빙 필요. 2026년 신설.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_050",
    name: "중진공 협동화·협업 승인기업 자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "협동화·협업 사업 승인 기업 전용. 시설자금 최대 100억 원, 운전자금 최대 15억 원. 공동 생산·물류·판매 목적. 중기부 승인서 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 은행권 보증연계 특화 상품 ────────────────────────────────
  {
    id: "fund_051",
    name: "카카오뱅크 사업자 신용대출",
    institution: "카카오뱅크",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 5.0~9.0%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "24000000",
    maxDebt: "200000000",
    minCreditScore: "600",
    description: "100% 비대면 사업자 신용대출. 최대 1억 원. 사업자 카드매출·세금계산서 자동 연동 심사. 당일 한도 확인 및 즉시 입금. 신보 보증 연계 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_052",
    name: "토스뱅크 사업자 마이너스통장",
    institution: "토스뱅크",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 5.5~9.5%",
    period: "1년 (자동갱신)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "24000000",
    maxDebt: "150000000",
    minCreditScore: "620",
    description: "인터넷은행 사업자 마이너스통장. 최대 1억 원 한도. 사용한 만큼만 이자 부과. 비대면 신청·즉시 한도. 매출 데이터 기반 자동 한도 관리.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_053",
    name: "케이뱅크 사업자 소호대출",
    institution: "케이뱅크",
    category: "운전자금",
    maxAmount: "50000000",
    interestRate: "연 5.0~8.5%",
    period: "3년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "24000000",
    maxDebt: "150000000",
    minCreditScore: "600",
    description: "케이뱅크 사업자 전용 소호대출. 최대 5천만 원. 비대면 신청 후 당일 승인. 신용·매출 기반 심사. 주거래은행 전환 시 금리 우대 혜택.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 정부 특화 자금 (중기부·고용부·지자체) ─────────────────────
  {
    id: "fund_054",
    name: "고용노동부 고용위기지역 지원자금",
    institution: "고용노동부 (지자체 연계)",
    category: "긴급자금",
    maxAmount: "500000000",
    interestRate: "연 2.0~2.5% (이차보전)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "고용위기지역 지정 지역 내 사업체 대상 긴급 지원. 최대 5억 원. 이차보전 방식. 고용 유지 조건. 지역 산업위기 대응 특별법 적용 지역 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_055",
    name: "중기부 스마트제조혁신자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "5000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "제조업 스마트공장 레벨2 이상 도입 기업. 최대 50억 원. AI·IoT·빅데이터 활용 생산 자동화 지원. 스마트공장 보급·확산 사업 참여기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_056",
    name: "경기도 경기 소상공인 육성자금",
    institution: "경기도·경기신용보증재단",
    category: "보증부대출",
    maxAmount: "100000000",
    interestRate: "연 1.0~2.0% (이차보전 후)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "경기도 소재 소상공인 전용. 최대 1억 원. 이차보전으로 실질금리 1~2% 수준. 경기신용보증재단 보증 연계. 전 업종 신청 가능(유흥업 제외).",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_057",
    name: "서울시 서울형 소공인 특화자금",
    institution: "서울특별시·서울신용보증재단",
    category: "시설자금",
    maxAmount: "150000000",
    interestRate: "연 1.5~2.5% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "500",
    description: "서울 소재 제조업 소공인(10인 미만 제조업체) 전용. 최대 1억 5천만 원. 시설개선·장비구입 목적. 서울신용보증재단 보증 연계. 성수·문래 등 제조집적지 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_058",
    name: "부산시 부산 소상공인 경영안정자금",
    institution: "부산시·부산신용보증재단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 1.5~2.5% (이차보전 후)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "부산 소재 소상공인 경영안정 지원. 최대 7천만 원. 이차보전으로 실질 저금리. 부산신용보증재단 보증 연계. 해운대·원도심 상권 특별 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_059",
    name: "인천시 인천 소기업 성장자금",
    institution: "인천시·인천신용보증재단",
    category: "성장지원",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "인천 소재 소기업 성장 지원. 최대 1억 원. 인천신용보증재단 보증 연계. 제조·물류·IT 업종 우대. 인천경제자유구역 입주 기업 추가 혜택.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_060",
    name: "대구시 대구 소상공인 특례보증",
    institution: "대구시·대구신용보증재단",
    category: "보증부대출",
    maxAmount: "50000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "5년",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "대구 소재 소상공인 특례보증 대출. 최대 5천만 원. 대구신용보증재단 연계. 섬유·패션·IT 주요 업종 우대. 전통시장 상인 특별 금리 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 특수 목적 정책자금 ────────────────────────────────────────
  {
    id: "fund_061",
    name: "중진공 탄소중립 전환자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "탄소 감축·친환경 전환 추진 중소기업. 최대 60억 원. 온실가스 감축 설비·공정 개선 지원. RE100·CDP 참여 기업 우대. 기준금리 -0.5%p 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_062",
    name: "기보 딥테크 특별보증",
    institution: "기술보증기금",
    category: "창업지원",
    maxAmount: "3000000000",
    interestRate: "시중금리 -1.5%p",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "700",
    description: "AI·바이오·양자컴퓨팅·우주항공 등 딥테크 창업기업 전용. 최대 30억 원. 시중금리 -1.5%p 최대 우대. 기술성 100% 평가 방식. 2026년 확대 시행.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_063",
    name: "신보 ESG 경영지원 보증",
    institution: "신용보증기금",
    category: "성장지원",
    maxAmount: "2000000000",
    interestRate: "시중금리 -0.8%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "ESG 평가 우수 중소기업 전용 보증. 최대 20억 원. 환경·사회·지배구조 우수 기업 금리 우대. ESG 인증서 또는 평가보고서 필요. 2026년 신설 확대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_064",
    name: "소진공 폐업 소상공인 재기자금",
    institution: "소상공인시장진흥공단",
    category: "창업지원",
    maxAmount: "70000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "폐업 후 재창업한 소상공인 재기 지원. 성실폐업 확인서 필요. 최대 7천만 원. 폐업 교육 이수자 우대. 재기지원센터 연계 멘토링 제공.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_065",
    name: "중진공 K-브랜드 수출자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "3000000000",
    interestRate: "기준금리 -0.3%p",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "K-브랜드(K-뷰티·K-푸드·K-패션 등) 해외 진출 기업 전용. 최대 30억 원. 해외 마케팅·현지법인·유통 채널 확보 비용 지원. 수출 실적 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 농림·수산·관광 특화 자금 ─────────────────────────────────
  {
    id: "fund_066",
    name: "농림축산식품부 농식품기업 육성자금",
    institution: "농업정책보험금융원",
    category: "성장지원",
    maxAmount: "3000000000",
    interestRate: "연 2.0~3.0% (이차보전)",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "농식품·식품가공·로컬푸드 기업 전용. 최대 30억 원. 농림축산식품부 정책금리 이차보전. 수출용 식품 가공기업 우대. 6차산업 인증기업 추가 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_067",
    name: "해양수산부 수산식품산업육성자금",
    institution: "수산업협동조합(수협)",
    category: "시설자금",
    maxAmount: "1000000000",
    interestRate: "연 2.0~3.0% (이차보전)",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "수산업·수산물 가공·유통 기업 전용. 최대 10억 원. 수협 또는 지역 수산업협동조합 연계. 어선·가공시설·냉동창고 등 시설자금. 해수부 이차보전 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_068",
    name: "한국관광공사 관광기업 지원자금",
    institution: "한국관광공사·기업은행",
    category: "운전자금",
    maxAmount: "500000000",
    interestRate: "연 2.5~3.5% (이차보전)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "여행·숙박·MICE·테마파크 등 관광 관련 소기업 전용. 최대 5억 원. 한국관광공사 이차보전. 관광명품·스마트관광 분야 우대. 코로나 피해 관광기업 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_069",
    name: "문화체육관광부 문화콘텐츠 제작자금",
    institution: "한국콘텐츠진흥원",
    category: "창업지원",
    maxAmount: "1000000000",
    interestRate: "연 2.0~3.0%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "600",
    description: "게임·웹툰·드라마·K-POP 등 문화콘텐츠 제작기업 전용. 최대 10억 원. 한국콘텐츠진흥원 추천 기업 우선. IP 기반 콘텐츠 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_070",
    name: "산업통상자원부 에너지효율화자금",
    institution: "한국에너지공단",
    category: "시설자금",
    maxAmount: "2000000000",
    interestRate: "연 2.0~3.0% (이차보전)",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "에너지 절약 설비 도입·신재생에너지 설치 기업. 최대 20억 원. 에너지 절감 20% 이상 달성 예상 기업 우선. 에너지진단 결과서 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 소진공 추가 특화 자금 ──────────────────────────────────
  {
    id: "fund_071",
    name: "소진공 스마트 소상공인 육성자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "스마트기기·키오스크·POS 시스템·무인화 도입 소상공인 전용. 최대 1억 원. IT 설비 구입비 포함. 디지털·스마트상점 전환 목적 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_072",
    name: "소진공 배달·온라인 전환 지원자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "50000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "배달앱·스마트스토어·인스타그램 마켓 등 온라인 채널 개설 소상공인. 최대 5천만 원. 포장재·촬영장비·배달용기 등 초기 비용 포함. 전 등급 신청 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_073",
    name: "소진공 소공인 특화자금 (집적지)",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "150000000",
    interestRate: "연 2.0~2.5%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "소공인 집적지(서울 성수·문래·청계천 등) 입주 제조 소공인 전용. 최대 1억 5천만 원. 설비·장비 구입 중심. 소공인복합지원센터 이용 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_074",
    name: "소진공 전통주 특화육성자금",
    institution: "소상공인시장진흥공단",
    category: "성장지원",
    maxAmount: "100000000",
    interestRate: "연 2.0~2.5%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "전통주(막걸리·약주·증류식 소주 등) 제조 소상공인 전용. 양조장 시설 개선·위생설비·포장 설비 등 지원. 최대 1억 원. 주류면허 소지자 필수.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_075",
    name: "소진공 반려동물 특화자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~3.0%",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "반려동물 관련 업종(펫샵·동물병원·미용·호텔 등) 소상공인 전용. 최대 7천만 원. 펫 산업 성장 지원. 동물판매업·보호업 등록 사업자 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 중진공 추가 특화 자금 ─────────────────────────────────
  {
    id: "fund_076",
    name: "중진공 기후위기 대응 전환자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "6000000000",
    interestRate: "연 2.0% (고정)",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "650",
    description: "기후위기 대응 사업 전환 중소기업. 수소·전기차부품·태양광 등 업종 전환 자금. 최대 60억 원. 연 2% 고정금리. 전환계획서 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_077",
    name: "중진공 글로벌 강소기업 특별자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A"],
    minRevenue: "1000000000",
    maxDebt: "0",
    minCreditScore: "800",
    description: "중기부 '글로벌강소기업' 선정 기업 전용. 최대 100억 원. 해외 생산·마케팅·R&D 투자 지원. NICE 800점 이상, 연매출 10억 이상 조건.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_078",
    name: "중진공 지방이전·창업 특별자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "600",
    description: "수도권에서 지방으로 이전하거나 지방에서 창업하는 기업 우대. 최대 60억 원. 기준금리 -0.5%p 특별 우대. 지방소멸지역 이전 기업 추가 혜택.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_079",
    name: "중진공 유니콘-예비 특별보증",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "20000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 5년)",
    eligibleGrades: ["A"],
    minRevenue: "500000000",
    maxDebt: "0",
    minCreditScore: "800",
    description: "예비유니콘·아기유니콘 단계 고성장 스타트업 전용. 최대 200억 원. 고성장 평가 기반. 투자 연계 대출 가능. 글로벌 시장 진출 기업 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_080",
    name: "중진공 소재부품장비 자립화자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "일본 수출규제 이후 소부장(소재·부품·장비) 자립화 추진 기업. 최대 100억 원. 대체부품 개발·생산설비 도입 지원. 소부장 전문기업 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 신보·기보 추가 보증 상품 ──────────────────────────────────
  {
    id: "fund_081",
    name: "신보 매출채권 보험보증",
    institution: "신용보증기금",
    category: "운전자금",
    maxAmount: "1000000000",
    interestRate: "시중금리 기준",
    period: "1년 이내 (단기)",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "납품 후 매출채권(외상매출금) 담보 보증. 최대 10억 원. B2B 납품기업 운전자금 지원. 거래처 부도 시 보험 혜택 포함. 결제기일 30~180일.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_082",
    name: "신보 혁신형 중소기업 우대보증",
    institution: "신용보증기금",
    category: "성장지원",
    maxAmount: "5000000000",
    interestRate: "시중금리 -1.0%p",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "이노비즈·메인비즈·벤처기업 확인서 보유 기업 우대. 최대 50억 원. 시중금리 -1.0%p 우대. 기술혁신형 기업 보증비율 100% 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_083",
    name: "기보 특허기술사업화 보증",
    institution: "기술보증기금",
    category: "창업지원",
    maxAmount: "2000000000",
    interestRate: "시중금리 -1.0~1.5%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "600",
    description: "등록 특허 기반 기술 사업화 기업. 특허 가치 평가 후 보증 한도 결정. 최대 20억 원. IP금융 연계 가능. 특허청 우수 발명 기업 추가 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_084",
    name: "기보 녹색기술인증 기업보증",
    institution: "기술보증기금",
    category: "시설자금",
    maxAmount: "3000000000",
    interestRate: "시중금리 -1.0%p",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "환경부 녹색기술 인증 기업 전용. 최대 30억 원. 탄소중립·친환경 기술 기업 우대. 보증비율 최대 100%. 녹색기술인증서 필수.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_085",
    name: "기보 데이터바우처 연계보증",
    institution: "기술보증기금",
    category: "성장지원",
    maxAmount: "1000000000",
    interestRate: "시중금리 -0.5%p",
    period: "5년 이내",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "600",
    description: "데이터바우처(과기정통부) 수혜기업 전용 연계 보증. 최대 10억 원. AI·데이터 기반 비즈니스 모델 기업 우대. 데이터 활용 사업화 계획서 필요.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 보증부 은행 연계 특화 ─────────────────────────────────────
  {
    id: "fund_086",
    name: "IBK-신보 연계 중소기업 우대대출",
    institution: "IBK기업은행·신용보증기금",
    category: "보증부대출",
    maxAmount: "500000000",
    interestRate: "연 3.5~5.0% (보증부)",
    period: "7년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "300000000",
    minCreditScore: "600",
    description: "IBK기업은행과 신용보증기금 업무협약 상품. 보증서 담보 최대 5억 원. 이노비즈·메인비즈·벤처기업 추가 우대. 심사 기간 단축(5영업일 이내).",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_087",
    name: "NH-기보 연계 농식품기업 보증대출",
    institution: "NH농협은행·기술보증기금",
    category: "보증부대출",
    maxAmount: "300000000",
    interestRate: "연 3.0~4.5% (보증부)",
    period: "7년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "NH농협은행과 기술보증기금 연계 농식품·바이오 기업 전용. 최대 3억 원. 농업·식품 기술기업 특화. 기보 기술평가 병행. 식품안전인증 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_088",
    name: "KB-신보 스마트 소상공인 보증대출",
    institution: "KB국민은행·신용보증기금",
    category: "보증부대출",
    maxAmount: "150000000",
    interestRate: "연 3.5~5.5% (보증부)",
    period: "5년",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "500",
    description: "KB국민은행과 신용보증기금 업무협약 소상공인 특화. 최대 1억 5천만 원. 저신용 소상공인도 신청 가능(신보 특례보증 연계). 비대면 신청 후 3영업일 내 심사.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 조건별 특화 자금 ─────────────────────────────────────────
  {
    id: "fund_089",
    name: "소진공 고령화 대응 생계형 자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "30000000",
    interestRate: "연 1.5~2.0% (고정)",
    period: "5년",
    eligibleGrades: ["C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "연매출 1억 미만 생계형 소상공인 전용. 최대 3천만 원. 연 1.5~2% 최저금리. 생계 유지 목적 운전자금. 기초생활수급자·차상위 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_090",
    name: "소진공 청년 창업자 우대자금",
    institution: "소상공인시장진흥공단",
    category: "창업지원",
    maxAmount: "100000000",
    interestRate: "연 1.5~2.0% (우대)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "만 39세 이하 청년 소상공인 창업자 전용. 최대 1억 원. 금리 추가 0.5%p 우대. 청년 창업 교육 이수자 우선. 업력 3년 미만 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_091",
    name: "중진공 수출초보기업 첫걸음자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "500000000",
    interestRate: "기준금리 -0.5%p",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "수출 경험 없는 내수 소기업의 첫 수출 도전 지원. 최대 5억 원. 해외 박람회·바이어 발굴·패키지 포장 비용 포함. KOTRA 연계 멘토링 제공.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_092",
    name: "신보 사회적기업 우대보증",
    institution: "신용보증기금",
    category: "운전자금",
    maxAmount: "500000000",
    interestRate: "시중금리 -1.5%p (우대)",
    period: "7년 이내",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "고용노동부 사회적기업 인증 기업 전용. 최대 5억 원. 보증비율 100%. 보증료 전액 면제 또는 최소화. 사회서비스·취약계층 고용 기업 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_093",
    name: "기보 협동조합 전용보증",
    institution: "기술보증기금",
    category: "운전자금",
    maxAmount: "1000000000",
    interestRate: "시중금리 -0.5%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "550",
    description: "사회적협동조합·협동조합 사업자 전용. 최대 10억 원. 구성원 공동 사업 운전자금. 기술기반 협동조합 우대. 기획재정부 인가 협동조합 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 지자체 특화 자금 (추가) ──────────────────────────────────
  {
    id: "fund_094",
    name: "광주시 광주형 미래차 소기업 자금",
    institution: "광주시·광주신용보증재단",
    category: "시설자금",
    maxAmount: "200000000",
    interestRate: "연 1.5~2.5% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "광주 소재 전기차·수소차 부품 소기업 전용. 최대 2억 원. 광주형일자리 연계 기업 우대. 광주신보 보증 연계. 미래차 관련 R&D·설비 투자 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_095",
    name: "대전시 대덕특구 기술창업 지원자금",
    institution: "대전시·대전신용보증재단",
    category: "창업지원",
    maxAmount: "200000000",
    interestRate: "연 1.5~2.5% (이차보전)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "대덕연구개발특구 내 기술창업기업 전용. 최대 2억 원. 연구소 기술 사업화 기업 우대. KAIST·ETRI 등 공공연구기관 출신 창업자 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_096",
    name: "울산시 조선·해양 중소기업 자금",
    institution: "울산시·울산신용보증재단",
    category: "긴급자금",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "울산 조선·해양 산업 불황으로 피해를 입은 협력 소기업 전용. 최대 1억 원. 업종 피해 증빙 필요. 울산신보 보증 연계. 경영 정상화 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_097",
    name: "전라북도 전북 농생명 기업 자금",
    institution: "전라북도·전북신용보증재단",
    category: "성장지원",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "전라북도 소재 농생명·바이오·식품 소기업 전용. 최대 1억 원. 전북신보 보증 연계. 새만금산업단지 입주 기업 추가 혜택. 스마트팜 도입 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_098",
    name: "제주도 제주형 관광·청정자원 자금",
    institution: "제주도·제주신용보증재단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "제주 소재 관광·숙박·청정자원 관련 소상공인 전용. 최대 7천만 원. 제주신보 보증 연계. 제주 특산물·친환경 기업 추가 우대. 도내 소상공인 전 등급 신청.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 금융권 보증·정책 혼합 상품 ────────────────────────────────
  {
    id: "fund_099",
    name: "소진공 기후피해 소상공인 특별자금",
    institution: "소상공인시장진흥공단",
    category: "긴급자금",
    maxAmount: "70000000",
    interestRate: "연 1.5% (고정)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "폭우·폭설·태풍·가뭄 등 기후재난 피해 소상공인 특별 지원. 연 1.5% 최저 고정금리. 피해 증빙 후 2주 내 신속 집행. 전 등급 신청 가능. 재해복구 비용 포함.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_100",
    name: "중기부 지역균형발전 특별자금",
    institution: "중소벤처기업진흥공단",
    category: "창업지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.5%p (추가 우대)",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "인구소멸위기지역·지방소멸지역 내 창업·이전 기업 전용. 최대 60억 원. 기준금리 -0.5%p 최대 우대. 비수도권 지역 균형발전 목적. 전 등급 신청 가능. 수도권 이전 기업 제외.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // ── 추가 정책자금 (fund_101 ~ fund_150) ──────────────────────

  // 소진공 추가
  {
    id: "fund_101",
    name: "소진공 노란우산공제 연계 특별자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 1.5~2.0% (우대)",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "노란우산공제 가입 소상공인 전용 우대 금리 자금. 공제 납입 실적 기반 한도 산정. 최대 7천만 원, 연 1.5% 최저금리. 가입 후 6개월 이상 납부 시 신청 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_102",
    name: "소진공 탄소중립 소상공인 자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "80000000",
    interestRate: "연 2.0~2.5%",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "LED 조명교체, 고효율 에어컨·냉난방기 설치, 태양광 패널 설치 등 에너지 절감 설비 도입 소상공인. 최대 8천만 원. 에너지 절감 20% 이상 예상 시 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_103",
    name: "소진공 외식업 특화 경영안정자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~3.0%",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "음식점·카페·제과점 등 외식업 소상공인 특화. 식재료비·임대료·인건비 등 운전자금. 최대 7천만 원. 식품위생법 허가업소 필수. 배달매출 포함 심사.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_104",
    name: "소진공 미용·뷰티업 특화자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "미용실·네일·피부관리·헤어샵 등 뷰티업 소상공인 전용. 인테리어·장비·용품 구입 자금. 최대 7천만 원. 미용사 면허 또는 공중위생업 허가 필수.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_105",
    name: "소진공 세탁·청소업 특화자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "50000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "세탁소·코인세탁·청소업 소상공인 전용. 세탁기·건조기·청소장비 등 시설 투자 지원. 최대 5천만 원. 공중위생관리법 적용 업종 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_106",
    name: "소진공 의료·약국 소상공인 자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "600",
    description: "동네 의원·한의원·약국·치과 등 의료 소상공인 운전자금. 최대 1억 원. 의료기관 개설 허가 또는 약국 개설등록 필수. 의약품 구입비·인건비 포함.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_107",
    name: "소진공 교육·학원 특화자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~3.0%",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "학원·교습소·어린이집·독서실 운영 소상공인 전용. 최대 7천만 원. 교습비 인가·학원 등록 필수. 교육부·교육청 지도 기준 준수 업체 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_108",
    name: "소진공 스포츠·헬스장 특화자금",
    institution: "소상공인시장진흥공단",
    category: "시설자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~2.5%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "헬스장·필라테스·요가·수영장·골프연습장 등 체육시설업 소상공인. 운동기구·시설 개선 지원. 최대 7천만 원. 체육시설업 신고필증 필수.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_109",
    name: "소진공 숙박업 경영안정자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0%",
    period: "5년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "모텔·민박·게스트하우스·펜션 등 숙박업 소상공인. 최대 1억 원. 관광·숙박업 허가 필수. 리뉴얼·시설개선·운전자금 복합 활용 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_110",
    name: "소진공 소매업 재고자금",
    institution: "소상공인시장진흥공단",
    category: "운전자금",
    maxAmount: "50000000",
    interestRate: "연 2.5~3.5%",
    period: "3년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "편의점·슈퍼마켓·잡화점·의류점 등 소매업 재고 구입 단기 자금. 최대 5천만 원. 사업자 카드매출 기반 빠른 심사. 명절 특수·성수기 재고 확보 목적.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // 중진공 추가
  {
    id: "fund_111",
    name: "중진공 바이오·헬스케어 육성자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "바이오·제약·의료기기·디지털헬스 중소기업 전용. 최대 60억 원. 임상시험·GMP 설비·R&D 투자 지원. 식약처 허가·인증 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_112",
    name: "중진공 반도체·디스플레이 특화자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "500000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "반도체·디스플레이 소재·부품·장비 중소기업 전용. 최대 100억 원. 첨단 제조설비 투자 지원. 국가첨단전략산업 지정 품목 생산 기업 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_113",
    name: "중진공 방위산업 중소기업 자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "방산업체 지정·방산물자 생산 허가 중소기업. 최대 60억 원. 방위사업청 납품 실적 기업 우대. 시설·부품·R&D 복합 자금.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_114",
    name: "중진공 우주·항공·드론 산업자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "위성·발사체·드론·UAM(도심항공모빌리티) 관련 중소기업. 최대 60억 원. 항공기제조 허가 또는 드론 제조업 등록 기업 우선. 2026년 신설 확대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_115",
    name: "중진공 수소경제 육성자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "수소연료전지·수전해·수소충전소·수소저장 관련 중소기업. 최대 60억 원. 산업부 수소 전문기업 인증 우선. 수소 생산·유통·활용 전 분야 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_116",
    name: "중진공 로봇산업 육성자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "산업용·서비스·의료·물류 로봇 제조 중소기업. 최대 60억 원. 로봇산업진흥법 적용 기업. 스마트공장 로봇 도입 기업도 지원 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_117",
    name: "중진공 핀테크·블록체인 창업자금",
    institution: "중소벤처기업진흥공단",
    category: "창업지원",
    maxAmount: "3000000000",
    interestRate: "기준금리 -0.5%p",
    period: "7년 (거치 3년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "650",
    description: "핀테크·디지털금융·블록체인·NFT 플랫폼 창업기업. 최대 30억 원. 금융혁신지원 특별법 샌드박스 참여 기업 우대. 업력 7년 미만 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_118",
    name: "중진공 메타버스·XR 콘텐츠 자금",
    institution: "중소벤처기업진흥공단",
    category: "창업지원",
    maxAmount: "3000000000",
    interestRate: "기준금리 -0.5%p",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "650",
    description: "메타버스·VR·AR·XR 콘텐츠 제작 및 플랫폼 기업. 최대 30억 원. 과기정통부 실감콘텐츠 지원사업 연계. SW 개발·서버 인프라 비용 포함.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_119",
    name: "중진공 이차전지·배터리 소재자금",
    institution: "중소벤처기업진흥공단",
    category: "시설자금",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.5%p",
    period: "10년 (거치 4년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "이차전지 양극재·음극재·전해질·분리막 소재 중소기업. 최대 100억 원. 전기차·ESS 공급망 핵심 기업 우선. 국가첨단전략산업 이차전지 분야 적용.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_120",
    name: "중진공 AI·빅데이터 솔루션 자금",
    institution: "중소벤처기업진흥공단",
    category: "성장지원",
    maxAmount: "6000000000",
    interestRate: "기준금리 -0.6%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "100000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "AI 솔루션·빅데이터 분석·클라우드 서비스 중소기업. 최대 60억 원. 기준금리 -0.6%p 최대 우대. AI 솔루션 인증 또는 데이터바우처 수혜 기업 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // 신보·기보 추가
  {
    id: "fund_121",
    name: "신보 회계투명성 우수기업 보증",
    institution: "신용보증기금",
    category: "보증부대출",
    maxAmount: "5000000000",
    interestRate: "시중금리 -1.0%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "외부감사·회계투명성 우수 중소기업 전용. 최대 50억 원. 재무 신뢰도 기반 우대 보증. 공인회계사 감사보고서 제출 기업 우선. 보증비율 100%.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_122",
    name: "신보 청년창업 특별보증 (도약보증)",
    institution: "신용보증기금",
    category: "창업지원",
    maxAmount: "300000000",
    interestRate: "시중금리 -1.0%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "만 39세 이하 청년 창업자 전용. 최대 3억 원. 담보·매출 실적 없어도 창업 아이템 평가 중심 심사. 보증비율 100%. 창업지원 전담 팀 배정.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_123",
    name: "신보 수출기업 외화보증",
    institution: "신용보증기금",
    category: "성장지원",
    maxAmount: "3000000000",
    interestRate: "시중금리 -0.5%p",
    period: "1년 이내 (단기갱신)",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "수출 L/C·D/A·D/P 결제 중소기업 외화 운전자금 보증. 최대 30억 원. 수출실적 기반 한도 산정. 환율 리스크 헤지 연계 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_124",
    name: "기보 혁신형기업 기술금융 보증",
    institution: "기술보증기금",
    category: "성장지원",
    maxAmount: "7000000000",
    interestRate: "시중금리 -1.0~1.5%p",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "300000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "이노비즈(기술혁신형) 인증 중소기업 전용. 최대 70억 원. 기술평가 A등급 이상 기업 보증비율 100%. 연구소 보유 기업 추가 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_125",
    name: "기보 소부장 기술독립 보증",
    institution: "기술보증기금",
    category: "시설자금",
    maxAmount: "5000000000",
    interestRate: "시중금리 -1.5%p",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "200000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "소재·부품·장비 기술 자립화 추진 기업. 최대 50억 원. 수입 대체 품목 국산화 개발 기업 우선. 시중금리 -1.5%p 최대 우대. 산업부 소부장 지원 연계.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // 지역신보 추가
  {
    id: "fund_126",
    name: "지역신보 전통시장 특별보증",
    institution: "지역신용보증재단",
    category: "보증부대출",
    maxAmount: "50000000",
    interestRate: "시중금리 기준 (보증료 50% 감면)",
    period: "5년 이내",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "전통시장·상점가 등록 소상공인 특별보증. 최대 5천만 원. 보증료 50% 감면 혜택. 전 등급 신청 가능. 시장 현대화 사업 참여 상인 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_127",
    name: "지역신보 청년 소상공인 특례보증",
    institution: "지역신용보증재단",
    category: "창업지원",
    maxAmount: "70000000",
    interestRate: "시중금리 -0.5%p (보증료 면제)",
    period: "5년 이내",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "만 39세 이하 청년 소상공인 창업 특례보증. 최대 7천만 원. 보증료 전액 면제. 담보 없이 사업성 평가만으로 신청 가능. 청년창업 교육 이수 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_128",
    name: "지역신보 여성 소상공인 특례보증",
    institution: "지역신용보증재단",
    category: "보증부대출",
    maxAmount: "70000000",
    interestRate: "시중금리 -0.3%p (보증료 30% 감면)",
    period: "5년 이내",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "여성 대표 소상공인 전용. 최대 7천만 원. 보증료 30% 감면. 경력단절 여성 재창업 우선. 여성기업 확인서 제출 시 추가 혜택.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_129",
    name: "지역신보 장기 성실상환 우대보증",
    institution: "지역신용보증재단",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "시중금리 -0.5%p",
    period: "7년 이내",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "550",
    description: "지역신보 보증 이력 3년 이상, 연체 없이 성실 상환한 소상공인 우대. 최대 1억 원. 보증 한도 20% 자동 증액. 금리 추가 우대 혜택.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_130",
    name: "지역신보 소상공인 경기회복 특례보증",
    institution: "지역신용보증재단",
    category: "긴급자금",
    maxAmount: "70000000",
    interestRate: "시중금리 -0.5%p (이차보전)",
    period: "5년 이내",
    eligibleGrades: ["B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "경기 침체·내수 부진으로 매출 20% 이상 감소한 소상공인 특례보증. 최대 7천만 원. 지자체 이차보전 연계. 심사 5영업일 내 완료.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // 시중은행 추가 상품
  {
    id: "fund_131",
    name: "국민은행 KB 소상공인 사업자대출",
    institution: "KB국민은행",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 4.0~6.5%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "30000000",
    maxDebt: "300000000",
    minCreditScore: "580",
    description: "사업자등록 6개월 이상 소상공인 대상 일반 사업자대출. 최대 1억 원. 국민은행 주거래 고객 우대. 인터넷·모바일뱅킹 비대면 신청 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_132",
    name: "신한은행 신한 사업자 플러스론",
    institution: "신한은행",
    category: "운전자금",
    maxAmount: "150000000",
    interestRate: "연 4.0~6.5%",
    period: "5년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "300000000",
    minCreditScore: "600",
    description: "연매출 5천만 원 이상 사업자 대상 플러스 대출. 최대 1억 5천만 원. 신한카드 매출 데이터 연동 한도 산정. 급여·공과금 이체 고객 추가 금리 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_133",
    name: "우리은행 우리 사업자 신용대출",
    institution: "우리은행",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 4.5~7.0%",
    period: "3년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "24000000",
    maxDebt: "200000000",
    minCreditScore: "580",
    description: "사업자 신용 기반 운전자금 대출. 최대 1억 원. 우리은행 급여이체·공과금 자동납부 고객 금리 우대. 부동산 담보 없이 신용만으로 대출 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_134",
    name: "하나은행 하나 사업자 원큐대출",
    institution: "하나은행",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 4.0~6.5%",
    period: "3년",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "24000000",
    maxDebt: "200000000",
    minCreditScore: "600",
    description: "하나원큐 앱으로 비대면 즉시 신청. 최대 1억 원. 당일 한도 확인·즉시 지급. 하나카드 매출 연동 우대 한도. 사업자등록 6개월 이상 필수.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_135",
    name: "SC제일은행 소호 비즈니스 론",
    institution: "SC제일은행",
    category: "운전자금",
    maxAmount: "200000000",
    interestRate: "연 4.5~7.0%",
    period: "5년",
    eligibleGrades: ["A", "B"],
    minRevenue: "50000000",
    maxDebt: "300000000",
    minCreditScore: "650",
    description: "글로벌 네트워크 보유 SC제일은행 소호 전용 대출. 최대 2억 원. 외화 결제·무역금융 연계 가능. 수출입 소상공인 특화. 영문 사업자등록증 발급 연계.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_136",
    name: "씨티은행 씨티 비즈니스 대출",
    institution: "씨티은행",
    category: "운전자금",
    maxAmount: "200000000",
    interestRate: "연 4.5~7.5%",
    period: "5년",
    eligibleGrades: ["A", "B"],
    minRevenue: "50000000",
    maxDebt: "300000000",
    minCreditScore: "650",
    description: "씨티은행 주거래 사업자 전용 신용대출. 최대 2억 원. 외화 환전·해외 송금 우대. 글로벌 비즈니스 소기업 특화. 영어 지원 전담 상담 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_137",
    name: "저축은행 SBI 소호 비대면 대출",
    institution: "SBI저축은행",
    category: "운전자금",
    maxAmount: "100000000",
    interestRate: "연 7.0~14.0%",
    period: "3년",
    eligibleGrades: ["C", "D"],
    minRevenue: "12000000",
    maxDebt: "0",
    minCreditScore: "0",
    description: "1금융권 대출이 어려운 저신용 소상공인 대상 저축은행 사업자대출. 최대 1억 원. 인터넷 비대면 신청. 금리가 높지만 심사 기준 완화. 신보·지역신보 보증 병행 가능.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_138",
    name: "OK저축은행 OK 사업자 신용대출",
    institution: "OK저축은행",
    category: "운전자금",
    maxAmount: "50000000",
    interestRate: "연 8.0~16.0%",
    period: "3년",
    eligibleGrades: ["D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "저신용·저소득 소상공인 최후 안전망. 최대 5천만 원. 연체 이력 있어도 신청 가능. 사업자등록 3개월 이상 필수. 분할상환 방식. 긴급 운전자금 목적.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // 특수목적 펀드/융자 상품
  {
    id: "fund_139",
    name: "모태펀드 엔젤투자 매칭펀드",
    institution: "한국벤처투자·중소벤처기업부",
    category: "창업지원",
    maxAmount: "500000000",
    interestRate: "지분투자 (이자 없음)",
    period: "5~7년 (투자 회수 시까지)",
    eligibleGrades: ["A", "B"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "엔젤투자자 투자금액만큼 정부가 1:1 매칭 투자. 최대 5억 원. 상환 의무 없는 지분투자. 기술·아이디어 기반 초기창업 기업 전용. 엔젤투자 인증 투자자 연계 필수.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_140",
    name: "TIPS 연계 R&D 창업자금",
    institution: "중소벤처기업부·민간 액셀러레이터",
    category: "창업지원",
    maxAmount: "1500000000",
    interestRate: "지분투자+R&D지원 (이자 없음)",
    period: "2년 (R&D 과제 기간)",
    eligibleGrades: ["A", "B"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "TIPS(민간투자 주도 기술창업 지원) 프로그램 선정 기업. 액셀러레이터 투자 1억 원 + 정부 R&D 최대 5억 원 + 사업화 지원 1억 원. 기술 기반 딥테크 창업 특화.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_141",
    name: "성장사다리펀드 스케일업 대출",
    institution: "산업은행·성장금융",
    category: "성장지원",
    maxAmount: "30000000000",
    interestRate: "기준금리 +0.5~1.0%p",
    period: "10년 이내",
    eligibleGrades: ["A"],
    minRevenue: "1000000000",
    maxDebt: "0",
    minCreditScore: "800",
    description: "고성장 중소·중견기업 대규모 성장자금. 최대 300억 원. 연매출 10억 이상, NICE 800점 이상. 산업은행 성장사다리펀드 출자 방식. IPO·M&A 준비 기업 특화.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_142",
    name: "산업은행 KDB 중소기업 육성자금",
    institution: "KDB산업은행",
    category: "성장지원",
    maxAmount: "10000000000",
    interestRate: "기준금리 -0.3%p",
    period: "10년 (거치 3년)",
    eligibleGrades: ["A", "B"],
    minRevenue: "500000000",
    maxDebt: "0",
    minCreditScore: "750",
    description: "KDB산업은행 직접대출 중소기업 육성 상품. 최대 100억 원. 주력 산업·신산업 분야 기업 우대. 기술성·성장성·수익성 종합 평가 방식.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_143",
    name: "수출입은행 중소기업 수출금융",
    institution: "한국수출입은행",
    category: "성장지원",
    maxAmount: "10000000000",
    interestRate: "연 3.0~4.5%",
    period: "10년 이내",
    eligibleGrades: ["A", "B"],
    minRevenue: "500000000",
    maxDebt: "0",
    minCreditScore: "700",
    description: "수출 중소기업 전용 무역금융. 최대 100억 원. 수출 선수금·수출환어음·포페이팅 등 다양한 형태. 신흥시장 수출 기업 추가 지원. 글로벌 공급망 참여 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },

  // 지자체 추가 상품
  {
    id: "fund_144",
    name: "경상남도 경남형 뿌리산업 자금",
    institution: "경상남도·경남신용보증재단",
    category: "시설자금",
    maxAmount: "150000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "경남 소재 뿌리산업(주조·금형·열처리·용접 등) 소기업 전용. 최대 1억 5천만 원. 경남신보 보증 연계. 창원·거제·진주 등 산업단지 입주 기업 우대.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_145",
    name: "전라남도 전남 농수산물 가공 자금",
    institution: "전라남도·전남신용보증재단",
    category: "성장지원",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "20000000",
    maxDebt: "0",
    minCreditScore: "500",
    description: "전남 소재 농수산물 가공·유통·식품 소기업 전용. 최대 1억 원. 전남신보 보증 연계. 6차산업·로컬푸드 기업 우대. 해조류·수산가공·발효식품 특화.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_146",
    name: "충청북도 충북 바이오·오송 특화자금",
    institution: "충청북도·충북신용보증재단",
    category: "창업지원",
    maxAmount: "150000000",
    interestRate: "연 1.5~2.5% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "550",
    description: "충북 오송·오창 바이오단지 입주 창업기업 전용. 최대 1억 5천만 원. 바이오·제약·화장품·의료기기 업종 우대. 충북신보 보증 연계. 연구소 보유 기업 추가 혜택.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_147",
    name: "강원도 강원 관광·레저 특화자금",
    institution: "강원도·강원신용보증재단",
    category: "운전자금",
    maxAmount: "70000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "강원 소재 관광·스키·레저·펜션·캠핑장 소상공인 전용. 최대 7천만 원. 강원신보 보증 연계. 강원도 관광진흥기금 연계 가능. 동계 비수기 피해 업체 우선.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_148",
    name: "충청남도 충남 자동차 부품 소기업 자금",
    institution: "충청남도·충남신용보증재단",
    category: "시설자금",
    maxAmount: "100000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "50000000",
    maxDebt: "0",
    minCreditScore: "550",
    description: "충남 소재 자동차 부품·조립 소기업 전용. 최대 1억 원. 현대·기아·한국GM 협력사 우대. 충남신보 보증 연계. 전기차 전환 설비 투자 추가 지원.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_149",
    name: "경상북도 경북 문화·콘텐츠 소기업 자금",
    institution: "경상북도·경북신용보증재단",
    category: "창업지원",
    maxAmount: "70000000",
    interestRate: "연 2.0~3.0% (이차보전 후)",
    period: "5년 (거치 1년)",
    eligibleGrades: ["A", "B", "C", "D"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "0",
    description: "경북 소재 문화콘텐츠·웹툰·게임·K-문화 관련 소기업 창업 지원. 최대 7천만 원. 경북신보 보증 연계. 안동·경주 문화도시 입지 기업 추가 혜택.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
  {
    id: "fund_150",
    name: "세종시 세종 스마트시티 기업 자금",
    institution: "세종시·세종신용보증재단",
    category: "성장지원",
    maxAmount: "150000000",
    interestRate: "연 1.5~2.5% (이차보전 후)",
    period: "7년 (거치 2년)",
    eligibleGrades: ["A", "B", "C"],
    minRevenue: "0",
    maxDebt: "0",
    minCreditScore: "550",
    description: "세종 스마트시티 국가시범도시 참여·입주 기업 전용. 최대 1억 5천만 원. AI·IoT·모빌리티·에너지 분야 우대. 세종신보 보증 연계. 2026년 확대 시행.",
    active: true,
    createdAt: "2026-01-01 00:00:00",
  },
];

// ────────────────────────────────────────────
// 자금 마스터 CRUD
// ────────────────────────────────────────────

export function getAllFunds(): FundProduct[] {
  if (typeof window === "undefined") return DEFAULT_FUNDS;

  // 항상 DEFAULT_FUNDS를 기준으로 덮어쓴 뒤 반환
  // 관리자가 추가한 항목(타임스탬프 id)만 뒤에 보존
  const raw = localStorage.getItem("fundMaster");
  const existing: FundProduct[] = raw ? (JSON.parse(raw) as FundProduct[]) : [];
  const defaultIds = new Set(DEFAULT_FUNDS.map(f => f.id));
  const adminAdded = existing.filter(f => !defaultIds.has(f.id));
  const merged = [...DEFAULT_FUNDS, ...adminAdded];

  // 항상 최신 상태로 덮어씀
  localStorage.setItem("fundMaster", JSON.stringify(merged));
  return merged;
}

export function saveAllFunds(funds: FundProduct[]) {
  localStorage.setItem("fundMaster", JSON.stringify(funds));
}

export function addFund(data: Omit<FundProduct, "id" | "createdAt">): FundProduct {
  const funds = getAllFunds();
  const newFund: FundProduct = {
    ...data,
    id: "fund_" + Date.now(),
    createdAt: new Date().toLocaleString("ko-KR"),
    updatedAt: new Date().toLocaleString("ko-KR"),
  };
  funds.push(newFund);
  saveAllFunds(funds);
  return newFund;
}

export function updateFund(id: string, data: Partial<FundProduct>) {
  const funds = getAllFunds();
  const idx = funds.findIndex(f => f.id === id);
  if (idx >= 0) {
    funds[idx] = { ...funds[idx], ...data, updatedAt: new Date().toLocaleString("ko-KR") };
    saveAllFunds(funds);
  }
}

export function deleteFund(id: string) {
  const funds = getAllFunds().filter(f => f.id !== id);
  saveAllFunds(funds);
}

/**
 * AI 추천: 사용자 정보 기반으로 적합한 자금 목록 반환
 * - eligibleGrades에 해당 등급 포함
 * - minRevenue 이상 연매출
 * - minCreditScore 이상 신용점수
 * - maxDebt 조건 충족 (0이면 무제한)
 * - active: true 인 것만
 */
export function getRecommendedFunds(u: UserRecord): FundProduct[] {
  const { grade } = calcGrade(u);
  const rev = Number(u.annual_revenue) || 0;
  const nice = Number(u.nice_score) || 0;
  const totalDebt =
    (Number(u.debt_policy) || 0) +
    (Number(u.debt_bank1) || 0) +
    (Number(u.debt_bank2) || 0) +
    (Number(u.debt_card) || 0);

  const all = getAllFunds();
  return all.filter(f => {
    if (!f.active) return false;
    if (!f.eligibleGrades.includes(grade)) return false;
    if (Number(f.minRevenue) > 0 && rev < Number(f.minRevenue)) return false;
    if (Number(f.minCreditScore) > 0 && nice < Number(f.minCreditScore)) return false;
    if (Number(f.maxDebt) > 0 && totalDebt > Number(f.maxDebt)) return false;
    return true;
  });
}

/** 자금명 문자열 배열로 반환 (기존 호환용) */
export function getRecommendedFundNames(u: UserRecord): string[] {
  return getRecommendedFunds(u).map(f => f.name);
}

// ────────────────────────────────────────────
// 관리자 계정 관리
// ────────────────────────────────────────────

const DEFAULT_ADMIN: AdminAccount = {
  id: "admin",
  username: "admin",
  password: "emfrontier2026!",
  name: "슈퍼 관리자",
  role: "superadmin",
  createdAt: "2026-01-01 00:00:00",
};

export function getAllAdmins(): AdminAccount[] {
  if (typeof window === "undefined") return [DEFAULT_ADMIN];
  const raw = localStorage.getItem("adminAccounts");
  if (!raw) {
    localStorage.setItem("adminAccounts", JSON.stringify([DEFAULT_ADMIN]));
    return [DEFAULT_ADMIN];
  }
  const list: AdminAccount[] = JSON.parse(raw);
  if (!list.find(a => a.id === "admin")) {
    list.unshift(DEFAULT_ADMIN);
    localStorage.setItem("adminAccounts", JSON.stringify(list));
  }
  return list;
}

export function saveAllAdmins(admins: AdminAccount[]) {
  localStorage.setItem("adminAccounts", JSON.stringify(admins));
}

export function loginAdmin(username: string, password: string): AdminAccount | null {
  const admins = getAllAdmins();
  const admin = admins.find(a => a.username === username && a.password === password);
  if (!admin) return null;
  const updated = admins.map(a =>
    a.id === admin.id ? { ...a, lastLogin: new Date().toLocaleString("ko-KR") } : a
  );
  saveAllAdmins(updated);
  localStorage.setItem("adminLoggedIn", "true");
  localStorage.setItem("currentAdminId", admin.id);
  return admin;
}

export function getCurrentAdmin(): AdminAccount | null {
  if (typeof window === "undefined") return null;
  const adminId = localStorage.getItem("currentAdminId");
  if (!adminId) return null;
  return getAllAdmins().find(a => a.id === adminId) ?? null;
}

export function addAdmin(data: Omit<AdminAccount, "id" | "createdAt">): AdminAccount {
  const admins = getAllAdmins();
  const newAdmin: AdminAccount = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toLocaleString("ko-KR"),
  };
  admins.push(newAdmin);
  saveAllAdmins(admins);
  return newAdmin;
}

export function updateAdmin(id: string, data: Partial<AdminAccount>) {
  const admins = getAllAdmins();
  const idx = admins.findIndex(a => a.id === id);
  if (idx >= 0) {
    admins[idx] = { ...admins[idx], ...data };
    saveAllAdmins(admins);
  }
}

export function deleteAdmin(id: string) {
  if (id === "admin") return;
  const admins = getAllAdmins().filter(a => a.id !== id);
  saveAllAdmins(admins);
}

// ────────────────────────────────────────────
// 회원 관련
// ────────────────────────────────────────────

export function getAllUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("users");
  return raw ? JSON.parse(raw) : [];
}

export function saveAllUsers(users: UserRecord[]) {
  localStorage.setItem("users", JSON.stringify(users));
}

export function getUserById(id: string): UserRecord | null {
  return getAllUsers().find(u => u.id === id) ?? null;
}

export function getUserByEmail(email: string): UserRecord | null {
  return getAllUsers().find(u => u.email === email) ?? null;
}

export function upsertUser(user: UserRecord) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.unshift(user);
  saveAllUsers(users);
}

export function registerUser(data: Omit<UserRecord, "id" | "registeredAt">): UserRecord {
  const user: UserRecord = {
    ...data,
    id: data.email,
    registeredAt: new Date().toLocaleString("ko-KR"),
  };
  upsertUser(user);
  localStorage.setItem("userData", JSON.stringify(user));
  return user;
}

export function loginUser(email: string, password: string): UserRecord | null {
  const user = getUserByEmail(email);
  if (!user || user.password !== password) return null;
  localStorage.setItem("userData", JSON.stringify(user));
  localStorage.setItem("isLoggedIn", "true");
  return user;
}

export function getCurrentUser(): UserRecord | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("userData");
  if (!raw) return null;
  const cached = JSON.parse(raw) as UserRecord;
  const latest = getUserById(cached.id);
  if (latest) {
    localStorage.setItem("userData", JSON.stringify(latest));
    return latest;
  }
  return cached;
}

export function deleteUser(userId: string) {
  const users = getAllUsers().filter(u => u.id !== userId);
  saveAllUsers(users);
}

export function updateUser(userId: string, data: Partial<UserRecord>) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...data };
    saveAllUsers(users);
    const currentRaw = localStorage.getItem("userData");
    if (currentRaw) {
      const current = JSON.parse(currentRaw);
      if (current.id === userId) {
        localStorage.setItem("userData", JSON.stringify(users[idx]));
      }
    }
  }
}

// ────────────────────────────────────────────
// 신청 관련
// ────────────────────────────────────────────

export function submitApplication(userId: string, funds: string[]): Application {
  const app: Application = {
    status: "접수대기",
    funds,
    date: new Date().toLocaleDateString("ko-KR"),
    updatedAt: new Date().toLocaleString("ko-KR"),
  };
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].application = app;
    saveAllUsers(users);
    localStorage.setItem("userData", JSON.stringify(users[idx]));
  }
  return app;
}

export function updateApplicationStatus(userId: string, status: ApplicationStatus) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0 && users[idx].application) {
    users[idx].application!.status = status;
    users[idx].application!.updatedAt = new Date().toLocaleString("ko-KR");
    saveAllUsers(users);
    const currentRaw = localStorage.getItem("userData");
    if (currentRaw) {
      const current = JSON.parse(currentRaw);
      if (current.id === userId) {
        current.application = users[idx].application;
        localStorage.setItem("userData", JSON.stringify(current));
      }
    }
  }
}

export function saveAdminMemo(userId: string, memo: string) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].adminMemo = memo;
    saveAllUsers(users);
  }
}

// ────────────────────────────────────────────
// 등급 계산
// ────────────────────────────────────────────

export function calcGrade(u: UserRecord): { grade: string; score: number } {
  let s = 0;
  const nice = Number(u.nice_score) || 0;
  const rev = Number(u.annual_revenue) || 0;
  const debt =
    (Number(u.debt_policy) || 0) +
    (Number(u.debt_bank1) || 0) +
    (Number(u.debt_bank2) || 0) +
    (Number(u.debt_card) || 0);

  if (nice >= 900) s += 40;
  else if (nice >= 800) s += 30;
  else if (nice >= 700) s += 20;
  else if (nice >= 600) s += 10;

  if (rev >= 500000000) s += 30;
  else if (rev >= 200000000) s += 20;
  else if (rev >= 100000000) s += 15;
  else if (rev >= 50000000) s += 8;

  if (debt === 0) s += 20;
  else if (debt < 50000000) s += 15;
  else if (debt < 100000000) s += 10;
  else if (debt < 200000000) s += 5;

  const grade = s >= 75 ? "A" : s >= 55 ? "B" : s >= 35 ? "C" : "D";
  return { grade, score: s };
}

// ────────────────────────────────────────────
// 상담 신청 (Consultation)
// ────────────────────────────────────────────

export type ConsultStatus =
  | "접수대기"
  | "상담예약"
  | "상담완료"
  | "서류요청"
  | "신청진행"
  | "종결";

export interface Consultation {
  id: string;                   // 고유 접수번호
  // 신청자 기본 정보
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  // 사업 정보
  businessType: string;         // 업종
  businessPeriod: string;       // 사업 기간
  annual_revenue: string;       // 연매출
  // 대출 정보
  desiredAmount: string;        // 희망 대출금액
  purposeType: string;          // 목적 (운전자금/시설자금/기타)
  currentDebt: string;          // 현재 총 기대출
  // 신용 정보
  nice_score: string;
  kcb_score: string;
  // 기타
  inquiryContent: string;       // 문의 내용
  privacyAgreed: boolean;
  // AI 분석 및 자금 추천
  aiAnalysis?: {
    sohoGrade: string;          // SOHO 등급 (A/B/C/D)
    sohoScore: number;          // 점수
    summary: string;            // 종합 분석 요약
    strengths: string[];        // 강점
    weaknesses: string[];       // 약점
    opportunities: string[];    // 기회
    risks: string[];            // 리스크
    totalRecommended: number;   // 추천 자금 수
    maxPossibleAmount: string;  // 최대 가능 금액
  };
  recommendedFundIds?: string[];  // AI 추천 자금 ID 목록
  selectedFundIds?: string[];     // 클라이언트가 최종 선택한 자금 ID 목록
  // 관리자 필드
  status: ConsultStatus;
  adminMemo: string;
  assignedTo: string;           // 담당자
  consultDate: string;          // 상담 예약일시
  createdAt: string;
  updatedAt?: string;
}

export const CONSULT_STATUS_LIST: ConsultStatus[] = [
  "접수대기", "상담예약", "상담완료", "서류요청", "신청진행", "종결",
];

export const CONSULT_STATUS_COLORS: Record<ConsultStatus, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
  "접수대기": { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB", darkBg: "#1E293B",   darkText: "#94A3B8" },
  "상담예약": { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD", darkBg: "#1E3A5F",   darkText: "#60A5FA" },
  "상담완료": { bg: "#DCFCE7", text: "#166534", border: "#86EFAC", darkBg: "#052E1C",   darkText: "#34D399" },
  "서류요청": { bg: "#FEF9C3", text: "#92400E", border: "#FDE68A", darkBg: "#3B2A00",   darkText: "#FBBF24" },
  "신청진행": { bg: "#EDE9FE", text: "#6D28D9", border: "#C4B5FD", darkBg: "#2E1B5E",   darkText: "#A78BFA" },
  "종결":     { bg: "#F1F5F9", text: "#64748B", border: "#CBD5E1", darkBg: "#0F172A",   darkText: "#475569" },
};

export const PURPOSE_TYPES = ["운전자금", "시설자금", "창업자금", "기타"];
export const BUSINESS_PERIODS = ["1년 미만", "1~3년", "3~5년", "5~10년", "10년 이상"];
export const BUSINESS_TYPES = [
  "음식점/카페", "도소매업", "서비스업", "제조업", "건설업",
  "IT/소프트웨어", "교육", "의료/헬스케어", "부동산", "기타",
];

function genConsultId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CS-${ymd}-${rand}`;
}

export function getAllConsultations(): Consultation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("consultations");
  return raw ? JSON.parse(raw) : [];
}

export function saveAllConsultations(list: Consultation[]) {
  localStorage.setItem("consultations", JSON.stringify(list));
}

export function getConsultationById(id: string): Consultation | null {
  return getAllConsultations().find(c => c.id === id) ?? null;
}

export function submitConsultation(
  data: Omit<Consultation, "id" | "status" | "adminMemo" | "assignedTo" | "consultDate" | "createdAt" | "updatedAt">
): Consultation {
  const consultation: Consultation = {
    ...data,
    id: genConsultId(),
    status: "접수대기",
    adminMemo: "",
    assignedTo: "",
    consultDate: "",
    createdAt: new Date().toLocaleString("ko-KR"),
  };
  const list = getAllConsultations();
  list.unshift(consultation);
  saveAllConsultations(list);
  return consultation;
}

export function updateConsultation(id: string, data: Partial<Consultation>) {
  const list = getAllConsultations();
  const idx = list.findIndex(c => c.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toLocaleString("ko-KR") };
    saveAllConsultations(list);
  }
}

export function deleteConsultation(id: string) {
  saveAllConsultations(getAllConsultations().filter(c => c.id !== id));
}

export function lookupConsultations(name: string, phone: string): Consultation[] {
  return getAllConsultations().filter(
    c => c.name === name.trim() && c.phone.replace(/-/g, "") === phone.replace(/-/g, "")
  );
}
