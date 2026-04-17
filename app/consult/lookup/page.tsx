"use client";
import { useState } from "react";
import Link from "next/link";
import { LOGO_B64,
  lookupConsultations, getConsultationById,
  CONSULT_STATUS_LIST, CONSULT_STATUS_COLORS, FONT,
  Consultation,
} from "@/lib/store"; // LOGO_B64 added

const font = FONT;

export default function ConsultLookupPage() {
  const [mode, setMode] = useState<"name" | "id">("name");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consultId, setConsultId] = useState("");
  const [results, setResults] = useState<Consultation[] | null>(null);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError(""); setResults(null); setSelected(null);
    if (mode === "name") {
      if (!name.trim() || !phone.trim()) { setError("이름과 연락처를 모두 입력해주세요."); return; }
    } else {
      if (!consultId.trim()) { setError("접수번호를 입력해주세요."); return; }
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (mode === "name") {
      const list = lookupConsultations(name, phone);
      if (list.length === 0) setError("일치하는 상담 내역이 없습니다. 이름과 연락처를 다시 확인해주세요.");
      else { setResults(list); if (list.length === 1) setSelected(list[0]); }
    } else {
      const c = getConsultationById(consultId.trim());
      if (!c) setError("해당 접수번호의 상담 내역을 찾을 수 없습니다.");
      else { setResults([c]); setSelected(c); }
    }
    setLoading(false);
  };

  const statusProgress = (status: string): number => {
    const idx = CONSULT_STATUS_LIST.indexOf(status as Consultation["status"]);
    return Math.round(((idx + 1) / CONSULT_STATUS_LIST.length) * 100);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4FF", fontFamily: font }}>
      {/* 헤더 */}
      <div style={{ backgroundColor: "#1E3A8A", padding: "0 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "60px" }}>
          <Link href="/consult" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src={LOGO_B64} alt="EMFRONTIER LAB" width={36} height={36} style={{ objectFit: "contain", filter: "invert(1)" }} />
            <div>
              <p style={{ fontSize: "16px", fontWeight: "800", color: "#FFFFFF" }}>EMFRONTIER LAB</p>
              <p style={{ fontSize: "11px", color: "#93C5FD" }}>정책자금 무료 상담 센터</p>
            </div>
          </Link>
          <Link href="/consult" style={{ fontSize: "13px", color: "#BFDBFE", textDecoration: "none", fontFamily: font }}>
            ← 상담 신청
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px 60px" }}>

        {/* 타이틀 */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#1E293B", marginBottom: "8px", fontFamily: font }}>
            📋 상담 현황 조회
          </h1>
          <p style={{ fontSize: "15px", color: "#64748B", fontFamily: font }}>
            접수번호 또는 이름 + 연락처로 상담 진행 현황을 확인하세요
          </p>
        </div>

        {/* 검색 카드 */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", boxShadow: "0 8px 40px rgba(37,99,235,0.10)", border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: "24px" }}>
          {/* 조회 방법 탭 */}
          <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0" }}>
            {(["name", "id"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setResults(null); setSelected(null); setError(""); }}
                style={{
                  flex: 1, padding: "16px", fontSize: "14px", fontWeight: "700",
                  border: "none", cursor: "pointer", fontFamily: font, transition: "all 0.2s",
                  backgroundColor: mode === m ? "#EFF6FF" : "#FFFFFF",
                  color: mode === m ? "#2563EB" : "#9CA3AF",
                  borderBottom: mode === m ? "2px solid #2563EB" : "2px solid transparent",
                }}>
                {m === "name" ? "👤 이름 + 연락처로 조회" : "🔖 접수번호로 조회"}
              </button>
            ))}
          </div>

          <div style={{ padding: "28px 32px" }}>
            {mode === "name" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                    이름 <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="신청 시 입력한 이름" onKeyDown={e => e.key === "Enter" && handleSearch()}
                    style={{ width: "100%", padding: "12px 14px", fontSize: "15px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                    연락처 <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="예: 010-1234-5678 또는 01012345678" onKeyDown={e => e.key === "Enter" && handleSearch()}
                    style={{ width: "100%", padding: "12px 14px", fontSize: "15px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", fontFamily: font }}>
                  접수번호 <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input value={consultId} onChange={e => setConsultId(e.target.value)}
                  placeholder="예: CS-20260417-1234" onKeyDown={e => e.key === "Enter" && handleSearch()}
                  style={{ width: "100%", padding: "12px 14px", fontSize: "15px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px", fontFamily: font }}>
                  접수번호는 상담 신청 완료 후 발급된 번호입니다 (예: CS-20260417-1234)
                </p>
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: "#FEF2F2", borderRadius: "10px", padding: "12px 16px", border: "1px solid #FECACA", marginTop: "16px" }}>
                <p style={{ fontSize: "13px", color: "#EF4444", fontFamily: font }}>⚠️ {error}</p>
              </div>
            )}

            <button onClick={handleSearch} disabled={loading}
              style={{
                width: "100%", marginTop: "20px", padding: "14px",
                backgroundColor: loading ? "#93C5FD" : "#2563EB",
                color: "#FFFFFF", border: "none", borderRadius: "12px",
                fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: font, boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
              }}>
              {loading ? "🔍 조회 중..." : "🔍 조회하기"}
            </button>
          </div>
        </div>

        {/* 복수 결과 선택 */}
        {results && results.length > 1 && !selected && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#374151", fontFamily: font }}>
                총 {results.length}건의 상담 내역이 있습니다. 확인할 상담을 선택하세요.
              </p>
            </div>
            {results.map(c => {
              const sc = CONSULT_STATUS_COLORS[c.status];
              return (
                <div key={c.id} onClick={() => setSelected(c)}
                  style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FFFFFF")}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B", fontFamily: font }}>{c.id}</p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: font, marginTop: "2px" }}>신청일: {c.createdAt}</p>
                  </div>
                  <span style={{ padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontFamily: font }}>
                    {c.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 상세 결과 */}
        {selected && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", boxShadow: "0 8px 40px rgba(37,99,235,0.10)", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            {/* 상태 배너 */}
            {(() => {
              const sc = CONSULT_STATUS_COLORS[selected.status];
              return (
                <div style={{ padding: "24px 32px", backgroundColor: sc.bg, borderBottom: `2px solid ${sc.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "12px", color: "#64748B", fontFamily: font, marginBottom: "4px" }}>접수번호 {selected.id}</p>
                      <p style={{ fontSize: "20px", fontWeight: "900", color: "#1E293B", fontFamily: font }}>{selected.name} 고객님의 상담</p>
                    </div>
                    <span style={{ padding: "8px 18px", borderRadius: "999px", fontSize: "14px", fontWeight: "800", backgroundColor: sc.bg, color: sc.text, border: `2px solid ${sc.border}`, fontFamily: font }}>
                      {selected.status}
                    </span>
                  </div>

                  {/* 진행 바 */}
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      {CONSULT_STATUS_LIST.map(s => {
                        const isCurrent = s === selected.status;
                        const isPast = CONSULT_STATUS_LIST.indexOf(s) <= CONSULT_STATUS_LIST.indexOf(selected.status);
                        const thisSc = CONSULT_STATUS_COLORS[s];
                        return (
                          <div key={s} style={{ textAlign: "center", flex: 1 }}>
                            <div style={{
                              width: "24px", height: "24px", borderRadius: "50%", margin: "0 auto",
                              backgroundColor: isPast ? sc.text : "#E2E8F0",
                              border: isCurrent ? `3px solid ${sc.border}` : "none",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "11px", color: isPast ? "#FFFFFF" : "#9CA3AF",
                              fontWeight: "700",
                            }}>
                              {isPast ? "✓" : "○"}
                            </div>
                            <p style={{ fontSize: "9px", color: isPast ? sc.text : "#9CA3AF", fontWeight: isCurrent ? "800" : "400", marginTop: "4px", fontFamily: font }}>
                              {s}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", backgroundColor: sc.text, borderRadius: "999px", width: `${statusProgress(selected.status)}%`, transition: "width 0.5s" }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 상담 정보 */}
            <div style={{ padding: "24px 32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                {[
                  ["신청자", `${selected.name} (${selected.gender}, ${selected.age}세)`],
                  ["연락처", selected.phone],
                  ["이메일", selected.email],
                  ["업종", `${selected.businessType} · ${selected.businessPeriod}`],
                  ["연매출액", `${Number(selected.annual_revenue).toLocaleString()}원`],
                  ["희망 대출금액", `${Number(selected.desiredAmount).toLocaleString()}원`],
                  ["대출 목적", selected.purposeType],
                  ["NICE / KCB", `${selected.nice_score}점 / ${selected.kcb_score}점`],
                  ["신청 일시", selected.createdAt],
                  ...(selected.updatedAt ? [["최종 업데이트", selected.updatedAt]] : []),
                  ...(selected.assignedTo ? [["담당 매니저", selected.assignedTo]] : []),
                  ...(selected.consultDate ? [["상담 예약일시", selected.consultDate]] : []),
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: font }}>{k}</p>
                    <p style={{ fontSize: "13px", color: "#1E293B", fontWeight: "600", fontFamily: font, marginTop: "2px" }}>{v}</p>
                  </div>
                ))}
              </div>

              {selected.inquiryContent && (
                <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "14px 16px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: font, marginBottom: "6px" }}>문의 내용</p>
                  <p style={{ fontSize: "13px", color: "#374151", fontFamily: font, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{selected.inquiryContent}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                {results && results.length > 1 && (
                  <button onClick={() => setSelected(null)}
                    style={{ flex: 1, padding: "13px", backgroundColor: "#F1F5F9", color: "#64748B", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
                    ← 목록으로
                  </button>
                )}
                <Link href="/consult"
                  style={{ flex: 2, display: "block", textAlign: "center", padding: "13px", backgroundColor: "#2563EB", color: "#FFFFFF", borderRadius: "10px", fontSize: "14px", fontWeight: "700", textDecoration: "none", fontFamily: font }}>
                  🏠 메인으로
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div style={{ backgroundColor: "#1E293B", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font }}>
          © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
        </p>
      </div>
    </div>
  );
}
