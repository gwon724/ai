"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOGO_B64, loginAdmin, FONT } from "@/lib/store";

const font = FONT;

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 600));

    const isSuperAdmin = username === "admin" && pw === "emfrontier2026!";
    if (isSuperAdmin) {
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("currentAdminId", "admin");
      router.push("/admin/dashboard");
      return;
    }

    const admin = loginAdmin(username, pw);
    if (admin) {
      router.push("/admin/dashboard");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .al-wrap {
          min-height: 100vh;
          background-color: #0F172A;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          font-family: ${font};
        }
        .al-logo { text-align: center; margin-bottom: 32px; }
        .al-logo img { object-fit: contain; filter: invert(1); display: block; margin: 0 auto 12px; width: 56px; height: 56px; }
        .al-logo h1 { font-size: 26px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
        .al-logo p { font-size: 13px; color: #64748B; }
        .al-card {
          background-color: #1E293B;
          border-radius: 16px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.5);
          padding: 32px 28px;
          width: 100%;
          max-width: 400px;
          border: 1px solid #334155;
        }
        .al-card h2 { font-size: 16px; font-weight: 700; color: #F1F5F9; margin-bottom: 24px; }
        .al-inp {
          width: 100%; padding: 12px 14px; font-size: 14px;
          border: 1.5px solid #334155; border-radius: 8px;
          background-color: #0F172A; color: #F1F5F9;
          outline: none; font-family: ${font}; box-sizing: border-box;
        }
        .al-inp:focus { border-color: #2563EB; }
        .al-lbl { display: block; font-size: 12px; font-weight: 600; color: #94A3B8; margin-bottom: 8px; }
        .al-err {
          background-color: #450A0A; border: 1px solid #7F1D1D;
          border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;
          font-size: 13px; color: #FCA5A5;
        }
        .al-pw-wrap { position: relative; }
        .al-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 16px; color: #64748B; padding: 0;
        }
        .al-btn {
          width: 100%; padding: 13px; font-size: 15px; font-weight: 700;
          background-color: #2563EB; color: #FFFFFF; border: none;
          border-radius: 8px; cursor: pointer; font-family: ${font};
          box-shadow: 0 2px 12px rgba(37,99,235,0.35);
          transition: background-color 0.2s;
        }
        .al-btn:disabled { background-color: #1D4ED8; cursor: not-allowed; }
        .al-footer { margin-top: 24px; font-size: 11px; color: #334155; text-align: center; }
        @media (max-width: 480px) {
          .al-card { padding: 24px 18px; }
          .al-logo h1 { font-size: 22px; }
          .al-logo img { width: 48px; height: 48px; }
        }
        @media (max-width: 360px) {
          .al-card { padding: 20px 14px; border-radius: 12px; }
          .al-logo h1 { font-size: 20px; }
          .al-wrap { padding: 24px 12px; }
        }
      `}</style>
      <div className="al-wrap">
        <div className="al-logo">
          <img src={LOGO_B64} alt="EMFRONTIER LAB" />
          <h1>EMFRONTIER LAB</h1>
          <p>관리자 포털</p>
        </div>

        <div className="al-card">
          <h2>관리자 로그인</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="al-err">⚠️ {error}</div>}

            <div style={{ marginBottom: "16px" }}>
              <label className="al-lbl">관리자 ID</label>
              <input
                type="text" required autoComplete="username"
                placeholder="아이디 입력"
                value={username} onChange={e => setUsername(e.target.value)}
                className="al-inp"
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="al-lbl">비밀번호</label>
              <div className="al-pw-wrap">
                <input
                  type={showPw ? "text" : "password"} required autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  value={pw} onChange={e => setPw(e.target.value)}
                  className="al-inp" style={{ paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="al-pw-toggle">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="al-btn">
              {loading ? "인증 중..." : "로그인"}
            </button>
          </form>
        </div>

        <p className="al-footer">© 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved</p>
      </div>
    </>
  );
}
