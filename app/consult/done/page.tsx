"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getConsultationById, updateConsultation,
  getAllFunds, FONT, Consultation, FundProduct,
} from "@/lib/store";

const font = FONT;

/* ── SOHO 등급 계산 (상담 데이터 기반) ─────────────────────── */
function calcConsultGrade(c: Consultation): { grade: string; score: number } {
  let s = 0;
  const nice = Number(c.nice_score) || 0;
  const rev  = Number(c.annual_revenue) || 0;
  const debt = Number(c.currentDebt) || 0;

  if (nice >= 900) s += 40;
  else if (nice >= 800) s += 30;
  else if (nice >= 700) s += 20;
  else if (nice >= 600) s += 10;

  if (rev >= 500000000) s += 30;
  else if (rev >= 200000000) s += 20;
  else if (rev >= 100000000) s += 15;
  else if (rev >= 50000000) s += 8;

  if (debt === 0) s += 20;
  else if (debt < 50000000) s += 15;
  else if (debt < 100000000) s += 10;
  else if (debt < 200000000) s += 5;

  const grade = s >= 75 ? "A" : s >= 55 ? "B" : s >= 35 ? "C" : "D";
  return { grade, score: s };
}

/* ── AI 기업 분석 생성 ──────────────────────────────────────── */
function buildAiAnalysis(c: Consultation, grade: string, score: number) {
  const nice = Number(c.nice_score) || 0;
  const rev  = Number(c.annual_revenue) || 0;
  const debt = Number(c.currentDebt) || 0;
  const age  = Number(c.age) || 0;
  const desired = Number(c.desiredAmount) || 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const risks: string[] = [];

  // 강점
  if (nice >= 800) strengths.push(`신용점수 ${nice}점으로 최상위 등급 — 우대금리 적용 가능`);
  else if (nice >= 700) strengths.push(`신용점수 ${nice}점으로 양호 — 대부분 정책자금 신청 가능`);
  if (rev >= 200000000) strengths.push(`연매출 ${(rev/100000000).toFixed(1)}억원으로 안정적 매출 기반 확보`);
  if (debt === 0) strengths.push("기존 대출 없음 — 신규 대출 한도 최대치 활용 가능");
  else if (debt < 50000000) strengths.push("기대출 규모가 적어 추가 대출 여력 충분");
  if (c.businessPeriod === "5~10년" || c.businessPeriod === "10년 이상") strengths.push(`업력 ${c.businessPeriod}으로 사업 안정성 입증`);
  if (age <= 39) strengths.push(`만 ${age}세 청년 대표자 — 청년 전용 우대 자금 신청 가능`);
  if (strengths.length === 0) strengths.push("정책자금 신청 기본 요건 충족");

  // 약점
  if (nice < 600) weaknesses.push(`신용점수 ${nice}점 — 일부 정책자금 제한, 신용관리 필요`);
  if (rev < 30000000) weaknesses.push("연매출 3천만원 미만 — 매출 기반 대출 한도 낮을 수 있음");
  if (debt > 200000000) weaknesses.push(`기대출 ${(debt/100000000).toFixed(1)}억원 — 추가 대출 한도 제약 가능성`);
  if (c.businessPeriod === "1년 미만") weaknesses.push("업력 1년 미만 — 일부 경영안정자금 신청 제한");
  if (weaknesses.length === 0) weaknesses.push("현재 특별한 제약 요소 없음");

  // 기회
  opportunities.push(`${c.businessType} 업종 맞춤 정책자금 다수 존재`);
  if (c.purposeType === "창업자금") opportunities.push("창업 초기 지원 자금 집중 신청 전략 유효");
  if (c.purposeType === "시설자금") opportunities.push("시설자금은 담보 설정으로 한도 확대 가능");
  if (desired > 0) opportunities.push(`희망 금액 ${(desired/100000000).toFixed(1)}억원, 복수 자금 조합으로 목표 달성 가능`);
  opportunities.push("정부 정책자금 + 보증부대출 병행 전략으로 총 한도 극대화 가능");

  // 리스크
  if (nice < 650) risks.push("신용점수 상승 전 시중은행 일반 대출은 고금리 적용 가능성");
  if (debt > 100000000) risks.push("기대출 과다 시 DSR(총부채원리금상환비율) 제한 주의");
  risks.push("정책자금 신청 증가로 예산 소진 전 조기 신청 권장");
  if (c.businessPeriod === "1년 미만") risks.push("초기 사업장 임대차 계약 안정성 확보 필요");

  // 최대 가능 금액 (추천 자금 최대 합산)
  const allFunds = getAllFunds();
  const recommended = allFunds.filter(f => {
    if (!f.active) return false;
    if (!f.eligibleGrades.includes(grade)) return false;
    if (Number(f.minRevenue) > 0 && rev < Number(f.minRevenue)) return false;
    if (Number(f.minCreditScore) > 0 && nice < Number(f.minCreditScore)) return false;
    if (Number(f.maxDebt) > 0 && debt > Number(f.maxDebt)) return false;
    return true;
  });

  const maxAmount = recommended.reduce((sum, f) => sum + Number(f.maxAmount), 0);

  const gradeLabel: Record<string, string> = { A: "최우수", B: "우수", C: "보통", D: "기초" };
  const summary =
    `SOHO 등급 ${grade}(${gradeLabel[grade]}) · ${score}점. ` +
    `${c.businessType} ${c.businessPeriod} 사업체 기준 총 ${recommended.length}개 정책자금 신청 가능. ` +
    `신용점수 ${nice}점, 연매출 ${rev >= 100000000 ? (rev/100000000).toFixed(1)+"억" : (rev/10000).toFixed(0)+"만"}원 기준 ` +
    `최대 ${maxAmount >= 100000000 ? (maxAmount/100000000).toFixed(0)+"억원" : (maxAmount/10000).toFixed(0)+"만원"} 규모 자금 활용 가능.`;

  return {
    sohoGrade: grade,
    sohoScore: score,
    summary,
    strengths,
    weaknesses,
    opportunities,
    risks,
    totalRecommended: recommended.length,
    maxPossibleAmount: String(maxAmount),
  };
}

/* ── 등급 색상 ──────────────────────────────────────────────── */
const GRADE_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC", label: "최우수" },
  B: { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD", label: "우수" },
  C: { bg: "#FEF9C3", text: "#92400E", border: "#FDE68A", label: "보통" },
  D: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5", label: "기초" },
};

const CAT_ICONS: Record<string, string> = {
  운전자금: "💰", 시설자금: "🏗️", 긴급자금: "🚨", 성장지원: "📈",
  창업지원: "🚀", 보증부대출: "🛡️", 이차보전: "💹", 기타: "📋",
};

export default function ConsultDonePage() {
  const router = useRouter();
  const [consult, setConsult] = useState<Consultation | null>(null);
  const [allFunds, setAllFunds] = useState<FundProduct[]>([]);
  const [recommended, setRecommended] = useState<FundProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [analysis, setAnalysis] = useState<NonNullable<Consultation["aiAnalysis"]> | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterCat, setFilterCat] = useState("전체");
  const [tab, setTab] = useState<"analysis" | "recommend" | "all">("analysis");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const id = localStorage.getItem("lastConsultId");
    if (!id) { router.replace("/consult"); return; }
    const c = getConsultationById(id);
    if (!c) { router.replace("/consult"); return; }

    const funds = getAllFunds();
    setAllFunds(funds);
    setConsult(c);

    const { grade, score } = calcConsultGrade(c);
    const ai = buildAiAnalysis(c, grade, score);
    setAnalysis(ai);

    // 추천 자금 필터링
    const nice = Number(c.nice_score) || 0;
    const rev  = Number(c.annual_revenue) || 0;
    const debt = Number(c.currentDebt) || 0;
    const rec = funds.filter(f => {
      if (!f.active) return false;
      if (!f.eligibleGrades.includes(grade)) return false;
      if (Number(f.minRevenue) > 0 && rev < Number(f.minRevenue)) return false;
      if (Number(f.minCreditScore) > 0 && nice < Number(f.minCreditScore)) return false;
      if (Number(f.maxDebt) > 0 && debt > Number(f.maxDebt)) return false;
      return true;
    });
    setRecommended(rec);

    // 기존 선택 복원
    if (c.selectedFundIds && c.selectedFundIds.length > 0) {
      setSelected(new Set(c.selectedFundIds));
    }

    // AI 분석 저장
    if (!c.aiAnalysis) {
      updateConsultation(c.id, {
        aiAnalysis: ai,
        recommendedFundIds: rec.map(f => f.id),
      });
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    if (!consult) return;
    updateConsultation(consult.id, { selectedFundIds: Array.from(selected) });
    setSaved(true);
  };

  const handleCopy = () => {
    if (!consult) return;
    navigator.clipboard.writeText(consult.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayFunds = tab === "recommend"
    ? recommended
    : tab === "all"
      ? allFunds.filter(f => f.active)
      : [];

  const filteredFunds = filterCat === "전체"
    ? displayFunds
    : displayFunds.filter(f => f.category === filterCat);

  const selectedFunds = allFunds.filter(f => selected.has(f.id));
  const totalSelected = selectedFunds.reduce((s, f) => s + Number(f.maxAmount), 0);

  const categories = ["전체", ...Array.from(new Set(displayFunds.map(f => f.category)))];

  if (!consult || !analysis) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚙️</div>
        <p style={{ fontFamily: font, color: "#64748B", fontSize: "16px" }}>AI 분석 중...</p>
      </div>
    </div>
  );

  const gs = GRADE_STYLE[analysis.sohoGrade] || GRADE_STYLE.D;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4FF", fontFamily: font }}>

      {/* 헤더 */}
      <div style={{ backgroundColor: "#1E3A8A", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image src="/logo.png" alt="EMFRONTIER LAB" width={36} height={36} style={{ objectFit: "contain", filter: "invert(1)" }} />
            <div>
              <p style={{ fontSize: "16px", fontWeight: "800", color: "#FFFFFF" }}>EMFRONTIER LAB</p>
              <p style={{ fontSize: "11px", color: "#93C5FD" }}>AI 기업분석 & 정책자금 추천</p>
            </div>
          </div>
          <Link href="/consult" style={{ fontSize: "13px", color: "#BFDBFE", textDecoration: "none" }}>홈으로</Link>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── 상단: 접수 완료 + 접수번호 ── */}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 24px rgba(37,99,235,0.10)", marginBottom: "24px" }}>
          <div style={{ background: "linear-gradient(135deg, #1E3A8A, #2563EB)", padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "13px", color: "#BFDBFE", marginBottom: "4px" }}>✅ 상담 신청 완료</p>
              <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", marginBottom: "6px" }}>AI 기업분석 결과</h1>
              <p style={{ fontSize: "13px", color: "#93C5FD" }}>신청 정보를 바탕으로 최적의 정책자금을 분석했습니다</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#BFDBFE", marginBottom: "4px" }}>접수번호</p>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "#fff", letterSpacing: "0.05em" }}>{consult.id}</p>
              </div>
              <button onClick={handleCopy} style={{ padding: "10px 14px", backgroundColor: copied ? "#16A34A" : "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                {copied ? "✓ 복사됨" : "📋 복사"}
              </button>
            </div>
          </div>
        </div>

        {/* ── 탭 메뉴 ── */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto" }}>
          {([
            { key: "analysis", label: "🧠 AI 기업분석", desc: "SWOT 분석" },
            { key: "recommend", label: `⭐ 추천 자금 (${recommended.length}개)`, desc: "AI 맞춤 추천" },
            { key: "all", label: `📋 전체 자금 (${allFunds.filter(f=>f.active).length}개)`, desc: "직접 선택" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: "12px 20px", borderRadius: "12px", border: "none", cursor: "pointer",
                backgroundColor: tab === t.key ? "#2563EB" : "#fff",
                color: tab === t.key ? "#fff" : "#374151",
                fontFamily: font, fontWeight: "700", fontSize: "14px",
                boxShadow: tab === t.key ? "0 4px 12px rgba(37,99,235,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ AI 기업분석 탭 ══ */}
        {tab === "analysis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* SOHO 등급 카드 */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "13px", color: "#64748B", fontWeight: "600", marginBottom: "16px" }}>🏅 SOHO 신용등급</p>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: gs.bg, border: `4px solid ${gs.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "36px", fontWeight: "900", color: gs.text }}>{analysis.sohoGrade}</span>
                  <span style={{ fontSize: "10px", color: gs.text, fontWeight: "700" }}>{gs.label}</span>
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <p style={{ fontSize: "15px", fontWeight: "800", color: "#1E293B", marginBottom: "8px" }}>
                    {gs.label} 등급 · {analysis.sohoScore}점
                  </p>
                  <p style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.6", marginBottom: "12px" }}>
                    {analysis.summary}
                  </p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ backgroundColor: "#EFF6FF", borderRadius: "8px", padding: "8px 14px", textAlign: "center" }}>
                      <p style={{ fontSize: "11px", color: "#3B82F6" }}>추천 자금</p>
                      <p style={{ fontSize: "18px", fontWeight: "900", color: "#1D4ED8" }}>{analysis.totalRecommended}개</p>
                    </div>
                    <div style={{ backgroundColor: "#F0FDF4", borderRadius: "8px", padding: "8px 14px", textAlign: "center" }}>
                      <p style={{ fontSize: "11px", color: "#16A34A" }}>최대 가능 금액</p>
                      <p style={{ fontSize: "18px", fontWeight: "900", color: "#166534" }}>
                        {Number(analysis.maxPossibleAmount) >= 100000000
                          ? (Number(analysis.maxPossibleAmount)/100000000).toFixed(0)+"억↑"
                          : (Number(analysis.maxPossibleAmount)/10000).toFixed(0)+"만"}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 점수 바 */}
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>종합 점수</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: gs.text }}>{analysis.sohoScore} / 90점</span>
                </div>
                <div style={{ height: "10px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (analysis.sohoScore/90)*100)}%`, backgroundColor: gs.border, borderRadius: "999px", transition: "width 1s ease" }} />
                </div>
              </div>
            </div>

            {/* SWOT 분석 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { title: "💪 강점 (Strength)", items: analysis.strengths, bg: "#F0FDF4", border: "#86EFAC", titleColor: "#166534" },
                { title: "⚠️ 약점 (Weakness)", items: analysis.weaknesses, bg: "#FFF7ED", border: "#FED7AA", titleColor: "#C2410C" },
                { title: "🚀 기회 (Opportunity)", items: analysis.opportunities, bg: "#EFF6FF", border: "#BFDBFE", titleColor: "#1D4ED8" },
                { title: "🔴 리스크 (Risk)", items: analysis.risks, bg: "#FEF2F2", border: "#FCA5A5", titleColor: "#DC2626" },
              ].map(sw => (
                <div key={sw.title} style={{ backgroundColor: sw.bg, border: `1px solid ${sw.border}`, borderRadius: "14px", padding: "16px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "800", color: sw.titleColor, marginBottom: "10px" }}>{sw.title}</p>
                  {sw.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "10px", color: sw.titleColor, marginTop: "3px", flexShrink: 0 }}>●</span>
                      <span style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 신청 정보 요약 */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "13px", color: "#64748B", fontWeight: "600", marginBottom: "14px" }}>📋 신청 정보</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  ["신청자", `${consult.name} (${consult.gender}, ${consult.age}세)`],
                  ["연락처", consult.phone],
                  ["업종", consult.businessType],
                  ["사업 기간", consult.businessPeriod],
                  ["연매출액", `${Number(consult.annual_revenue).toLocaleString()}원`],
                  ["희망 대출", `${Number(consult.desiredAmount).toLocaleString()}원`],
                  ["대출 목적", consult.purposeType],
                  ["NICE / KCB", `${consult.nice_score}점 / ${consult.kcb_score}점`],
                  ["기대출 합계", `${Number(consult.currentDebt).toLocaleString()}원`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: "8px", padding: "8px 12px", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#9CA3AF", flexShrink: 0, width: "80px" }}>{k}</span>
                    <span style={{ fontSize: "12px", color: "#1E293B", fontWeight: "600" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setTab("recommend")}
              style={{ width: "100%", padding: "16px", backgroundColor: "#2563EB", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: "pointer" }}>
              ⭐ AI 추천 자금 보기 ({recommended.length}개) →
            </button>
          </div>
        )}

        {/* ══ 추천 자금 / 전체 자금 탭 공통 ══ */}
        {(tab === "recommend" || tab === "all") && (
          <div>
            {/* 안내 배너 */}
            <div style={{ backgroundColor: tab === "recommend" ? "#EFF6FF" : "#F0FDF4", border: `1px solid ${tab === "recommend" ? "#BFDBFE" : "#86EFAC"}`, borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>{tab === "recommend" ? "⭐" : "📋"}</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "700", color: tab === "recommend" ? "#1D4ED8" : "#166534" }}>
                  {tab === "recommend"
                    ? `AI가 ${consult.name}님의 조건에 맞는 자금 ${recommended.length}개를 선별했습니다`
                    : `전체 활성 자금 ${allFunds.filter(f=>f.active).length}개 중 원하는 자금을 직접 선택하세요`}
                </p>
                <p style={{ fontSize: "12px", color: "#64748B" }}>체크박스로 원하는 자금을 선택 후 "선택 저장" 버튼을 누르세요</p>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  style={{
                    padding: "6px 14px", borderRadius: "999px", border: "none", cursor: "pointer",
                    backgroundColor: filterCat === cat ? "#2563EB" : "#fff",
                    color: filterCat === cat ? "#fff" : "#374151",
                    fontSize: "12px", fontWeight: "600",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}>
                  {cat === "전체" ? `전체 (${displayFunds.length})` : `${CAT_ICONS[cat] || ""}${cat}`}
                </button>
              ))}
            </div>

            {/* 선택 현황 바 */}
            {selected.size > 0 && (
              <div style={{ backgroundColor: "#1E3A8A", borderRadius: "12px", padding: "12px 18px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "13px", color: "#BFDBFE" }}>선택한 자금: </span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{selected.size}개</span>
                  <span style={{ fontSize: "13px", color: "#BFDBFE", marginLeft: "12px" }}>최대 합산 한도: </span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#34D399" }}>
                    {totalSelected >= 100000000
                      ? (totalSelected/100000000).toFixed(0)+"억원↑"
                      : (totalSelected/10000).toFixed(0)+"만원"}
                  </span>
                </div>
                <button onClick={handleSave}
                  style={{ padding: "8px 20px", backgroundColor: saved ? "#16A34A" : "#F59E0B", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}>
                  {saved ? "✓ 저장됨" : "💾 선택 저장"}
                </button>
              </div>
            )}

            {/* 자금 카드 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredFunds.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8", backgroundColor: "#fff", borderRadius: "12px" }}>
                  해당 조건의 자금이 없습니다
                </div>
              )}
              {filteredFunds.map(fund => {
                const isSelected = selected.has(fund.id);
                const isExpanded = expandedId === fund.id;
                return (
                  <div key={fund.id}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "14px",
                      border: isSelected ? "2px solid #2563EB" : "1px solid #E2E8F0",
                      overflow: "hidden",
                      boxShadow: isSelected ? "0 4px 16px rgba(37,99,235,0.15)" : "0 1px 6px rgba(0,0,0,0.06)",
                      transition: "all 0.2s",
                    }}>
                    <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
                      {/* 체크박스 */}
                      <button onClick={() => toggleSelect(fund.id)}
                        style={{
                          width: "28px", height: "28px", borderRadius: "8px", border: "none", cursor: "pointer",
                          backgroundColor: isSelected ? "#2563EB" : "#E2E8F0",
                          color: "#fff", fontSize: "16px", fontWeight: "700", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        {isSelected ? "✓" : ""}
                      </button>

                      {/* 등급 배지 */}
                      <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                        {fund.eligibleGrades.map(g => (
                          <span key={g} style={{
                            width: "20px", height: "20px", borderRadius: "4px", fontSize: "10px", fontWeight: "800",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: GRADE_STYLE[g]?.bg, color: GRADE_STYLE[g]?.text, border: `1px solid ${GRADE_STYLE[g]?.border}`,
                          }}>{g}</span>
                        ))}
                      </div>

                      {/* 자금 정보 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B" }}>{fund.name}</p>
                          <span style={{ fontSize: "11px", color: "#64748B", backgroundColor: "#F1F5F9", padding: "2px 8px", borderRadius: "999px" }}>
                            {CAT_ICONS[fund.category] || ""} {fund.category}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                          {fund.institution} · 최대 {Number(fund.maxAmount) >= 100000000
                            ? (Number(fund.maxAmount)/100000000).toFixed(0)+"억원"
                            : (Number(fund.maxAmount)/10000).toFixed(0)+"만원"} · {fund.interestRate}
                        </p>
                      </div>

                      {/* 상세보기 토글 */}
                      <button onClick={() => setExpandedId(isExpanded ? null : fund.id)}
                        style={{ padding: "6px 12px", backgroundColor: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", color: "#64748B", fontWeight: "600", flexShrink: 0 }}>
                        {isExpanded ? "접기 ▲" : "상세 ▼"}
                      </button>
                    </div>

                    {/* 상세 정보 */}
                    {isExpanded && (
                      <div style={{ padding: "0 18px 18px", borderTop: "1px solid #F1F5F9" }}>
                        <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "14px", marginTop: "12px" }}>
                          <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" }}>{fund.description}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                            {[
                              ["최대 한도", Number(fund.maxAmount) >= 100000000 ? (Number(fund.maxAmount)/100000000).toFixed(0)+"억원" : (Number(fund.maxAmount)/10000).toFixed(0)+"만원"],
                              ["금리", fund.interestRate],
                              ["기간", fund.period],
                              ["최소 연매출", fund.minRevenue === "0" ? "제한없음" : (Number(fund.minRevenue)/10000).toFixed(0)+"만원↑"],
                              ["최소 신용점수", fund.minCreditScore === "0" ? "제한없음" : fund.minCreditScore+"점↑"],
                              ["적용 등급", fund.eligibleGrades.join(" / ")],
                            ].map(([k, v]) => (
                              <div key={k} style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "8px 10px" }}>
                                <p style={{ fontSize: "10px", color: "#9CA3AF", marginBottom: "2px" }}>{k}</p>
                                <p style={{ fontSize: "12px", fontWeight: "700", color: "#1E293B" }}>{v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => toggleSelect(fund.id)}
                          style={{
                            width: "100%", marginTop: "10px", padding: "10px",
                            backgroundColor: isSelected ? "#EF4444" : "#2563EB",
                            color: "#fff", border: "none", borderRadius: "8px",
                            fontSize: "13px", fontWeight: "700", cursor: "pointer",
                          }}>
                          {isSelected ? "✕ 선택 해제" : "✓ 이 자금 선택하기"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 하단 저장 버튼 */}
            {selected.size > 0 && (
              <div style={{ position: "sticky", bottom: "16px", marginTop: "20px" }}>
                <div style={{ backgroundColor: "#1E293B", borderRadius: "16px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  <div>
                    <p style={{ fontSize: "13px", color: "#94A3B8" }}>선택 완료: <span style={{ color: "#fff", fontWeight: "800" }}>{selected.size}개 자금</span></p>
                    <p style={{ fontSize: "12px", color: "#64748B" }}>합산 최대 {totalSelected >= 100000000 ? (totalSelected/100000000).toFixed(0)+"억원↑" : (totalSelected/10000).toFixed(0)+"만원"}</p>
                  </div>
                  <button onClick={handleSave}
                    style={{ padding: "12px 28px", backgroundColor: saved ? "#16A34A" : "#F59E0B", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
                    {saved ? "✓ 저장 완료!" : "💾 선택 저장하기"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 선택한 자금 요약 (always show if selected) ── */}
        {selected.size > 0 && tab === "analysis" && (
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "20px", marginTop: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B", marginBottom: "12px" }}>
              💾 선택한 자금 ({selected.size}개)
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedFunds.map(f => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#1D4ED8" }}>{f.name}</p>
                    <p style={{ fontSize: "11px", color: "#64748B" }}>{f.institution} · {f.interestRate}</p>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: "800", color: "#1D4ED8" }}>
                    최대 {Number(f.maxAmount) >= 100000000 ? (Number(f.maxAmount)/100000000).toFixed(0)+"억" : (Number(f.maxAmount)/10000).toFixed(0)+"만"}원
                  </p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", padding: "12px 14px", backgroundColor: "#F0FDF4", borderRadius: "8px", border: "1px solid #86EFAC", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>합산 최대 금액</span>
              <span style={{ fontSize: "15px", fontWeight: "900", color: "#16A34A" }}>
                {totalSelected >= 100000000 ? (totalSelected/100000000).toFixed(0)+"억원↑" : (totalSelected/10000).toFixed(0)+"만원"}
              </span>
            </div>
          </div>
        )}

        {/* ── 하단 버튼 ── */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Link href="/consult/lookup"
            style={{ flex: 1, display: "block", textAlign: "center", padding: "14px", backgroundColor: "#fff", color: "#2563EB", border: "2px solid #2563EB", borderRadius: "12px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>
            📋 상담 현황 조회
          </Link>
          <Link href="/consult"
            style={{ flex: 1, display: "block", textAlign: "center", padding: "14px", backgroundColor: "#2563EB", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>
            🏠 홈으로
          </Link>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{ backgroundColor: "#1E293B", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font }}>© 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved</p>
      </div>
    </div>
  );
}
