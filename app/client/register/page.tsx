"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOGO_B64, registerUser, FONT } from "@/lib/store";

const font = FONT;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "", password: "", confirmPassword: "",
    name: "", age: "", gender: "남성",
    annual_revenue: "",
    debt_policy: "", debt_bank1: "", debt_bank2: "", debt_card: "",
    nice_score: "", kcb_score: "",
    agree_credit: false, agree_privacy: false, agree_secret: false,
  });

  const totalDebt =
    (Number(form.debt_policy) || 0) + (Number(form.debt_bank1) || 0) +
    (Number(form.debt_bank2) || 0) + (Number(form.debt_card) || 0);

  const set = (key: string, val: string | boolean) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("비밀번호가 일치하지 않습니다."); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (!form.agree_credit || !form.agree_privacy || !form.agree_secret) { setError("필수 동의 항목을 모두 체크해주세요."); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    registerUser({
      email: form.email, password: form.password, name: form.name,
      age: form.age, gender: form.gender, annual_revenue: form.annual_revenue,
      debt_policy: form.debt_policy, debt_bank1: form.debt_bank1,
      debt_bank2: form.debt_bank2, debt_card: form.debt_card,
      nice_score: form.nice_score, kcb_score: form.kcb_score,
    });
    router.push("/client/dashboard");
  };

  return (
    <>
      <style>{`
        .rg-wrap {
          min-height: 100vh;
          background-color: #E8EDFB;
          padding: 32px 16px;
          font-family: ${font};
        }
        .rg-logo { text-align: center; margin-bottom: 24px; }
        .rg-logo img { width: 56px; height: 56px; object-fit: contain; margin: 0 auto 8px; display: block; }
        .rg-logo h1 { font-size: 26px; font-weight: 800; color: #1E293B; margin-bottom: 6px; }
        .rg-logo .sub { font-size: 14px; font-weight: 600; color: #3B82F6; margin-bottom: 4px; }
        .rg-logo .desc { font-size: 13px; color: #6B7280; }
        .rg-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(99,120,200,0.12);
          padding: 28px 24px;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }
        .rg-section { border-bottom: 1px solid #F0F1F5; padding-bottom: 22px; margin-bottom: 22px; }
        .rg-section-title { font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 14px; }
        .rg-inp {
          width: 100%; padding: 11px 14px; font-size: 14px;
          border: 1.5px solid #D1D5DB; border-radius: 8px;
          background: #F9FAFB; color: #1F2937; outline: none;
          font-family: ${font}; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .rg-inp:focus { border-color: #2563EB; background: #FFF; }
        .rg-lbl { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .rg-lbl-sm { display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 5px; }
        .rg-err { background: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 13px; color: #DC2626; }
        .rg-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rg-btn {
          flex: 1; padding: 13px; font-size: 14px; font-weight: 700;
          background: #2563EB; color: #FFFFFF; border: none;
          border-radius: 8px; cursor: pointer; font-family: ${font};
          box-shadow: 0 2px 8px rgba(37,99,235,0.2);
        }
        .rg-btn:disabled { background: #93C5FD; cursor: not-allowed; }
        .rg-footer { margin-top: 28px; font-size: 11px; color: #9CA3AF; text-align: center; }
        @media (max-width: 480px) {
          .rg-card { padding: 20px 14px; border-radius: 12px; }
          .rg-logo h1 { font-size: 22px; }
          .rg-logo img { width: 48px; height: 48px; }
          .rg-2col { grid-template-columns: 1fr; }
        }
        @media (max-width: 360px) {
          .rg-wrap { padding: 20px 10px; }
          .rg-card { padding: 16px 12px; }
          .rg-logo h1 { font-size: 20px; }
          .rg-inp { padding: 9px 12px; font-size: 13px; }
        }
      `}</style>
      <div className="rg-wrap">
        <div className="rg-logo">
          <img src={LOGO_B64} alt="EMFRONTIER LAB" />
          <h1>EMFRONTIER LAB</h1>
          <p className="sub">회원가입</p>
          <p className="desc">정책자금 신청을 위한 정보를 입력해주세요</p>
        </div>

        <div className="rg-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="rg-err">{error}</div>}

            {/* ① 로그인 정보 */}
            <div className="rg-section">
              <p className="rg-section-title">① 로그인 정보</p>
              <div style={{ marginBottom: "12px" }}>
                <label className="rg-lbl">이메일 <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="email" required placeholder="example@email.com" value={form.email} onChange={e => set("email", e.target.value)} className="rg-inp" />
              </div>
              <div className="rg-2col">
                <div>
                  <label className="rg-lbl">비밀번호 <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="password" required placeholder="비밀번호" value={form.password} onChange={e => set("password", e.target.value)} className="rg-inp" />
                  <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>영문·숫자·특수문자 포함 8자↑</p>
                </div>
                <div>
                  <label className="rg-lbl">비밀번호 확인 <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="password" required placeholder="비밀번호 확인" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} className="rg-inp" />
                </div>
              </div>
            </div>

            {/* ② 기본 정보 */}
            <div className="rg-section">
              <p className="rg-section-title">② 기본 정보</p>
              <div style={{ marginBottom: "12px" }}>
                <label className="rg-lbl">이름 <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="text" required placeholder="홍길동" value={form.name} onChange={e => set("name", e.target.value)} className="rg-inp" />
              </div>
              <div className="rg-2col">
                <div>
                  <label className="rg-lbl">나이 <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="number" required placeholder="35" min="18" max="100" value={form.age} onChange={e => set("age", e.target.value)} className="rg-inp" />
                </div>
                <div>
                  <label className="rg-lbl">성별 <span style={{ color: "#EF4444" }}>*</span></label>
                  <select required value={form.gender} onChange={e => set("gender", e.target.value)} className="rg-inp" style={{ cursor: "pointer" }}>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ③ 재무 정보 */}
            <div className="rg-section">
              <p className="rg-section-title">③ 재무 정보</p>
              <div style={{ marginBottom: "12px" }}>
                <label className="rg-lbl">연매출액 (원) <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="number" required placeholder="예: 150000000" min="0" value={form.annual_revenue} onChange={e => set("annual_revenue", e.target.value)} className="rg-inp" />
              </div>
              <label className="rg-lbl" style={{ marginBottom: "8px" }}>기대출 내역 (원) <span style={{ color: "#EF4444" }}>*</span></label>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px" }}>※ 없는 항목은 0을 입력하세요</p>
              <div className="rg-2col" style={{ marginBottom: "10px" }}>
                {[
                  { label: "정책자금", key: "debt_policy" },
                  { label: "1금융권 대출", key: "debt_bank1" },
                  { label: "2금융권 대출", key: "debt_bank2" },
                  { label: "카드론", key: "debt_card" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="rg-lbl-sm">{label} <span style={{ color: "#EF4444" }}>*</span></label>
                    <input type="number" required placeholder="0" min="0" value={form[key as keyof typeof form] as string} onChange={e => set(key, e.target.value)} className="rg-inp" />
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: "#EAF2FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "10px 14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#1D4ED8" }}>총 기대출 합계: {totalDebt.toLocaleString()}원</p>
              </div>
            </div>

            {/* ④ 신용 정보 */}
            <div className="rg-section">
              <p className="rg-section-title">④ 신용 정보</p>
              <div className="rg-2col">
                <div>
                  <label className="rg-lbl">NICE 신용점수 <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="number" required placeholder="750" min="0" max="1000" value={form.nice_score} onChange={e => set("nice_score", e.target.value)} className="rg-inp" />
                  <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>0 ~ 1000점</p>
                </div>
                <div>
                  <label className="rg-lbl">KCB 신용점수 <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="number" required placeholder="730" min="0" max="1000" value={form.kcb_score} onChange={e => set("kcb_score", e.target.value)} className="rg-inp" />
                  <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>0 ~ 1000점</p>
                </div>
              </div>
            </div>

            {/* ⑤ 필수 동의 */}
            <div style={{ marginBottom: "22px" }}>
              <p className="rg-section-title">⑤ 필수 동의</p>
              <div style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { key: "agree_credit", label: "신용정보조회 동의" },
                  { key: "agree_privacy", label: "개인정보 수집·이용 동의" },
                  { key: "agree_secret", label: "비밀유지서약서 동의" },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e => set(key, e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#2563EB", cursor: "pointer", flexShrink: 0 }} />
                    {label} <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                ))}
                <p style={{ fontSize: "11px", color: "#EF4444" }}>* 모든 항목에 동의해야 회원가입이 가능합니다.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/client/login" style={{ flex: 1, display: "block", textAlign: "center", padding: "13px", backgroundColor: "#FFFFFF", color: "#6B7280", fontSize: "14px", fontWeight: "600", border: "1.5px solid #D1D5DB", borderRadius: "8px", textDecoration: "none" }}>취소</Link>
              <button type="submit" disabled={loading} className="rg-btn">
                {loading ? "처리 중..." : "회원가입"}
              </button>
            </div>
          </form>
        </div>

        <p className="rg-footer">Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved</p>
      </div>
    </>
  );
}
