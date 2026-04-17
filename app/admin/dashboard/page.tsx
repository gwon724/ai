"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGO_B64,
  getAllUsers, calcGrade, STATUS_COLORS, STATUS_LIST,
  FONT, UserRecord, deleteUser, getCurrentAdmin, AdminAccount,
  getAllConsultations, updateConsultation,
  CONSULT_STATUS_LIST, CONSULT_STATUS_COLORS, Consultation, ConsultStatus,
  syncAllToServer, restoreFromServer,
} from "@/lib/store";

const font = FONT;
type Tab = "members" | "consultations";

function calcConsultGrade(c: Consultation): { grade: string; score: number } {
  let s = 0;
  const nice = Number(c.nice_score) || 0;
  const rev = Number(c.annual_revenue) || 0;
  const debt = Number(c.currentDebt) || 0;
  if (nice >= 900) s += 40; else if (nice >= 800) s += 30; else if (nice >= 700) s += 20; else if (nice >= 600) s += 10;
  if (rev >= 500000000) s += 30; else if (rev >= 200000000) s += 20; else if (rev >= 100000000) s += 15; else if (rev >= 50000000) s += 8;
  if (debt === 0) s += 20; else if (debt < 50000000) s += 15; else if (debt < 100000000) s += 10; else if (debt < 200000000) s += 5;
  const grade = s >= 75 ? "A" : s >= 55 ? "B" : s >= 35 ? "C" : "D";
  return { grade, score: s };
}

const gradeColor = (g: string) =>
  g === "A" ? "#16A34A" : g === "B" ? "#3B82F6" : g === "C" ? "#D97706" : "#EF4444";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("members");
  const [mobileNav, setMobileNav] = useState(false);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [filterGrade, setFilterGrade] = useState("전체");
  const [sortBy, setSortBy] = useState<"name" | "date" | "grade">("date");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [cSearch, setCSearch] = useState("");
  const [cStatusFilter, setCStatusFilter] = useState<ConsultStatus | "">("");
  const [cGradeFilter, setCGradeFilter] = useState("");
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);
  const [cNewStatus, setCNewStatus] = useState<ConsultStatus>("접수대기");
  const [cMemo, setCMemo] = useState("");
  const [cAssigned, setCAssigned] = useState("");
  const [cDate, setCDate] = useState("");
  const [cSaved, setCSaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [lastRefresh, setLastRefresh] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");

  const refresh = useCallback(() => {
    setUsers(getAllUsers());
    setConsultations(getAllConsultations());
    setLastRefresh(new Date().toLocaleTimeString("ko-KR"));
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) { router.push("/admin/login"); return; }
    setAdmin(getCurrentAdmin());
    refresh();
    setLoading(false);
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [router, refresh]);

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("currentAdminId");
    router.push("/admin/login");
  };

  const handleSync = async () => {
    setSyncStatus("syncing");
    try {
      const result = await syncAllToServer();
      setSyncStatus(result.ok ? "done" : "error");
    } catch { setSyncStatus("error"); }
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleRestore = async () => {
    if (!confirm("서버 백업 데이터로 현재 브라우저 데이터를 덮어씁니다.\n계속하시겠습니까?")) return;
    try {
      const result = await restoreFromServer();
      if (result.ok) refresh();
    } catch { /* ignore */ }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch("/api/backup");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emfrontier-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("다운로드 실패. 서버 동기화를 먼저 실행하세요."); }
  };

  const handleUploadRestore = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const res = await fetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) });
        if (res.ok) { await handleRestore(); alert("✅ 백업 파일로 복원 완료!"); }
        else alert("❌ 복원 실패");
      } catch { alert("❌ 파일 형식이 올바르지 않습니다."); }
    };
    input.click();
  };

  const handleDeleteUser = (userId: string) => { deleteUser(userId); refresh(); setDeleteConfirm(null); };

  const openConsult = (c: Consultation) => {
    setSelectedConsult(c); setCNewStatus(c.status);
    setCMemo(c.adminMemo || ""); setCAssigned(c.assignedTo || ""); setCDate(c.consultDate || ""); setCSaved(false);
  };

  const saveConsult = () => {
    if (!selectedConsult) return;
    updateConsultation(selectedConsult.id, { status: cNewStatus, adminMemo: cMemo, assignedTo: cAssigned, consultDate: cDate });
    setCSaved(true); setTimeout(() => setCSaved(false), 2500);
    const fresh = getAllConsultations(); setConsultations(fresh);
    const updated = fresh.find(c => c.id === selectedConsult.id);
    if (updated) setSelectedConsult(updated);
  };

  const filteredUsers = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchStatus = filterStatus === "전체" || (filterStatus === "미신청" ? !u.application : u.application?.status === filterStatus);
      const matchGrade = filterGrade === "전체" || calcGrade(u).grade === filterGrade;
      return matchSearch && matchStatus && matchGrade;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "ko");
      if (sortBy === "grade") return calcGrade(a).score - calcGrade(b).score;
      return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
    });

  const filteredConsults = consultations.filter(c => {
    const q = cSearch.trim().toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    const matchStatus = !cStatusFilter || c.status === cStatusFilter;
    const matchGrade = !cGradeFilter || calcConsultGrade(c).grade === cGradeFilter;
    return matchSearch && matchStatus && matchGrade;
  });

  const total = users.length;
  const applied = users.filter(u => u.application).length;
  const inProgress = users.filter(u => u.application?.status === "진행중").length;
  const done = users.filter(u => u.application?.status === "집행완료").length;
  const cTotal = consultations.length;
  const cWaiting = consultations.filter(c => c.status === "접수대기").length;
  const cInProg = consultations.filter(c => ["상담예약", "서류요청", "신청진행"].includes(c.status)).length;
  const cDone = consultations.filter(c => ["상담완료", "종결"].includes(c.status)).length;

  const gradeCount = ["A", "B", "C", "D"].map(g => ({
    grade: g,
    memberCount: users.filter(u => calcGrade(u).grade === g).length,
    consultCount: consultations.filter(c => calcConsultGrade(c).grade === g).length,
    color: gradeColor(g),
  }));

  const inp: React.CSSProperties = {
    padding: "9px 12px", fontSize: "13px", border: "1.5px solid #334155",
    borderRadius: "8px", backgroundColor: "#0F172A", color: "#F1F5F9",
    outline: "none", fontFamily: font,
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94A3B8", fontFamily: font }}>로딩 중...</p>
    </div>
  );

  return (
    <>
      <style>{`
        .dash-header { background-color:#1E293B; border-bottom:1px solid #334155; padding:12px 16px; position:sticky; top:0; z-index:20; }
        .dash-header-inner { max-width:1500px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; }
        .dash-brand { display:flex; align-items:center; gap:10px; }
        .dash-brand-text p:first-child { font-size:16px; font-weight:800; color:#F8FAFC; }
        .dash-brand-text p:last-child { font-size:11px; color:#64748B; }
        .dash-nav { display:flex; gap:6px; flex-wrap:wrap; }
        .dash-nav a { padding:6px 12px; font-size:12px; font-weight:600; border-radius:6px; text-decoration:none; white-space:nowrap; }
        .dash-nav a.active { background-color:#2563EB; color:#FFF; }
        .dash-nav a.inactive { background-color:#334155; color:#CBD5E1; }
        .dash-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .dash-sync-badge { font-size:11px; color:#22C55E; background-color:#052E16; padding:4px 10px; border-radius:999px; border:1px solid #166534; white-space:nowrap; }
        .dash-action-btn { padding:5px 10px; font-size:11px; font-weight:600; border:none; border-radius:6px; cursor:pointer; font-family:${font}; white-space:nowrap; }
        .dash-logout-btn { padding:7px 14px; background-color:#334155; color:#CBD5E1; font-size:12px; font-weight:600; border:none; border-radius:7px; cursor:pointer; font-family:${font}; }
        .hamburger { display:none; background:none; border:none; cursor:pointer; padding:6px; }
        .hamburger span { display:block; width:22px; height:2px; background:#CBD5E1; border-radius:2px; margin:4px 0; }
        .mobile-menu-overlay { display:none; }
        .mobile-menu-overlay.open { display:flex; position:fixed; inset:0; background:rgba(15,23,42,0.97); z-index:100; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:24px; }
        .mobile-menu-overlay a { width:100%; text-align:center; padding:14px 20px; font-size:15px; font-weight:600; border-radius:8px; text-decoration:none; }
        .mobile-close-btn { position:absolute; top:16px; right:16px; background:none; border:none; color:#94A3B8; font-size:24px; cursor:pointer; padding:8px; }
        .stats-grid-8 { display:grid; grid-template-columns:repeat(8,1fr); gap:10px; margin-bottom:20px; }
        .grade-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .consult-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        @media (max-width:1100px) {
          .stats-grid-8 { grid-template-columns:repeat(4,1fr); }
          .dash-nav { display:none; }
          .hamburger { display:block; }
        }
        @media (max-width:768px) {
          .stats-grid-8 { grid-template-columns:repeat(2,1fr); }
          .grade-grid-4 { grid-template-columns:repeat(2,1fr); }
          .consult-detail-grid { grid-template-columns:1fr; }
          .dash-sync-badge { display:none; }
          .dash-right-extra { display:none; }
        }
        @media (max-width:480px) {
          .dash-brand-text p:last-child { display:none; }
          .dash-header { padding:10px 12px; }
        }
        .member-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .member-table-wrap table { min-width:700px; }
        .consult-panel { display:flex; gap:16px; }
        @media (max-width:900px) {
          .consult-panel { flex-direction:column; }
        }
        .filter-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
        .filter-row input, .filter-row select { max-width:none !important; }
      `}</style>

      <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font }}>

        {/* Mobile Nav Overlay */}
        <div className={`mobile-menu-overlay ${mobileNav ? "open" : ""}`}>
          <button className="mobile-close-btn" onClick={() => setMobileNav(false)}>✕</button>
          <Link href="/admin/dashboard" style={{ backgroundColor: "#2563EB", color: "#FFF" }} onClick={() => setMobileNav(false)}>📊 대시보드</Link>
          <Link href="/admin/funds" style={{ backgroundColor: "#334155", color: "#CBD5E1" }} onClick={() => setMobileNav(false)}>💰 자금 관리</Link>
          <Link href="/admin/consultations" style={{ backgroundColor: "#334155", color: "#CBD5E1" }} onClick={() => setMobileNav(false)}>💬 상담 관리</Link>
          <Link href="/admin/accounts" style={{ backgroundColor: "#334155", color: "#CBD5E1" }} onClick={() => setMobileNav(false)}>🔑 계정 관리</Link>
          <button onClick={() => { setMobileNav(false); logout(); }} style={{ width: "100%", padding: "14px 20px", background: "#450A0A", color: "#FCA5A5", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>로그아웃</button>
        </div>

        {/* Header */}
        <div className="dash-header">
          <div className="dash-header-inner">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="dash-brand">
                <img src={LOGO_B64} alt="EF" width={34} height={34} style={{ objectFit: "contain", filter: "invert(1)" }} />
                <div className="dash-brand-text">
                  <p>EMFRONTIER LAB</p>
                  <p>관리자 대시보드</p>
                </div>
              </div>
              <nav className="dash-nav">
                <Link href="/admin/dashboard" className="active">📊 대시보드</Link>
                <Link href="/admin/funds" className="inactive">💰 자금</Link>
                <Link href="/admin/consultations" className="inactive">💬 상담</Link>
                <Link href="/admin/accounts" className="inactive">🔑 계정</Link>
              </nav>
            </div>
            <div className="dash-right">
              <span className="dash-sync-badge">● 실시간 동기화</span>
              <span style={{ fontSize: "11px", color: "#475569" }} className="dash-right-extra">{lastRefresh}</span>
              <button onClick={handleSync} disabled={syncStatus === "syncing"} className="dash-action-btn"
                style={{ backgroundColor: syncStatus === "done" ? "#166534" : syncStatus === "error" ? "#7F1D1D" : "#1D4ED8", color: "#FFF" }}>
                {syncStatus === "syncing" ? "⏳" : syncStatus === "done" ? "✅" : syncStatus === "error" ? "❌" : "☁️"}
                <span className="dash-right-extra"> {syncStatus === "syncing" ? "동기화중" : syncStatus === "done" ? "저장완료" : syncStatus === "error" ? "오류" : "서버저장"}</span>
              </button>
              <button onClick={handleDownload} className="dash-action-btn dash-right-extra" style={{ backgroundColor: "#0F766E", color: "#FFF" }}>📥 백업</button>
              <button onClick={handleUploadRestore} className="dash-action-btn dash-right-extra" style={{ backgroundColor: "#7C3AED", color: "#FFF" }}>📤 복원</button>
              {admin && <span style={{ fontSize: "12px", color: "#94A3B8" }} className="dash-right-extra">{admin.name}</span>}
              <button onClick={logout} className="dash-logout-btn hide-on-mobile">로그아웃</button>
              <button className="hamburger" onClick={() => setMobileNav(true)} aria-label="메뉴">
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "16px 12px" }}>

          {/* Stats */}
          <div className="stats-grid-8">
            {[
              { label: "전체 회원", value: total, color: "#3B82F6", bg: "#1E3A5F", icon: "👥" },
              { label: "신청 완료", value: applied, color: "#A78BFA", bg: "#2E1B5E", icon: "📋" },
              { label: "진행중", value: inProgress, color: "#34D399", bg: "#052E1C", icon: "⚡" },
              { label: "집행완료", value: done, color: "#818CF8", bg: "#1E1B4B", icon: "✅" },
              { label: "상담 전체", value: cTotal, color: "#60A5FA", bg: "#0C2340", icon: "💬" },
              { label: "접수대기", value: cWaiting, color: "#FCD34D", bg: "#1C1A09", icon: "⏳" },
              { label: "상담진행", value: cInProg, color: "#C084FC", bg: "#1C0D30", icon: "🔄" },
              { label: "상담완료", value: cDone, color: "#4ADE80", bg: "#052915", icon: "🎉" },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: "12px", padding: "12px 14px", border: `1px solid ${s.color}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ fontSize: "10px", color: "#94A3B8" }}>{s.label}</p>
                  <span style={{ fontSize: "14px" }}>{s.icon}</span>
                </div>
                <p style={{ fontSize: "24px", fontWeight: "800", color: s.color, marginTop: "4px" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Grade Distribution */}
          <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#CBD5E1", marginBottom: "14px" }}>
              📊 SOHO 등급 분포
            </p>
            <div className="grade-grid-4">
              {gradeCount.map(g => (
                <div key={g.grade} style={{ backgroundColor: "#0F172A", borderRadius: "12px", padding: "14px 16px", border: `1px solid ${g.color}40` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "26px", fontWeight: "900", color: g.color }}>{g.grade}</span>
                    <span style={{ fontSize: "10px", color: g.color, backgroundColor: `${g.color}18`, padding: "3px 7px", borderRadius: "999px", fontWeight: "700" }}>
                      {g.grade === "A" ? "최우수" : g.grade === "B" ? "우량" : g.grade === "C" ? "보통" : "주의"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94A3B8" }}>
                    <span>👥 {g.memberCount}명</span>
                    <span>💬 {g.consultCount}명</span>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "#1E293B", borderRadius: "999px", overflow: "hidden", marginTop: "8px" }}>
                    <div style={{ height: "100%", backgroundColor: g.color, borderRadius: "999px", width: `${total ? Math.round(g.memberCount / total * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: "14px", borderBottom: "2px solid #334155" }}>
            {([
              { key: "members", label: `👥 회원 (${total})` },
              { key: "consultations", label: `💬 상담 (${cTotal})` },
            ] as { key: Tab; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  padding: "10px 20px", fontSize: "14px", fontWeight: "700",
                  border: "none", borderBottom: tab === t.key ? "2px solid #3B82F6" : "2px solid transparent",
                  marginBottom: "-2px", backgroundColor: "transparent",
                  color: tab === t.key ? "#60A5FA" : "#64748B",
                  cursor: "pointer", fontFamily: font,
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Members Tab */}
          {tab === "members" && (
            <>
              <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "12px 16px", marginBottom: "10px" }} className="filter-row">
                <input placeholder="🔍 이름 또는 이메일" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ ...inp, flex: 1, minWidth: "160px" }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                  <option value="전체">전체 상태</option>
                  {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="미신청">미신청</option>
                </select>
                <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                  <option value="전체">전체 등급</option>
                  {["A", "B", "C", "D"].map(g => <option key={g} value={g}>{g}등급</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as "name" | "date" | "grade")} style={{ ...inp, cursor: "pointer" }}>
                  <option value="date">최신순</option>
                  <option value="name">이름순</option>
                  <option value="grade">등급순</option>
                </select>
                <p style={{ fontSize: "12px", color: "#64748B" }}>{filteredUsers.length}/{total}명</p>
              </div>

              <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
                <div className="member-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#0F172A" }}>
                        {["이름", "이메일", "나이/성별", "NICE", "KCB", "연매출", "등급", "신청상태", "가입일", "관리"].map(h => (
                          <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "#475569", fontSize: "14px" }}>
                          {users.length === 0 ? "아직 가입한 회원이 없습니다" : "검색 결과가 없습니다"}
                        </td></tr>
                      ) : filteredUsers.map((u, i) => {
                        const { grade } = calcGrade(u);
                        const gc = gradeColor(grade);
                        const statusC = u.application ? STATUS_COLORS[u.application.status] : null;
                        return (
                          <tr key={u.id} style={{ borderBottom: "1px solid #1A2235", backgroundColor: i % 2 === 0 ? "#1E293B" : "#172032" }}>
                            <td style={{ padding: "11px 12px", fontSize: "13px", fontWeight: "600", color: "#F1F5F9", whiteSpace: "nowrap" }}>{u.name}</td>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8" }}>{u.email}</td>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>{u.age}세/{u.gender}</td>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>{u.nice_score}</td>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>{u.kcb_score}</td>
                            <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>{Number(u.annual_revenue).toLocaleString()}원</td>
                            <td style={{ padding: "11px 12px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "800", color: gc, padding: "3px 7px", borderRadius: "6px", backgroundColor: `${gc}18` }}>{grade}</span>
                            </td>
                            <td style={{ padding: "11px 12px" }}>
                              {u.application && statusC ? (
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 7px", borderRadius: "999px", backgroundColor: statusC.bg, color: statusC.text, border: `1px solid ${statusC.border}`, whiteSpace: "nowrap" }}>
                                  {u.application.status}
                                </span>
                              ) : <span style={{ fontSize: "11px", color: "#475569" }}>미신청</span>}
                            </td>
                            <td style={{ padding: "11px 12px", fontSize: "11px", color: "#64748B", whiteSpace: "nowrap" }}>{u.registeredAt?.split(" ")[0] ?? "-"}</td>
                            <td style={{ padding: "11px 12px" }}>
                              <div style={{ display: "flex", gap: "5px" }}>
                                <Link href={`/admin/clients/${encodeURIComponent(u.id)}`}
                                  style={{ fontSize: "11px", fontWeight: "600", color: "#60A5FA", textDecoration: "none", padding: "4px 8px", borderRadius: "6px", border: "1px solid #1E3A5F", backgroundColor: "#0F172A", whiteSpace: "nowrap" }}>
                                  상세
                                </Link>
                                <button onClick={() => setDeleteConfirm(u.id)}
                                  style={{ fontSize: "11px", color: "#F87171", border: "1px solid #450A0A", backgroundColor: "#1A0505", padding: "4px 7px", borderRadius: "6px", cursor: "pointer" }}>
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Consultations Tab */}
          {tab === "consultations" && (
            <div className="consult-panel">
              {/* Left: List */}
              <div style={{ flex: selectedConsult ? "0 0 min(480px,100%)" : "1", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "12px 14px" }} className="filter-row">
                  <input value={cSearch} onChange={e => setCSearch(e.target.value)} placeholder="🔍 이름/연락처/이메일"
                    style={{ ...inp, flex: 1, minWidth: "150px" }} />
                  <select value={cStatusFilter} onChange={e => setCStatusFilter(e.target.value as ConsultStatus | "")} style={{ ...inp, cursor: "pointer" }}>
                    <option value="">전체 상태</option>
                    {CONSULT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={cGradeFilter} onChange={e => setCGradeFilter(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                    <option value="">전체 등급</option>
                    {["A","B","C","D"].map(g => <option key={g} value={g}>{g}등급</option>)}
                  </select>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>{filteredConsults.length}건</span>
                </div>

                <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
                  {filteredConsults.length === 0 ? (
                    <div style={{ padding: "48px", textAlign: "center" }}>
                      <p style={{ fontSize: "32px", marginBottom: "12px" }}>📭</p>
                      <p style={{ fontSize: "14px", color: "#64748B" }}>상담 신청 내역이 없습니다</p>
                      <Link href="/consult" target="_blank" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none" }}>→ 상담 신청 페이지</Link>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#0F172A" }}>
                            {["접수번호","신청자","연락처","연매출","SOHO","상태","신청일",""].map(h => (
                              <th key={h} style={{ padding: "10px 11px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredConsults.map((c, i) => {
                            const sc = CONSULT_STATUS_COLORS[c.status];
                            const { grade } = calcConsultGrade(c);
                            const gc = gradeColor(grade);
                            const isSelected = selectedConsult?.id === c.id;
                            return (
                              <tr key={c.id} onClick={() => openConsult(c)}
                                style={{ borderBottom: "1px solid #1A2235", backgroundColor: isSelected ? "#0F2540" : i % 2 === 0 ? "#1E293B" : "#172032", cursor: "pointer" }}>
                                <td style={{ padding: "10px 11px", fontSize: "11px", color: "#60A5FA", fontWeight: "700", whiteSpace: "nowrap" }}>{c.id}</td>
                                <td style={{ padding: "10px 11px" }}>
                                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9" }}>{c.name}</p>
                                  <p style={{ fontSize: "10px", color: "#64748B" }}>{c.gender} {c.age}세</p>
                                </td>
                                <td style={{ padding: "10px 11px", fontSize: "12px", color: "#CBD5E1", whiteSpace: "nowrap" }}>{c.phone}</td>
                                <td style={{ padding: "10px 11px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>
                                  {Number(c.annual_revenue) >= 100000000 ? `${(Number(c.annual_revenue)/100000000).toFixed(1)}억` : `${(Number(c.annual_revenue)/10000).toFixed(0)}만`}
                                </td>
                                <td style={{ padding: "10px 11px" }}>
                                  <span style={{ fontSize: "12px", fontWeight: "800", color: gc, padding: "3px 7px", borderRadius: "6px", backgroundColor: `${gc}18` }}>{grade}</span>
                                </td>
                                <td style={{ padding: "10px 11px" }}>
                                  <span style={{ padding: "3px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: "700", backgroundColor: sc.darkBg, color: sc.darkText, border: `1px solid ${sc.border}33`, whiteSpace: "nowrap" }}>{c.status}</span>
                                </td>
                                <td style={{ padding: "10px 11px", fontSize: "11px", color: "#64748B", whiteSpace: "nowrap" }}>{c.createdAt.slice(0, 10)}</td>
                                <td style={{ padding: "10px 11px" }}>
                                  <button onClick={e => { e.stopPropagation(); openConsult(c); }}
                                    style={{ padding: "4px 8px", backgroundColor: "#2563EB", color: "#FFF", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>관리</button>
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
              {selectedConsult && (() => {
                const { grade } = calcConsultGrade(selectedConsult);
                const gc = gradeColor(grade);
                return (
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <div>
                          <p style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px" }}>{selectedConsult.id}</p>
                          <p style={{ fontSize: "17px", fontWeight: "900", color: "#F1F5F9" }}>{selectedConsult.name} 고객</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <div style={{ textAlign: "center", backgroundColor: `${gc}18`, borderRadius: "10px", padding: "6px 12px", border: `2px solid ${gc}60` }}>
                            <p style={{ fontSize: "10px", color: gc, fontWeight: "700" }}>SOHO</p>
                            <p style={{ fontSize: "20px", fontWeight: "900", color: gc }}>{grade}</p>
                          </div>
                          <button onClick={() => setSelectedConsult(null)}
                            style={{ width: "28px", height: "28px", backgroundColor: "#334155", border: "none", borderRadius: "50%", color: "#94A3B8", cursor: "pointer", fontSize: "14px" }}>×</button>
                        </div>
                      </div>

                      <div className="consult-detail-grid">
                        {[
                          ["연락처", selectedConsult.phone], ["이메일", selectedConsult.email],
                          ["나이/성별", `${selectedConsult.age}세 / ${selectedConsult.gender}`],
                          ["업종", selectedConsult.businessType],
                          ["연매출액", `${Number(selectedConsult.annual_revenue).toLocaleString()}원`],
                          ["희망금액", `${Number(selectedConsult.desiredAmount).toLocaleString()}원`],
                          ["기대출", `${Number(selectedConsult.currentDebt).toLocaleString()}원`],
                          ["NICE/KCB", `${selectedConsult.nice_score} / ${selectedConsult.kcb_score}점`],
                        ].map(([k, v]) => (
                          <div key={k} style={{ padding: "8px 10px", backgroundColor: "#0F172A", borderRadius: "8px" }}>
                            <p style={{ fontSize: "10px", color: "#64748B" }}>{k}</p>
                            <p style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "600", marginTop: "2px" }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status management */}
                    <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "18px 20px" }}>
                      <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9", marginBottom: "10px" }}>📊 상담 상태 관리</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
                        {CONSULT_STATUS_LIST.map(s => {
                          const sc = CONSULT_STATUS_COLORS[s];
                          const isActive = cNewStatus === s;
                          return (
                            <button key={s} onClick={() => setCNewStatus(s)}
                              style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", border: `2px solid ${isActive ? sc.border : "#334155"}`, backgroundColor: isActive ? sc.darkBg : "#0F172A", color: isActive ? sc.darkText : "#64748B" }}>
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
                        <div>
                          <label style={{ fontSize: "11px", color: "#94A3B8", display: "block", marginBottom: "4px" }}>담당 매니저</label>
                          <input value={cAssigned} onChange={e => setCAssigned(e.target.value)} placeholder="담당자 이름"
                            style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "11px", color: "#94A3B8", display: "block", marginBottom: "4px" }}>상담 예약일시</label>
                          <input value={cDate} onChange={e => setCDate(e.target.value)} placeholder="예: 2026-04-20 14:00"
                            style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "11px", color: "#94A3B8", display: "block", marginBottom: "4px" }}>관리자 메모</label>
                          <textarea value={cMemo} onChange={e => setCMemo(e.target.value)} rows={3}
                            placeholder="내부 메모..." style={{ ...inp, width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: "1.7" }} />
                        </div>
                      </div>
                      <button onClick={saveConsult}
                        style={{ width: "100%", padding: "11px", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", backgroundColor: cSaved ? "#16A34A" : "#2563EB", color: "#FFF" }}>
                        {cSaved ? "✓ 저장됨" : "💾 저장"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", padding: "28px", maxWidth: "360px", width: "100%", border: "1px solid #334155" }}>
              <p style={{ fontSize: "20px", textAlign: "center", marginBottom: "12px" }}>⚠️</p>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#F1F5F9", textAlign: "center", marginBottom: "8px" }}>회원을 삭제하시겠습니까?</p>
              <p style={{ fontSize: "13px", color: "#94A3B8", textAlign: "center", marginBottom: "24px" }}>
                {users.find(u => u.id === deleteConfirm)?.name}<br />삭제 후 복구할 수 없습니다.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer" }}>취소</button>
                <button onClick={() => handleDeleteUser(deleteConfirm)} style={{ flex: 1, padding: "11px", backgroundColor: "#DC2626", color: "#FFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer" }}>삭제 확인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
