"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginAdmin, FONT } from "@/lib/store";

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

    // 기본 슈퍼관리자 하드코딩 fallback (localStorage 초기화 전에도 동작)
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

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontSize: "14px",
    border: "1.5px solid #334155", borderRadius: "8px",
    backgroundColor: "#0F172A", color: "#F1F5F9",
    outline: "none", fontFamily: font, boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0F172A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 16px", fontFamily: font,
    }}>
      {/* 로고 */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "56px", height: "56px", backgroundColor: "#2563EB",
          borderRadius: "16px", marginBottom: "16px",
          boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
        }}>
          <span style={{ fontSize: "26px" }}>🛡️</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#F8FAFC", marginBottom: "4px" }}>
          <Image src="/logo.png" alt="EMFRONTIER LAB" width={56} height={56} style={{ objectFit: "contain", filter: "invert(1)", display: "block", margin: "0 auto 8px" }} />
          EMFRONTIER LAB
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", fontFamily: font }}>관리자 포털</p>
      </div>

      {/* 카드 */}
      <div style={{
        backgroundColor: "#1E293B", borderRadius: "16px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
        padding: "32px 28px", width: "100%", maxWidth: "400px",
        border: "1px solid #334155",
      }}>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#F1F5F9", marginBottom: "24px", fontFamily: font }}>
          관리자 로그인
        </h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: "#450A0A", border: "1px solid #7F1D1D",
              borderRadius: "8px", padding: "10px 14px",
              marginBottom: "16px", fontSize: "13px",
              color: "#FCA5A5", fontFamily: font,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94A3B8", marginBottom: "8px", fontFamily: font }}>
              관리자 ID
            </label>
            <input
              type="text" required autoComplete="username"
              placeholder="아이디 입력"
              value={username} onChange={e => setUsername(e.target.value)}
              style={inp}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94A3B8", marginBottom: "8px", fontFamily: font }}>
              비밀번호
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"} required autoComplete="current-password"
                placeholder="비밀번호 입력"
                value={pw} onChange={e => setPw(e.target.value)}
                style={{ ...inp, paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "16px", color: "#64748B", padding: "0",
                }}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "13px",
              backgroundColor: loading ? "#1D4ED8" : "#2563EB",
              color: "#FFFFFF", fontSize: "15px", fontWeight: "700",
              border: "none", borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: font,
              boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
            }}
          >
            {loading ? "인증 중..." : "로그인"}
          </button>
        </form>

        {/* 초기 계정 안내 */}
        <div style={{
          marginTop: "20px", padding: "12px 14px",
          backgroundColor: "#0F172A", borderRadius: "8px",
          border: "1px solid #1E3A5F",
        }}>
          <p style={{ fontSize: "11px", color: "#475569", fontFamily: font, marginBottom: "4px" }}>
            🔑 초기 관리자 계정
          </p>
          <p style={{ fontSize: "12px", color: "#64748B", fontFamily: font }}>
            ID: <span style={{ color: "#93C5FD" }}>admin</span>
            &nbsp;&nbsp;PW: <span style={{ color: "#93C5FD" }}>emfrontier2026!</span>
          </p>
        </div>
      </div>

      <p style={{ marginTop: "24px", fontSize: "11px", color: "#334155", fontFamily: font }}>
        © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </p>
    </div>
  );
}
