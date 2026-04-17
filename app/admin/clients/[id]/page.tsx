"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getUserById, updateApplicationStatus, saveAdminMemo, updateUser,
  calcGrade, getRecommendedFunds, STATUS_LIST, STATUS_COLORS,
  FONT, UserRecord, ApplicationStatus, FundProduct,
} from "@/lib/store";

const font = FONT;

export default function ClientDetail() {
  const router = useRouter();
  const params = useParams();
  const id = decodeURIComponent(params.id as string);

  const [user, setUser] = useState<UserRecord | null>(null);
  const [memo, setMemo] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<UserRecord>>({});
  const [editSaved, setEditSaved] = useState(false);
  const [tab, setTab] = useState<"info" | "application" | "memo" | "funds">("info");
  const [expandedFund, setExpandedFund] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) { router.push("/admin/login"); return; }
    const u = getUserById(id);
    if (u) {
      setUser(u);
      setMemo(u.adminMemo ?? "");
      setEditData(u);
    }
    setLoading(false);
  }, [id, router]);

  const handleStatusChange = (status: ApplicationStatus) => {
    if (!user?.application) return;
    updateApplicationStatus(user.id, status);
    const updated = getUserById(user.id);
    if (updated) setUser(updated);
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 2000);
  };

  const handleMemoSave = () => {
    if (!user) return;
    saveAdminMemo(user.id, memo);
    setMemoSaved(true);
    setTimeout(() => setMemoSaved(false), 2000);
  };

  const handleEditSave = () => {
    if (!user) return;
    updateUser(user.id, editData);
    const updated = getUserById(user.id);
    if (updated) { setUser(updated); setEditData(updated); }
    setEditMode(false);
    setEditSaved(true);
    setTimeout(() => setEditSaved(false), 2500);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94A3B8", fontFamily: font }}>로딩 중...</p>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font }}>
      <p style={{ color: "#94A3B8", marginBottom: "12px", fontSize: "16px" }}>회원을 찾을 수 없습니다.</p>
      <Link href="/admin/dashboard" style={{ color: "#60A5FA", textDecoration: "underline", fontFamily: font }}>← 목록으로</Link>
    </div>
  );

  const { grade, score } = calcGrade(user);
  const gradeColor = grade === "A" ? "#16A34A" : grade === "B" ? "#3B82F6" : grade === "C" ? "#D97706" : "#EF4444";
  const totalDebt =
    (Number(user.debt_policy) || 0) + (Number(user.debt_bank1) || 0) +
    (Number(user.debt_bank2) || 0) + (Number(user.debt_card) || 0);

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "22px",
  };
  const sT: React.CSSProperties = {
    fontSize: "12px", fontWeight: "700", color: "#64748B", marginBottom: "14px",
    fontFamily: font, textTransform: "uppercase", letterSpacing: "0.08em",
  };
  const row = (k: string, v: string | React.ReactNode, highlight?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0F172A" }}>
      <span style={{ fontSize: "12px", color: "#64748B", fontFamily: font }}>{k}</span>
      <span style={{ fontSize: "13px", fontWeight: "600", color: highlight ?? "#E2E8F0", fontFamily: font }}>{v}</span>
    </div>
  );

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: "13px",
    border: "1px solid #334155", borderRadius: "7px",
    backgroundColor: "#0F172A", color: "#F1F5F9",
    outline: "none", fontFamily: font, boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font }}>
      {/* 헤더 */}
      <div style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155", padding: "14px 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link href="/admin/dashboard" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none", fontFamily: font }}>
              ← 목록으로
            </Link>
            <span style={{ color: "#334155" }}>|</span>
            <div>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#F8FAFC" }}>회원 상세</p>
              <p style={{ fontSize: "11px", color: "#64748B" }}>{user.name} · {user.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {editSaved && (
              <span style={{ fontSize: "12px", color: "#22C55E", backgroundColor: "#052E16", padding: "4px 10px", borderRadius: "999px", fontFamily: font }}>
                ✓ 정보가 수정되었습니다
              </span>
            )}
            {statusSaved && (
              <span style={{ fontSize: "12px", color: "#22C55E", backgroundColor: "#052E16", padding: "4px 10px", borderRadius: "999px", fontFamily: font }}>
                ✓ 상태 저장됨
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
        {/* 요약 배너 */}
        <div style={{
          background: "linear-gradient(135deg,#1E3A5F 0%,#1E293B 100%)",
          borderRadius: "14px", border: "1px solid #334155",
          padding: "20px 24px", marginBottom: "20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              backgroundColor: `${gradeColor}20`, border: `2px solid ${gradeColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: "800", color: gradeColor,
            }}>
              {grade}
            </div>
            <div>
              <p style={{ fontSize: "18px", fontWeight: "800", color: "#F1F5F9", fontFamily: font }}>{user.name}</p>
              <p style={{ fontSize: "12px", color: "#64748B", fontFamily: font }}>{user.email} · 가입: {user.registeredAt}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            {[
              { label: "SOHO등급", value: `${grade}등급`, color: gradeColor },
              { label: "종합점수", value: `${score}점`, color: "#94A3B8" },
              { label: "NICE점수", value: `${user.nice_score}점`, color: "#60A5FA" },
              { label: "연매출", value: `${(Number(user.annual_revenue) / 100000000).toFixed(1)}억`, color: "#34D399" },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "#64748B", fontFamily: font, marginBottom: "2px" }}>{item.label}</p>
                <p style={{ fontSize: "16px", fontWeight: "700", color: item.color, fontFamily: font }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
          {(["info", "application", "funds", "memo"] as const).map((t, i) => {
            const labels = ["📋 기본 정보", "📊 신청 관리", "💰 추천 자금", "📝 메모"];
            const total = 4;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "10px 20px", fontSize: "13px", fontWeight: tab === t ? "700" : "500",
                  color: tab === t ? "#FFFFFF" : "#64748B",
                  backgroundColor: tab === t ? "#2563EB" : "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: i === 0 ? "8px 0 0 8px" : i === total - 1 ? "0 8px 8px 0" : "0",
                  cursor: "pointer", fontFamily: font,
                }}
              >
                {labels[i]}
              </button>
            );
          })}
        </div>

        {/* 탭 내용 */}
        {tab === "info" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              {/* 기본 정보 */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <p style={sT}>기본 정보</p>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} style={{ fontSize: "11px", color: "#60A5FA", background: "none", border: "1px solid #1E3A5F", borderRadius: "5px", padding: "3px 8px", cursor: "pointer", fontFamily: font }}>
                      ✏️ 수정
                    </button>
                  )}
                </div>
                {editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { label: "이름", key: "name", type: "text" },
                      { label: "나이", key: "age", type: "number" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: "11px", color: "#64748B", fontFamily: font, display: "block", marginBottom: "4px" }}>{f.label}</label>
                        <input
                          type={f.type}
                          value={editData[f.key as keyof UserRecord] as string ?? ""}
                          onChange={e => setEditData(p => ({ ...p, [f.key]: e.target.value }))}
                          style={inp}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: "11px", color: "#64748B", fontFamily: font, display: "block", marginBottom: "4px" }}>성별</label>
                      <select
                        value={editData.gender ?? user.gender}
                        onChange={e => setEditData(p => ({ ...p, gender: e.target.value }))}
                        style={{ ...inp, cursor: "pointer" }}
                      >
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    {row("이름", user.name)}
                    {row("이메일", user.email)}
                    {row("나이", `${user.age}세`)}
                    {row("성별", user.gender)}
                    {row("가입일", user.registeredAt ?? "-")}
                  </>
                )}
              </div>

              {/* 재무 정보 */}
              <div style={cardStyle}>
                <p style={sT}>재무 정보</p>
                {editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { label: "연매출액 (원)", key: "annual_revenue" },
                      { label: "정책자금 기대출 (원)", key: "debt_policy" },
                      { label: "1금융권 대출 (원)", key: "debt_bank1" },
                      { label: "2금융권 대출 (원)", key: "debt_bank2" },
                      { label: "카드론 (원)", key: "debt_card" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: "11px", color: "#64748B", fontFamily: font, display: "block", marginBottom: "4px" }}>{f.label}</label>
                        <input
                          type="number"
                          value={editData[f.key as keyof UserRecord] as string ?? ""}
                          onChange={e => setEditData(p => ({ ...p, [f.key]: e.target.value }))}
                          style={inp}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {row("연매출액", `${Number(user.annual_revenue).toLocaleString()}원`)}
                    {row("정책자금 기대출", `${Number(user.debt_policy).toLocaleString()}원`)}
                    {row("1금융권 대출", `${Number(user.debt_bank1).toLocaleString()}원`)}
                    {row("2금융권 대출", `${Number(user.debt_bank2).toLocaleString()}원`)}
                    {row("카드론", `${Number(user.debt_card).toLocaleString()}원`)}
                    {row("총 기대출", `${totalDebt.toLocaleString()}원`, "#FCA5A5")}
                  </>
                )}
              </div>

              {/* 신용 & 등급 */}
              <div style={cardStyle}>
                <p style={sT}>신용 & SOHO 등급</p>
                <div style={{ textAlign: "center", padding: "10px 0 14px" }}>
                  <p style={{ fontSize: "60px", fontWeight: "800", color: gradeColor, lineHeight: "1" }}>{grade}</p>
                  <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontFamily: font }}>종합 점수 {score}점</p>
                  <div style={{ backgroundColor: "#0F172A", borderRadius: "999px", height: "6px", margin: "10px 0", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(score, 100)}%`, height: "6px", borderRadius: "999px", backgroundColor: gradeColor, transition: "width 0.5s" }} />
                  </div>
                </div>
                {editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { label: "NICE 신용점수", key: "nice_score" },
                      { label: "KCB 신용점수", key: "kcb_score" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: "11px", color: "#64748B", fontFamily: font, display: "block", marginBottom: "4px" }}>{f.label}</label>
                        <input
                          type="number"
                          value={editData[f.key as keyof UserRecord] as string ?? ""}
                          onChange={e => setEditData(p => ({ ...p, [f.key]: e.target.value }))}
                          style={inp}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {row("NICE 점수", `${user.nice_score}점`, "#60A5FA")}
                    {row("KCB 점수", `${user.kcb_score}점`, "#60A5FA")}
                  </>
                )}
              </div>
            </div>

            {/* 수정 버튼 */}
            {editMode && (
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginBottom: "14px" }}>
                <button onClick={() => { setEditMode(false); setEditData(user); }}
                  style={{ padding: "10px 22px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>
                  취소
                </button>
                <button onClick={handleEditSave}
                  style={{ padding: "10px 22px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>
                  💾 저장
                </button>
              </div>
            )}

          </div>
        )}

        {tab === "application" && (
          <div style={cardStyle}>
            <p style={sT}>신청 상태 관리</p>
            {!user.application ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>📭</p>
                <p style={{ fontSize: "14px", color: "#475569", fontFamily: font }}>아직 신청 내역이 없습니다</p>
                <p style={{ fontSize: "12px", color: "#334155", marginTop: "6px", fontFamily: font }}>
                  클라이언트가 AI 진단 후 정책자금을 신청하면 여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <>
                {/* 신청 정보 */}
                <div style={{ backgroundColor: "#0F172A", borderRadius: "10px", padding: "16px", marginBottom: "20px", border: "1px solid #1E3A5F" }}>
                  <p style={{ fontSize: "12px", color: "#64748B", marginBottom: "8px", fontFamily: font }}>신청 자금 목록</p>
                  {user.application.funds.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: i < user.application!.funds.length - 1 ? "1px solid #1E293B" : "none" }}>
                      <span style={{ fontSize: "14px" }}>💼</span>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#60A5FA", fontFamily: font }}>{f}</p>
                    </div>
                  ))}
                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #1E293B", display: "flex", gap: "16px" }}>
                    <p style={{ fontSize: "11px", color: "#475569", fontFamily: font }}>신청일: {user.application.date}</p>
                    {user.application.updatedAt && (
                      <p style={{ fontSize: "11px", color: "#475569", fontFamily: font }}>최종 업데이트: {user.application.updatedAt}</p>
                    )}
                  </div>
                </div>

                {/* 상태 변경 */}
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#94A3B8", marginBottom: "12px", fontFamily: font }}>
                  현재 상태 → 상태 변경
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {STATUS_LIST.map(s => {
                    const isActive = user.application?.status === s;
                    const c = STATUS_COLORS[s];
                    return (
                      <button key={s} onClick={() => handleStatusChange(s as ApplicationStatus)}
                        style={{
                          padding: "12px 8px", fontSize: "13px", fontWeight: "700",
                          borderRadius: "8px", cursor: "pointer", fontFamily: font,
                          backgroundColor: isActive ? c.bg : "#0F172A",
                          color: isActive ? c.text : "#475569",
                          border: isActive ? `2px solid ${c.border}` : "1px solid #334155",
                          transform: isActive ? "scale(1.02)" : "none",
                          transition: "all 0.2s",
                          textAlign: "center",
                        }}>
                        {isActive && <p style={{ fontSize: "16px", marginBottom: "4px" }}>✓</p>}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "funds" && (() => {
          const recFunds = getRecommendedFunds(user);
          const GRADE_COLOR = (g: string) => g === "A" ? "#16A34A" : g === "B" ? "#3B82F6" : g === "C" ? "#D97706" : "#EF4444";
          return (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={sT}>AI 추천 정책자금</p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontFamily: font }}>
                    SOHO <strong style={{ color: gradeColor }}>{grade}등급</strong> 기준
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#3B82F6", backgroundColor: "#1E3A5F", padding: "3px 10px", borderRadius: "999px", fontFamily: font }}>
                    {recFunds.length}개 해당
                  </span>
                  <Link href="/admin/funds" style={{ fontSize: "11px", color: "#60A5FA", border: "1px solid #1E3A5F", backgroundColor: "#0F172A", padding: "4px 10px", borderRadius: "6px", textDecoration: "none", fontFamily: font }}>
                    ⚙️ 자금 관리
                  </Link>
                </div>
              </div>

              {recFunds.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ fontSize: "32px", marginBottom: "10px" }}>📭</p>
                  <p style={{ fontSize: "14px", color: "#475569", fontFamily: font }}>현재 조건에 맞는 추천 자금이 없습니다.</p>
                  <Link href="/admin/funds" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "underline", fontFamily: font }}>자금 관리에서 자금을 추가해주세요</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recFunds.map((f: FundProduct) => {
                    const isExp = expandedFund === f.id;
                    return (
                      <div key={f.id} style={{ border: `1px solid ${isExp ? "#1E3A5F" : "#1E293B"}`, borderRadius: "10px", overflow: "hidden" }}>
                        <div
                          style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", backgroundColor: isExp ? "#0F172A" : "#0A0F1E" }}
                          onClick={() => setExpandedFund(isExp ? null : f.id)}
                        >
                          <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                            {["A","B","C","D"].map(g => (
                              <span key={g} style={{
                                fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px",
                                backgroundColor: f.eligibleGrades.includes(g) ? `${GRADE_COLOR(g)}22` : "transparent",
                                color: f.eligibleGrades.includes(g) ? GRADE_COLOR(g) : "#1E293B",
                              }}>{g}</span>
                            ))}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9", fontFamily: font }}>{f.name}</p>
                            <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font, marginTop: "2px" }}>
                              {f.institution} · {f.category} · 최대 {Number(f.maxAmount).toLocaleString()}원 · 금리 {f.interestRate}
                            </p>
                          </div>
                          <span style={{ fontSize: "12px", color: "#475569" }}>{isExp ? "▲" : "▼"}</span>
                        </div>
                        {isExp && (
                          <div style={{ padding: "14px 16px", backgroundColor: "#0F172A", borderTop: "1px solid #1E293B" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
                              {[
                                { label: "최대 한도", value: `${Number(f.maxAmount).toLocaleString()}원` },
                                { label: "금리", value: f.interestRate },
                                { label: "대출 기간", value: f.period },
                                { label: "분류", value: f.category },
                                { label: "최소 연매출", value: Number(f.minRevenue) > 0 ? `${Number(f.minRevenue).toLocaleString()}원↑` : "제한없음" },
                                { label: "최대 기대출", value: Number(f.maxDebt) > 0 ? `${Number(f.maxDebt).toLocaleString()}원↓` : "제한없음" },
                                { label: "최소 신용(NICE)", value: Number(f.minCreditScore) > 0 ? `${f.minCreditScore}점↑` : "제한없음" },
                                { label: "적용 등급", value: f.eligibleGrades.join(", ") },
                              ].map(item => (
                                <div key={item.label} style={{ backgroundColor: "#1E293B", borderRadius: "6px", padding: "8px 10px" }}>
                                  <p style={{ fontSize: "10px", color: "#475569", fontFamily: font, marginBottom: "2px" }}>{item.label}</p>
                                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#CBD5E1", fontFamily: font }}>{item.value}</p>
                                </div>
                              ))}
                            </div>
                            {f.description && (
                              <div style={{ backgroundColor: "#1E293B", borderRadius: "7px", padding: "10px 14px" }}>
                                <p style={{ fontSize: "12px", color: "#94A3B8", fontFamily: font, lineHeight: "1.7" }}>{f.description}</p>
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
          );
        })()}

        {tab === "memo" && (
          <div style={cardStyle}>
            <p style={sT}>관리자 메모</p>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px", fontFamily: font }}>
              이 메모는 관리자만 볼 수 있습니다. 클라이언트에게는 공개되지 않습니다.
            </p>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="이 회원에 대한 메모를 자유롭게 입력하세요..."
              style={{
                width: "100%", height: "220px", padding: "14px", fontSize: "13px",
                border: "1px solid #334155", borderRadius: "10px",
                backgroundColor: "#0F172A", color: "#E2E8F0", outline: "none",
                resize: "vertical", fontFamily: font, lineHeight: "1.7",
                boxSizing: "border-box",
              }}
            />
            <button onClick={handleMemoSave} style={{
              width: "100%", marginTop: "12px", padding: "12px",
              backgroundColor: memoSaved ? "#052E16" : "#2563EB",
              color: memoSaved ? "#22C55E" : "#FFFFFF",
              fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "8px",
              cursor: "pointer", fontFamily: font, transition: "all 0.2s",
            }}>
              {memoSaved ? "✓ 저장되었습니다" : "메모 저장"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
