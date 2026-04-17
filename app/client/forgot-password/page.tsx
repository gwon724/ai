"use client";
import { useState } from "react";
import Link from "next/link";
import { LOGO_B64 } from "@/lib/store";

const font = "'Noto Sans KR', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  fontSize: "14px",
  border: "1.5px solid #D1D5DB",
  borderRadius: "8px",
  backgroundColor: "#F9FAFB",
  color: "#1F2937",
  outline: "none",
  fontFamily: font,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "6px",
  fontFamily: font,
};

type Step = "email" | "verify" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: 이메일 + 이름으로 본인 확인
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const raw = localStorage.getItem("userData");
    if (!raw) {
      setError("가입된 계정 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }
    const user = JSON.parse(raw);
    if (user.email !== email || user.name !== name) {
      setError("이메일 또는 이름이 일치하지 않습니다.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep("reset");
  };

  // Step 2: 새 비밀번호 설정
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const raw = localStorage.getItem("userData");
    if (raw) {
      const user = JSON.parse(raw);
      user.password = newPassword;
      localStorage.setItem("userData", JSON.stringify(user));
    }
    setLoading(false);
    setStep("done");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#E8EDFB",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
      fontFamily: font,
    }}>
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: "800", color: "#1E293B", marginBottom: "6px" }}>
          <img src={LOGO_B64} alt="EMFRONTIER LAB" width={56} height={56} style={{ objectFit: "contain", display: "block", margin: "0 auto 8px" }} />
          EMFRONTIER LAB
        </h1>
        <p style={{ fontSize: "15px", fontWeight: "600", color: "#3B82F6", marginBottom: "4px" }}>
          비밀번호 찾기
        </p>
        <p style={{ fontSize: "13px", color: "#6B7280" }}>
          가입 시 등록한 정보로 본인 확인 후 비밀번호를 재설정합니다
        </p>
      </div>

      {/* 단계 표시 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0px",
        marginBottom: "24px",
      }}>
        {[
          { label: "본인 확인", key: "email" },
          { label: "비밀번호 재설정", key: "reset" },
          { label: "완료", key: "done" },
        ].map((s, i) => {
          const steps: Step[] = ["email", "reset", "done"];
          const currentIdx = steps.indexOf(step);
          const isActive = steps.indexOf(s.key as Step) === currentIdx;
          const isDone = steps.indexOf(s.key as Step) < currentIdx;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  backgroundColor: isDone ? "#2563EB" : isActive ? "#2563EB" : "#D1D5DB",
                  color: "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700", fontFamily: font,
                  boxShadow: isActive ? "0 0 0 3px rgba(37,99,235,0.2)" : "none",
                }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: "11px", marginTop: "4px", fontFamily: font,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#2563EB" : isDone ? "#2563EB" : "#9CA3AF",
                }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  width: "60px", height: "2px", marginBottom: "18px",
                  backgroundColor: isDone ? "#2563EB" : "#E5E7EB",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 카드 */}
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(99,120,200,0.12)",
        padding: "32px 28px",
        width: "100%",
        maxWidth: "400px",
      }}>

        {/* ── Step 1: 본인 확인 ── */}
        {step === "email" && (
          <form onSubmit={handleVerify}>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "6px", fontFamily: font }}>
              본인 확인
            </p>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "20px", fontFamily: font }}>
              가입 시 등록한 이메일과 이름을 입력해주세요.
            </p>

            {error && (
              <div style={{
                backgroundColor: "#FEE2E2", border: "1px solid #FECACA",
                borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
                fontSize: "13px", color: "#DC2626", fontFamily: font,
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>가입 이메일 <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                type="email" required placeholder="example@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>이름 <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                type="text" required placeholder="홍길동"
                value={name} onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "12px",
              backgroundColor: loading ? "#93C5FD" : "#2563EB",
              color: "#FFFFFF", fontSize: "14px", fontWeight: "700",
              border: "none", borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: font,
              boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
            }}>
              {loading ? "확인 중..." : "본인 확인"}
            </button>
          </form>
        )}

        {/* ── Step 2: 비밀번호 재설정 ── */}
        {step === "reset" && (
          <form onSubmit={handleReset}>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "6px", fontFamily: font }}>
              새 비밀번호 설정
            </p>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "20px", fontFamily: font }}>
              <span style={{ fontWeight: "600", color: "#2563EB" }}>{email}</span> 계정의 새 비밀번호를 입력해주세요.
            </p>

            {error && (
              <div style={{
                backgroundColor: "#FEE2E2", border: "1px solid #FECACA",
                borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
                fontSize: "13px", color: "#DC2626", fontFamily: font,
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>새 비밀번호 <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                type="password" required placeholder="새 비밀번호 (8자 이상)"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px", fontFamily: font }}>
                영문·숫자·특수문자 포함 8자 이상
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>새 비밀번호 확인 <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                type="password" required placeholder="비밀번호 재입력"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={{
                  ...inputStyle,
                  border: confirmPassword
                    ? newPassword === confirmPassword
                      ? "1.5px solid #22C55E"
                      : "1.5px solid #EF4444"
                    : "1.5px solid #D1D5DB",
                }}
              />
              {confirmPassword && (
                <p style={{
                  fontSize: "11px", marginTop: "4px", fontFamily: font,
                  color: newPassword === confirmPassword ? "#16A34A" : "#DC2626",
                }}>
                  {newPassword === confirmPassword ? "✓ 비밀번호가 일치합니다" : "✗ 비밀번호가 일치하지 않습니다"}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "12px",
              backgroundColor: loading ? "#93C5FD" : "#2563EB",
              color: "#FFFFFF", fontSize: "14px", fontWeight: "700",
              border: "none", borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: font,
              boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
            }}>
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}

        {/* ── Step 3: 완료 ── */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              backgroundColor: "#DCFCE7", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "30px",
            }}>
              ✅
            </div>
            <p style={{ fontSize: "17px", fontWeight: "700", color: "#1E293B", marginBottom: "8px", fontFamily: font }}>
              비밀번호가 변경되었습니다
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "24px", fontFamily: font }}>
              새 비밀번호로 로그인해주세요.
            </p>
            <Link href="/client/login" style={{
              display: "block", width: "100%", padding: "12px",
              backgroundColor: "#2563EB", color: "#FFFFFF",
              fontSize: "14px", fontWeight: "700", borderRadius: "8px",
              textDecoration: "none", textAlign: "center", fontFamily: font,
              boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
            }}>
              로그인하러 가기
            </Link>
          </div>
        )}

        {/* 하단 링크 */}
        {step !== "done" && (
          <div style={{ textAlign: "center", marginTop: "18px" }}>
            <Link href="/client/login" style={{
              fontSize: "13px", color: "#6B7280", textDecoration: "none", fontFamily: font,
            }}>
              ← 로그인으로 돌아가기
            </Link>
          </div>
        )}
      </div>

      <p style={{ marginTop: "36px", fontSize: "11px", color: "#9CA3AF" }}>
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </p>
    </div>
  );
}
