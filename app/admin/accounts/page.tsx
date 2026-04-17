"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LOGO_B64, getAllAdmins, addAdmin, updateAdmin, deleteAdmin, getCurrentAdmin,
  FONT, AdminAccount,
} from "@/lib/store";

const font = FONT;

export default function AdminAccounts() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const [form, setForm] = useState({ username: "", password: "", name: "", role: "admin" as "admin" | "superadmin" });
  const [editForm, setEditForm] = useState({ name: "", password: "", role: "admin" as "admin" | "superadmin" });

  const refresh = useCallback(() => { setAdmins(getAllAdmins()); }, []);

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) { router.push("/admin/login"); return; }
    const me = getCurrentAdmin();
    setCurrentAdmin(me);
    if (me?.role !== "superadmin") { alert("슈퍼 관리자만 접근할 수 있습니다."); router.push("/admin/dashboard"); return; }
    refresh(); setLoading(false);
  }, [router, refresh]);

  const logout = () => { localStorage.removeItem("adminLoggedIn"); localStorage.removeItem("currentAdminId"); router.push("/admin/login"); };
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault(); addAdmin(form); refresh(); setShowAdd(false);
    setForm({ username: "", password: "", name: "", role: "admin" }); flash();
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault(); if (!editTarget) return;
    const patch: Partial<AdminAccount> = { name: editForm.name, role: editForm.role };
    if (editForm.password) patch.password = editForm.password;
    updateAdmin(editTarget.id, patch); refresh(); setEditTarget(null); flash();
  };
  const handleDelete = (id: string) => { deleteAdmin(id); refresh(); setDeleteConfirm(null); };
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: "13px",
    border: "1px solid #334155", borderRadius: "8px",
    backgroundColor: "#0F172A", color: "#F1F5F9",
    outline: "none", fontFamily: font, boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: "600",
    color: "#94A3B8", marginBottom: "6px", fontFamily: font,
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
        .ap-header {
          background-color:#1E293B; border-bottom:1px solid #334155;
          padding:10px 14px; position:sticky; top:0; z-index:10;
        }
        .ap-header-inner {
          max-width:900px; margin:0 auto;
          display:flex; justify-content:space-between; align-items:center; gap:8px;
        }
        .ap-brand { display:flex; align-items:center; gap:8px; min-width:0; overflow:hidden; }
        .ap-brand .t1 { font-size:15px; font-weight:800; color:#F8FAFC; white-space:nowrap; }
        .ap-brand .t2 { font-size:10px; color:#64748B; white-space:nowrap; }
        .ap-nav { display:flex; gap:5px; flex-wrap:wrap; margin-left:8px; }
        .ap-nav a { padding:5px 10px; font-size:11px; font-weight:600; border-radius:6px; text-decoration:none; white-space:nowrap; }
        .ap-right { display:flex; gap:6px; align-items:center; flex-shrink:0; }
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

        /* Table */
        .tbl-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .tbl-scroll table { width:100%; border-collapse:collapse; min-width:380px; }

        @media (max-width:768px) {
          .ap-nav { display:none; }
          .hamburger { display:block; }
          .ap-brand .t2 { display:none; }
        }
        @media (max-width:480px) {
          .col-hide-xs { display:none; }
        }
      `}</style>

      {/* Mobile nav overlay */}
      <div className={`mob-nav ${mobileNav ? "open" : ""}`}>
        <button className="mob-close" onClick={() => setMobileNav(false)}>✕</button>
        <Link href="/admin/dashboard" onClick={() => setMobileNav(false)}>📊 대시보드</Link>
        <Link href="/admin/funds" onClick={() => setMobileNav(false)}>💰 자금 관리</Link>
        <Link href="/admin/consultations" onClick={() => setMobileNav(false)}>💬 상담 관리</Link>
        <Link href="/admin/accounts" style={{ background: "#2563EB", color: "#FFF" }} onClick={() => setMobileNav(false)}>🔑 계정 관리</Link>
      </div>

      <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", fontFamily: font }}>
        {/* Header */}
        <div className="ap-header">
          <div className="ap-header-inner">
            <div style={{ display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" }}>
              <div className="ap-brand">
                <img src={LOGO_B64} alt="EF" width={30} height={30} style={{ objectFit: "contain", filter: "invert(1)", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p className="t1">EMFRONTIER LAB</p>
                  <p className="t2">계정 관리</p>
                </div>
              </div>
              <nav className="ap-nav">
                <Link href="/admin/dashboard" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>👥 회원</Link>
                <Link href="/admin/funds" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>💰 자금</Link>
                <Link href="/admin/consultations" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>💬 상담</Link>
                <Link href="/admin/accounts" style={{ backgroundColor: "#2563EB", color: "#FFF" }}>🔑 계정</Link>
              </nav>
            </div>
            <div className="ap-right">
              {saved && <span style={{ fontSize: "11px", color: "#22C55E", backgroundColor: "#052E16", padding: "3px 8px", borderRadius: "999px" }}>✓ 저장</span>}
              <button onClick={logout} style={{ padding: "6px 12px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "6px", cursor: "pointer" }}>로그아웃</button>
              <button className="hamburger" onClick={() => setMobileNav(true)}><span /><span /><span /></button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "16px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#F1F5F9" }}>관리자 계정 ({admins.length}명)</h2>
            <button onClick={() => setShowAdd(true)}
              style={{ padding: "8px 14px", backgroundColor: "#2563EB", color: "#FFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}>
              + 관리자 추가
            </button>
          </div>

          {/* Admin table */}
          <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden", marginBottom: "12px" }}>
            <div className="tbl-scroll">
              <table>
                <thead>
                  <tr style={{ backgroundColor: "#0F172A" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155" }}>아이디</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155" }}>이름</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155" }}>권한</th>
                    <th className="col-hide-xs" style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155", whiteSpace: "nowrap" }}>생성일</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", borderBottom: "1px solid #334155" }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #1A2235", backgroundColor: i % 2 === 0 ? "#1E293B" : "#172032" }}>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: "600", color: "#F1F5F9", whiteSpace: "nowrap" }}>
                        {a.username}
                        {a.id === currentAdmin?.id && (
                          <span style={{ marginLeft: "5px", fontSize: "10px", color: "#22C55E", backgroundColor: "#052E16", padding: "1px 5px", borderRadius: "3px" }}>나</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", color: "#94A3B8" }}>{a.name}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "999px", backgroundColor: a.role === "superadmin" ? "#2E1B5E" : "#1E293B", color: a.role === "superadmin" ? "#A78BFA" : "#64748B", border: a.role === "superadmin" ? "1px solid #6D28D9" : "1px solid #334155", whiteSpace: "nowrap" }}>
                          {a.role === "superadmin" ? "🔑 슈퍼" : "👤 관리자"}
                        </span>
                      </td>
                      <td className="col-hide-xs" style={{ padding: "10px 12px", fontSize: "11px", color: "#64748B", whiteSpace: "nowrap" }}>{a.createdAt?.split(" ")[0] ?? "-"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => { setEditTarget(a); setEditForm({ name: a.name, password: "", role: a.role }); }}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#60A5FA", border: "1px solid #1E3A5F", backgroundColor: "#0F172A", padding: "3px 7px", borderRadius: "5px", cursor: "pointer" }}>✏️</button>
                          {a.id !== "admin" && (
                            <button onClick={() => setDeleteConfirm(a.id)}
                              style={{ fontSize: "11px", fontWeight: "600", color: "#F87171", border: "1px solid #450A0A", backgroundColor: "#1A0505", padding: "3px 6px", borderRadius: "5px", cursor: "pointer" }}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security notice */}
          <div style={{ backgroundColor: "#1E293B", borderRadius: "10px", border: "1px solid #334155", padding: "12px 14px" }}>
            <p style={{ fontSize: "12px", color: "#64748B", lineHeight: "1.7" }}>
              🔒 <strong style={{ color: "#94A3B8" }}>보안 안내</strong><br />
              • 슈퍼관리자(admin) 계정은 삭제할 수 없습니다.<br />
              • 계정 관리 페이지는 슈퍼관리자만 접근 가능합니다.
            </p>
          </div>
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", padding: "22px", maxWidth: "420px", width: "100%", border: "1px solid #334155", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#F1F5F9", marginBottom: "16px" }}>➕ 관리자 계정 추가</h3>
              <form onSubmit={handleAdd}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <div><label style={lbl}>아이디 *</label><input type="text" required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} style={inp} placeholder="로그인 아이디" /></div>
                  <div><label style={lbl}>비밀번호 *</label><input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={inp} placeholder="비밀번호" /></div>
                  <div><label style={lbl}>이름 *</label><input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="표시 이름" /></div>
                  <div>
                    <label style={lbl}>권한</label>
                    <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as "admin" | "superadmin" }))} style={{ ...inp, cursor: "pointer" }}>
                      <option value="admin">관리자</option><option value="superadmin">슈퍼관리자</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "11px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer" }}>취소</button>
                  <button type="submit" style={{ flex: 1, padding: "11px", backgroundColor: "#2563EB", color: "#FFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer" }}>추가</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editTarget && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
            <div style={{ backgroundColor: "#1E293B", borderRadius: "14px", padding: "22px", maxWidth: "420px", width: "100%", border: "1px solid #334155", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#F1F5F9", marginBottom: "4px" }}>✏️ 계정 수정</h3>
              <p style={{ fontSize: "12px", color: "#64748B", marginBottom: "16px" }}>아이디: <span style={{ color: "#93C5FD" }}>{editTarget.username}</span></p>
              <form onSubmit={handleEdit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <div><label style={lbl}>이름 *</label><input type="text" required value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} style={inp} /></div>
                  <div><label style={lbl}>새 비밀번호 (변경 시에만)</label><input type="password" value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} style={inp} placeholder="변경하지 않으려면 빈칸" /></div>
                  {editTarget.id !== "admin" && (
                    <div>
                      <label style={lbl}>권한</label>
                      <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value as "admin" | "superadmin" }))} style={{ ...inp, cursor: "pointer" }}>
                        <option value="admin">관리자</option><option value="superadmin">슈퍼관리자</option>
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => setEditTarget(null)} style={{ flex: 1, padding: "11px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer" }}>취소</button>
                  <button type="submit" style={{ flex: 1, padding: "11px", backgroundColor: "#2563EB", color: "#FFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer" }}>저장</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
            <div style={{ backgroundColor: "#1E293B", borderRadius: "12px", padding: "24px", maxWidth: "320px", width: "100%", border: "1px solid #334155" }}>
              <p style={{ fontSize: "20px", textAlign: "center", marginBottom: "10px" }}>⚠️</p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#F1F5F9", textAlign: "center", marginBottom: "6px" }}>계정을 삭제하시겠습니까?</p>
              <p style={{ fontSize: "12px", color: "#94A3B8", textAlign: "center", marginBottom: "20px" }}>{admins.find(a => a.id === deleteConfirm)?.username}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", backgroundColor: "#334155", color: "#CBD5E1", fontSize: "13px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer" }}>취소</button>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "10px", backgroundColor: "#DC2626", color: "#FFF", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer" }}>삭제</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
