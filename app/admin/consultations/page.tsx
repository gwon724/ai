"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGO_B64,
  getAllConsultations, updateConsultation, deleteConsultation,
  CONSULT_STATUS_LIST, CONSULT_STATUS_COLORS, FONT,
  Consultation, ConsultStatus, getAllFunds, FundProduct,
} from "@/lib/store"; // LOGO_B64 added

const font = FONT;

const inp: React.CSSProperties = {
  padding: "8px 12px", fontSize: "13px", border: "1.5px solid #334155",
  borderRadius: "8px", backgroundColor: "#1E293B", color: "#F1F5F9",
  outline: "none", fontFamily: font,
};

export default function AdminConsultationsPage() {
  const router = useRouter();
  const [list, setList] = useState<Consultation[]>([]);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConsultStatus | "">("");
  const [search, setSearch] = useState("");
  const [memo, setMemo] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [consultDate, setConsultDate] = useState("");
  const [newStatus, setNewStatus] = useState<ConsultStatus>("접수대기");
  const [saved, setSaved] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const [allFunds, setAllFunds] = useState<FundProduct[]>([]);
  const [detailTab, setDetailTab] = useState<"info" | "analysis" | "funds">("info");

  const load = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("adminLoggedIn")) { router.replace("/admin/login"); return; }
    setList(getAllConsultations());
    setAllFunds(getAllFunds());
  }, [router]);

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const filtered = list.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const openDetail = (c: Consultation) => {
    setSelected(c);
    setMemo(c.adminMemo || "");
    setAssignedTo(c.assignedTo || "");
    setConsultDate(c.consultDate || "");
    setNewStatus(c.status);
    setSaved(false); setDelConfirm(false);
    setDetailTab("info");
  };

  const handleSave = () => {
    if (!selected) return;
    updateConsultation(selected.id, { status: newStatus, adminMemo: memo, assignedTo, consultDate });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
    const updated = getAllConsultations();
    setList(updated);
    const fresh = updated.find(c => c.id === selected.id);
    if (fresh) setSelected(fresh);
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteConsultation(selected.id);
    setList(getAllConsultations());
    setSelected(null); setDelConfirm(false);
  };

  // stats
  const total = list.length;
  const waiting = list.filter(c => c.status === "접수대기").length;
  const inProgress = list.filter(c => ["상담예약", "서류요청", "신청진행"].includes(c.status)).length;
  const completed = list.filter(c => c.status === "상담완료" || c.status === "종결").length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font, display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "58px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/admin/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={LOGO_B64} alt="EMFRONTIER LAB" width={32} height={32} style={{ objectFit: "contain", filter: "invert(1)" }} />
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#F1F5F9", fontFamily: font }}>EMFRONTIER LAB</span>
            </Link>
            <span style={{ color: "#475569" }}>/</span>
            <span style={{ fontSize: "14px", color: "#60A5FA", fontWeight: "700", fontFamily: font }}>💬 상담 관리</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#10B981", fontFamily: font }}>● 실시간 동기화</span>
            <Link href="/admin/dashboard" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none", fontFamily: font }}>대시보드</Link>
            <Link href="/admin/funds" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none", fontFamily: font }}>자금관리</Link>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", gap: "20px" }}>

        {/* 왼쪽: 목록 */}
        <div style={{ flex: selected ? "0 0 420px" : "1", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* 통계 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
            {[
              { label: "전체", value: total, color: "#60A5FA", bg: "#1E3A8A" },
              { label: "접수대기", value: waiting, color: "#FCD34D", bg: "#1C1A09" },
              { label: "진행중", value: inProgress, color: "#A78BFA", bg: "#1C1035" },
              { label: "완료/종결", value: completed, color: "#34D399", bg: "#052E1C" },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${s.color}22` }}>
                <p style={{ fontSize: "11px", color: "#94A3B8", fontFamily: font }}>{s.label}</p>
                <p style={{ fontSize: "26px", fontWeight: "900", color: s.color, fontFamily: font }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* 필터 */}
          <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", padding: "14px 16px", border: "1px solid #334155", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 이름 / 연락처 / 이메일 / 접수번호 검색"
              style={{ ...inp, flex: 1, minWidth: "180px" }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ConsultStatus | "")}
              style={{ ...inp, cursor: "pointer" }}>
              <option value="">전체 상태</option>
              {CONSULT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ fontSize: "13px", color: "#64748B", fontFamily: font }}>{filtered.length}건</span>
          </div>

          {/* 목록 */}
          <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", overflow: "hidden", flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>📭</p>
                <p style={{ fontSize: "15px", color: "#94A3B8", fontFamily: font }}>상담 신청 내역이 없습니다</p>
                <Link href="/consult" target="_blank" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none", fontFamily: font }}>
                  → 상담 신청 페이지로 이동
                </Link>
              </div>
            ) : (
              <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 280px)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #334155" }}>
                      {["접수번호", "신청자", "연락처", "업종 / 연매출", "희망금액", "SOHO등급", "선택자금", "신청일", "상태", ""].map(h => (
                        <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#64748B", fontFamily: font, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const sc = CONSULT_STATUS_COLORS[c.status];
                      const isSelected = selected?.id === c.id;
                      return (
                        <tr key={c.id}
                          style={{ borderBottom: "1px solid #1E293B", backgroundColor: isSelected ? "#0F2540" : "transparent", cursor: "pointer" }}
                          onClick={() => openDetail(c)}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "#1A2744"; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: "#60A5FA", fontFamily: font, fontWeight: "700", whiteSpace: "nowrap" }}>{c.id}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9", fontFamily: font }}>{c.name}</p>
                            <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font }}>{c.email}</p>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: "#CBD5E1", fontFamily: font, whiteSpace: "nowrap" }}>{c.phone}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <p style={{ fontSize: "12px", color: "#CBD5E1", fontFamily: font }}>{c.businessType}</p>
                            <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font }}>{Number(c.annual_revenue).toLocaleString()}원</p>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: "#A78BFA", fontFamily: font, fontWeight: "600", whiteSpace: "nowrap" }}>
                            {Number(c.desiredAmount).toLocaleString()}원
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {c.aiAnalysis ? (
                              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", fontFamily: font,
                                backgroundColor: c.aiAnalysis.sohoGrade === "A" ? "#052E1C" : c.aiAnalysis.sohoGrade === "B" ? "#1E3A8A" : c.aiAnalysis.sohoGrade === "C" ? "#3B2A00" : "#450A0A",
                                color: c.aiAnalysis.sohoGrade === "A" ? "#34D399" : c.aiAnalysis.sohoGrade === "B" ? "#60A5FA" : c.aiAnalysis.sohoGrade === "C" ? "#FBBF24" : "#FCA5A5",
                              }}>{c.aiAnalysis.sohoGrade}</span>
                            ) : <span style={{ fontSize: "11px", color: "#475569", fontFamily: font }}>-</span>}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {(c.selectedFundIds && c.selectedFundIds.length > 0)
                              ? <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", fontFamily: font, backgroundColor: "#052E1C", color: "#34D399" }}>{c.selectedFundIds.length}개</span>
                              : <span style={{ fontSize: "11px", color: "#475569", fontFamily: font }}>-</span>}
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: "11px", color: "#64748B", fontFamily: font, whiteSpace: "nowrap" }}>{c.createdAt.slice(0, 10)}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", backgroundColor: sc.darkBg, color: sc.darkText, border: `1px solid ${sc.border}33`, fontFamily: font, whiteSpace: "nowrap" }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <button onClick={e => { e.stopPropagation(); openDetail(c); }}
                              style={{ padding: "5px 12px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
                              상세
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 상세 패널 */}
        {selected && (() => {
          const selectedFundObjects = allFunds.filter(f => (selected.selectedFundIds || []).includes(f.id));
          const recommendedFundObjects = allFunds.filter(f => (selected.recommendedFundIds || []).includes(f.id));
          const ai = selected.aiAnalysis;
          const GRADE_COLOR: Record<string, { bg: string; text: string }> = {
            A: { bg: "#052E1C", text: "#34D399" }, B: { bg: "#1E3A8A", text: "#60A5FA" },
            C: { bg: "#3B2A00", text: "#FBBF24" }, D: { bg: "#450A0A", text: "#FCA5A5" },
          };
          return (
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* 상세 헤더 */}
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#64748B", fontFamily: font, marginBottom: "4px" }}>접수번호</p>
                  <p style={{ fontSize: "20px", fontWeight: "900", color: "#60A5FA", fontFamily: font, letterSpacing: "0.04em" }}>{selected.id}</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {ai && (
                    <div style={{ backgroundColor: GRADE_COLOR[ai.sohoGrade]?.bg || "#0F172A", border: `1px solid ${GRADE_COLOR[ai.sohoGrade]?.text || "#475569"}44`, borderRadius: "10px", padding: "6px 14px", textAlign: "center" }}>
                      <p style={{ fontSize: "10px", color: "#64748B", fontFamily: font }}>SOHO등급</p>
                      <p style={{ fontSize: "18px", fontWeight: "900", color: GRADE_COLOR[ai.sohoGrade]?.text || "#94A3B8", fontFamily: font }}>{ai.sohoGrade}</p>
                    </div>
                  )}
                  <span style={{
                    padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: "700",
                    backgroundColor: CONSULT_STATUS_COLORS[selected.status].darkBg,
                    color: CONSULT_STATUS_COLORS[selected.status].darkText,
                    border: `1px solid ${CONSULT_STATUS_COLORS[selected.status].border}44`,
                    fontFamily: font,
                  }}>
                    {selected.status}
                  </span>
                  <button onClick={() => setSelected(null)}
                    style={{ width: "28px", height: "28px", backgroundColor: "#334155", border: "none", borderRadius: "50%", color: "#94A3B8", cursor: "pointer", fontSize: "14px", fontFamily: font }}>
                    ×
                  </button>
                </div>
              </div>

              {/* 탭 메뉴 */}
              <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid #334155", paddingBottom: "0" }}>
                {([
                  { key: "info", label: "📋 기본정보" },
                  { key: "analysis", label: `🧠 AI분석${ai ? "" : " (없음)"}` },
                  { key: "funds", label: `💰 자금 (선택 ${selectedFundObjects.length}개)` },
                ] as const).map(t => (
                  <button key={t.key} onClick={() => setDetailTab(t.key)}
                    style={{
                      padding: "8px 14px", border: "none", cursor: "pointer", fontFamily: font,
                      fontSize: "12px", fontWeight: "700",
                      backgroundColor: detailTab === t.key ? "#0F172A" : "transparent",
                      color: detailTab === t.key ? "#60A5FA" : "#64748B",
                      borderRadius: "8px 8px 0 0",
                      borderBottom: detailTab === t.key ? "2px solid #2563EB" : "2px solid transparent",
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 기본정보 탭 ── */}
            {detailTab === "info" && (
              <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    ["신청자", `${selected.name} (${selected.gender}, ${selected.age}세)`],
                    ["연락처", selected.phone],
                    ["이메일", selected.email],
                    ["업종", `${selected.businessType} · ${selected.businessPeriod}`],
                    ["연매출액", `${Number(selected.annual_revenue).toLocaleString()}원`],
                    ["희망금액", `${Number(selected.desiredAmount).toLocaleString()}원`],
                    ["기대출", `${Number(selected.currentDebt).toLocaleString()}원`],
                    ["대출 목적", selected.purposeType],
                    ["NICE / KCB", `${selected.nice_score}점 / ${selected.kcb_score}점`],
                    ["신청일시", selected.createdAt],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: "8px 12px", backgroundColor: "#0F172A", borderRadius: "8px" }}>
                      <p style={{ fontSize: "10px", color: "#64748B", fontFamily: font }}>{k}</p>
                      <p style={{ fontSize: "13px", color: "#CBD5E1", fontWeight: "600", fontFamily: font, marginTop: "2px" }}>{v}</p>
                    </div>
                  ))}
                </div>
                {selected.inquiryContent && (
                  <div style={{ marginTop: "12px", padding: "12px 14px", backgroundColor: "#0F172A", borderRadius: "10px", border: "1px solid #334155" }}>
                    <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font, marginBottom: "6px" }}>문의 내용</p>
                    <p style={{ fontSize: "13px", color: "#CBD5E1", fontFamily: font, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{selected.inquiryContent}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── AI 분석 탭 ── */}
            {detailTab === "analysis" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {!ai ? (
                  <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "40px", textAlign: "center" }}>
                    <p style={{ fontSize: "32px", marginBottom: "12px" }}>🧠</p>
                    <p style={{ fontSize: "14px", color: "#64748B", fontFamily: font }}>AI 분석 데이터가 없습니다.<br />클라이언트가 상담 완료 페이지를 방문하면 자동 생성됩니다.</p>
                  </div>
                ) : (
                  <>
                    {/* SOHO 등급 요약 */}
                    <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: GRADE_COLOR[ai.sohoGrade]?.bg || "#0F172A", border: `3px solid ${GRADE_COLOR[ai.sohoGrade]?.text || "#475569"}66`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "26px", fontWeight: "900", color: GRADE_COLOR[ai.sohoGrade]?.text || "#94A3B8", fontFamily: font }}>{ai.sohoGrade}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "14px", fontWeight: "800", color: "#F1F5F9", fontFamily: font, marginBottom: "4px" }}>
                            SOHO {ai.sohoGrade}등급 · {ai.sohoScore}점 / 90점
                          </p>
                          <p style={{ fontSize: "12px", color: "#94A3B8", fontFamily: font, lineHeight: "1.6" }}>{ai.summary}</p>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ backgroundColor: "#0F172A", borderRadius: "8px", padding: "10px 14px", textAlign: "center" }}>
                          <p style={{ fontSize: "10px", color: "#64748B", fontFamily: font }}>AI 추천 자금 수</p>
                          <p style={{ fontSize: "20px", fontWeight: "900", color: "#60A5FA", fontFamily: font }}>{ai.totalRecommended}개</p>
                        </div>
                        <div style={{ backgroundColor: "#0F172A", borderRadius: "8px", padding: "10px 14px", textAlign: "center" }}>
                          <p style={{ fontSize: "10px", color: "#64748B", fontFamily: font }}>최대 가능 금액</p>
                          <p style={{ fontSize: "16px", fontWeight: "900", color: "#34D399", fontFamily: font }}>
                            {Number(ai.maxPossibleAmount) >= 100000000 ? (Number(ai.maxPossibleAmount)/100000000).toFixed(0)+"억↑" : (Number(ai.maxPossibleAmount)/10000).toFixed(0)+"만"}원
                          </p>
                        </div>
                      </div>
                      {/* 점수 바 */}
                      <div style={{ marginTop: "12px" }}>
                        <div style={{ height: "8px", backgroundColor: "#0F172A", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, (ai.sohoScore/90)*100)}%`, backgroundColor: GRADE_COLOR[ai.sohoGrade]?.text || "#475569", borderRadius: "999px" }} />
                        </div>
                      </div>
                    </div>

                    {/* SWOT */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[
                        { title: "💪 강점", items: ai.strengths, bg: "#052E1C", border: "#166534", color: "#34D399" },
                        { title: "⚠️ 약점", items: ai.weaknesses, bg: "#1C0A00", border: "#92400E", color: "#FBBF24" },
                        { title: "🚀 기회", items: ai.opportunities, bg: "#0F1E3D", border: "#1D4ED8", color: "#60A5FA" },
                        { title: "🔴 리스크", items: ai.risks, bg: "#450A0A", border: "#DC2626", color: "#FCA5A5" },
                      ].map(sw => (
                        <div key={sw.title} style={{ backgroundColor: sw.bg, border: `1px solid ${sw.border}44`, borderRadius: "12px", padding: "14px" }}>
                          <p style={{ fontSize: "12px", fontWeight: "800", color: sw.color, fontFamily: font, marginBottom: "8px" }}>{sw.title}</p>
                          {sw.items.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px", alignItems: "flex-start" }}>
                              <span style={{ fontSize: "8px", color: sw.color, marginTop: "4px", flexShrink: 0 }}>●</span>
                              <span style={{ fontSize: "11px", color: "#CBD5E1", fontFamily: font, lineHeight: "1.5" }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── 자금 탭 ── */}
            {detailTab === "funds" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 클라이언트 선택 자금 */}
                <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", fontFamily: font, marginBottom: "14px" }}>
                    💾 클라이언트 선택 자금 ({selectedFundObjects.length}개)
                  </p>
                  {selectedFundObjects.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#64748B", fontFamily: font, padding: "20px 0", textAlign: "center" }}>
                      아직 선택한 자금이 없습니다.<br />클라이언트가 상담 완료 페이지에서 자금을 선택해야 합니다.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedFundObjects.map(f => (
                        <div key={f.id} style={{ backgroundColor: "#0F172A", borderRadius: "10px", padding: "12px 14px", border: "1px solid #1E3A8A", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: "#60A5FA", fontFamily: font }}>{f.name}</p>
                            <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font }}>{f.institution} · {f.category} · {f.interestRate}</p>
                          </div>
                          <p style={{ fontSize: "13px", fontWeight: "800", color: "#34D399", fontFamily: font, flexShrink: 0 }}>
                            최대 {Number(f.maxAmount) >= 100000000 ? (Number(f.maxAmount)/100000000).toFixed(0)+"억" : (Number(f.maxAmount)/10000).toFixed(0)+"만"}원
                          </p>
                        </div>
                      ))}
                      {selectedFundObjects.length > 0 && (
                        <div style={{ backgroundColor: "#052E1C", borderRadius: "8px", padding: "10px 14px", border: "1px solid #16A34A22", display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#34D399", fontFamily: font }}>합산 최대 금액</span>
                          <span style={{ fontSize: "14px", fontWeight: "900", color: "#34D399", fontFamily: font }}>
                            {(() => {
                              const total = selectedFundObjects.reduce((s, f) => s + Number(f.maxAmount), 0);
                              return total >= 100000000 ? (total/100000000).toFixed(0)+"억원" : (total/10000).toFixed(0)+"만원";
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* AI 추천 자금 */}
                <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", fontFamily: font, marginBottom: "14px" }}>
                    ⭐ AI 추천 자금 ({recommendedFundObjects.length}개)
                  </p>
                  {recommendedFundObjects.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#64748B", fontFamily: font, padding: "20px 0", textAlign: "center" }}>
                      AI 추천 자금 데이터가 없습니다.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
                      {recommendedFundObjects.map(f => {
                        const isChosen = (selected.selectedFundIds || []).includes(f.id);
                        return (
                          <div key={f.id} style={{ backgroundColor: isChosen ? "#052E1C" : "#0F172A", borderRadius: "8px", padding: "10px 12px", border: `1px solid ${isChosen ? "#16A34A44" : "#334155"}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {isChosen && <span style={{ fontSize: "10px", backgroundColor: "#052E1C", color: "#34D399", border: "1px solid #16A34A44", padding: "1px 6px", borderRadius: "4px", fontFamily: font, flexShrink: 0 }}>선택됨</span>}
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#CBD5E1", fontFamily: font }}>{f.name}</p>
                              </div>
                              <p style={{ fontSize: "10px", color: "#64748B", fontFamily: font, marginTop: "2px" }}>{f.institution} · {f.category}</p>
                            </div>
                            <p style={{ fontSize: "12px", fontWeight: "700", color: "#60A5FA", fontFamily: font, flexShrink: 0 }}>
                              {Number(f.maxAmount) >= 100000000 ? (Number(f.maxAmount)/100000000).toFixed(0)+"억" : (Number(f.maxAmount)/10000).toFixed(0)+"만"}원
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 상태 변경 */}
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", fontFamily: font, marginBottom: "14px" }}>📊 상담 상태 관리</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {CONSULT_STATUS_LIST.map(s => {
                  const sc = CONSULT_STATUS_COLORS[s];
                  const isActive = newStatus === s;
                  return (
                    <button key={s} onClick={() => setNewStatus(s)}
                      style={{
                        padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
                        cursor: "pointer", fontFamily: font, border: `2px solid ${isActive ? sc.border : "#334155"}`,
                        backgroundColor: isActive ? sc.darkBg : "#0F172A",
                        color: isActive ? sc.darkText : "#64748B",
                        transition: "all 0.2s",
                      }}>
                      {s}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", fontFamily: font, marginBottom: "5px" }}>담당 매니저</label>
                  <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                    placeholder="담당자 이름 입력"
                    style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", fontFamily: font, marginBottom: "5px" }}>상담 예약일시</label>
                  <input value={consultDate} onChange={e => setConsultDate(e.target.value)}
                    placeholder="예: 2026-04-20 14:00"
                    style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", fontFamily: font, marginBottom: "5px" }}>관리자 메모 (내부용)</label>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={4}
                  placeholder="내부 메모를 입력하세요..."
                  style={{ ...inp, width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: "1.7" }} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button onClick={handleSave}
                  style={{
                    flex: 1, padding: "12px", border: "none", borderRadius: "10px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: font,
                    backgroundColor: saved ? "#16A34A" : "#2563EB",
                    color: "#FFFFFF", transition: "background-color 0.3s",
                  }}>
                  {saved ? "✓ 저장됨" : "💾 저장"}
                </button>
                <button onClick={() => setDelConfirm(true)}
                  style={{ padding: "12px 20px", border: "1.5px solid #EF4444", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: font, backgroundColor: "transparent", color: "#EF4444" }}>
                  🗑️ 삭제
                </button>
              </div>

              {delConfirm && (
                <div style={{ marginTop: "12px", backgroundColor: "#450A0A", borderRadius: "10px", padding: "14px 16px", border: "1px solid #EF4444" }}>
                  <p style={{ fontSize: "13px", color: "#FCA5A5", fontFamily: font, marginBottom: "10px" }}>
                    ⚠️ 정말 이 상담 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleDelete}
                      style={{ flex: 1, padding: "10px", backgroundColor: "#EF4444", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: font }}>
                      삭제 확인
                    </button>
                    <button onClick={() => setDelConfirm(false)}
                      style={{ flex: 1, padding: "10px", backgroundColor: "#334155", color: "#94A3B8", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 빠른 링크 */}
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "16px 24px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", fontFamily: font, marginBottom: "10px" }}>빠른 링크</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Link href="/consult" target="_blank"
                  style={{ padding: "7px 14px", backgroundColor: "#0F172A", color: "#60A5FA", border: "1px solid #1E3A8A", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none", fontFamily: font }}>
                  🌐 상담 사이트
                </Link>
                <Link href="/admin/funds"
                  style={{ padding: "7px 14px", backgroundColor: "#0F172A", color: "#A78BFA", border: "1px solid #2E1B5E", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none", fontFamily: font }}>
                  💰 자금 관리
                </Link>
                <Link href="/admin/dashboard"
                  style={{ padding: "7px 14px", backgroundColor: "#0F172A", color: "#34D399", border: "1px solid #052E1C", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none", fontFamily: font }}>
                  📊 대시보드
                </Link>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}
