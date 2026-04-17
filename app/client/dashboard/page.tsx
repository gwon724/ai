"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LOGO_B64,
  getCurrentUser, submitApplication, getRecommendedFunds,
  calcGrade, STATUS_LIST, STATUS_COLORS, FONT, UserRecord, FundProduct, Application,
} from "@/lib/store";

const font = FONT;
const GRADE_COLOR = (g: string) =>
  g === "A" ? "#16A34A" : g === "B" ? "#2563EB" : g === "C" ? "#D97706" : "#DC2626";

type SelectedFund = { id: string; name: string; maxAmount: number; chosenAmount: number };

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
  const [diagStep, setDiagStep] = useState<"analyzing" | "select">("analyzing");
  const [funds, setFunds] = useState<FundProduct[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<SelectedFund[]>([]);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const [submitDone, setSubmitDone] = useState(false);

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

  const logout = () => { localStorage.removeItem("isLoggedIn"); router.push("/client/login"); };

  const startDiag = async () => {
    setShowDiag(true); setDiagStep("analyzing"); setSelectedFunds([]); setSubmitDone(false);
    await new Promise(r => setTimeout(r, 2400));
    if (user) { setFunds(getRecommendedFunds(user)); setDiagStep("select"); }
  };

  const toggleFund = (f: FundProduct) => {
    const max = Number(f.maxAmount) || 0;
    setSelectedFunds(prev => {
      const exists = prev.find(s => s.id === f.id);
      if (exists) return prev.filter(s => s.id !== f.id);
      if (prev.length >= 3) return prev;
      return [...prev, { id: f.id, name: f.name, maxAmount: max, chosenAmount: max }];
    });
  };

  const updateAmount = (id: string, val: number) => {
    setSelectedFunds(prev => prev.map(s => s.id === id ? { ...s, chosenAmount: val } : s));
  };

  const handleSubmitApp = () => {
    if (!selectedFunds.length) { alert("최소 1개 이상 선택해주세요."); return; }
    if (!user) return;
    const labels = selectedFunds.map(s => `${s.name}(${s.chosenAmount.toLocaleString()}원)`);
    submitApplication(user.id, labels);
    setApp(getCurrentUser()?.application ?? null);
    setUser(getCurrentUser());
    setSubmitDone(true);
    setTimeout(() => { setShowDiag(false); setSelectedFunds([]); setSubmitDone(false); }, 2000);
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
    <>
      <style>{`
        * { box-sizing: border-box; }
        .cd-wrap { min-height: 100vh; background-color: #E8EDFB; font-family: ${font}; }
        .cd-header { background-color: #2563EB; padding: 10px 14px; }
        .cd-header-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .cd-header-left .name { font-size: 16px; font-weight: 800; color: #FFFFFF; white-space: nowrap; }
        .cd-header-left .welcome { font-size: 11px; color: #BFDBFE; margin-top: 2px; }
        .cd-header-right { display: flex; gap: 7px; align-items: center; flex-shrink: 0; }
        .cd-header-right button { padding: 7px 13px; font-size: 12px; font-weight: 700; border-radius: 7px; cursor: pointer; font-family: ${font}; white-space: nowrap; }
        .cd-main { max-width: 1100px; margin: 0 auto; padding: 14px 10px; }
        .cd-banner { background: linear-gradient(135deg,#2563EB 0%,#7C3AED 100%); border-radius: 12px; padding: 20px 16px; margin-bottom: 14px; text-align: center; color: #FFFFFF; }
        .cd-banner h2 { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
        .cd-banner p { font-size: 13px; color: #E0E7FF; margin-bottom: 14px; }
        .cd-banner button { padding: 10px 24px; background: #FFFFFF; color: #2563EB; font-size: 14px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; font-family: ${font}; }
        .cd-card { background: #FFFFFF; border-radius: 12px; box-shadow: 0 2px 10px rgba(99,120,200,0.10); padding: 16px; }
        .cd-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .cd-fund-detail { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 10px; }
        @media (max-width: 640px) {
          .cd-2col { grid-template-columns: 1fr; }
          .cd-fund-detail { grid-template-columns: repeat(2,1fr); }
          .cd-banner h2 { font-size: 17px; }
          .cd-banner p { font-size: 12px; }
          .cd-header-left .name { font-size: 14px; }
        }
        @media (max-width: 400px) {
          .cd-fund-detail { grid-template-columns: repeat(2,1fr); }
          .cd-header-right .qr-btn { display: none; }
          .cd-banner { padding: 16px 12px; }
        }
        .status-grid { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
        .status-item { flex: 1; min-width: 60px; text-align: center; padding: 8px 4px; border-radius: 8px; }
      `}</style>
      <div className="cd-wrap">
        {/* Header */}
        <div className="cd-header">
          <div className="cd-header-inner">
            <div className="cd-header-left">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={LOGO_B64} alt="EF" width={30} height={30} style={{ objectFit: "contain", filter: "invert(1)" }} />
                <p className="name">EMFRONTIER LAB</p>
              </div>
              <p className="welcome">{user.name}님 환영합니다</p>
            </div>
            <div className="cd-header-right">
              <button onClick={() => setShowQR(true)} className="qr-btn"
                style={{ backgroundColor: "#FFFFFF", color: "#2563EB" }}>
                📱 내 QR
              </button>
              <button onClick={logout}
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)" }}>
                로그아웃
              </button>
            </div>
          </div>
        </div>

        <div className="cd-main">

          {/* AI 진단 배너 */}
          {!app && (
            <div className="cd-banner">
              <h2>🤖 AI 정책자금 진단</h2>
              <p>AI가 회원님의 정보를 분석하여 최적의 정책자금을 추천해드립니다</p>
              <button onClick={startDiag}>AI 진단 시작하기</button>
            </div>
          )}

          {/* 신청 진행 상황 */}
          {app && (
            <div className="cd-card" style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B" }}>📊 신청 진행 상황</p>
                <button onClick={startDiag} style={{ padding: "7px 14px", backgroundColor: "#EAF2FF", color: "#2563EB", fontSize: "12px", fontWeight: "700", border: "1.5px solid #BFDBFE", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>🔄 재진단</button>
              </div>
              <div className="status-grid">
                {STATUS_LIST.map(s => {
                  const active = app.status === s;
                  const c = STATUS_COLORS[s];
                  return (
                    <div key={s} className="status-item"
                      style={{ border: `2px solid ${active ? c.border : "#E5E7EB"}`, backgroundColor: active ? c.bg : "#F9FAFB", transform: active ? "scale(1.04)" : "none" }}>
                      <p style={{ fontSize: "12px", fontWeight: active ? "700" : "500", color: active ? c.text : "#9CA3AF" }}>{s}</p>
                      {active && <p style={{ fontSize: "14px", marginTop: "3px" }}>✓</p>}
                    </div>
                  );
                })}
              </div>
              <div style={{ backgroundColor: "#EAF2FF", borderRadius: "8px", padding: "10px 14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1D4ED8" }}>현재: <strong>{app.status}</strong> · {app.date}</p>
                <p style={{ fontSize: "12px", color: "#3B82F6", marginTop: "3px" }}>{app.funds.join(" / ")}</p>
              </div>
            </div>
          )}

          {/* SOHO 등급 + 내 정보 */}
          <div className="cd-2col">
            <div className="cd-card">
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B", marginBottom: "14px" }}>🏆 SOHO 등급</p>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "60px", fontWeight: "800", color: gradeColor, lineHeight: "1" }}>{grade}</p>
                <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>종합 점수 {score}점</p>
                <div style={{ backgroundColor: "#F3F4F6", borderRadius: "999px", height: "8px", margin: "12px 0", overflow: "hidden" }}>
                  <div style={{ height: "8px", borderRadius: "999px", backgroundColor: gradeColor, width: `${Math.min(score, 100)}%` }} />
                </div>
                <div style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap" }}>
                  {["A", "B", "C", "D"].map(g => (
                    <div key={g} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", backgroundColor: grade === g ? "#EAF2FF" : "#F3F4F6", color: grade === g ? "#2563EB" : "#9CA3AF", border: grade === g ? "1.5px solid #93C5FD" : "1.5px solid #E5E7EB" }}>{g}등급</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cd-card">
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B", marginBottom: "14px" }}>👤 내 정보 요약</p>
              {[
                ["이름", user.name], ["이메일", user.email],
                ["나이 / 성별", `${user.age}세 / ${user.gender}`],
                ["NICE 신용점수", `${user.nice_score}점`],
                ["KCB 신용점수", `${user.kcb_score}점`],
                ["연매출액", `${Number(user.annual_revenue).toLocaleString()}원`],
                ["총 기대출", `${totalDebt.toLocaleString()}원`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>{k}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#1E293B" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 자금 목록 */}
          <div className="cd-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#1E293B" }}>💰 AI 추천 정책자금</p>
              <span style={{ fontSize: "12px", color: "#6B7280", backgroundColor: "#F3F4F6", padding: "4px 10px", borderRadius: "999px" }}>
                <strong style={{ color: gradeColor }}>{grade}등급</strong> 기준 {recommendedFunds.length}개
              </span>
            </div>
            {recommendedFunds.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: "#9CA3AF" }}>
                <p style={{ fontSize: "32px", marginBottom: "10px" }}>📭</p>
                <p style={{ fontSize: "14px" }}>현재 조건에 맞는 추천 자금이 없습니다.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recommendedFunds.map(f => {
                  const isExp = expandedFund === f.id;
                  return (
                    <div key={f.id} style={{ border: "1.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", backgroundColor: isExp ? "#EAF2FF" : "#F9FAFB", flexWrap: "wrap" }}
                        onClick={() => setExpandedFund(isExp ? null : f.id)}>
                        <span style={{ fontSize: "18px" }}>💼</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B" }}>{f.name}</p>
                          <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                            {f.institution} · 최대 <strong>{Number(f.maxAmount).toLocaleString()}원</strong> · {f.interestRate}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px", color: "#2563EB", backgroundColor: "#DBEAFE", padding: "3px 7px", borderRadius: "5px", fontWeight: "600" }}>{f.period}</span>
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{isExp ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isExp && (
                        <div style={{ padding: "12px 14px", backgroundColor: "#FFFFFF", borderTop: "1px solid #E5E7EB" }}>
                          <div className="cd-fund-detail">
                            {[
                              { label: "최대 한도", value: `${Number(f.maxAmount).toLocaleString()}원` },
                              { label: "금리", value: f.interestRate },
                              { label: "기간", value: f.period },
                              { label: "최소 연매출", value: Number(f.minRevenue) > 0 ? `${Number(f.minRevenue).toLocaleString()}원↑` : "제한 없음" },
                              { label: "최대 기대출", value: Number(f.maxDebt) > 0 ? `${Number(f.maxDebt).toLocaleString()}원↓` : "제한 없음" },
                              { label: "최소 신용점수", value: Number(f.minCreditScore) > 0 ? `${f.minCreditScore}점↑` : "제한 없음" },
                            ].map(item => (
                              <div key={item.label} style={{ backgroundColor: "#F9FAFB", borderRadius: "8px", padding: "9px 11px" }}>
                                <p style={{ fontSize: "10px", color: "#9CA3AF", marginBottom: "3px" }}>{item.label}</p>
                                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1E293B" }}>{item.value}</p>
                              </div>
                            ))}
                          </div>
                          {f.description && (
                            <div style={{ backgroundColor: "#EAF2FF", borderRadius: "8px", padding: "10px 12px" }}>
                              <p style={{ fontSize: "12px", color: "#1D4ED8", lineHeight: "1.7" }}>{f.description}</p>
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

        {/* QR Modal */}
        {showQR && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px 24px", maxWidth: "320px", width: "100%", textAlign: "center" }}>
              <p style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "6px" }}>📱 내 QR 코드</p>
              <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>이 QR 코드를 관리자에게 보여주세요</p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent("EMFRONTIER:" + user.email)}`} alt="QR" style={{ borderRadius: "8px", border: "1px solid #E5E7EB", marginBottom: "12px", maxWidth: "100%" }} />
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "16px" }}>{user.email}</p>
              <button onClick={() => setShowQR(false)} style={{ width: "100%", padding: "11px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>닫기</button>
            </div>
          </div>
        )}

        {/* AI 진단 Modal */}
        {showDiag && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "12px" }}>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", width: "100%", maxWidth: "600px", boxShadow: "0 12px 48px rgba(0,0,0,0.22)", maxHeight: "94vh", overflowY: "auto" }}>

              {/* 분석 중 */}
              {diagStep === "analyzing" && (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: "52px", marginBottom: "18px" }}>🤖</div>
                  <p style={{ fontSize: "18px", fontWeight: "800", color: "#1E293B", marginBottom: "10px" }}>AI 분석 중...</p>
                  <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.8" }}>
                    신용점수 · 연매출 · 부채 정보를 분석하고 있습니다<br />
                    <span style={{ color: gradeColor, fontWeight: "700" }}>SOHO {grade}등급</span> 기준 맞춤 자금을 찾는 중...
                  </p>
                  <div style={{ backgroundColor: "#F3F4F6", borderRadius: "999px", height: "6px", margin: "20px auto", maxWidth: "300px", overflow: "hidden" }}>
                    <div style={{ width: "65%", height: "6px", borderRadius: "999px", backgroundColor: "#2563EB" }} />
                  </div>
                </div>
              )}

              {/* 자금 선택 */}
              {diagStep === "select" && !submitDone && (
                <div style={{ padding: "24px 20px 20px" }}>
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "20px" }}>🎯</span>
                      <p style={{ fontSize: "17px", fontWeight: "800", color: "#1E293B" }}>맞춤 정책자금 추천 결과</p>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.6" }}>
                      <span style={{ color: gradeColor, fontWeight: "700" }}>SOHO {grade}등급</span> 기준 <strong>{funds.length}개</strong> 추천.
                      <br /><strong style={{ color: "#2563EB" }}>최대 3개</strong>까지 선택하고 한도를 조절하세요.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", padding: "10px 12px", backgroundColor: selectedFunds.length === 3 ? "#FEF9C3" : "#EAF2FF", borderRadius: "8px", border: `1px solid ${selectedFunds.length === 3 ? "#FDE68A" : "#BFDBFE"}` }}>
                    <span style={{ fontSize: "16px" }}>{selectedFunds.length === 3 ? "⚠️" : "✅"}</span>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: selectedFunds.length === 3 ? "#92400E" : "#1D4ED8" }}>
                      {selectedFunds.length === 0 && "아직 선택된 자금이 없습니다"}
                      {selectedFunds.length > 0 && selectedFunds.length < 3 && `${selectedFunds.length}개 선택됨 · ${3 - selectedFunds.length}개 더 가능`}
                      {selectedFunds.length === 3 && "3개 선택 완료"}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                    {funds.map(f => {
                      const sel = selectedFunds.find(s => s.id === f.id);
                      const maxAmt = Number(f.maxAmount) || 0;
                      const disabled = !sel && selectedFunds.length >= 3;
                      return (
                        <div key={f.id} style={{ border: `2px solid ${sel ? "#2563EB" : disabled ? "#F3F4F6" : "#E5E7EB"}`, borderRadius: "12px", backgroundColor: sel ? "#EAF2FF" : disabled ? "#FAFAFA" : "#FFFFFF", overflow: "hidden", opacity: disabled ? 0.5 : 1 }}>
                          <div onClick={() => !disabled && toggleFund(f)}
                            style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: "10px", cursor: disabled ? "not-allowed" : "pointer" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0, marginTop: "2px", backgroundColor: sel ? "#2563EB" : "#FFFFFF", border: `2px solid ${sel ? "#2563EB" : "#D1D5DB"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {sel && <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: "900" }}>✓</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <p style={{ fontSize: "14px", fontWeight: "700", color: sel ? "#1D4ED8" : "#1E293B" }}>{f.name}</p>
                                <span style={{ fontSize: "10px", backgroundColor: "#F3F4F6", color: "#6B7280", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>{f.category}</span>
                              </div>
                              <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{f.institution} · {f.interestRate} · {f.period}</p>
                              <p style={{ fontSize: "12px", color: "#2563EB", fontWeight: "600", marginTop: "2px" }}>최대: {maxAmt.toLocaleString()}원</p>
                            </div>
                          </div>

                          {sel && (
                            <div style={{ padding: "0 14px 14px", borderTop: "1px dashed #BFDBFE" }}>
                              <div style={{ paddingTop: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>💰 신청 한도</p>
                                  <p style={{ fontSize: "14px", fontWeight: "800", color: "#2563EB" }}>{sel.chosenAmount.toLocaleString()}원</p>
                                </div>
                                <input type="range" min={Math.round(maxAmt * 0.1)} max={maxAmt} step={Math.max(1000000, Math.round(maxAmt / 100))} value={sel.chosenAmount}
                                  onChange={e => updateAmount(f.id, Number(e.target.value))}
                                  style={{ width: "100%", accentColor: "#2563EB", cursor: "pointer", height: "6px" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{Math.round(maxAmt * 0.1).toLocaleString()}원</span>
                                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{maxAmt.toLocaleString()}원</span>
                                </div>
                                <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
                                  {[0.3, 0.5, 0.7, 1.0].map(ratio => {
                                    const val = Math.round(maxAmt * ratio);
                                    const active = sel.chosenAmount === val;
                                    return (
                                      <button key={ratio} onClick={e => { e.stopPropagation(); updateAmount(f.id, val); }}
                                        style={{ flex: 1, padding: "5px 0", fontSize: "11px", fontWeight: "600", border: `1.5px solid ${active ? "#2563EB" : "#E5E7EB"}`, borderRadius: "6px", backgroundColor: active ? "#2563EB" : "#FFFFFF", color: active ? "#FFFFFF" : "#6B7280", cursor: "pointer", fontFamily: font }}>
                                        {ratio === 1.0 ? "최대" : `${ratio * 100}%`}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {selectedFunds.length > 0 && (
                    <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
                      <p style={{ fontSize: "12px", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>📋 신청 내역</p>
                      {selectedFunds.map((s, i) => (
                        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < selectedFunds.length - 1 ? "1px solid #BBF7D0" : "none" }}>
                          <p style={{ fontSize: "12px", color: "#166534" }}>{i + 1}. {s.name}</p>
                          <p style={{ fontSize: "12px", fontWeight: "700", color: "#15803D" }}>{s.chosenAmount.toLocaleString()}원</p>
                        </div>
                      ))}
                      <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #86EFAC", display: "flex", justifyContent: "space-between" }}>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>합계</p>
                        <p style={{ fontSize: "13px", fontWeight: "800", color: "#15803D" }}>{selectedFunds.reduce((s, f) => s + f.chosenAmount, 0).toLocaleString()}원</p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => { setShowDiag(false); setSelectedFunds([]); }}
                      style={{ flex: 1, padding: "12px", backgroundColor: "#F9FAFB", color: "#6B7280", fontSize: "14px", fontWeight: "600", border: "1.5px solid #E5E7EB", borderRadius: "9px", cursor: "pointer", fontFamily: font }}>취소</button>
                    <button onClick={handleSubmitApp} disabled={!selectedFunds.length}
                      style={{ flex: 2, padding: "12px", backgroundColor: selectedFunds.length ? "#2563EB" : "#93C5FD", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "9px", cursor: selectedFunds.length ? "pointer" : "not-allowed", fontFamily: font }}>
                      ✅ 신청 ({selectedFunds.length}개 · {selectedFunds.reduce((s, f) => s + f.chosenAmount, 0).toLocaleString()}원)
                    </button>
                  </div>
                </div>
              )}

              {submitDone && (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: "#1E293B", marginBottom: "8px" }}>신청 완료!</p>
                  <p style={{ fontSize: "14px", color: "#6B7280" }}>정책자금 신청이 접수되었습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "11px", color: "#9CA3AF", padding: "20px 0" }}>
          Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
        </p>
      </div>
    </>
  );
}
