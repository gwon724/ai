"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOGO_B64, loginUser, FONT } from "@/lib/store";

const font = FONT;

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
    <>
      <style>{`
        .cl-wrap {
          min-height: 100vh;
          background-color: #E8EDFB;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          font-family: ${font};
        }
        .cl-logo { text-align: center; margin-bottom: 24px; }
        .cl-logo img { width: 60px; height: 60px; object-fit: contain; margin: 0 auto 8px; display: block; }
        .cl-logo h1 { font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 6px; }
        .cl-logo .portal { font-size: 15px; font-weight: 600; color: #3B82F6; margin-bottom: 4px; }
        .cl-logo .desc { font-size: 13px; color: #6B7280; }
        .cl-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(99,120,200,0.12);
          padding: 28px 24px;
          width: 100%;
          max-width: 400px;
        }
        .cl-card h2 { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 18px; }
        .cl-inp {
          width: 100%; padding: 12px 14px; font-size: 14px;
          border: 1.5px solid #D1D5DB; border-radius: 8px;
          background: #F9FAFB; color: #1F2937; outline: none;
          font-family: ${font}; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .cl-inp:focus { border-color: #2563EB; background: #FFFFFF; }
        .cl-lbl { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .cl-err { background: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 13px; color: #DC2626; }
        .cl-btn {
          width: 100%; padding: 13px; background: #2563EB; color: #FFFFFF;
          font-size: 14px; font-weight: 700; border: none; border-radius: 8px;
          cursor: pointer; font-family: ${font}; box-shadow: 0 2px 8px rgba(37,99,235,0.2);
          transition: background 0.2s;
        }
        .cl-btn:disabled { background: #93C5FD; cursor: not-allowed; }
        .cl-footer { margin-top: 32px; font-size: 11px; color: #9CA3AF; text-align: center; }
        @media (max-width: 480px) {
          .cl-card { padding: 22px 16px; border-radius: 12px; }
          .cl-logo h1 { font-size: 24px; }
          .cl-logo img { width: 48px; height: 48px; }
        }
        @media (max-width: 360px) {
          .cl-wrap { padding: 20px 10px; }
          .cl-card { padding: 18px 12px; }
          .cl-logo h1 { font-size: 20px; }
        }
      `}</style>
      <div className="cl-wrap">
        <div className="cl-logo">
          <img src={LOGO_B64} alt="EMFRONTIER LAB" />
          <h1>EMFRONTIER LAB</h1>
          <p className="portal">클라이언트 포털</p>
          <p className="desc">정책자금 신청 및 조회 시스템</p>
        </div>

        <div className="cl-card">
          <h2>로그인</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="cl-err">{error}</div>}
            <div style={{ marginBottom: "14px" }}>
              <label className="cl-lbl">이메일 <span style={{ color: "#EF4444" }}>*</span></label>
              <input type="email" required placeholder="example@email.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="cl-inp" />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label className="cl-lbl">비밀번호 <span style={{ color: "#EF4444" }}>*</span></label>
              <input type="password" required placeholder="비밀번호를 입력하세요" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="cl-inp" />
            </div>
            <div style={{ textAlign: "right", marginBottom: "18px" }}>
              <Link href="/client/forgot-password" style={{ fontSize: "12px", color: "#6B7280", textDecoration: "none" }}>비밀번호를 잊으셨나요?</Link>
            </div>
            <button type="submit" disabled={loading} className="cl-btn">
              {loading ? "로그인 중..." : "로그인"}
            </button>
            <div style={{ borderTop: "1px solid #F3F4F6", marginTop: "16px", paddingTop: "14px", textAlign: "center" }}>
              <span style={{ fontSize: "13px", color: "#6B7280" }}>아직 회원이 아니신가요? </span>
              <Link href="/client/register" style={{ fontSize: "13px", color: "#2563EB", fontWeight: "600", textDecoration: "underline" }}>회원가입</Link>
            </div>
          </form>
        </div>

        <p className="cl-footer">Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved</p>
      </div>
    </>
  );
}
