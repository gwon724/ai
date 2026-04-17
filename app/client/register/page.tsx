"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser, FONT } from "@/lib/store";

const font = FONT;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "14px",
  border: "1.5px solid #D1D5DB", borderRadius: "8px",
  backgroundColor: "#F9FAFB", color: "#1F2937", outline: "none", fontFamily: font,
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: "600",
  color: "#374151", marginBottom: "6px", fontFamily: font,
};
const sectionStyle: React.CSSProperties = {
  borderBottom: "1px solid #F0F1F5", paddingBottom: "24px", marginBottom: "24px",
};
const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px", fontWeight: "700", color: "#1E293B", marginBottom: "16px", fontFamily: font,
};

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
    <div style={{ minHeight: "100vh", backgroundColor: "#E8EDFB", padding: "40px 16px", fontFamily: font }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <Image src="/logo.png" alt="EMFRONTIER LAB" width={60} height={60} style={{ objectFit: "contain", margin: "0 auto 8px", display: "block" }} />
        <h1 style={{ fontSize: "30px", fontWeight: "800", color: "#1E293B", marginBottom: "6px" }}>EMFRONTIER LAB</h1>
        <p style={{ fontSize: "15px", fontWeight: "600", color: "#3B82F6", marginBottom: "4px" }}>회원가입</p>
        <p style={{ fontSize: "13px", color: "#6B7280" }}>정책자금 신청을 위한 정보를 입력해주세요</p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", boxShadow: "0 4px 20px rgba(99,120,200,0.12)", padding: "32px 28px", width: "100%", maxWidth: "560px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#DC2626", fontFamily: font }}>{error}</div>
          )}

          {/* ① 로그인 정보 */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>① 로그인 정보</p>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>이메일 <span style={{ color: "#EF4444" }}>*</span></label>
              <input type="email" required placeholder="example@email.com" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>비밀번호 <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="password" required placeholder="비밀번호" value={form.password} onChange={e => set("password", e.target.value)} style={inputStyle} />
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px", fontFamily: font }}>영문·숫자·특수문자 포함 8자 이상</p>
              </div>
              <div>
                <label style={labelStyle}>비밀번호 확인 <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="password" required placeholder="비밀번호 확인" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* ② 기본 정보 */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>② 기본 정보</p>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>이름 <span style={{ color: "#EF4444" }}>*</span></label>
              <input type="text" required placeholder="홍길동" value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>나이 <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="number" required placeholder="35" min="18" max="100" value={form.age} onChange={e => set("age", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>성별 <span style={{ color: "#EF4444" }}>*</span></label>
                <select required value={form.gender} onChange={e => set("gender", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>
            </div>
          </div>

          {/* ③ 재무 정보 */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>③ 재무 정보</p>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>연매출액 (원) <span style={{ color: "#EF4444" }}>*</span></label>
              <input type="number" required placeholder="예: 150000000" min="0" value={form.annual_revenue} onChange={e => set("annual_revenue", e.target.value)} style={inputStyle} />
            </div>
            <label style={{ ...labelStyle, marginBottom: "10px" }}>기대출 내역 (원) <span style={{ color: "#EF4444" }}>*</span></label>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px", fontFamily: font }}>※ 없는 항목은 0을 입력하세요</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              {[
                { label: "정책자금", key: "debt_policy" },
                { label: "1금융권 대출", key: "debt_bank1" },
                { label: "2금융권 대출", key: "debt_bank2" },
                { label: "카드론", key: "debt_card" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ ...labelStyle, fontWeight: "500", fontSize: "12px" }}>{label} <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="number" required placeholder="0" min="0" value={form[key as keyof typeof form] as string} onChange={e => set(key, e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: "#EAF2FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "10px 14px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#1D4ED8", fontFamily: font }}>총 기대출 합계: {totalDebt.toLocaleString()}원</p>
            </div>
          </div>

          {/* ④ 신용 정보 */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>④ 신용 정보</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>NICE 신용점수 <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="number" required placeholder="예: 750" min="0" max="1000" value={form.nice_score} onChange={e => set("nice_score", e.target.value)} style={inputStyle} />
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px", fontFamily: font }}>0 ~ 1000점</p>
              </div>
              <div>
                <label style={labelStyle}>KCB 신용점수 <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="number" required placeholder="예: 730" min="0" max="1000" value={form.kcb_score} onChange={e => set("kcb_score", e.target.value)} style={inputStyle} />
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px", fontFamily: font }}>0 ~ 1000점</p>
              </div>
            </div>
          </div>

          {/* ⑤ 필수 동의 */}
          <div style={{ marginBottom: "24px" }}>
            <p style={sectionTitleStyle}>⑤ 필수 동의</p>
            <div style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "agree_credit", label: "신용정보조회 동의" },
                { key: "agree_privacy", label: "개인정보 수집·이용 동의" },
                { key: "agree_secret", label: "비밀유지서약서 동의" },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontFamily: font, fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e => set(key, e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#2563EB", cursor: "pointer" }} />
                  {label} <span style={{ color: "#EF4444" }}>*</span>
                </label>
              ))}
              <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: font }}>* 모든 항목에 동의해야 회원가입이 가능합니다.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/client/login" style={{ flex: 1, display: "block", textAlign: "center", padding: "12px", backgroundColor: "#FFFFFF", color: "#6B7280", fontSize: "14px", fontWeight: "600", border: "1.5px solid #D1D5DB", borderRadius: "8px", textDecoration: "none", fontFamily: font }}>취소</Link>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", backgroundColor: loading ? "#93C5FD" : "#2563EB", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(37,99,235,0.2)" }}>
              {loading ? "처리 중..." : "회원가입"}
            </button>
          </div>
        </form>
      </div>

      <p style={{ marginTop: "32px", fontSize: "11px", color: "#9CA3AF", textAlign: "center" }}>
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </p>
    </div>
  );
}
