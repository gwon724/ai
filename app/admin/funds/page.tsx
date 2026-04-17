"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LOGO_B64, getAllFunds, addFund, updateFund, deleteFund,
  FONT, FUND_CATEGORIES, FundProduct,
} from "@/lib/store";

const font = FONT;
const GRADES = ["A", "B", "C", "D"];
const GRADE_COLORS: Record<string, string> = {
  A: "#16A34A", B: "#3B82F6", C: "#D97706", D: "#EF4444",
};

const EMPTY_FORM = {
  name: "", institution: "", category: "운전자금",
  maxAmount: "", interestRate: "", period: "",
  eligibleGrades: [] as string[],
  minRevenue: "0", maxDebt: "0", minCreditScore: "0",
  description: "", active: true,
};

export default function AdminFunds() {
  const router = useRouter();
  const [funds, setFunds] = useState<FundProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("전체");
  const [filterCat, setFilterCat] = useState("전체");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<FundProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  const refresh = useCallback(() => setFunds(getAllFunds()), []);

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) { router.push("/admin/login"); return; }
    refresh(); setLoading(false);
  }, [router, refresh]);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditTarget(null); setShowForm(true); };
  const openEdit = (f: FundProduct) => {
    setForm({ name: f.name, institution: f.institution, category: f.category, maxAmount: f.maxAmount, interestRate: f.interestRate, period: f.period, eligibleGrades: [...f.eligibleGrades], minRevenue: f.minRevenue, maxDebt: f.maxDebt, minCreditScore: f.minCreditScore, description: f.description, active: f.active });
    setEditTarget(f); setShowForm(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.eligibleGrades.length === 0) { alert("적용 등급을 최소 1개 선택해주세요."); return; }
    if (editTarget) updateFund(editTarget.id, form); else addFund(form);
    refresh(); setShowForm(false); flash();
  };
  const toggleGrade = (g: string) => {
    setForm(p => ({ ...p, eligibleGrades: p.eligibleGrades.includes(g) ? p.eligibleGrades.filter(x => x !== g) : [...p.eligibleGrades, g] }));
  };

  const filtered = funds.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !search || f.name.includes(q) || f.institution.includes(q);
    const matchGrade = filterGrade === "전체" || f.eligibleGrades.includes(filterGrade);
    const matchCat = filterCat === "전체" || f.category === filterCat;
    return matchSearch && matchGrade && matchCat;
  });

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: "13px",
    border: "1px solid #334155", borderRadius: "7px",
    backgroundColor: "#0F172A", color: "#F1F5F9",
    outline: "none", fontFamily: font, boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: "600",
    color: "#94A3B8", marginBottom: "5px", fontFamily: font,
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94A3B8", fontFamily: font }}>로딩 중...</p>
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .fp-header {
          background-color:#1E293B; border-bottom:1px solid #334155;
          padding:10px 14px; position:sticky; top:0; z-index:10;
        }
        .fp-header-inner {
          max-width:1300px; margin:0 auto;
          display:flex; justify-content:space-between; align-items:center; gap:8px;
        }
        .fp-brand { display:flex; align-items:center; gap:8px; min-width:0; overflow:hidden; }
        .fp-brand .t1 { font-size:15px; font-weight:800; color:#F8FAFC; white-space:nowrap; }
        .fp-brand .t2 { font-size:10px; color:#64748B; white-space:nowrap; }
        .fp-nav { display:flex; gap:5px; flex-wrap:wrap; margin-left:8px; }
        .fp-nav a { padding:5px 10px; font-size:11px; font-weight:600; border-radius:6px; text-decoration:none; white-space:nowrap; }
        .fp-right { display:flex; gap:6px; align-items:center; flex-shrink:0; }
        .hamburger { display:none; background:none; border:none; cursor:pointer; padding:6px; }
        .hamburger span { display:block; width:20px; height:2px; background:#CBD5E1; border-radius:2px; margin:4px 0; }

        .mob-nav {
          display:none; position:fixed; inset:0;
          background:rgba(15,23,42,0.97); z-index:100;
          flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:20px;
        }
        .mob-nav.open { display:flex; }
        .mob-nav a {
          width:100%; max-width:300px; text-align:center;
          padding:13px 20px; font-size:14px; font-weight:600;
          border-radius:8px; text-decoration:none; background:#334155; color:#CBD5E1; display:block;
        }
        .mob-close { position:absolute; top:14px; right:14px; background:none; border:none; color:#94A3B8; font-size:22px; cursor:pointer; padding:8px; }

        /* Stats */
        .fp-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-bottom:14px; }

        /* Grade row */
        .fp-grade-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }

        /* Filter row */
        .fp-filter-row {
          display:flex; gap:8px; flex-wrap:wrap; align-items:center;
          background-color:#1E293B; border-radius:10px; border:1px solid #334155;
          padding:10px 12px; margin-bottom:10px;
        }
        .fp-filter-row input, .fp-filter-row select { flex:1; min-width:100px; }

        /* Fund detail & form grids */
        .fund-detail-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:10px; }
        .fund-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }

        @media (max-width:1024px) {
          .fp-stats { grid-template-columns:repeat(3,1fr); }
          .fp-nav { display:none; }
          .hamburger { display:block; }
        }
        @media (max-width:640px) {
          .fp-stats { grid-template-columns:repeat(2,1fr); }
          .fp-grade-row { grid-template-columns:repeat(2,1fr); }
          .fund-detail-grid { grid-template-columns:repeat(2,1fr); }
          .fund-form-grid { grid-template-columns:1fr; }
          .fp-brand .t2 { display:none; }
        }
        @media (max-width:400px) {
          .fp-stats { grid-template-columns:1fr 1fr; }
          .fund-detail-grid { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      {/* Mobile nav overlay */}
      <div className={`mob-nav ${mobileNav ? "open" : ""}`}>
        <button className="mob-close" onClick={() => setMobileNav(false)}>✕</button>
        <Link href="/admin/dashboard" onClick={() => setMobileNav(false)}>📊 대시보드</Link>
        <Link href="/admin/funds" style={{ background: "#2563EB", color: "#FFF" }} onClick={() => setMobileNav(false)}>💰 자금 관리</Link>
        <Link href="/admin/consultations" onClick={() => setMobileNav(false)}>💬 상담 관리</Link>
        <Link href="/admin/accounts" onClick={() => setMobileNav(false)}>🔑 계정 관리</Link>
      </div>

      <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font }}>
        {/* Header */}
        <div className="fp-header">
          <div className="fp-header-inner">
            <div style={{ display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" }}>
              <div className="fp-brand">
                <img src={LOGO_B64} alt="EF" width={30} height={30} style={{ objectFit: "contain", filter: "invert(1)", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p className="t1">EMFRONTIER LAB</p>
                  <p className="t2">자금 상품 관리</p>
                </div>
              </div>
              <nav className="fp-nav">
                <Link href="/admin/dashboard" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>👥 회원</Link>
                <Link href="/admin/funds" style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}>💰 자금</Link>
                <Link href="/admin/consultations" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>💬 상담</Link>
                <Link href="/admin/accounts" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>🔑 계정</Link>
              </nav>
            </div>
            <div className="fp-right">
              {saved && <span style={{ fontSize: "11px", color: "#22C55E", backgroundColor: "#052E16", padding: "3px 8px", borderRadius: "999px" }}>✓ 저장</span>}
              <button onClick={() => { localStorage.removeItem("fundMaster"); localStorage.removeItem("fundMasterVersion"); refresh(); alert("초기화 완료"); }}
                style={{ padding: "6px 10px", backgroundColor: "#7C3AED", color: "#FFF", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>
                🔄 초기화
              </button>
              <button onClick={() => { localStorage.removeItem("adminLoggedIn"); router.push("/admin/login"); }}
                style={{ padding: "6px 10px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                로그아웃
              </button>
              <button className="hamburger" onClick={() => setMobileNav(true)}>
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "12px 10px" }}>
          {/* Stats */}
          <div className="fp-stats">
            {[
              { label: "전체 자금", value: funds.length, color: "#3B82F6", bg: "#1E3A5F" },
              { label: "활성 자금", value: funds.filter(f => f.active).length, color: "#22C55E", bg: "#052E1C" },
              { label: "비활성", value: funds.filter(f => !f.active).length, color: "#94A3B8", bg: "#1E293B" },
              { label: "A등급", value: funds.filter(f => f.active && f.eligibleGrades.includes("A")).length, color: "#16A34A", bg: "#052E1C" },
              { label: "D등급", value: funds.filter(f => f.active && f.eligibleGrades.includes("D")).length, color: "#EF4444", bg: "#450A0A" },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: "10px", padding: "10px 12px", border: `1px solid ${s.color}30` }}>
                <p style={{ fontSize: "10px", color: "#94A3B8" }}>{s.label}</p>
                <p style={{ fontSize: "22px", fontWeight: "800", color: s.color, marginTop: "4px" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Grade summary */}
          <div style={{ backgroundColor: "#1E293B", borderRadius: "10px", border: "1px solid #334155", padding: "12px 14px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "10px" }}>📊 SOHO 등급별 자금 현황</p>
            <div className="fp-grade-row">
              {GRADES.map(g => {
                const gFunds = funds.filter(f => f.active && f.eligibleGrades.includes(g));
                return (
                  <div key={g} style={{ backgroundColor: "#0F172A", borderRadius: "8px", padding: "10px 12px", border: `1px solid ${GRADE_COLORS[g]}40` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: GRADE_COLORS[g] }}>{g}등급</span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9" }}>{gFunds.length}개</span>
                    </div>
                    {gFunds.slice(0, 2).map(f => (
                      <p key={f.id} style={{ fontSize: "10px", color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>• {f.name}</p>
                    ))}
                    {gFunds.length > 2 && <p style={{ fontSize: "10px", color: "#475569" }}>+{gFunds.length - 2}개 더</p>}
                    {gFunds.length === 0 && <p style={{ fontSize: "10px", color: "#334155" }}>없음</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter & Add */}
          <div className="fp-filter-row">
            <input placeholder="🔍 자금명 또는 기관명" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: "120px", padding: "8px 12px", fontSize: "13px", border: "1px solid #334155", borderRadius: "7px", backgroundColor: "#0F172A", color: "#F1F5F9", outline: "none", fontFamily: font }} />
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
              style={{ padding: "8px 10px", fontSize: "12px", border: "1px solid #334155", borderRadius: "7px", backgroundColor: "#0F172A", color: "#F1F5F9", outline: "none", cursor: "pointer", fontFamily: font }}>
              <option value="전체">전체 등급</option>
              {GRADES.map(g => <option key={g} value={g}>{g}등급</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              style={{ padding: "8px 10px", fontSize: "12px", border: "1px solid #334155", borderRadius: "7px", backgroundColor: "#0F172A", color: "#F1F5F9", outline: "none", cursor: "pointer", fontFamily: font }}>
              <option value="전체">전체 분류</option>
              {FUND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontSize: "12px", color: "#64748B", whiteSpace: "nowrap" }}>{filtered.length}개</span>
            <button onClick={openAdd}
              style={{ padding: "8px 14px", backgroundColor: "#2563EB", color: "#FFF", fontSize: "12px", fontWeight: "700", border: "none", borderRadius: "7px", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", marginLeft: "auto" }}>
              + 자금 추가
            </button>
          </div>

          {/* Fund list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.length === 0 && (
              <div style={{ backgroundColor: "#1E293B", borderRadius: "10px", border: "1px solid #334155", padding: "40px", textAlign: "center" }}>
                <p style={{ color: "#475569", fontSize: "14px" }}>자금 상품이 없습니다</p>
              </div>
            )}
            {filtered.map(f => {
              const isExpanded = expandedId === f.id;
              return (
                <div key={f.id} style={{ backgroundColor: "#1E293B", borderRadius: "10px", border: `1px solid ${f.active ? "#334155" : "#1E293B"}`, overflow: "hidden", opacity: f.active ? 1 : 0.55 }}>
                  {/* Row */}
                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", flexWrap: "wrap" }}
                    onClick={() => setExpandedId(isExpanded ? null : f.id)}>
                    <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                      {GRADES.map(g => (
                        <span key={g} style={{ fontSize: "10px", fontWeight: "700", padding: "2px 5px", borderRadius: "4px", backgroundColor: f.eligibleGrades.includes(g) ? `${GRADE_COLORS[g]}22` : "#0F172A", color: f.eligibleGrades.includes(g) ? GRADE_COLORS[g] : "#334155", border: `1px solid ${f.eligibleGrades.includes(g) ? GRADE_COLORS[g] + "60" : "#1E293B"}` }}>{g}</span>
                      ))}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9" }}>{f.name}</p>
                        {!f.active && <span style={{ fontSize: "9px", color: "#64748B", backgroundColor: "#334155", padding: "1px 5px", borderRadius: "3px" }}>비활성</span>}
                      </div>
                      <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.institution} · {f.category} · 최대 {Number(f.maxAmount) >= 100000000 ? (Number(f.maxAmount)/100000000).toFixed(0)+"억" : (Number(f.maxAmount)/10000).toFixed(0)+"만"}원 · {f.interestRate}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0, flexWrap: "wrap" }}>
                      <button onClick={e => { e.stopPropagation(); updateFund(f.id, { active: !f.active }); refresh(); }}
                        style={{ fontSize: "11px", fontWeight: "600", color: f.active ? "#FBBF24" : "#22C55E", border: `1px solid ${f.active ? "#78350F" : "#14532D"}`, backgroundColor: f.active ? "#1A0F00" : "#052E1C", padding: "3px 7px", borderRadius: "5px", cursor: "pointer" }}>
                        {f.active ? "⏸" : "▶"}
                      </button>
                      <button onClick={e => { e.stopPropagation(); openEdit(f); }}
                        style={{ fontSize: "11px", fontWeight: "600", color: "#60A5FA", border: "1px solid #1E3A5F", backgroundColor: "#0F172A", padding: "3px 7px", borderRadius: "5px", cursor: "pointer" }}>
                        ✏️
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteConfirm(f.id); }}
                        style={{ fontSize: "11px", fontWeight: "600", color: "#F87171", border: "1px solid #450A0A", backgroundColor: "#1A0505", padding: "3px 6px", borderRadius: "5px", cursor: "pointer" }}>
                        🗑️
                      </button>
                      <span style={{ fontSize: "12px", color: "#475569", padding: "3px 2px" }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #0F172A", padding: "12px 14px", backgroundColor: "#0F172A" }}>
                      <div className="fund-detail-grid">
                        {[
                          { label: "최대 한도", value: `${Number(f.maxAmount).toLocaleString()}원` },
                          { label: "금리", value: f.interestRate },
                          { label: "기간", value: f.period },
                          { label: "분류", value: f.category },
                          { label: "최소 연매출", value: Number(f.minRevenue) > 0 ? `${Number(f.minRevenue).toLocaleString()}원↑` : "제한없음" },
                          { label: "최대 기대출", value: Number(f.maxDebt) > 0 ? `${Number(f.maxDebt).toLocaleString()}원↓` : "제한없음" },
                          { label: "최소 신용(NICE)", value: Number(f.minCreditScore) > 0 ? `${f.minCreditScore}점↑` : "제한없음" },
                          { label: "적용 등급", value: f.eligibleGrades.join(", ") },
                        ].map(item => (
                          <div key={item.label}>
                            <p style={{ fontSize: "10px", color: "#64748B", marginBottom: "2px" }}>{item.label}</p>
                            <p style={{ fontSize: "12px", fontWeight: "600", color: "#E2E8F0" }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                      {f.description && (
                        <div style={{ backgroundColor: "#1E293B", borderRadius: "7px", padding: "9px 12px" }}>
                          <p style={{ fontSize: "10px", color: "#64748B", marginBottom: "3px" }}>자금 설명</p>
                          <p style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: "1.7" }}>{f.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 50, padding: "12px", overflowY: "auto" }}>
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", padding: "20px", width: "100%", maxWidth: "560px", border: "1px solid #334155", boxShadow: "0 8px 40px rgba(0,0,0,0.5)", marginBottom: "16px", marginTop: "8px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#F1F5F9", marginBottom: "16px", fontFamily: font }}>
                {editTarget ? "✏️ 자금 수정" : "➕ 자금 추가"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="fund-form-grid">
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={lbl}>자금명 *</label>
                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="예: 소상공인진흥공단 성장촉진자금" />
                  </div>
                  <div>
                    <label style={lbl}>취급 기관 *</label>
                    <input required value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} style={inp} placeholder="예: 소상공인진흥공단" />
                  </div>
                  <div>
                    <label style={lbl}>분류 *</label>
                    <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                      {FUND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>최대 지원 한도 (원) *</label>
                    <input required type="number" min="0" value={form.maxAmount} onChange={e => setForm(p => ({ ...p, maxAmount: e.target.value }))} style={inp} placeholder="예: 500000000" />
                  </div>
                  <div>
                    <label style={lbl}>금리 *</label>
                    <input required value={form.interestRate} onChange={e => setForm(p => ({ ...p, interestRate: e.target.value }))} style={inp} placeholder="예: 2.5~3.5%" />
                  </div>
                  <div>
                    <label style={lbl}>대출 기간 *</label>
                    <input required value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} style={inp} placeholder="예: 5년 (거치 2년)" />
                  </div>
                  <div>
                    <label style={lbl}>최소 연매출 (0=제한없음)</label>
                    <input type="number" min="0" value={form.minRevenue} onChange={e => setForm(p => ({ ...p, minRevenue: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>최대 기대출 (0=제한없음)</label>
                    <input type="number" min="0" value={form.maxDebt} onChange={e => setForm(p => ({ ...p, maxDebt: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>최소 신용점수 NICE (0=제한없음)</label>
                    <input type="number" min="0" max="1000" value={form.minCreditScore} onChange={e => setForm(p => ({ ...p, minCreditScore: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "14px" }}>
                    <label style={{ fontSize: "12px", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ width: "15px", height: "15px", accentColor: "#2563EB" }} />
                      활성화
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={lbl}>적용 가능 SOHO 등급 * (복수 선택)</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {GRADES.map(g => (
                      <button key={g} type="button" onClick={() => toggleGrade(g)}
                        style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "700", borderRadius: "8px", cursor: "pointer", border: "2px solid", backgroundColor: form.eligibleGrades.includes(g) ? `${GRADE_COLORS[g]}20` : "#0F172A", color: form.eligibleGrades.includes(g) ? GRADE_COLORS[g] : "#475569", borderColor: form.eligibleGrades.includes(g) ? GRADE_COLORS[g] : "#334155" }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={lbl}>자금 설명</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                    style={{ ...inp, resize: "vertical", lineHeight: "1.6" }} placeholder="클라이언트에게 보여줄 자금 설명..." />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex: 1, padding: "11px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer" }}>취소</button>
                  <button type="submit"
                    style={{ flex: 2, padding: "11px", backgroundColor: "#2563EB", color: "#FFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    {editTarget ? "💾 수정 저장" : "➕ 자금 추가"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", padding: "24px", maxWidth: "320px", width: "100%", border: "1px solid #334155" }}>
              <p style={{ fontSize: "20px", textAlign: "center", marginBottom: "10px" }}>⚠️</p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", textAlign: "center", marginBottom: "6px" }}>자금을 삭제하시겠습니까?</p>
              <p style={{ fontSize: "12px", color: "#94A3B8", textAlign: "center", marginBottom: "20px" }}>{funds.find(f => f.id === deleteConfirm)?.name}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer" }}>취소</button>
                <button onClick={() => { deleteFund(deleteConfirm); refresh(); setDeleteConfirm(null); flash(); }}
                  style={{ flex: 1, padding: "10px", backgroundColor: "#DC2626", color: "#FFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer" }}>삭제</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
