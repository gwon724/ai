"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getAllUsers, calcGrade, STATUS_COLORS, STATUS_LIST,
  FONT, UserRecord, deleteUser, getCurrentAdmin, AdminAccount,
  getAllConsultations, updateConsultation,
  CONSULT_STATUS_LIST, CONSULT_STATUS_COLORS, Consultation, ConsultStatus,
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

  // 회원 관련
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [filterGrade, setFilterGrade] = useState("전체");
  const [sortBy, setSortBy] = useState<"name" | "date" | "grade">("date");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 상담 관련
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

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    refresh();
    setDeleteConfirm(null);
  };

  const openConsult = (c: Consultation) => {
    setSelectedConsult(c);
    setCNewStatus(c.status);
    setCMemo(c.adminMemo || "");
    setCAssigned(c.assignedTo || "");
    setCDate(c.consultDate || "");
    setCSaved(false);
  };

  const saveConsult = () => {
    if (!selectedConsult) return;
    updateConsultation(selectedConsult.id, { status: cNewStatus, adminMemo: cMemo, assignedTo: cAssigned, consultDate: cDate });
    setCSaved(true);
    setTimeout(() => setCSaved(false), 2500);
    const fresh = getAllConsultations();
    setConsultations(fresh);
    const updated = fresh.find(c => c.id === selectedConsult.id);
    if (updated) setSelectedConsult(updated);
  };

  // ── 회원 필터 ──
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

  // ── 상담 필터 ──
  const filteredConsults = consultations.filter(c => {
    const q = cSearch.trim().toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    const matchStatus = !cStatusFilter || c.status === cStatusFilter;
    const matchGrade = !cGradeFilter || calcConsultGrade(c).grade === cGradeFilter;
    return matchSearch && matchStatus && matchGrade;
  });

  // ── 통계 ──
  const total = users.length;
  const applied = users.filter(u => u.application).length;
  const pending = users.filter(u => u.application?.status === "접수대기").length;
  const inProgress = users.filter(u => u.application?.status === "진행중").length;
  const done = users.filter(u => u.application?.status === "집행완료").length;
  const rejected = users.filter(u => u.application?.status === "반려").length;

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
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font }}>

      {/* ── 헤더 ── */}
      <div style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155", padding: "14px 24px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: "1500px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Image src="/logo.png" alt="EMFRONTIER LAB" width={34} height={34} style={{ objectFit: "contain", filter: "invert(1)" }} />
              <div>
                <p style={{ fontSize: "16px", fontWeight: "800", color: "#F8FAFC" }}>EMFRONTIER LAB</p>
                <p style={{ fontSize: "11px", color: "#64748B" }}>관리자 대시보드</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", marginLeft: "16px" }}>
              <Link href="/admin/dashboard" style={{ padding: "6px 14px", backgroundColor: "#2563EB", color: "#FFF", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none" }}>
                📊 대시보드
              </Link>
              <Link href="/admin/funds" style={{ padding: "6px 14px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none" }}>
                💰 자금 관리
              </Link>
              <Link href="/admin/consultations" style={{ padding: "6px 14px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none" }}>
                💬 상담 관리
              </Link>
              <Link href="/admin/accounts" style={{ padding: "6px 14px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", borderRadius: "6px", textDecoration: "none" }}>
                🔑 계정 관리
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "#22C55E", backgroundColor: "#052E16", padding: "4px 10px", borderRadius: "999px", border: "1px solid #166534" }}>● 실시간 동기화</span>
            <span style={{ fontSize: "11px", color: "#475569" }}>{lastRefresh}</span>
            {admin && <span style={{ fontSize: "12px", color: "#94A3B8" }}>{admin.name} ({admin.role === "superadmin" ? "슈퍼관리자" : "관리자"})</span>}
            <button onClick={logout} style={{ padding: "7px 16px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "12px", fontWeight: "600", border: "none", borderRadius: "7px", cursor: "pointer", fontFamily: font }}>
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "24px 16px" }}>

        {/* ── 전체 통계 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "전체 회원", value: total, color: "#3B82F6", bg: "#1E3A5F", icon: "👥" },
            { label: "신청 완료", value: applied, color: "#A78BFA", bg: "#2E1B5E", icon: "📋" },
            { label: "회원 진행중", value: inProgress, color: "#34D399", bg: "#052E1C", icon: "⚡" },
            { label: "집행 완료", value: done, color: "#818CF8", bg: "#1E1B4B", icon: "✅" },
            { label: "상담 전체", value: cTotal, color: "#60A5FA", bg: "#0C2340", icon: "💬" },
            { label: "상담 접수대기", value: cWaiting, color: "#FCD34D", bg: "#1C1A09", icon: "⏳" },
            { label: "상담 진행중", value: cInProg, color: "#C084FC", bg: "#1C0D30", icon: "🔄" },
            { label: "상담 완료", value: cDone, color: "#4ADE80", bg: "#052915", icon: "🎉" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${s.color}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontSize: "10px", color: "#94A3B8" }}>{s.label}</p>
                <span style={{ fontSize: "15px" }}>{s.icon}</span>
              </div>
              <p style={{ fontSize: "26px", fontWeight: "800", color: s.color, marginTop: "4px" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── SOHO 등급 분포 (회원 + 상담 통합) ── */}
        <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: "#CBD5E1", marginBottom: "16px" }}>
            📊 SOHO 등급 분포 <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "400" }}>— 회원 & 상담 신청자 통합</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
            {gradeCount.map(g => (
              <div key={g.grade} style={{ backgroundColor: "#0F172A", borderRadius: "12px", padding: "16px 18px", border: `1px solid ${g.color}40` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "28px", fontWeight: "900", color: g.color }}>{g.grade}</span>
                  <span style={{ fontSize: "11px", color: g.color, backgroundColor: `${g.color}18`, padding: "3px 8px", borderRadius: "999px", fontWeight: "700" }}>
                    {g.grade === "A" ? "최우수" : g.grade === "B" ? "우량" : g.grade === "C" ? "보통" : "주의"}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>👥 회원</span>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#F1F5F9" }}>{g.memberCount}명</span>
                    </div>
                    <div style={{ height: "5px", backgroundColor: "#1E293B", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", backgroundColor: g.color, borderRadius: "999px", width: `${total ? Math.round(g.memberCount / total * 100) : 0}%`, transition: "width 0.5s" }} />
                    </div>
                    <p style={{ fontSize: "10px", color: "#475569", marginTop: "2px", textAlign: "right" }}>{total ? Math.round(g.memberCount / total * 100) : 0}%</p>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>💬 상담</span>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#F1F5F9" }}>{g.consultCount}명</span>
                    </div>
                    <div style={{ height: "5px", backgroundColor: "#1E293B", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", backgroundColor: g.color, opacity: 0.55, borderRadius: "999px", width: `${cTotal ? Math.round(g.consultCount / cTotal * 100) : 0}%`, transition: "width 0.5s" }} />
                    </div>
                    <p style={{ fontSize: "10px", color: "#475569", marginTop: "2px", textAlign: "right" }}>{cTotal ? Math.round(g.consultCount / cTotal * 100) : 0}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 탭 ── */}
        <div style={{ display: "flex", gap: "0", marginBottom: "16px", borderBottom: "2px solid #334155" }}>
          {([
            { key: "members", label: `👥 회원 목록 (${total})` },
            { key: "consultations", label: `💬 상담 신청 (${cTotal})` },
          ] as { key: Tab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: "12px 24px", fontSize: "14px", fontWeight: "700",
                border: "none", borderBottom: tab === t.key ? "2px solid #3B82F6" : "2px solid transparent",
                marginBottom: "-2px", backgroundColor: "transparent",
                color: tab === t.key ? "#60A5FA" : "#64748B",
                cursor: "pointer", fontFamily: font, transition: "all 0.2s",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════ 회원 목록 탭 ══════════ */}
        {tab === "members" && (
          <>
            {/* 필터 */}
            <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "14px 18px", marginBottom: "12px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="🔍  이름 또는 이메일 검색..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inp, flex: 1, minWidth: "180px" }} />
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
                <option value="date">최신 가입순</option>
                <option value="name">이름순</option>
                <option value="grade">등급순</option>
              </select>
              <p style={{ fontSize: "12px", color: "#64748B", marginLeft: "auto" }}>{filteredUsers.length} / {total}명</p>
            </div>

            {/* 회원 테이블 */}
            <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0F172A" }}>
                    {["이름", "이메일", "나이/성별", "NICE", "KCB", "연매출액", "SOHO등급", "신청상태", "가입일", "관리"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: "48px", textAlign: "center", color: "#475569", fontSize: "14px" }}>
                      {users.length === 0 ? "아직 가입한 회원이 없습니다" : "검색 결과가 없습니다"}
                    </td></tr>
                  ) : filteredUsers.map((u, i) => {
                    const { grade } = calcGrade(u);
                    const gc = gradeColor(grade);
                    const statusC = u.application ? STATUS_COLORS[u.application.status] : null;
                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #1A2235", backgroundColor: i % 2 === 0 ? "#1E293B" : "#172032" }}>
                        <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: "600", color: "#F1F5F9" }}>
                          {u.name}
                          {u.adminMemo && <span title={u.adminMemo} style={{ marginLeft: "4px", fontSize: "11px", color: "#FBBF24" }}>📝</span>}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94A3B8" }}>{u.email}</td>
                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94A3B8" }}>{u.age}세 / {u.gender}</td>
                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94A3B8" }}>{u.nice_score}점</td>
                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94A3B8" }}>{u.kcb_score}점</td>
                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94A3B8" }}>{Number(u.annual_revenue).toLocaleString()}원</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "800", color: gc, padding: "3px 8px", borderRadius: "6px", backgroundColor: `${gc}18` }}>
                            {grade}등급
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {u.application && statusC ? (
                            <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "999px", backgroundColor: statusC.bg, color: statusC.text, border: `1px solid ${statusC.border}` }}>
                              {u.application.status}
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#475569" }}>미신청</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "11px", color: "#64748B" }}>{u.registeredAt?.split(" ")[0] ?? "-"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <Link href={`/admin/clients/${encodeURIComponent(u.id)}`}
                              style={{ fontSize: "12px", fontWeight: "600", color: "#60A5FA", textDecoration: "none", padding: "5px 10px", borderRadius: "6px", border: "1px solid #1E3A5F", backgroundColor: "#0F172A", whiteSpace: "nowrap" }}>
                              상세 →
                            </Link>
                            <button onClick={() => setDeleteConfirm(u.id)}
                              style={{ fontSize: "12px", color: "#F87171", border: "1px solid #450A0A", backgroundColor: "#1A0505", padding: "5px 8px", borderRadius: "6px", cursor: "pointer" }}>
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
          </>
        )}

        {/* ══════════ 상담 신청 탭 ══════════ */}
        {tab === "consultations" && (
          <div style={{ display: "flex", gap: "16px" }}>

            {/* 왼쪽: 상담 목록 */}
            <div style={{ flex: selectedConsult ? "0 0 520px" : "1", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* 필터 */}
              <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "14px 16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <input value={cSearch} onChange={e => setCSearch(e.target.value)} placeholder="🔍 이름 / 연락처 / 이메일 / 접수번호"
                  style={{ ...inp, flex: 1, minWidth: "180px" }} />
                <select value={cStatusFilter} onChange={e => setCStatusFilter(e.target.value as ConsultStatus | "")} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">전체 상태</option>
                  {CONSULT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={cGradeFilter} onChange={e => setCGradeFilter(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">전체 등급</option>
                  {["A", "B", "C", "D"].map(g => <option key={g} value={g}>{g}등급</option>)}
                </select>
                <span style={{ fontSize: "12px", color: "#64748B" }}>{filteredConsults.length}건</span>
              </div>

              {/* 상담 테이블 */}
              <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
                {filteredConsults.length === 0 ? (
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <p style={{ fontSize: "36px", marginBottom: "12px" }}>📭</p>
                    <p style={{ fontSize: "14px", color: "#64748B" }}>상담 신청 내역이 없습니다</p>
                    <Link href="/consult" target="_blank" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none" }}>→ 상담 신청 페이지</Link>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#0F172A" }}>
                          {["접수번호", "신청자", "연락처", "업종", "연매출", "희망금액", "SOHO", "상태", "신청일", ""].map(h => (
                            <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155", whiteSpace: "nowrap" }}>{h}</th>
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
                            <tr key={c.id}
                              onClick={() => openConsult(c)}
                              style={{ borderBottom: "1px solid #1A2235", backgroundColor: isSelected ? "#0F2540" : i % 2 === 0 ? "#1E293B" : "#172032", cursor: "pointer" }}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "#1A2744"; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#1E293B" : "#172032"; }}>
                              <td style={{ padding: "11px 12px", fontSize: "11px", color: "#60A5FA", fontWeight: "700", whiteSpace: "nowrap" }}>{c.id}</td>
                              <td style={{ padding: "11px 12px" }}>
                                <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9" }}>{c.name}</p>
                                <p style={{ fontSize: "10px", color: "#64748B" }}>{c.gender} {c.age}세</p>
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: "12px", color: "#CBD5E1", whiteSpace: "nowrap" }}>{c.phone}</td>
                              <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8" }}>{c.businessType}</td>
                              <td style={{ padding: "11px 12px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>
                                {Number(c.annual_revenue) >= 100000000
                                  ? `${(Number(c.annual_revenue) / 100000000).toFixed(1)}억`
                                  : `${(Number(c.annual_revenue) / 10000).toFixed(0)}만`}
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: "12px", color: "#A78BFA", fontWeight: "600", whiteSpace: "nowrap" }}>
                                {Number(c.desiredAmount) >= 100000000
                                  ? `${(Number(c.desiredAmount) / 100000000).toFixed(1)}억`
                                  : `${(Number(c.desiredAmount) / 10000).toFixed(0)}만`}
                              </td>
                              <td style={{ padding: "11px 12px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "800", color: gc, padding: "3px 8px", borderRadius: "6px", backgroundColor: `${gc}18` }}>
                                  {grade}
                                </span>
                              </td>
                              <td style={{ padding: "11px 12px" }}>
                                <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", backgroundColor: sc.darkBg, color: sc.darkText, border: `1px solid ${sc.border}33`, whiteSpace: "nowrap" }}>
                                  {c.status}
                                </span>
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: "11px", color: "#64748B", whiteSpace: "nowrap" }}>{c.createdAt.slice(0, 10)}</td>
                              <td style={{ padding: "11px 12px" }}>
                                <button onClick={e => { e.stopPropagation(); openConsult(c); }}
                                  style={{ padding: "4px 10px", backgroundColor: "#2563EB", color: "#FFF", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                                  관리
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

            {/* 오른쪽: 상담 상세 패널 */}
            {selectedConsult && (() => {
              const { grade } = calcConsultGrade(selectedConsult);
              const gc = gradeColor(grade);
              return (
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>

                  {/* 신청자 정보 */}
                  <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px" }}>{selectedConsult.id}</p>
                        <p style={{ fontSize: "18px", fontWeight: "900", color: "#F1F5F9" }}>{selectedConsult.name} 고객</p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {/* SOHO 등급 뱃지 */}
                        <div style={{ textAlign: "center", backgroundColor: `${gc}18`, borderRadius: "10px", padding: "8px 14px", border: `2px solid ${gc}60` }}>
                          <p style={{ fontSize: "10px", color: gc, fontWeight: "700" }}>SOHO</p>
                          <p style={{ fontSize: "22px", fontWeight: "900", color: gc }}>{grade}</p>
                        </div>
                        <button onClick={() => setSelectedConsult(null)}
                          style={{ width: "28px", height: "28px", backgroundColor: "#334155", border: "none", borderRadius: "50%", color: "#94A3B8", cursor: "pointer", fontSize: "14px" }}>×</button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {[
                        ["연락처", selectedConsult.phone],
                        ["이메일", selectedConsult.email],
                        ["나이/성별", `${selectedConsult.age}세 / ${selectedConsult.gender}`],
                        ["업종", `${selectedConsult.businessType} · ${selectedConsult.businessPeriod}`],
                        ["연매출액", `${Number(selectedConsult.annual_revenue).toLocaleString()}원`],
                        ["희망금액", `${Number(selectedConsult.desiredAmount).toLocaleString()}원`],
                        ["기대출", `${Number(selectedConsult.currentDebt).toLocaleString()}원`],
                        ["대출목적", selectedConsult.purposeType],
                        ["NICE점수", `${selectedConsult.nice_score}점`],
                        ["KCB점수", `${selectedConsult.kcb_score}점`],
                        ["신청일시", selectedConsult.createdAt],
                        ...(selectedConsult.updatedAt ? [["최종업데이트", selectedConsult.updatedAt]] : []),
                      ].map(([k, v]) => (
                        <div key={k} style={{ padding: "8px 12px", backgroundColor: "#0F172A", borderRadius: "8px" }}>
                          <p style={{ fontSize: "10px", color: "#64748B" }}>{k}</p>
                          <p style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "600", marginTop: "2px" }}>{v}</p>
                        </div>
                      ))}
                    </div>

                    {selectedConsult.inquiryContent && (
                      <div style={{ marginTop: "10px", padding: "12px 14px", backgroundColor: "#0F172A", borderRadius: "10px", border: "1px solid #334155" }}>
                        <p style={{ fontSize: "10px", color: "#64748B", marginBottom: "4px" }}>문의 내용</p>
                        <p style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{selectedConsult.inquiryContent}</p>
                      </div>
                    )}
                  </div>

                  {/* 상담 상태 관리 */}
                  <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", border: "1px solid #334155", padding: "20px 24px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#F1F5F9", marginBottom: "12px" }}>📊 상담 상태 관리</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                      {CONSULT_STATUS_LIST.map(s => {
                        const sc = CONSULT_STATUS_COLORS[s];
                        const isActive = cNewStatus === s;
                        return (
                          <button key={s} onClick={() => setCNewStatus(s)}
                            style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", border: `2px solid ${isActive ? sc.border : "#334155"}`, backgroundColor: isActive ? sc.darkBg : "#0F172A", color: isActive ? sc.darkText : "#64748B", transition: "all 0.2s" }}>
                            {s}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
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
                      style={{ width: "100%", padding: "12px", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", backgroundColor: cSaved ? "#16A34A" : "#2563EB", color: "#FFF", transition: "background-color 0.3s" }}>
                      {cSaved ? "✓ 저장됨" : "💾 저장"}
                    </button>
                  </div>

                  {/* 상담 사이트 바로가기 */}
                  <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "14px 20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Link href="/consult" target="_blank" style={{ padding: "7px 14px", backgroundColor: "#0F172A", color: "#60A5FA", border: "1px solid #1E3A8A", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>🌐 상담 사이트</Link>
                    <Link href="/admin/consultations" style={{ padding: "7px 14px", backgroundColor: "#0F172A", color: "#A78BFA", border: "1px solid #2E1B5E", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>💬 상담 전체 관리</Link>
                    <Link href="/admin/funds" style={{ padding: "7px 14px", backgroundColor: "#0F172A", color: "#34D399", border: "1px solid #052E1C", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>💰 자금 관리</Link>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── 회원 삭제 모달 ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", padding: "28px", maxWidth: "360px", width: "90%", border: "1px solid #334155" }}>
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
  );
}
