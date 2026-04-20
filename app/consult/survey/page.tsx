"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGO_B64, submitConsultation, FONT } from "@/lib/store"; // LOGO_B64 added

const font = FONT;

/* ─── 타입 ─────────────────────────────── */
type FormData = {
  bizType: string;
  businessType: string;
  businessPeriod: string;
  purposeType: string;
  desiredAmount: string;
  nice_score: string;
  currentDebt: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  annual_revenue: string;
  inquiryContent: string;
  privacyAgreed: boolean;
};

const EMPTY: FormData = {
  bizType: "", businessType: "", businessPeriod: "",
  purposeType: "", desiredAmount: "", nice_score: "", currentDebt: "",
  name: "", phone: "", email: "", age: "",
  annual_revenue: "", inquiryContent: "", privacyAgreed: false,
};

/* ─── 설문 단계 정의 ──────────────────────── */
const STEPS = [
  {
    id: "bizType",
    question: "사업자 형태는 어떻게 되시나요?",
    desc: "현재 사업자 유형을 선택해주세요",
    type: "card",
    options: [
      { value: "개인사업자", label: "개인사업자", sub: "1인 사업자 / 소상공인" },
      { value: "법인사업자", label: "법인사업자", sub: "주식회사 / 유한회사 등" },
      { value: "예정사업자", label: "창업 예정", sub: "사업자 등록 전 창업 준비 중" },
    ],
  },
  {
    id: "businessType",
    question: "업종이 어떻게 되시나요?",
    desc: "가장 가까운 업종을 선택해주세요",
    type: "card",
    options: [
      { value: "음식점/카페", label: "음식점·카페", sub: "식당, 카페, 베이커리" },
      { value: "도소매업", label: "도소매업", sub: "온라인/오프라인 판매" },
      { value: "서비스업", label: "서비스업", sub: "미용, 세탁, 컨설팅 등" },
      { value: "제조업", label: "제조업", sub: "생산·가공·조립 업체" },
      { value: "건설업", label: "건설업", sub: "건설, 인테리어, 시공" },
      { value: "IT/소프트웨어", label: "IT·소프트웨어", sub: "개발, SaaS, 플랫폼" },
      { value: "의료/헬스케어", label: "의료·헬스케어", sub: "병원, 약국, 헬스장" },
      { value: "교육", label: "교육", sub: "학원, 교습소, 강사" },
      { value: "기타", label: "기타 업종", sub: "위에 해당 없는 경우" },
    ],
  },
  {
    id: "businessPeriod",
    question: "사업 기간은 얼마나 되셨나요?",
    desc: "현재 운영 중인 사업의 기간을 선택해주세요",
    type: "card",
    options: [
      { value: "1년 미만", label: "1년 미만", sub: "신규 창업 / 초기 단계" },
      { value: "1~3년", label: "1년 ~ 3년", sub: "성장 초기 단계" },
      { value: "3~5년", label: "3년 ~ 5년", sub: "안정화 단계" },
      { value: "5~10년", label: "5년 ~ 10년", sub: "성숙 단계" },
      { value: "10년 이상", label: "10년 이상", sub: "장기 운영 사업체" },
    ],
  },
  {
    id: "purposeType",
    question: "자금이 필요한 이유가 무엇인가요?",
    desc: "주된 자금 사용 목적을 선택해주세요",
    type: "card",
    options: [
      { value: "운전자금", label: "운전자금", sub: "임대료, 급여, 재고 구입 등 운영 자금" },
      { value: "시설자금", label: "시설자금", sub: "인테리어, 설비, 장비 구입" },
      { value: "창업자금", label: "창업자금", sub: "신규 사업 개시를 위한 자금" },
      { value: "기타", label: "기타", sub: "위에 해당 없는 경우" },
    ],
  },
  {
    id: "desiredAmount",
    question: "필요하신 자금 규모는 얼마인가요?",
    desc: "희망하시는 대출 금액대를 선택해주세요",
    type: "card",
    options: [
      { value: "3000만원 이하", label: "3,000만원 이하", sub: "소규모 운영 자금" },
      { value: "3000~5000만원", label: "3,000 ~ 5,000만원", sub: "중소 규모 자금" },
      { value: "5000~1억원", label: "5,000만 ~ 1억원", sub: "일반 정책자금 규모" },
      { value: "1억~3억원", label: "1억 ~ 3억원", sub: "성장·시설 투자 자금" },
      { value: "3억원 이상", label: "3억원 이상", sub: "대규모 사업 확장 자금" },
    ],
  },
  {
    id: "nice_score",
    question: "현재 신용점수는 어느 정도인가요?",
    desc: "정확하지 않아도 괜찮아요 — 대략적인 구간을 선택해주세요",
    type: "card",
    options: [
      { value: "900", label: "900점 이상", sub: "최상위 신용 등급 (상위 10%)" },
      { value: "800", label: "800 ~ 899점", sub: "우량 신용 등급" },
      { value: "700", label: "700 ~ 799점", sub: "양호한 신용 등급" },
      { value: "600", label: "600 ~ 699점", sub: "보통 신용 등급" },
      { value: "500", label: "600점 미만", sub: "신용 관리가 필요한 단계" },
    ],
  },
  {
    id: "currentDebt",
    question: "현재 사업 관련 대출이 있으신가요?",
    desc: "기존 대출 여부에 따라 추천 자금이 달라집니다",
    type: "card",
    options: [
      { value: "0", label: "없음", sub: "현재 사업 관련 대출 없음" },
      { value: "30000000", label: "3,000만원 미만", sub: "소액 대출 보유" },
      { value: "70000000", label: "3,000 ~ 7,000만원", sub: "중간 규모 대출 보유" },
      { value: "150000000", label: "7,000만 ~ 1억 5천", sub: "상당 규모 대출 보유" },
      { value: "300000000", label: "1억 5천만원 이상", sub: "고액 대출 보유" },
    ],
  },
];

const TOTAL = STEPS.length + 1; // 7단계 + 개인정보

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [slideDir, setSlideDir] = useState<"in" | "out">("in");
  const [visible, setVisible] = useState(true);

  const progress = Math.round((step / TOTAL) * 100);

  const goNext = () => {
    setVisible(false);
    setSlideDir("out");
    setTimeout(() => {
      setStep(s => s + 1);
      setSlideDir("in");
      setVisible(true);
    }, 220);
  };

  const goBack = () => {
    if (step === 0) {
      router.push("/consult");
      return;
    }
    setVisible(false);
    setTimeout(() => {
      setStep(s => s - 1);
      setVisible(true);
    }, 180);
  };

  const handleSelect = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setTimeout(goNext, 260);
  };

  const validateInfo = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "이름을 입력해주세요";
    if (!form.phone.trim()) e.phone = "연락처를 입력해주세요";
    else if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "올바른 연락처를 입력해주세요";
    if (!form.email.trim()) e.email = "이메일을 입력해주세요";
    if (!form.annual_revenue) e.annual_revenue = "연매출액을 입력해주세요";
    if (!form.privacyAgreed) e.privacyAgreed = "개인정보 수집·이용에 동의해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateInfo()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));

    const niceMap: Record<string, string> = { "900": "920", "800": "840", "700": "740", "600": "640", "500": "560" };
    const debtMap: Record<string, string> = { "0": "0", "30000000": "20000000", "70000000": "50000000", "150000000": "100000000", "300000000": "200000000" };
    const amountMap: Record<string, string> = {
      "3000만원 이하": "25000000", "3000~5000만원": "40000000",
      "5000~1억원": "70000000", "1억~3억원": "150000000", "3억원 이상": "300000000",
    };

    const result = submitConsultation({
      name: form.name, phone: form.phone, email: form.email,
      age: form.age || "0", gender: "남성",
      businessType: form.businessType || "기타",
      businessPeriod: form.businessPeriod || "1~3년",
      annual_revenue: form.annual_revenue,
      desiredAmount: amountMap[form.desiredAmount] || "50000000",
      purposeType: form.purposeType || "운전자금",
      currentDebt: debtMap[form.currentDebt] || "0",
      nice_score: niceMap[form.nice_score] || "700",
      kcb_score: niceMap[form.nice_score] || "700",
      inquiryContent: form.inquiryContent,
      privacyAgreed: form.privacyAgreed,
    });
    localStorage.setItem("lastConsultId", result.id);
    router.push("/consult/done");
  };

  const setField = (k: string, v: string | boolean) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const currentStepData = step < STEPS.length ? STEPS[step] : null;
  const isInfoStep = step === STEPS.length;

  const slideStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : slideDir === "out" ? "translateX(-30px)" : "translateX(30px)",
    transition: "opacity 0.22s ease, transform 0.22s ease",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: font, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        .sv-options-grid { display: grid; gap: 10px; }
        .sv-options-1 { grid-template-columns: 1fr; }
        .sv-options-2 { grid-template-columns: 1fr 1fr; }
        .sv-options-3 { grid-template-columns: 1fr 1fr 1fr; }
        .sv-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) {
          .sv-options-2 { grid-template-columns: 1fr; }
          .sv-options-3 { grid-template-columns: 1fr 1fr; }
          .sv-form-2col { grid-template-columns: 1fr; }
        }
        @media (max-width: 380px) {
          .sv-options-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── 상단 헤더 ── */}
      <header style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #F1F5F9", padding: "0 16px", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <Link href="/consult" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <img src={LOGO_B64} alt="EMFRONTIER LAB 로고" width={34} height={34} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: "15px", fontWeight: "800", color: "#0A1628", fontFamily: font }}>EMFRONTIER LAB</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "#94A3B8", fontFamily: font }}>
              {step + 1} / {TOTAL}
            </span>
            <button onClick={goBack}
              style={{ padding: "6px 14px", backgroundColor: "transparent", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "12px", color: "#64748B", cursor: "pointer", fontFamily: font }}>
              ← 이전
            </button>
          </div>
        </div>
      </header>

      {/* ── 진행 바 ── */}
      <div style={{ height: "4px", backgroundColor: "#F1F5F9", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #2563EB, #06B6D4)", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* ── 단계 번호 표시 ── */}
      <div style={{ backgroundColor: "#FAFBFF", borderBottom: "1px solid #F1F5F9", padding: "12px 24px", flexShrink: 0 }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", gap: "6px", alignItems: "center" }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{
              flex: i < step ? "0 0 auto" : "1",
              height: "5px",
              borderRadius: "999px",
              backgroundColor: i < step ? "#2563EB" : i === step ? "#BFDBFE" : "#E2E8F0",
              transition: "all 0.3s",
              maxWidth: i < step ? "24px" : undefined,
            }} />
          ))}
        </div>
      </div>

      {/* ── 메인 컨텐츠 ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
          <div style={slideStyle}>

            {/* ── 카드 선택 단계 ── */}
            {currentStepData && (
              <>
                <div style={{ marginBottom: "32px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#EFF6FF", border: "1px solid #DBEAFE", borderRadius: "999px", padding: "4px 14px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563EB", fontFamily: font, letterSpacing: "0.05em" }}>
                      STEP {step + 1} of {TOTAL}
                    </span>
                  </div>
                  <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0A1628", lineHeight: "1.35", marginBottom: "10px", fontFamily: font }}>
                    {currentStepData.question}
                  </h1>
                  <p style={{ fontSize: "14px", color: "#94A3B8", fontFamily: font }}>
                    {currentStepData.desc}
                  </p>
                </div>

                <div className={`sv-options-grid ${currentStepData.options.length <= 3 ? "sv-options-1" : currentStepData.options.length <= 4 ? "sv-options-2" : "sv-options-3"}`}>
                  {currentStepData.options.map(opt => {
                    const selected = (form as unknown as Record<string, string>)[currentStepData.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(currentStepData.id, opt.value)}
                        style={{
                          padding: currentStepData.options.length <= 3 ? "18px 24px" : "16px 18px",
                          borderRadius: "14px",
                          border: `2px solid ${selected ? "#2563EB" : "#E8EDF5"}`,
                          backgroundColor: selected ? "#EFF6FF" : "#FAFBFF",
                          cursor: "pointer",
                          fontFamily: font,
                          textAlign: "left",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          boxShadow: selected ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
                        }}
                        onMouseEnter={e => {
                          if (!selected) {
                            e.currentTarget.style.borderColor = "#BFDBFE";
                            e.currentTarget.style.backgroundColor = "#F5F9FF";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!selected) {
                            e.currentTarget.style.borderColor = "#E8EDF5";
                            e.currentTarget.style.backgroundColor = "#FAFBFF";
                          }
                        }}
                      >
                        <div>
                          <p style={{ fontSize: currentStepData.options.length <= 3 ? "16px" : "14px", fontWeight: "800", color: selected ? "#1D4ED8" : "#1E293B", fontFamily: font, marginBottom: "3px" }}>
                            {opt.label}
                          </p>
                          <p style={{ fontSize: "12px", color: selected ? "#3B82F6" : "#94A3B8", fontFamily: font, lineHeight: "1.4" }}>
                            {opt.sub}
                          </p>
                        </div>
                        <div style={{
                          width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${selected ? "#2563EB" : "#D1D5DB"}`,
                          backgroundColor: selected ? "#2563EB" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s",
                        }}>
                          {selected && <span style={{ color: "#FFF", fontSize: "12px", fontWeight: "900" }}>✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 이미 선택된 경우 다음 버튼 표시 */}
                {(form as unknown as Record<string, string>)[currentStepData.id] && (
                  <button onClick={goNext}
                    style={{ marginTop: "20px", width: "100%", padding: "15px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: "pointer", fontFamily: font }}>
                    다음 →
                  </button>
                )}
              </>
            )}

            {/* ── 개인정보 입력 단계 (마지막) ── */}
            {isInfoStep && (
              <>
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "4px 14px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#16A34A", fontFamily: font, letterSpacing: "0.05em" }}>
                      LAST STEP {TOTAL} of {TOTAL}
                    </span>
                  </div>
                  <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0A1628", lineHeight: "1.35", marginBottom: "8px", fontFamily: font }}>
                    거의 다 됐어요! 🎉
                  </h1>
                  <p style={{ fontSize: "14px", color: "#64748B", fontFamily: font }}>
                    연락처를 입력하시면 전담 매니저가 24시간 내로 연락드립니다
                  </p>
                </div>

                {/* 선택 요약 태그 */}
                <div style={{ backgroundColor: "#F8FAFF", border: "1px solid #DBEAFE", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#2563EB", marginBottom: "8px", fontFamily: font }}>📋 선택 내용 요약</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {[
                      form.bizType, form.businessType,
                      form.businessPeriod && `사업 ${form.businessPeriod}`,
                      form.purposeType,
                      form.desiredAmount && `희망 ${form.desiredAmount}`,
                    ].filter(Boolean).map((tag, i) => (
                      <span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "#1D4ED8", backgroundColor: "#DBEAFE", padding: "3px 10px", borderRadius: "999px", fontFamily: font }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 입력 필드들 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                  <div className="sv-form-2col">
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                        이름 <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        value={form.name}
                        onChange={e => setField("name", e.target.value)}
                        placeholder="홍길동"
                        style={{ width: "100%", padding: "13px 16px", fontSize: "15px", border: `2px solid ${errors.name ? "#EF4444" : "#E2E8F0"}`, borderRadius: "12px", fontFamily: font, outline: "none", boxSizing: "border-box", backgroundColor: "#FAFBFF" }}
                      />
                      {errors.name && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: font }}>{errors.name}</p>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                        연락처 <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        value={form.phone}
                        onChange={e => setField("phone", e.target.value)}
                        placeholder="010-1234-5678"
                        style={{ width: "100%", padding: "13px 16px", fontSize: "15px", border: `2px solid ${errors.phone ? "#EF4444" : "#E2E8F0"}`, borderRadius: "12px", fontFamily: font, outline: "none", boxSizing: "border-box", backgroundColor: "#FAFBFF" }}
                      />
                      {errors.phone && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: font }}>{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                      이메일 <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setField("email", e.target.value)}
                      placeholder="example@email.com"
                      style={{ width: "100%", padding: "13px 16px", fontSize: "15px", border: `2px solid ${errors.email ? "#EF4444" : "#E2E8F0"}`, borderRadius: "12px", fontFamily: font, outline: "none", boxSizing: "border-box", backgroundColor: "#FAFBFF" }}
                    />
                    {errors.email && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: font }}>{errors.email}</p>}
                  </div>

                  <div className="sv-form-2col">
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                        연매출액 <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.annual_revenue}
                        onChange={e => setField("annual_revenue", e.target.value)}
                        placeholder="예: 100000000"
                        style={{ width: "100%", padding: "13px 16px", fontSize: "15px", border: `2px solid ${errors.annual_revenue ? "#EF4444" : "#E2E8F0"}`, borderRadius: "12px", fontFamily: font, outline: "none", boxSizing: "border-box", backgroundColor: "#FAFBFF" }}
                      />
                      {form.annual_revenue && (
                        <p style={{ fontSize: "11px", color: "#2563EB", marginTop: "4px", fontFamily: font }}>
                          = {Number(form.annual_revenue).toLocaleString()}원
                        </p>
                      )}
                      {errors.annual_revenue && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: font }}>{errors.annual_revenue}</p>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                        나이 (선택)
                      </label>
                      <input
                        type="number"
                        min="18" max="100"
                        value={form.age}
                        onChange={e => setField("age", e.target.value)}
                        placeholder="예: 38"
                        style={{ width: "100%", padding: "13px 16px", fontSize: "15px", border: "2px solid #E2E8F0", borderRadius: "12px", fontFamily: font, outline: "none", boxSizing: "border-box", backgroundColor: "#FAFBFF" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                      문의 내용 (선택)
                    </label>
                    <textarea
                      value={form.inquiryContent}
                      onChange={e => setField("inquiryContent", e.target.value)}
                      rows={3}
                      placeholder="궁금하신 점이나 상담 내용을 자유롭게 입력해주세요..."
                      style={{ width: "100%", padding: "13px 16px", fontSize: "14px", border: "2px solid #E2E8F0", borderRadius: "12px", fontFamily: font, outline: "none", resize: "vertical", lineHeight: "1.7", boxSizing: "border-box", backgroundColor: "#FAFBFF" }}
                    />
                  </div>

                  {/* 개인정보 동의 */}
                  <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "16px 18px", border: `1px solid ${errors.privacyAgreed ? "#FCA5A5" : "#E5E7EB"}` }}>
                    <label style={{ display: "flex", gap: "12px", cursor: "pointer", alignItems: "flex-start" }}>
                      <input
                        type="checkbox"
                        checked={form.privacyAgreed}
                        onChange={e => setField("privacyAgreed", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "#2563EB", marginTop: "2px", flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: "#374151", fontFamily: font }}>
                          [필수] 개인정보 수집·이용 동의 <span style={{ color: "#EF4444" }}>*</span>
                        </p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px", lineHeight: "1.6", fontFamily: font }}>
                          수집 항목: 이름, 연락처, 이메일, 사업 정보<br />
                          이용 목적: 정책자금 상담 / 보유 기간: 1년
                        </p>
                      </div>
                    </label>
                    {errors.privacyAgreed && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "8px", fontFamily: font }}>{errors.privacyAgreed}</p>}
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "17px",
                      backgroundColor: submitting ? "#93C5FD" : "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "14px",
                      fontSize: "16px",
                      fontWeight: "900",
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: font,
                      boxShadow: submitting ? "none" : "0 6px 24px rgba(37,99,235,0.35)",
                      transition: "all 0.2s",
                    }}
                  >
                    {submitting ? "⏳ AI 분석 중..." : "🚀 신청 완료 · AI 자금 분석 시작"}
                  </button>

                  <p style={{ textAlign: "center", fontSize: "11px", color: "#94A3B8", fontFamily: font }}>
                    ✔ 상담비 0원 &nbsp;·&nbsp; ✔ 24시간 신청 &nbsp;·&nbsp; ✔ 미승인 시 착수금 100% 환불
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </main>

      {/* ── 하단 신뢰 배지 ── */}
      <footer style={{ borderTop: "1px solid #F1F5F9", padding: "16px 24px", flexShrink: 0 }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
          {["🔒 개인정보 보호", "🏢 정식 경영컨설팅업 등록", "📞 전국 비대면 상담 가능"].map(t => (
            <span key={t} style={{ fontSize: "11px", color: "#94A3B8", fontFamily: font }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
