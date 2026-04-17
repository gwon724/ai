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

// 선택된 자금 + 한도 조절 타입
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

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/client/login");
  };

  const startDiag = async () => {
    setShowDiag(true);
    setDiagStep("analyzing");
    setSelectedFunds([]);
    setSubmitDone(false);
    await new Promise(r => setTimeout(r, 2400));
    if (user) { setFunds(getRecommendedFunds(user)); setDiagStep("select"); }
  };

  // 자금 선택/해제 (최대 3개)
  const toggleFund = (f: FundProduct) => {
    const max = Number(f.maxAmount) || 0;
    setSelectedFunds(prev => {
      const exists = prev.find(s => s.id === f.id);
      if (exists) return prev.filter(s => s.id !== f.id);
      if (prev.length >= 3) return prev; // 3개 초과 불가
      return [...prev, { id: f.id, name: f.name, maxAmount: max, chosenAmount: max }];
    });
  };

  // 한도 슬라이더 변경
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
    <div style={{ minHeight: "100vh", backgroundColor: "#E8EDFB", fontFamily: font }}>
      {/* ── 헤더 ── */}
      <div style={{ backgroundColor: "#2563EB", padding: "14px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src={LOGO_B64} alt="EMFRONTIER LAB" width={32} height={32} style={{ objectFit: "contain", filter: "invert(1)" }} />
              <p style={{ fontSize: "18px", fontWeight: "800", color: "#FFFFFF" }}>EMFRONTIER LAB</p>
            </div>
            <p style={{ fontSize: "12px", color: "#BFDBFE", marginTop: "2px" }}>{user.name}님 환영합니다</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setShowQR(true)} style={{ padding: "8px 16px", backgroundColor: "#FFFFFF", color: "#2563EB", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>📱 내 QR 코드</button>
            <button onClick={logout} style={{ padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>로그아웃</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>

        {/* ── AI 진단 배너 ── */}
        {!app && (
          <div style={{ background: "linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)", borderRadius: "14px", padding: "28px 32px", marginBottom: "20px", textAlign: "center", color: "#FFFFFF" }}>
            <p style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", fontFamily: font }}>🤖 AI 정책자금 진단</p>
            <p style={{ fontSize: "14px", color: "#E0E7FF", marginBottom: "20px", fontFamily: font }}>AI가 회원님의 정보를 분석하여 최적의 정책자금을 추천해드립니다</p>
            <button onClick={startDiag} style={{ padding: "12px 36px", backgroundColor: "#FFFFFF", color: "#2563EB", fontSize: "15px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              AI 진단 시작하기
            </button>
          </div>
        )}

        {/* ── 신청 진행 상황 ── */}
        {app && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 2px 12px rgba(99,120,200,0.10)", padding: "24px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", fontFamily: font }}>📊 신청 진행 상황</p>
              <button onClick={startDiag} style={{ padding: "7px 16px", backgroundColor: "#EAF2FF", color: "#2563EB", fontSize: "12px", fontWeight: "700", border: "1.5px solid #BFDBFE", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>
                🔄 재진단
              </button>
            </div>
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

        {/* ── AI 추천 정책자금 목록 ── */}
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
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recommendedFunds.map((f) => {
                const isExp = expandedFund === f.id;
                return (
                  <div key={f.id} style={{ border: "1.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", backgroundColor: isExp ? "#EAF2FF" : "#F9FAFB" }}
                      onClick={() => setExpandedFund(isExp ? null : f.id)}>
                      <span style={{ fontSize: "20px" }}>💼</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B", fontFamily: font }}>{f.name}</p>
                        <p style={{ fontSize: "12px", color: "#6B7280", fontFamily: font, marginTop: "2px" }}>
                          {f.institution} · {f.category} · 최대 <strong>{Number(f.maxAmount).toLocaleString()}원</strong> · 금리 <strong>{f.interestRate}</strong>
                        </p>
                      </div>
                      <span style={{ fontSize: "11px", color: "#2563EB", backgroundColor: "#DBEAFE", padding: "3px 8px", borderRadius: "5px", fontWeight: "600", fontFamily: font }}>기간 {f.period}</span>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{isExp ? "▲" : "▼"}</span>
                    </div>
                    {isExp && (
                      <div style={{ padding: "14px 16px", backgroundColor: "#FFFFFF", borderTop: "1px solid #E5E7EB" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                          {[
                            { label: "최대 지원 한도", value: `${Number(f.maxAmount).toLocaleString()}원` },
                            { label: "금리", value: f.interestRate },
                            { label: "대출 기간", value: f.period },
                            { label: "최소 연매출", value: Number(f.minRevenue) > 0 ? `${Number(f.minRevenue).toLocaleString()}원 이상` : "제한 없음" },
                            { label: "최대 기대출", value: Number(f.maxDebt) > 0 ? `${Number(f.maxDebt).toLocaleString()}원 이하` : "제한 없음" },
                            { label: "최소 신용점수", value: Number(f.minCreditScore) > 0 ? `${f.minCreditScore}점 이상` : "제한 없음" },
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

      {/* ── QR 모달 ── */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "32px 28px", maxWidth: "320px", width: "90%", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B", marginBottom: "6px", fontFamily: font }}>📱 내 QR 코드</p>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "16px", fontFamily: font }}>이 QR 코드를 관리자에게 보여주세요</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent("EMFRONTIER:" + user.email)}`} alt="QR" style={{ borderRadius: "8px", border: "1px solid #E5E7EB", marginBottom: "12px" }} />
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "20px", fontFamily: font }}>{user.email}</p>
            <button onClick={() => setShowQR(false)} style={{ width: "100%", padding: "11px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>닫기</button>
          </div>
        </div>
      )}

      {/* ── AI 진단 모달 ── */}
      {showDiag && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", width: "100%", maxWidth: "620px", boxShadow: "0 12px 48px rgba(0,0,0,0.22)", maxHeight: "92vh", overflowY: "auto" }}>

            {/* 분석 중 */}
            {diagStep === "analyzing" && (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "52px", marginBottom: "20px" }}>🤖</div>
                <p style={{ fontSize: "18px", fontWeight: "800", color: "#1E293B", marginBottom: "10px", fontFamily: font }}>AI 분석 중...</p>
                <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.8", fontFamily: font }}>
                  신용점수 · 연매출 · 부채 정보를 분석하고 있습니다<br />
                  <span style={{ color: gradeColor, fontWeight: "700" }}>SOHO {grade}등급</span> 기준 맞춤 자금을 찾는 중...
                </p>
                <div style={{ backgroundColor: "#F3F4F6", borderRadius: "999px", height: "6px", margin: "24px auto", maxWidth: "300px", overflow: "hidden" }}>
                  <div style={{ width: "65%", height: "6px", borderRadius: "999px", backgroundColor: "#2563EB" }} />
                </div>
              </div>
            )}

            {/* 자금 선택 */}
            {diagStep === "select" && !submitDone && (
              <div style={{ padding: "28px 28px 24px" }}>
                {/* 헤더 */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "22px" }}>🎯</span>
                    <p style={{ fontSize: "18px", fontWeight: "800", color: "#1E293B", fontFamily: font }}>맞춤 정책자금 추천 결과</p>
                  </div>
                  <p style={{ fontSize: "13px", color: "#6B7280", fontFamily: font, lineHeight: "1.6" }}>
                    <span style={{ color: gradeColor, fontWeight: "700" }}>SOHO {grade}등급</span> 기준 <strong>{funds.length}개</strong> 추천 자금이 있습니다.
                    <br />원하는 자금을 <strong style={{ color: "#2563EB" }}>최대 3개까지</strong> 선택하고 신청 한도를 조절해주세요.
                  </p>
                </div>

                {/* 선택 현황 배지 */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", padding: "10px 14px", backgroundColor: selectedFunds.length === 3 ? "#FEF9C3" : "#EAF2FF", borderRadius: "8px", border: `1px solid ${selectedFunds.length === 3 ? "#FDE68A" : "#BFDBFE"}` }}>
                  <span style={{ fontSize: "16px" }}>{selectedFunds.length === 3 ? "⚠️" : "✅"}</span>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: selectedFunds.length === 3 ? "#92400E" : "#1D4ED8", fontFamily: font }}>
                    {selectedFunds.length === 0 && "아직 선택된 자금이 없습니다"}
                    {selectedFunds.length > 0 && selectedFunds.length < 3 && `${selectedFunds.length}개 선택됨 · 최대 ${3 - selectedFunds.length}개 더 선택 가능`}
                    {selectedFunds.length === 3 && "3개 선택 완료 · 더 이상 선택할 수 없습니다"}
                  </p>
                </div>

                {/* 자금 목록 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {funds.map((f) => {
                    const sel = selectedFunds.find(s => s.id === f.id);
                    const maxAmt = Number(f.maxAmount) || 0;
                    const disabled = !sel && selectedFunds.length >= 3;
                    return (
                      <div key={f.id} style={{
                        border: `2px solid ${sel ? "#2563EB" : disabled ? "#F3F4F6" : "#E5E7EB"}`,
                        borderRadius: "12px",
                        backgroundColor: sel ? "#EAF2FF" : disabled ? "#FAFAFA" : "#FFFFFF",
                        overflow: "hidden",
                        opacity: disabled ? 0.5 : 1,
                        transition: "all 0.2s",
                      }}>
                        {/* 자금 헤더 - 클릭으로 선택/해제 */}
                        <div
                          onClick={() => !disabled && toggleFund(f)}
                          style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px", cursor: disabled ? "not-allowed" : "pointer" }}
                        >
                          {/* 체크박스 */}
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0, marginTop: "2px",
                            backgroundColor: sel ? "#2563EB" : "#FFFFFF",
                            border: `2px solid ${sel ? "#2563EB" : "#D1D5DB"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {sel && <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: "900" }}>✓</span>}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <p style={{ fontSize: "14px", fontWeight: "700", color: sel ? "#1D4ED8" : "#1E293B", fontFamily: font }}>{f.name}</p>
                              <span style={{ fontSize: "10px", backgroundColor: "#F3F4F6", color: "#6B7280", padding: "2px 7px", borderRadius: "4px", fontWeight: "600", fontFamily: font }}>{f.category}</span>
                            </div>
                            <p style={{ fontSize: "12px", color: "#6B7280", fontFamily: font, marginTop: "3px" }}>
                              {f.institution} · 금리 {f.interestRate} · {f.period}
                            </p>
                            <p style={{ fontSize: "12px", color: "#2563EB", fontWeight: "600", fontFamily: font, marginTop: "3px" }}>
                              최대 한도: {maxAmt.toLocaleString()}원
                            </p>
                          </div>
                        </div>

                        {/* 한도 슬라이더 - 선택된 경우만 표시 */}
                        {sel && (
                          <div style={{ padding: "0 16px 16px", borderTop: "1px dashed #BFDBFE" }}>
                            <div style={{ paddingTop: "14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <p style={{ fontSize: "12px", fontWeight: "600", color: "#374151", fontFamily: font }}>💰 신청 한도 조절</p>
                                <p style={{ fontSize: "14px", fontWeight: "800", color: "#2563EB", fontFamily: font }}>
                                  {sel.chosenAmount.toLocaleString()}원
                                </p>
                              </div>
                              <input
                                type="range"
                                min={Math.round(maxAmt * 0.1)}
                                max={maxAmt}
                                step={Math.max(1000000, Math.round(maxAmt / 100))}
                                value={sel.chosenAmount}
                                onChange={e => updateAmount(f.id, Number(e.target.value))}
                                style={{ width: "100%", accentColor: "#2563EB", cursor: "pointer", height: "6px" }}
                              />
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                                <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: font }}>{Math.round(maxAmt * 0.1).toLocaleString()}원</span>
                                <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: font }}>{maxAmt.toLocaleString()}원</span>
                              </div>
                              {/* 빠른 선택 버튼 */}
                              <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                                {[0.3, 0.5, 0.7, 1.0].map(ratio => {
                                  const val = Math.round(maxAmt * ratio);
                                  const active = sel.chosenAmount === val;
                                  return (
                                    <button key={ratio} onClick={(e) => { e.stopPropagation(); updateAmount(f.id, val); }}
                                      style={{ flex: 1, padding: "5px 0", fontSize: "11px", fontWeight: "600", fontFamily: font, border: `1.5px solid ${active ? "#2563EB" : "#E5E7EB"}`, borderRadius: "6px", backgroundColor: active ? "#2563EB" : "#FFFFFF", color: active ? "#FFFFFF" : "#6B7280", cursor: "pointer" }}>
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

                {/* 선택 요약 */}
                {selectedFunds.length > 0 && (
                  <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#166534", marginBottom: "8px", fontFamily: font }}>📋 신청 내역 요약</p>
                    {selectedFunds.map((s, i) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < selectedFunds.length - 1 ? "1px solid #BBF7D0" : "none" }}>
                        <p style={{ fontSize: "12px", color: "#166534", fontFamily: font }}>{i + 1}. {s.name}</p>
                        <p style={{ fontSize: "12px", fontWeight: "700", color: "#15803D", fontFamily: font }}>{s.chosenAmount.toLocaleString()}원</p>
                      </div>
                    ))}
                    <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #86EFAC", display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontSize: "13px", fontWeight: "700", color: "#166534", fontFamily: font }}>총 신청 한도</p>
                      <p style={{ fontSize: "13px", fontWeight: "800", color: "#15803D", fontFamily: font }}>
                        {selectedFunds.reduce((sum, s) => sum + s.chosenAmount, 0).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                )}

                {/* 버튼 */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => { setShowDiag(false); setSelectedFunds([]); }}
                    style={{ flex: 1, padding: "12px", backgroundColor: "#F9FAFB", color: "#6B7280", fontSize: "14px", fontWeight: "600", border: "1.5px solid #E5E7EB", borderRadius: "9px", cursor: "pointer", fontFamily: font }}>
                    취소
                  </button>
                  <button onClick={handleSubmitApp} disabled={!selectedFunds.length}
                    style={{ flex: 2, padding: "12px", backgroundColor: selectedFunds.length ? "#2563EB" : "#93C5FD", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "9px", cursor: selectedFunds.length ? "pointer" : "not-allowed", fontFamily: font, boxShadow: selectedFunds.length ? "0 2px 10px rgba(37,99,235,0.3)" : "none" }}>
                    ✅ 신청하기 ({selectedFunds.length}개 · {selectedFunds.reduce((s, f) => s + f.chosenAmount, 0).toLocaleString()}원)
                  </button>
                </div>
              </div>
            )}

            {/* 신청 완료 */}
            {submitDone && (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#1E293B", marginBottom: "8px", fontFamily: font }}>신청 완료!</p>
                <p style={{ fontSize: "14px", color: "#6B7280", fontFamily: font }}>정책자금 신청이 접수되었습니다.<br />담당 매니저가 곧 연락드립니다.</p>
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
