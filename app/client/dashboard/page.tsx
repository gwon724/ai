"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getCurrentUser, submitApplication, getRecommendedFunds,
  calcGrade, STATUS_LIST, STATUS_COLORS, FONT, UserRecord, Application, FundProduct,
} from "@/lib/store";

const font = FONT;
const GRADE_COLOR = (g: string) =>
  g === "A" ? "#16A34A" : g === "B" ? "#2563EB" : g === "C" ? "#D97706" : "#DC2626";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
  const [diagStep, setDiagStep] = useState<"analyzing" | "select">("analyzing");
  const [funds, setFunds] = useState<FundProduct[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/client/login"); return; }
    setUser(u);
    setApp(u.application ?? null);
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) { router.push("/client/login"); return; }
    refresh();
    setLoading(false);
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [router, refresh]);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/client/login");
  };

  const startDiag = async () => {
    setShowDiag(true);
    setDiagStep("analyzing");
    await new Promise(r => setTimeout(r, 2200));
    if (user) { setFunds(getRecommendedFunds(user)); setDiagStep("select"); }
  };

  const handleSubmitApp = () => {
    if (!selected.length) { alert("최소 1개 이상 선택해주세요."); return; }
    if (!user) return;
    const newApp = submitApplication(user.id, selected);
    setApp(newApp);
    setUser(getCurrentUser());
    setShowDiag(false);
    setSelected([]);
    alert("정책자금 신청이 완료되었습니다!");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#E8EDFB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
      <p style={{ fontSize: "16px", color: "#6B7280" }}>로딩 중...</p>
    </div>
  );
  if (!user) return null;

  const { grade, score } = calcGrade(user);
  const gradeColor = GRADE_COLOR(grade);
  const totalDebt = (Number(user.debt_policy) || 0) + (Number(user.debt_bank1) || 0) + (Number(user.debt_bank2) || 0) + (Number(user.debt_card) || 0);
  const recommendedFunds = getRecommendedFunds(user);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#E8EDFB", fontFamily: font }}>
      {/* 헤더 */}
      <div style={{ backgroundColor: "#2563EB", padding: "14px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Image src="/logo.png" alt="EMFRONTIER LAB" width={32} height={32} style={{ objectFit: "contain", filter: "invert(1)" }} /><p style={{ fontSize: "18px", fontWeight: "800", color: "#FFFFFF" }}>EMFRONTIER LAB</p></div>
            <p style={{ fontSize: "12px", color: "#BFDBFE", marginTop: "2px" }}>{user.name}님 환영합니다</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setShowQR(true)} style={{ padding: "8px 16px", backgroundColor: "#FFFFFF", color: "#2563EB", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>📱 내 QR 코드</button>
            <button onClick={logout} style={{ padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>로그아웃</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>
        {/* AI 진단 배너 */}
        {!app && (
          <div style={{ background: "linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)", borderRadius: "14px", padding: "28px 32px", marginBottom: "20px", textAlign: "center", color: "#FFFFFF" }}>
            <p style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", fontFamily: font }}>🤖 AI 정책자금 진단</p>
            <p style={{ fontSize: "14px", color: "#E0E7FF", marginBottom: "20px", fontFamily: font }}>AI가 회원님의 정보를 분석하여 최적의 정책자금을 추천해드립니다</p>
            <button onClick={startDiag} style={{ padding: "12px 36px", backgroundColor: "#FFFFFF", color: "#2563EB", fontSize: "15px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>AI 진단 시작하기</button>
          </div>
        )}

        {/* 신청 진행 상황 */}
        {app && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 2px 12px rgba(99,120,200,0.10)", padding: "24px", marginBottom: "20px" }}>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "16px", fontFamily: font }}>📊 신청 진행 상황</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {STATUS_LIST.map(s => {
                const active = app.status === s;
                const c = STATUS_COLORS[s];
                return (
                  <div key={s} style={{ flex: "1", minWidth: "80px", textAlign: "center", padding: "12px 8px", borderRadius: "8px", border: `2px solid ${active ? c.border : "#E5E7EB"}`, backgroundColor: active ? c.bg : "#F9FAFB", transform: active ? "scale(1.04)" : "none", transition: "all 0.2s" }}>
                    <p style={{ fontSize: "12px", fontWeight: active ? "700" : "500", color: active ? c.text : "#9CA3AF", fontFamily: font }}>{s}</p>
                    {active && <p style={{ fontSize: "16px", marginTop: "4px" }}>✓</p>}
                  </div>
                );
              })}
            </div>
            <div style={{ backgroundColor: "#EAF2FF", borderRadius: "8px", padding: "12px 16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#1D4ED8", fontFamily: font }}>현재 상태: <strong>{app.status}</strong> · 신청일: {app.date}</p>
              <p style={{ fontSize: "12px", color: "#3B82F6", marginTop: "4px", fontFamily: font }}>선택 자금: {app.funds.join(" / ")}</p>
              {app.updatedAt && <p style={{ fontSize: "11px", color: "#93C5FD", marginTop: "2px", fontFamily: font }}>최종 업데이트: {app.updatedAt}</p>}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* SOHO 등급 */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 2px 12px rgba(99,120,200,0.10)", padding: "24px" }}>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B", marginBottom: "16px", fontFamily: font }}>🏆 SOHO 등급</p>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "64px", fontWeight: "800", color: gradeColor, lineHeight: "1" }}>{grade}</p>
              <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px", fontFamily: font }}>종합 점수 {score}점</p>
              <div style={{ backgroundColor: "#F3F4F6", borderRadius: "999px", height: "8px", margin: "12px 0", overflow: "hidden" }}>
                <div style={{ height: "8px", borderRadius: "999px", backgroundColor: gradeColor, width: `${Math.min(score, 100)}%`, transition: "width 0.5s" }} />
              </div>
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                {["A", "B", "C", "D"].map(g => (
                  <div key={g} style={{ padding: "5px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", backgroundColor: grade === g ? "#EAF2FF" : "#F3F4F6", color: grade === g ? "#2563EB" : "#9CA3AF", border: grade === g ? "1.5px solid #93C5FD" : "1.5px solid #E5E7EB", fontFamily: font }}>{g}등급</div>
                ))}
              </div>
            </div>
          </div>

          {/* 내 정보 요약 */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 2px 12px rgba(99,120,200,0.10)", padding: "24px" }}>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B", marginBottom: "16px", fontFamily: font }}>👤 내 정보 요약</p>
            {[
              ["이름", user.name], ["이메일", user.email],
              ["나이 / 성별", `${user.age}세 / ${user.gender}`],
              ["NICE 신용점수", `${user.nice_score}점`], ["KCB 신용점수", `${user.kcb_score}점`],
              ["연매출액", `${Number(user.annual_revenue).toLocaleString()}원`],
              ["총 기대출", `${totalDebt.toLocaleString()}원`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: "12px", color: "#6B7280", fontFamily: font }}>{k}</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#1E293B", fontFamily: font }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 정책자금 - 상세 카드 */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 2px 12px rgba(99,120,200,0.10)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B", fontFamily: font }}>💰 AI 추천 정책자금</p>
            <span style={{ fontSize: "12px", color: "#6B7280", backgroundColor: "#F3F4F6", padding: "4px 10px", borderRadius: "999px", fontFamily: font }}>
              SOHO <strong style={{ color: gradeColor }}>{grade}등급</strong> 기준 {recommendedFunds.length}개 추천
            </span>
          </div>

          {recommendedFunds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>📭</p>
              <p style={{ fontSize: "14px", fontFamily: font }}>현재 조건에 맞는 추천 자금이 없습니다.</p>
              <p style={{ fontSize: "12px", marginTop: "4px", fontFamily: font }}>관리자에게 문의해주세요.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recommendedFunds.map((f) => {
                const isExp = expandedFund === f.id;
                return (
                  <div key={f.id} style={{ border: "1.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", transition: "border-color 0.2s" }}>
                    {/* 헤더 */}
                    <div
                      style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", backgroundColor: isExp ? "#EAF2FF" : "#F9FAFB" }}
                      onClick={() => setExpandedFund(isExp ? null : f.id)}
                    >
                      <span style={{ fontSize: "20px" }}>💼</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B", fontFamily: font }}>{f.name}</p>
                        <p style={{ fontSize: "12px", color: "#6B7280", fontFamily: font, marginTop: "2px" }}>
                          {f.institution} · {f.category} · 최대 <strong>{Number(f.maxAmount).toLocaleString()}원</strong> · 금리 <strong>{f.interestRate}</strong>
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#2563EB", backgroundColor: "#DBEAFE", padding: "3px 8px", borderRadius: "5px", fontWeight: "600", fontFamily: font }}>
                          기간 {f.period}
                        </span>
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{isExp ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {/* 상세 */}
                    {isExp && (
                      <div style={{ padding: "14px 16px", backgroundColor: "#FFFFFF", borderTop: "1px solid #E5E7EB" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                          {[
                            { label: "최대 지원 한도", value: `${Number(f.maxAmount).toLocaleString()}원` },
                            { label: "금리", value: f.interestRate },
                            { label: "대출 기간", value: f.period },
                            {
                              label: "최소 연매출 조건",
                              value: Number(f.minRevenue) > 0 ? `${Number(f.minRevenue).toLocaleString()}원 이상` : "제한 없음"
                            },
                            {
                              label: "최대 기대출 조건",
                              value: Number(f.maxDebt) > 0 ? `${Number(f.maxDebt).toLocaleString()}원 이하` : "제한 없음"
                            },
                            {
                              label: "최소 신용점수(NICE)",
                              value: Number(f.minCreditScore) > 0 ? `${f.minCreditScore}점 이상` : "제한 없음"
                            },
                          ].map(item => (
                            <div key={item.label} style={{ backgroundColor: "#F9FAFB", borderRadius: "8px", padding: "10px 12px" }}>
                              <p style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: font, marginBottom: "3px" }}>{item.label}</p>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#1E293B", fontFamily: font }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        {f.description && (
                          <div style={{ backgroundColor: "#EAF2FF", borderRadius: "8px", padding: "10px 14px" }}>
                            <p style={{ fontSize: "12px", color: "#1D4ED8", fontFamily: font, lineHeight: "1.7" }}>{f.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QR 모달 */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "32px 28px", maxWidth: "320px", width: "90%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "6px", fontFamily: font }}>📱 내 QR 코드</p>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "16px", fontFamily: font }}>이 QR 코드를 관리자에게 보여주세요</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent("EMFRONTIER:" + user.email)}`} alt="QR" style={{ borderRadius: "8px", border: "1px solid #E5E7EB", marginBottom: "12px" }} />
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "20px", fontFamily: font }}>{user.email}</p>
            <button onClick={() => setShowQR(false)} style={{ width: "100%", padding: "11px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>닫기</button>
          </div>
        </div>
      )}

      {/* AI 진단 모달 */}
      {showDiag && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "32px 28px", maxWidth: "520px", width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
            {diagStep === "analyzing" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: "44px", marginBottom: "16px" }}>🤖</p>
                <p style={{ fontSize: "17px", fontWeight: "700", color: "#1E293B", marginBottom: "8px", fontFamily: font }}>AI 분석 중...</p>
                <p style={{ fontSize: "13px", color: "#6B7280", fontFamily: font }}>신용점수, 매출, 부채 정보를 분석하고 있습니다</p>
                <div style={{ backgroundColor: "#F3F4F6", borderRadius: "999px", height: "6px", margin: "20px 0", overflow: "hidden" }}>
                  <div style={{ width: "70%", height: "6px", borderRadius: "999px", backgroundColor: "#2563EB", animation: "none" }} />
                </div>
                <p style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: font }}>SOHO {grade}등급 기준 자금 목록 조회 중...</p>
              </div>
            )}
            {diagStep === "select" && (
              <div>
                <p style={{ fontSize: "17px", fontWeight: "700", color: "#1E293B", marginBottom: "6px", fontFamily: font }}>🎯 맞춤 정책자금 추천</p>
                <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", fontFamily: font }}>
                  SOHO <strong style={{ color: gradeColor }}>{grade}등급</strong> 기준 {funds.length}개 추천 · 신청할 항목을 선택해주세요.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  {funds.map((f) => {
                    const sel = selected.includes(f.name);
                    return (
                      <div key={f.id}>
                        <label style={{
                          display: "flex", alignItems: "flex-start", gap: "10px",
                          padding: "12px 14px", borderRadius: "8px", cursor: "pointer",
                          border: sel ? "2px solid #2563EB" : "2px solid #E5E7EB",
                          backgroundColor: sel ? "#EAF2FF" : "#F9FAFB",
                        }}>
                          <input type="checkbox" checked={sel}
                            onChange={() => setSelected(p => p.includes(f.name) ? p.filter(x => x !== f.name) : [...p, f.name])}
                            style={{ width: "16px", height: "16px", accentColor: "#2563EB", marginTop: "2px", flexShrink: 0 }}
                          />
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B", fontFamily: font }}>{f.name}</p>
                            <p style={{ fontSize: "11px", color: "#6B7280", fontFamily: font, marginTop: "2px" }}>
                              {f.institution} · 최대 {Number(f.maxAmount).toLocaleString()}원 · 금리 {f.interestRate} · {f.period}
                            </p>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setShowDiag(false); setSelected([]); }} style={{ flex: 1, padding: "11px", backgroundColor: "#F9FAFB", color: "#6B7280", fontSize: "14px", fontWeight: "600", border: "1.5px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>취소</button>
                  <button onClick={handleSubmitApp} style={{ flex: 2, padding: "11px", backgroundColor: selected.length ? "#2563EB" : "#93C5FD", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: selected.length ? "pointer" : "not-allowed", fontFamily: font }}>
                    신청하기 ({selected.length}개 선택)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: "11px", color: "#9CA3AF", padding: "24px 0", fontFamily: font }}>
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </p>
    </div>
  );
}
