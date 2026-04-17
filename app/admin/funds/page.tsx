"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGO_B64,
  getAllFunds, addFund, updateFund, deleteFund,
  FONT, FUND_CATEGORIES, FundProduct,
} from "@/lib/store"; // LOGO_B64 added

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

  const refresh = useCallback(() => setFunds(getAllFunds()), []);

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) { router.push("/admin/login"); return; }
    refresh();
    setLoading(false);
  }, [router, refresh]);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (f: FundProduct) => {
    setForm({
      name: f.name, institution: f.institution, category: f.category,
      maxAmount: f.maxAmount, interestRate: f.interestRate, period: f.period,
      eligibleGrades: [...f.eligibleGrades],
      minRevenue: f.minRevenue, maxDebt: f.maxDebt, minCreditScore: f.minCreditScore,
      description: f.description, active: f.active,
    });
    setEditTarget(f);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.eligibleGrades.length === 0) { alert("적용 등급을 최소 1개 선택해주세요."); return; }
    if (editTarget) {
      updateFund(editTarget.id, form);
    } else {
      addFund(form);
    }
    refresh();
    setShowForm(false);
    flash();
  };

  const toggleGrade = (g: string) => {
    setForm(p => ({
      ...p,
      eligibleGrades: p.eligibleGrades.includes(g)
        ? p.eligibleGrades.filter(x => x !== g)
        : [...p.eligibleGrades, g],
    }));
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
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font }}>
      {/* 헤더 */}
      <div style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155", padding: "14px 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={LOGO_B64} alt="EMFRONTIER LAB" width={34} height={34} style={{ objectFit: "contain", filter: "invert(1)" }} />
              <div>
                <p style={{ fontSize: "16px", fontWeight: "800", color: "#F8FAFC" }}>EMFRONTIER LAB</p>
                <p style={{ fontSize: "11px", color: "#64748B" }}>자금 상품 관리</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", marginLeft: "12px" }}>
              <Link href="/admin/dashboard" style={{ padding: "6px 14px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none", fontFamily: font }}>👥 회원 관리</Link>
              <Link href="/admin/funds" style={{ padding: "6px 14px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none", fontFamily: font }}>💰 자금 관리</Link>
              <Link href="/admin/consultations" style={{ padding: "6px 14px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none", fontFamily: font }}>💬 상담 관리</Link>
              <Link href="/admin/accounts" style={{ padding: "6px 14px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none", fontFamily: font }}>🔑 계정 관리</Link>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {saved && <span style={{ fontSize: "12px", color: "#22C55E", backgroundColor: "#052E16", padding: "4px 10px", borderRadius: "999px", fontFamily: font }}>✓ 저장되었습니다</span>}
            <button onClick={() => {
              localStorage.removeItem("fundMaster");
              localStorage.removeItem("fundMasterVersion");
              refresh();
              alert("자금 데이터가 최신 기본값(100개)으로 초기화되었습니다.");
            }}
              style={{ padding: "7px 16px", backgroundColor: "#7C3AED", color: "#FFFFFF", fontSize: "12px", fontWeight: "600", border: "none", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>
              🔄 DB 초기화
            </button>
            <button onClick={() => { localStorage.removeItem("adminLoggedIn"); router.push("/admin/login"); }}
              style={{ padding: "7px 16px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", border: "none", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "24px 16px" }}>
        {/* 통계 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "전체 자금", value: funds.length, color: "#3B82F6", bg: "#1E3A5F" },
            { label: "활성 자금", value: funds.filter(f => f.active).length, color: "#22C55E", bg: "#052E1C" },
            { label: "비활성", value: funds.filter(f => !f.active).length, color: "#94A3B8", bg: "#1E293B" },
            { label: "A등급 자금", value: funds.filter(f => f.active && f.eligibleGrades.includes("A")).length, color: "#16A34A", bg: "#052E1C" },
            { label: "D등급 자금", value: funds.filter(f => f.active && f.eligibleGrades.includes("D")).length, color: "#EF4444", bg: "#450A0A" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${s.color}30` }}>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontFamily: font }}>{s.label}</p>
              <p style={{ fontSize: "28px", fontWeight: "800", color: s.color, marginTop: "4px" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* 등급별 자금 현황 */}
        <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "16px 20px", marginBottom: "18px" }}>
          <p style={{ fontSize: "13px", fontWeight: "700", color: "#CBD5E1", marginBottom: "12px", fontFamily: font }}>📊 SOHO 등급별 적용 자금 현황</p>
          <div style={{ display: "flex", gap: "10px" }}>
            {GRADES.map(g => {
              const gFunds = funds.filter(f => f.active && f.eligibleGrades.includes(g));
              return (
                <div key={g} style={{ flex: 1, backgroundColor: "#0F172A", borderRadius: "8px", padding: "12px 14px", border: `1px solid ${GRADE_COLORS[g]}40` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: GRADE_COLORS[g] }}>{g}등급</span>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#F1F5F9" }}>{gFunds.length}개</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {gFunds.slice(0, 3).map(f => (
                      <p key={f.id} style={{ fontSize: "11px", color: "#64748B", fontFamily: font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        • {f.name}
                      </p>
                    ))}
                    {gFunds.length > 3 && <p style={{ fontSize: "11px", color: "#475569", fontFamily: font }}>+{gFunds.length - 3}개 더보기</p>}
                    {gFunds.length === 0 && <p style={{ fontSize: "11px", color: "#334155", fontFamily: font }}>없음</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 검색 & 필터 & 추가 */}
        <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "14px 18px", marginBottom: "12px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="🔍  자금명 또는 기관명 검색..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: "1", minWidth: "180px", padding: "9px 14px", fontSize: "13px", border: "1px solid #334155", borderRadius: "8px", backgroundColor: "#0F172A", color: "#F1F5F9", outline: "none", fontFamily: font }}
          />
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
            style={{ padding: "9px 12px", fontSize: "13px", border: "1px solid #334155", borderRadius: "8px", backgroundColor: "#0F172A", color: "#F1F5F9", outline: "none", cursor: "pointer", fontFamily: font }}>
            <option value="전체">전체 등급</option>
            {GRADES.map(g => <option key={g} value={g}>{g}등급</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ padding: "9px 12px", fontSize: "13px", border: "1px solid #334155", borderRadius: "8px", backgroundColor: "#0F172A", color: "#F1F5F9", outline: "none", cursor: "pointer", fontFamily: font }}>
            <option value="전체">전체 분류</option>
            {FUND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <p style={{ fontSize: "12px", color: "#64748B", fontFamily: font }}>{filtered.length}개</p>
          <button onClick={openAdd}
            style={{ marginLeft: "auto", padding: "9px 18px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>
            + 자금 추가
          </button>
        </div>

        {/* 자금 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.length === 0 && (
            <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "40px", textAlign: "center" }}>
              <p style={{ color: "#475569", fontFamily: font, fontSize: "14px" }}>자금 상품이 없습니다</p>
            </div>
          )}
          {filtered.map(f => {
            const isExpanded = expandedId === f.id;
            return (
              <div key={f.id} style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: `1px solid ${f.active ? "#334155" : "#1E293B"}`, overflow: "hidden", opacity: f.active ? 1 : 0.55 }}>
                {/* 헤더 행 */}
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : f.id)}>
                  {/* 등급 뱃지들 */}
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    {GRADES.map(g => (
                      <span key={g} style={{
                        fontSize: "11px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px",
                        backgroundColor: f.eligibleGrades.includes(g) ? `${GRADE_COLORS[g]}22` : "#0F172A",
                        color: f.eligibleGrades.includes(g) ? GRADE_COLORS[g] : "#334155",
                        border: `1px solid ${f.eligibleGrades.includes(g) ? GRADE_COLORS[g] + "60" : "#1E293B"}`,
                      }}>{g}</span>
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", fontFamily: font }}>{f.name}</p>
                      {!f.active && <span style={{ fontSize: "10px", color: "#64748B", backgroundColor: "#334155", padding: "2px 6px", borderRadius: "4px", fontFamily: font }}>비활성</span>}
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748B", fontFamily: font, marginTop: "2px" }}>
                      {f.institution} · {f.category} · 최대 {Number(f.maxAmount).toLocaleString()}원 · 금리 {f.interestRate}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); updateFund(f.id, { active: !f.active }); refresh(); }}
                      style={{ fontSize: "11px", fontWeight: "600", color: f.active ? "#FBBF24" : "#22C55E", border: `1px solid ${f.active ? "#78350F" : "#14532D"}`, backgroundColor: f.active ? "#1A0F00" : "#052E1C", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontFamily: font }}>
                      {f.active ? "⏸ 비활성" : "▶ 활성화"}
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEdit(f); }}
                      style={{ fontSize: "11px", fontWeight: "600", color: "#60A5FA", border: "1px solid #1E3A5F", backgroundColor: "#0F172A", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontFamily: font }}>
                      ✏️ 수정
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(f.id); }}
                      style={{ fontSize: "11px", fontWeight: "600", color: "#F87171", border: "1px solid #450A0A", backgroundColor: "#1A0505", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontFamily: font }}>
                      🗑️
                    </button>
                    <span style={{ fontSize: "14px", color: "#475569", padding: "5px" }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* 상세 펼침 */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #0F172A", padding: "16px 20px", backgroundColor: "#0F172A" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "14px" }}>
                      {[
                        { label: "최대 지원 한도", value: `${Number(f.maxAmount).toLocaleString()}원` },
                        { label: "금리", value: f.interestRate },
                        { label: "대출 기간", value: f.period },
                        { label: "분류", value: f.category },
                        { label: "최소 연매출 조건", value: Number(f.minRevenue) > 0 ? `${Number(f.minRevenue).toLocaleString()}원 이상` : "제한 없음" },
                        { label: "최대 기대출 조건", value: Number(f.maxDebt) > 0 ? `${Number(f.maxDebt).toLocaleString()}원 이하` : "제한 없음" },
                        { label: "최소 신용점수(NICE)", value: Number(f.minCreditScore) > 0 ? `${f.minCreditScore}점 이상` : "제한 없음" },
                        { label: "적용 등급", value: f.eligibleGrades.join(", ") + "등급" },
                      ].map(item => (
                        <div key={item.label}>
                          <p style={{ fontSize: "10px", color: "#64748B", fontFamily: font, marginBottom: "3px" }}>{item.label}</p>
                          <p style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0", fontFamily: font }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ backgroundColor: "#1E293B", borderRadius: "8px", padding: "12px 14px" }}>
                      <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font, marginBottom: "4px" }}>자금 설명</p>
                      <p style={{ fontSize: "13px", color: "#CBD5E1", fontFamily: font, lineHeight: "1.7" }}>{f.description}</p>
                    </div>
                    <p style={{ fontSize: "10px", color: "#334155", fontFamily: font, marginTop: "8px" }}>
                      등록: {f.createdAt} {f.updatedAt ? `· 수정: ${f.updatedAt}` : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 추가/수정 모달 */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 50, padding: "20px 16px", overflowY: "auto" }}>
          <div style={{ backgroundColor: "#1E293B", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "600px", border: "1px solid #334155", boxShadow: "0 8px 40px rgba(0,0,0,0.5)", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#F1F5F9", marginBottom: "20px", fontFamily: font }}>
              {editTarget ? "✏️ 자금 수정" : "➕ 자금 추가"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
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
                  <label style={lbl}>최소 연매출 조건 (원, 0=제한없음)</label>
                  <input type="number" min="0" value={form.minRevenue} onChange={e => setForm(p => ({ ...p, minRevenue: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>최대 기대출 조건 (원, 0=제한없음)</label>
                  <input type="number" min="0" value={form.maxDebt} onChange={e => setForm(p => ({ ...p, maxDebt: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>최소 신용점수 NICE (0=제한없음)</label>
                  <input type="number" min="0" max="1000" value={form.minCreditScore} onChange={e => setForm(p => ({ ...p, minCreditScore: e.target.value }))} style={inp} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "16px" }}>
                  <label style={{ fontSize: "12px", color: "#94A3B8", fontFamily: font, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ width: "15px", height: "15px", accentColor: "#2563EB" }} />
                    활성화 (클라이언트에게 추천)
                  </label>
                </div>
              </div>

              {/* 적용 SOHO 등급 */}
              <div style={{ marginBottom: "14px" }}>
                <label style={lbl}>적용 가능 SOHO 등급 * (복수 선택)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {GRADES.map(g => (
                    <button key={g} type="button" onClick={() => toggleGrade(g)}
                      style={{
                        padding: "8px 18px", fontSize: "14px", fontWeight: "700", borderRadius: "8px", cursor: "pointer", fontFamily: font, border: "2px solid",
                        backgroundColor: form.eligibleGrades.includes(g) ? `${GRADE_COLORS[g]}20` : "#0F172A",
                        color: form.eligibleGrades.includes(g) ? GRADE_COLORS[g] : "#475569",
                        borderColor: form.eligibleGrades.includes(g) ? GRADE_COLORS[g] : "#334155",
                      }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 설명 */}
              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>자금 설명</label>
                <textarea
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ ...inp, resize: "vertical", lineHeight: "1.6" }}
                  placeholder="클라이언트에게 보여줄 자금 설명을 입력하세요..."
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "11px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>
                  취소
                </button>
                <button type="submit"
                  style={{ flex: 2, padding: "11px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>
                  {editTarget ? "💾 수정 저장" : "➕ 자금 추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", padding: "28px", maxWidth: "340px", width: "90%", border: "1px solid #334155" }}>
            <p style={{ fontSize: "20px", textAlign: "center", marginBottom: "12px" }}>⚠️</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#F1F5F9", textAlign: "center", marginBottom: "8px", fontFamily: font }}>자금을 삭제하시겠습니까?</p>
            <p style={{ fontSize: "13px", color: "#94A3B8", textAlign: "center", marginBottom: "24px", fontFamily: font }}>
              {funds.find(f => f.id === deleteConfirm)?.name}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>취소</button>
              <button onClick={() => { deleteFund(deleteConfirm); refresh(); setDeleteConfirm(null); flash(); }}
                style={{ flex: 1, padding: "11px", backgroundColor: "#DC2626", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: font }}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
