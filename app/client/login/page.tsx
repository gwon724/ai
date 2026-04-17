"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser, FONT } from "@/lib/store";

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

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 700));
    const user = loginUser(form.email, form.password);
    if (user) {
      router.push("/client/dashboard");
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#E8EDFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", fontFamily: font }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <Image src="/logo.png" alt="EMFRONTIER LAB" width={60} height={60} style={{ objectFit: "contain", margin: "0 auto 8px", display: "block" }} />
        <h1 style={{ fontSize: "30px", fontWeight: "800", color: "#1E293B", marginBottom: "6px" }}>EMFRONTIER LAB</h1>
        <p style={{ fontSize: "15px", fontWeight: "600", color: "#3B82F6", marginBottom: "4px" }}>클라이언트 포털</p>
        <p style={{ fontSize: "13px", color: "#6B7280" }}>정책자금 신청 및 조회 시스템</p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", boxShadow: "0 4px 20px rgba(99,120,200,0.12)", padding: "32px 28px", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "20px", fontFamily: font }}>로그인</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#DC2626", fontFamily: font }}>{error}</div>
          )}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>이메일 <span style={{ color: "#EF4444" }}>*</span></label>
            <input type="email" required placeholder="example@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>비밀번호 <span style={{ color: "#EF4444" }}>*</span></label>
            <input type="password" required placeholder="비밀번호를 입력하세요" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={inputStyle} />
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link href="/client/forgot-password" style={{ fontSize: "12px", color: "#6B7280", textDecoration: "none", fontFamily: font }}>
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", backgroundColor: loading ? "#93C5FD" : "#2563EB", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(37,99,235,0.2)" }}>
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div style={{ borderTop: "1px solid #F3F4F6", marginTop: "16px", paddingTop: "16px", textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B7280", fontFamily: font }}>아직 회원이 아니신가요? </span>
            <Link href="/client/register" style={{ fontSize: "13px", color: "#2563EB", fontWeight: "600", textDecoration: "underline", fontFamily: font }}>회원가입</Link>
          </div>
        </form>
      </div>

      <p style={{ marginTop: "36px", fontSize: "11px", color: "#9CA3AF", fontFamily: font }}>
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </p>
    </div>
  );
}
