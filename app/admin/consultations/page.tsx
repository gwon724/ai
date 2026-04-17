"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGO_B64,
  getAllConsultations, updateConsultation, deleteConsultation,
  CONSULT_STATUS_LIST, CONSULT_STATUS_COLORS, FONT,
  Consultation, ConsultStatus, getAllFunds, FundProduct,
} from "@/lib/store";

const font = FONT;

const inp: React.CSSProperties = {
  padding: "8px 12px", fontSize: "13px", border: "1.5px solid #334155",
  borderRadius: "8px", backgroundColor: "#1E293B", color: "#F1F5F9",
  outline: "none", fontFamily: font, boxSizing: "border-box",
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
  const [mobileNav, setMobileNav] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

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
    setShowDetail(true);
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
    setSelected(null); setDelConfirm(false); setShowDetail(false);
  };

  const total = list.length;
  const waiting = list.filter(c => c.status === "접수대기").length;
  const inProgress = list.filter(c => ["상담예약", "서류요청", "신청진행"].includes(c.status)).length;
  const completed = list.filter(c => c.status === "상담완료" || c.status === "종결").length;

  const GRADE_COLOR: Record<string, { bg: string; text: string }> = {
    A: { bg: "#052E1C", text: "#34D399" }, B: { bg: "#1E3A8A", text: "#60A5FA" },
    C: { bg: "#3B2A00", text: "#FBBF24" }, D: { bg: "#450A0A", text: "#FCA5A5" },
  };

  return (
    <>
      <style>{`
        .cp-header { background-color:#1E293B; border-bottom:1px solid #334155; padding:0 16px; position:sticky; top:0; z-index:50; }
        .cp-header-inner { max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; height:56px; gap:8px; }
        .cp-brand { text-decoration:none; display:flex; align-items:center; gap:10px; }
        .cp-brand span { font-size:15px; font-weight:800; color:#F1F5F9; white-space:nowrap; }
        .cp-nav-links { display:flex; gap:12px; align-items:center; }
        .cp-nav-links a { font-size:13px; color:#94A3B8; text-decoration:none; font-family:${font}; white-space:nowrap; }
        .hamburger { display:none; background:none; border:none; cursor:pointer; padding:6px; }
        .hamburger span { display:block; width:22px; height:2px; background:#CBD5E1; border-radius:2px; margin:4px 0; }
        .mobile-overlay { display:none; }
        .mobile-overlay.open { display:flex; position:fixed; inset:0; background:rgba(15,23,42,0.97); z-index:100; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:24px; }
        .mobile-overlay a { width:100%; text-align:center; padding:14px; font-size:15px; font-weight:600; border-radius:8px; text-decoration:none; background:#334155; color:#CBD5E1; }
        .mobile-close { position:absolute; top:16px; right:16px; background:none; border:none; color:#94A3B8; font-size:24px; cursor:pointer; padding:8px; }
        .cp-layout { flex:1; max-width:1400px; width:100%; margin:0 auto; padding:16px 12px; display:flex; gap:16px; }
        .cp-list-col { flex:1; display:flex; flex-direction:column; gap:12px; }
        .cp-list-col.with-detail { flex:0 0 min(420px,100%); }
        .cp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .cp-detail-col { flex:1; min-width:0; display:flex; flex-direction:column; gap:14px; }
        .cp-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .cp-swot-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .filter-row { background-color:#1E293B; border-radius:12px; padding:12px 14px; border:1px solid #334155; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
        @media (max-width:1024px) {
          .cp-layout { flex-direction:column; }
          .cp-list-col.with-detail { flex:none; }
        }
        @media (max-width:768px) {
          .cp-stats { grid-template-columns:repeat(2,1fr); }
          .cp-nav-links { display:none; }
          .hamburger { display:block; }
          .cp-info-grid { grid-template-columns:1fr; }
          .cp-swot-grid { grid-template-columns:1fr; }
        }
        @media (max-width:480px) {
          .cp-brand span { display:none; }
        }
        .table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .table-scroll table { min-width:560px; }
        .detail-tab-btn { padding:8px 12px; border:none; cursor:pointer; font-family:${font}; font-size:12px; font-weight:700; border-radius:8px 8px 0 0; border-bottom:2px solid transparent; background:transparent; color:#64748B; }
        .detail-tab-btn.active { background:#0F172A; color:#60A5FA; border-bottom:2px solid #2563EB; }
      `}</style>

      <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font, display: "flex", flexDirection: "column" }}>

        {/* Mobile nav overlay */}
        <div className={`mobile-overlay ${mobileNav ? "open" : ""}`}>
          <button className="mobile-close" onClick={() => setMobileNav(false)}>✕</button>
          <Link href="/admin/dashboard" onClick={() => setMobileNav(false)}>📊 대시보드</Link>
          <Link href="/admin/funds" onClick={() => setMobileNav(false)}>💰 자금 관리</Link>
          <Link href="/admin/consultations" style={{ background: "#2563EB !important", color: "#FFF" }} onClick={() => setMobileNav(false)}>💬 상담 관리</Link>
          <Link href="/admin/accounts" onClick={() => setMobileNav(false)}>🔑 계정 관리</Link>
        </div>

        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-inner">
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Link href="/admin/dashboard" className="cp-brand">
                <img src={LOGO_B64} alt="EF" width={30} height={30} style={{ objectFit: "contain", filter: "invert(1)" }} />
                <span>EMFRONTIER LAB</span>
              </Link>
              <span style={{ color: "#475569", fontSize: "14px" }}>/</span>
              <span style={{ fontSize: "14px", color: "#60A5FA", fontWeight: "700" }}>💬 상담 관리</span>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="cp-nav-links">
                <span style={{ fontSize: "12px", color: "#10B981" }}>● 실시간</span>
                <Link href="/admin/dashboard">대시보드</Link>
                <Link href="/admin/funds">자금관리</Link>
              </div>
              <button className="hamburger" onClick={() => setMobileNav(true)}>
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>

        <div className="cp-layout">
          {/* Left: List */}
          <div className={`cp-list-col ${selected ? "with-detail" : ""}`}>

            {/* Stats */}
            <div className="cp-stats">
              {[
                { label: "전체", value: total, color: "#60A5FA", bg: "#1E3A8A" },
                { label: "접수대기", value: waiting, color: "#FCD34D", bg: "#1C1A09" },
                { label: "진행중", value: inProgress, color: "#A78BFA", bg: "#1C1035" },
                { label: "완료/종결", value: completed, color: "#34D399", bg: "#052E1C" },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: "12px", padding: "12px 14px", border: `1px solid ${s.color}22` }}>
                  <p style={{ fontSize: "11px", color: "#94A3B8" }}>{s.label}</p>
                  <p style={{ fontSize: "24px", fontWeight: "900", color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="filter-row">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 이름 / 연락처 / 이메일 / 접수번호"
                style={{ ...inp, flex: 1, minWidth: "160px", backgroundColor: "#0F172A" }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ConsultStatus | "")}
                style={{ ...inp, cursor: "pointer", backgroundColor: "#0F172A" }}>
                <option value="">전체 상태</option>
                {CONSULT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: "13px", color: "#64748B" }}>{filtered.length}건</span>
            </div>

            {/* List */}
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", overflow: "hidden", flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "48px", textAlign: "center" }}>
                  <p style={{ fontSize: "36px", marginBottom: "12px" }}>📭</p>
                  <p style={{ fontSize: "15px", color: "#94A3B8" }}>상담 신청 내역이 없습니다</p>
                  <Link href="/consult" target="_blank" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none" }}>→ 상담 신청 페이지</Link>
                </div>
              ) : (
                <div className="table-scroll" style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #334155" }}>
                        {["접수번호", "신청자", "연락처", "연매출", "상태", "신청일", ""].map(h => (
                          <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#64748B", whiteSpace: "nowrap" }}>{h}</th>
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
                            onClick={() => openDetail(c)}>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#60A5FA", fontWeight: "700", whiteSpace: "nowrap" }}>{c.id}</td>
                            <td style={{ padding: "11px 12px" }}>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9" }}>{c.name}</p>
                              <p style={{ fontSize: "11px", color: "#64748B" }}>{c.email}</p>
                            </td>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#CBD5E1", whiteSpace: "nowrap" }}>{c.phone}</td>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>
                              {Number(c.annual_revenue) >= 100000000 ? `${(Number(c.annual_revenue)/100000000).toFixed(1)}억` : `${(Number(c.annual_revenue)/10000).toFixed(0)}만`}원
                            </td>
                            <td style={{ padding: "11px 12px" }}>
                              <span style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", backgroundColor: sc.darkBg, color: sc.darkText, border: `1px solid ${sc.border}33`, whiteSpace: "nowrap" }}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ padding: "11px 12px", fontSize: "11px", color: "#64748B", whiteSpace: "nowrap" }}>{c.createdAt.slice(0, 10)}</td>
                            <td style={{ padding: "11px 12px" }}>
                              <button onClick={e => { e.stopPropagation(); openDetail(c); }}
                                style={{ padding: "5px 10px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
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

          {/* Right: Detail Panel */}
          {selected && showDetail && (() => {
            const selectedFundObjects = allFunds.filter(f => (selected.selectedFundIds || []).includes(f.id));
            const ai = selected.aiAnalysis;
            return (
              <div className="cp-detail-col">
                {/* Header */}
                <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontSize: "12px", color: "#64748B", marginBottom: "4px" }}>접수번호</p>
                      <p style={{ fontSize: "18px", fontWeight: "900", color: "#60A5FA" }}>{selected.id}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: "700", backgroundColor: CONSULT_STATUS_COLORS[selected.status].darkBg, color: CONSULT_STATUS_COLORS[selected.status].darkText, border: `1px solid ${CONSULT_STATUS_COLORS[selected.status].border}44` }}>
                        {selected.status}
                      </span>
                      <button onClick={() => { setSelected(null); setShowDetail(false); }}
                        style={{ width: "28px", height: "28px", backgroundColor: "#334155", border: "none", borderRadius: "50%", color: "#94A3B8", cursor: "pointer", fontSize: "14px" }}>×</button>
                    </div>
                  </div>

                  {/* Tab menu */}
                  <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid #334155" }}>
                    {([
                      { key: "info", label: "📋 기본정보" },
                      { key: "analysis", label: `🧠 AI분석${ai ? "" : "(없음)"}` },
                      { key: "funds", label: `💰 자금(${selectedFundObjects.length})` },
                    ] as const).map(t => (
                      <button key={t.key} onClick={() => setDetailTab(t.key)}
                        className={`detail-tab-btn ${detailTab === t.key ? "active" : ""}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Tab */}
                {detailTab === "info" && (
                  <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px" }}>
                    <div className="cp-info-grid">
                      {[
                        ["신청자", `${selected.name} (${selected.gender}, ${selected.age}세)`],
                        ["연락처", selected.phone], ["이메일", selected.email],
                        ["업종", `${selected.businessType} · ${selected.businessPeriod}`],
                        ["연매출액", `${Number(selected.annual_revenue).toLocaleString()}원`],
                        ["희망금액", `${Number(selected.desiredAmount).toLocaleString()}원`],
                        ["기대출", `${Number(selected.currentDebt).toLocaleString()}원`],
                        ["NICE/KCB", `${selected.nice_score}점 / ${selected.kcb_score}점`],
                        ["신청일", selected.createdAt],
                      ].map(([k, v]) => (
                        <div key={k} style={{ padding: "8px 10px", backgroundColor: "#0F172A", borderRadius: "8px" }}>
                          <p style={{ fontSize: "10px", color: "#64748B" }}>{k}</p>
                          <p style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "600", marginTop: "2px" }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    {selected.inquiryContent && (
                      <div style={{ marginTop: "10px", padding: "12px 14px", backgroundColor: "#0F172A", borderRadius: "10px", border: "1px solid #334155" }}>
                        <p style={{ fontSize: "11px", color: "#64748B", marginBottom: "6px" }}>문의 내용</p>
                        <p style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{selected.inquiryContent}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Analysis Tab */}
                {detailTab === "analysis" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {!ai ? (
                      <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "40px", textAlign: "center" }}>
                        <p style={{ fontSize: "32px", marginBottom: "12px" }}>🧠</p>
                        <p style={{ fontSize: "14px", color: "#64748B" }}>AI 분석 데이터가 없습니다.</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: GRADE_COLOR[ai.sohoGrade]?.bg || "#0F172A", border: `3px solid ${GRADE_COLOR[ai.sohoGrade]?.text || "#475569"}66`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: "24px", fontWeight: "900", color: GRADE_COLOR[ai.sohoGrade]?.text || "#94A3B8" }}>{ai.sohoGrade}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "14px", fontWeight: "800", color: "#F1F5F9", marginBottom: "4px" }}>SOHO {ai.sohoGrade}등급 · {ai.sohoScore}점/90점</p>
                              <p style={{ fontSize: "12px", color: "#94A3B8", lineHeight: "1.6" }}>{ai.summary}</p>
                            </div>
                          </div>
                          <div style={{ height: "6px", backgroundColor: "#0F172A", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min(100, (ai.sohoScore/90)*100)}%`, backgroundColor: GRADE_COLOR[ai.sohoGrade]?.text || "#475569", borderRadius: "999px" }} />
                          </div>
                        </div>
                        <div className="cp-swot-grid">
                          {[
                            { title: "💪 강점", items: ai.strengths, bg: "#052E1C", border: "#166534", color: "#34D399" },
                            { title: "⚠️ 약점", items: ai.weaknesses, bg: "#1C0A00", border: "#92400E", color: "#FBBF24" },
                            { title: "🚀 기회", items: ai.opportunities, bg: "#0F1E3D", border: "#1D4ED8", color: "#60A5FA" },
                            { title: "🔴 리스크", items: ai.risks, bg: "#450A0A", border: "#DC2626", color: "#FCA5A5" },
                          ].map(sw => (
                            <div key={sw.title} style={{ backgroundColor: sw.bg, border: `1px solid ${sw.border}44`, borderRadius: "12px", padding: "12px" }}>
                              <p style={{ fontSize: "12px", fontWeight: "800", color: sw.color, marginBottom: "8px" }}>{sw.title}</p>
                              {sw.items.map((item, i) => (
                                <div key={i} style={{ display: "flex", gap: "5px", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "8px", color: sw.color, marginTop: "4px", flexShrink: 0 }}>●</span>
                                  <span style={{ fontSize: "11px", color: "#CBD5E1", lineHeight: "1.5" }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Funds Tab */}
                {detailTab === "funds" && (
                  <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", marginBottom: "14px" }}>
                      💾 선택 자금 ({selectedFundObjects.length}개)
                    </p>
                    {selectedFundObjects.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#64748B", padding: "20px 0", textAlign: "center" }}>아직 선택한 자금이 없습니다.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedFundObjects.map(f => (
                          <div key={f.id} style={{ backgroundColor: "#0F172A", borderRadius: "10px", padding: "10px 12px", border: "1px solid #1E3A8A", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "700", color: "#60A5FA" }}>{f.name}</p>
                              <p style={{ fontSize: "11px", color: "#64748B" }}>{f.institution} · {f.category}</p>
                            </div>
                            <p style={{ fontSize: "13px", fontWeight: "800", color: "#34D399", flexShrink: 0 }}>
                              최대 {Number(f.maxAmount) >= 100000000 ? (Number(f.maxAmount)/100000000).toFixed(0)+"억" : (Number(f.maxAmount)/10000).toFixed(0)+"만"}원
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Status management */}
                <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", marginBottom: "12px" }}>📊 상담 상태 관리</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                    {CONSULT_STATUS_LIST.map(s => {
                      const sc = CONSULT_STATUS_COLORS[s];
                      const isActive = newStatus === s;
                      return (
                        <button key={s} onClick={() => setNewStatus(s)}
                          style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", border: `2px solid ${isActive ? sc.border : "#334155"}`, backgroundColor: isActive ? sc.darkBg : "#0F172A", color: isActive ? sc.darkText : "#64748B" }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "5px" }}>담당 매니저</label>
                      <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="담당자 이름"
                        style={{ ...inp, width: "100%", backgroundColor: "#0F172A" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "5px" }}>상담 예약일시</label>
                      <input value={consultDate} onChange={e => setConsultDate(e.target.value)} placeholder="예: 2026-04-20 14:00"
                        style={{ ...inp, width: "100%", backgroundColor: "#0F172A" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "5px" }}>관리자 메모</label>
                    <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3}
                      placeholder="내부 메모..." style={{ ...inp, width: "100%", resize: "vertical", lineHeight: "1.7", backgroundColor: "#0F172A" }} />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <button onClick={handleSave}
                      style={{ flex: 1, padding: "12px", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", backgroundColor: saved ? "#16A34A" : "#2563EB", color: "#FFFFFF" }}>
                      {saved ? "✓ 저장됨" : "💾 저장"}
                    </button>
                    <button onClick={() => setDelConfirm(true)}
                      style={{ padding: "12px 16px", border: "1.5px solid #EF4444", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", backgroundColor: "transparent", color: "#EF4444" }}>
                      🗑️
                    </button>
                  </div>

                  {delConfirm && (
                    <div style={{ marginTop: "12px", backgroundColor: "#450A0A", borderRadius: "10px", padding: "14px 16px", border: "1px solid #EF4444" }}>
                      <p style={{ fontSize: "13px", color: "#FCA5A5", marginBottom: "10px" }}>⚠️ 정말 삭제하시겠습니까?</p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handleDelete} style={{ flex: 1, padding: "10px", backgroundColor: "#EF4444", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>삭제 확인</button>
                        <button onClick={() => setDelConfirm(false)} style={{ flex: 1, padding: "10px", backgroundColor: "#334155", color: "#94A3B8", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>취소</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
