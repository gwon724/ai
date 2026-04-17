"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FONT } from "@/lib/store";

const font = FONT;

/* ── 카운트업 훅 ─────────────────────────── */
function useCountUp(target: number, duration = 1800, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return val;
}

/* ── 후기 데이터 ─────────────────────────── */
const REVIEWS = [
  { name: "김○○ 대표", type: "음식점", text: "정말 전문가에게 맡기길 잘했어요! 혼자 알아보다 복잡해서 포기할 뻔했는데, 처음부터 끝까지 친절하게 설명해주시고 맞춤 자금까지 제시해 주셨어요.", grade: "A", amount: "7,000만원" },
  { name: "이○○ 대표", type: "도소매업", text: "다른 곳에서 거절 당하고 왔는데 승인됐어요! 신용등급이 낮아서 은행에서 두 번이나 거절당했는데, 제 상황에 맞는 정책자금을 찾아주셔서 결국 승인까지 받았습니다.", grade: "D", amount: "3,000만원" },
  { name: "박○○ 대표", type: "카페 창업", text: "창업한 지 6개월도 안 됐는데 이런 게 가능할지 반신반의했어요. 담당 컨설턴트님이 창업 지원자금을 찾아주셔서 카페 인테리어 비용을 충당할 수 있었습니다!", grade: "C", amount: "5,000만원" },
  { name: "최○○ 대표", type: "제조업", text: "기대출이 있어도 추가로 받을 수 있었어요! 이미 대출이 있어서 무조건 안 된다고 생각했는데, 기대출 미적용 상품을 먼저 안내해주셔서 원하는 금액보다 더 많이 승인받았습니다.", grade: "B", amount: "1억 2,000만원" },
  { name: "정○○ 대표", type: "서비스업", text: "솔루션 받은대로 진행되서 놀랐어요. 사업자번호랑 몇 가지 정보만 알려드리니까 맞춤 솔루션을 바로 제공해주셔서 자금 실행까지 순조롭게 마무리됐습니다.", grade: "B", amount: "8,000만원" },
  { name: "강○○ 대표", type: "IT 스타트업", text: "비대면 진행이라 부담 없고 빠르게 끝났어요. 매장 운영하면서 따로 시간 내기 어려웠는데, 대부분 비대면으로 진행돼서 한 달도 안 돼서 자금 집행까지 완료됐습니다.", grade: "A", amount: "2억원" },
];

const GRADE_C: Record<string, string> = { A: "#16A34A", B: "#2563EB", C: "#D97706", D: "#DC2626" };

export default function ConsultPage() {
  const router = useRouter();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [floatVisible, setFloatVisible] = useState(false);

  /* 카운트업 */
  const c1 = useCountUp(97, 1600, statsVisible);
  const c2 = useCountUp(1000, 2000, statsVisible);
  const c3 = useCountUp(96, 1600, statsVisible);
  const c4 = useCountUp(500, 2200, statsVisible);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setFloatVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setReviewIdx(i => (i + 1) % REVIEWS.length), 4200);
    return () => clearInterval(t);
  }, []);

  const goSurvey = () => router.push("/consult/survey");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: font, overflowX: "hidden" }}>

      {/* ══ 헤더 ══ */}
      <header style={{ backgroundColor: "#0A1628", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #1E2D47" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image src="/logo.png" alt="EMFRONTIER LAB 로고" width={40} height={40} style={{ objectFit: "contain", filter: "invert(1)" }} />
            <div>
              <p style={{ fontSize: "17px", fontWeight: "900", color: "#FFFFFF", letterSpacing: "0.04em" }}>EMFRONTIER LAB</p>
              <p style={{ fontSize: "10px", color: "#60A5FA", letterSpacing: "0.08em" }}>정책자금 전문 컨설팅</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/consult/lookup" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none", fontFamily: font }}>상담 조회</Link>
            <Link href="/client/login" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none", fontFamily: font }}>회원 로그인</Link>
            <button onClick={goSurvey}
              style={{ padding: "9px 20px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: font }}>
              무료 상담 신청
            </button>
          </div>
        </div>
      </header>

      {/* ══ 히어로 ══ */}
      <section style={{ background: "linear-gradient(160deg, #0A1628 0%, #0D2244 45%, #112D5E 100%)", padding: "80px 24px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: "48px", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)", borderRadius: "999px", padding: "6px 16px", marginBottom: "24px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} />
              <span style={{ fontSize: "12px", color: "#60A5FA", fontWeight: "700", letterSpacing: "0.05em" }}>🔥 지금 바로 무료 상담 가능</span>
            </div>

            <h1 style={{ fontSize: "44px", fontWeight: "900", color: "#FFFFFF", lineHeight: "1.2", marginBottom: "20px" }}>
              사업자금이 필요한데,<br />
              <span style={{ color: "#60A5FA" }}>"나도 가능할까"</span><br />
              고민되시나요?
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
              {["매출이 낮아도!!", "신용 점수가 낮아도!!", "사업 기간이 짧아도!!", "기존 대출이 있어도!!", "승인이 거절되었어도!!"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: "900", color: "#FFFFFF" }}>✓</span>
                  <span style={{ fontSize: "17px", fontWeight: "700", color: "#E2E8F0" }}>{t}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "22px", fontWeight: "900", color: "#FCD34D", marginBottom: "32px" }}>
              사업자라면 모두 상담 가능합니다!!
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={goSurvey}
                style={{ padding: "16px 36px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "17px", fontWeight: "900", cursor: "pointer", fontFamily: font, boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}>
                지금 무료 상담 신청하기 →
              </button>
              <Link href="/consult/lookup"
                style={{ padding: "16px 28px", backgroundColor: "rgba(255,255,255,0.1)", color: "#E2E8F0", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "15px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center" }}>
                상담 현황 조회
              </Link>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "16px" }}>
              ※ 상담비 0원 &nbsp;·&nbsp; 24시간 신청 가능 &nbsp;·&nbsp; 개인정보 안전 보호
            </p>
          </div>

          {/* 신뢰 뱃지 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "200px" }}>
            {[
              { icon: "🏢", title: "경영컨설팅업", desc: "정식 등록" },
              { icon: "📅", title: "2024년 설립", desc: "법인회사" },
              { icon: "🔒", title: "보이스피싱 NO", desc: "사기 NO" },
              { icon: "📞", title: "전국 무료 상담", desc: "비대면 가능" },
            ].map(b => (
              <div key={b.title} style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>{b.icon}</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "800", color: "#FFFFFF", fontFamily: font }}>{b.title}</p>
                  <p style={{ fontSize: "11px", color: "#64748B", fontFamily: font }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 숫자 통계 (승인율 97%, 연간 1000+, 만족도 96%, 500억+) ══ */}
      <section ref={statsRef} style={{ backgroundColor: "#0A1628", padding: "64px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#60A5FA", letterSpacing: "0.12em", marginBottom: "40px", fontFamily: font }}>PROVEN RESULTS</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", backgroundColor: "#1E2D47", borderRadius: "20px", overflow: "hidden" }}>
            {[
              { val: c1, suffix: "%", label: "사업자금 승인율", icon: "✅", color: "#10B981", sub: "타사 대비 최고 수준" },
              { val: c2, suffix: "+", label: "연간 상담 건수", icon: "💬", color: "#60A5FA", sub: "매년 꾸준히 증가 중" },
              { val: c3, suffix: "%", label: "고객 만족도", icon: "⭐", color: "#FBBF24", sub: "실제 이용 고객 평가" },
              { val: c4, suffix: "억+", label: "누적 자금 조달 총액", icon: "💰", color: "#F87171", sub: "2024년 설립 이후 누적" },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: "#0A1628", padding: "40px 24px", textAlign: "center" }}>
                <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>{s.icon}</span>
                <p style={{ fontSize: "52px", fontWeight: "900", color: s.color, fontFamily: font, lineHeight: 1, marginBottom: "8px" }}>
                  {s.val.toLocaleString()}{s.suffix}
                </p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#E2E8F0", fontFamily: font, marginBottom: "4px" }}>{s.label}</p>
                <p style={{ fontSize: "11px", color: "#475569", fontFamily: font }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 왜 혼자 하면 안 되나요? ══ */}
      <section style={{ padding: "80px 24px", backgroundColor: "#F8FAFC" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#2563EB", letterSpacing: "0.1em", marginBottom: "12px", fontFamily: font }}>WHY PROFESSIONAL</p>
            <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0A1628", marginBottom: "16px", fontFamily: font, lineHeight: "1.2" }}>
              혼자 하면 왜<br />실패하는 걸까요?
            </h2>
            <p style={{ fontSize: "16px", color: "#64748B", fontFamily: font }}>사업자금은 전략 없이 접근하면 오히려 기회를 잃게 됩니다</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { step: "01", icon: "😭", title: "미리 준비하지 않으면 받기 힘든 사업자금", desc: "사업자금은 미리 준비한 만큼 승인 확률과 한도가 올라갑니다. 매출, 신용, 업종, 경력 등 상품마다 핵심 요소가 모두 다릅니다.", color: "#EF4444" },
              { step: "02", icon: "😥", title: "부결 시 재신청 6개월 불가", desc: "신청이 부결되면 6개월간 재신청이 불가능합니다. 급한 마음에 준비 없이 신청했다가 부결나면 정말 힘든 상황이 됩니다.", color: "#F59E0B" },
              { step: "03", icon: "🥰", title: "순서를 지켜야 원하는 수준의 대출 가능", desc: "사업자금은 신청 순서가 매우 중요합니다. 기대출 적용/미적용 상품이 있어, 잘못된 순서로 신청하면 원하는 금액을 못 받습니다.", color: "#10B981" },
              { step: "04", icon: "😯", title: "20분 만에 소진되는 인기 사업자금", desc: "인기 많은 사업자금 상품은 짧게는 20분 만에 소진됩니다. 날짜와 시간을 매일 체크하고 철저히 준비해야 합니다.", color: "#2563EB" },
              { step: "05", icon: "🤔", title: "내 경쟁자들은 철저하게 준비한다는 사실", desc: "기관의 예산은 한정되어 있기에 선별해서 지원합니다. 꼼꼼한 사업계획서, 실사 준비, 기관 인터뷰 준비 등 노하우가 필요합니다.", color: "#7C3AED" },
              { step: "06", icon: "⚡", title: "매일 업데이트되는 사업자금만 300가지", desc: "매일 업데이트되는 사업자금은 무려 300가지! 기관마다 지원금 한도, 이율, 조건, 순서, 진행 방법이 모두 다릅니다.", color: "#EC4899" },
            ].map(c => (
              <div key={c.step} style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "14px", right: "14px", fontSize: "11px", fontWeight: "900", color: c.color, opacity: 0.25, fontFamily: font }}>STEP {c.step}</div>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "14px" }}>{c.icon}</span>
                <p style={{ fontSize: "15px", fontWeight: "800", color: "#0A1628", marginBottom: "10px", fontFamily: font, lineHeight: "1.4" }}>{c.title}</p>
                <p style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.7", fontFamily: font }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 신뢰 섹션 ══ */}
      <section style={{ background: "linear-gradient(135deg, #0A1628 0%, #112D5E 100%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#FFFFFF", marginBottom: "16px", lineHeight: "1.3", fontFamily: font }}>
            사기 NO · 보이스피싱 NO<br />이제 <span style={{ color: "#60A5FA" }}>안심</span>하세요!
          </h2>
          <p style={{ fontSize: "16px", color: "#94A3B8", marginBottom: "48px", lineHeight: "1.7", fontFamily: font }}>
            엠프론티어랩은 경영컨설팅업으로 <strong style={{ color: "#FFFFFF" }}>정식 등록된 컨설팅 업체</strong>이며,<br />
            <strong style={{ color: "#FFFFFF" }}>2024년 설립된 법인회사</strong>로서 믿고 맡기실 수 있습니다.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
            {[
              { icon: "🏛️", title: "경영컨설팅업 정식 등록", desc: "무등록 사기 업체와 다릅니다" },
              { icon: "📋", title: "법인사업자 2024년 설립", desc: "정식 법인회사로 운영됩니다" },
              { icon: "🛡️", title: "개인정보보호 철저", desc: "안전한 정보 관리 보장" },
            ].map(t => (
              <div key={t.title} style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "28px 20px" }}>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "14px" }}>{t.icon}</span>
                <p style={{ fontSize: "14px", fontWeight: "800", color: "#FFFFFF", marginBottom: "6px", fontFamily: font }}>{t.title}</p>
                <p style={{ fontSize: "12px", color: "#64748B", fontFamily: font }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 8단계 프로세스 ══ */}
      <section style={{ padding: "80px 24px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#2563EB", letterSpacing: "0.1em", marginBottom: "12px", fontFamily: font }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0A1628", marginBottom: "12px", fontFamily: font }}>8단계 전문 컨설팅 프로세스</h2>
            <p style={{ fontSize: "15px", color: "#64748B", fontFamily: font }}>신청부터 자금 집행, 사후 관리까지 전담 매니저가 함께합니다</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", border: "1px solid #E2E8F0", borderRadius: "20px", overflow: "hidden" }}>
            {[
              { n: "01", icon: "📝", title: "무료 상담 신청", desc: "기본정보 작성" },
              { n: "02", icon: "📞", title: "전화 상담", desc: "기업 현황 검토" },
              { n: "03", icon: "💡", title: "솔루션 제안", desc: "맞춤 자금 설계" },
              { n: "04", icon: "✍️", title: "계약서 작성", desc: "미승인 시 100% 환불" },
              { n: "05", icon: "👤", title: "담당 매니저 배정", desc: "전담 단톡방 생성" },
              { n: "06", icon: "🔍", title: "컨설팅 진행", desc: "최적 자금 분석·설계" },
              { n: "07", icon: "🎉", title: "사업자금 승인", desc: "성공 수수료 납부" },
              { n: "08", icon: "🛎️", title: "사후 관리", desc: "1년 추가 자금 관리" },
            ].map((p, i) => (
              <div key={p.n} style={{ padding: "28px 16px", textAlign: "center", borderRight: i % 4 !== 3 ? "1px solid #E2E8F0" : "none", borderBottom: i < 4 ? "1px solid #E2E8F0" : "none", backgroundColor: i % 2 === 0 ? "#FAFBFF" : "#FFFFFF" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "24px" }}>
                  {p.icon}
                </div>
                <span style={{ fontSize: "10px", fontWeight: "900", color: "#2563EB", letterSpacing: "0.08em", fontFamily: font }}>STEP {p.n}</span>
                <p style={{ fontSize: "13px", fontWeight: "800", color: "#0A1628", margin: "6px 0 4px", fontFamily: font }}>{p.title}</p>
                <p style={{ fontSize: "11px", color: "#94A3B8", fontFamily: font }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 고객 후기 ══ */}
      <section style={{ padding: "80px 24px", backgroundColor: "#F8FAFC" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#2563EB", letterSpacing: "0.1em", marginBottom: "12px", fontFamily: font }}>REVIEWS</p>
            <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0A1628", fontFamily: font }}>실제 고객 후기</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginTop: "10px" }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: "20px" }}>⭐</span>)}
            </div>
          </div>

          <div style={{ backgroundColor: "#0A1628", borderRadius: "20px", padding: "40px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "20px", right: "28px", fontSize: "80px", opacity: 0.05, color: "#FFFFFF", fontFamily: "serif" }}>"</div>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#1E3A8A", display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${GRADE_C[REVIEWS[reviewIdx].grade]}` }}>
                <span style={{ fontSize: "18px", fontWeight: "900", color: GRADE_C[REVIEWS[reviewIdx].grade], fontFamily: font }}>{REVIEWS[reviewIdx].grade}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "17px", color: "#FFFFFF", lineHeight: "1.8", fontFamily: font, marginBottom: "16px" }}>"{REVIEWS[reviewIdx].text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#94A3B8", fontFamily: font }}>{REVIEWS[reviewIdx].name}</span>
                  <span style={{ fontSize: "12px", color: "#475569", fontFamily: font }}>{REVIEWS[reviewIdx].type}</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#10B981", backgroundColor: "#052E1C", padding: "3px 10px", borderRadius: "6px", fontFamily: font }}>승인 {REVIEWS[reviewIdx].amount}</span>
                  <span style={{ fontSize: "14px", color: "#FCD34D" }}>★★★★★</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
            {REVIEWS.map((_, i) => (
              <button key={i} onClick={() => setReviewIdx(i)}
                style={{ width: i === reviewIdx ? "24px" : "8px", height: "8px", borderRadius: "999px", border: "none", cursor: "pointer", transition: "all 0.3s", backgroundColor: i === reviewIdx ? "#2563EB" : "#CBD5E1" }} />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {REVIEWS.map((r, i) => (
              <div key={i} onClick={() => setReviewIdx(i)}
                style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "20px", border: `1.5px solid ${i === reviewIdx ? "#2563EB" : "#E2E8F0"}`, cursor: "pointer", transition: "all 0.2s", boxShadow: i === reviewIdx ? "0 4px 20px rgba(37,99,235,0.12)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: `${GRADE_C[r.grade]}18`, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${GRADE_C[r.grade]}` }}>
                      <span style={{ fontSize: "11px", fontWeight: "900", color: GRADE_C[r.grade], fontFamily: font }}>{r.grade}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151", fontFamily: font }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#10B981", backgroundColor: "#F0FDF4", padding: "2px 8px", borderRadius: "4px", fontFamily: font }}>{r.amount}</span>
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", lineHeight: "1.6", fontFamily: font, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.text}</p>
                <p style={{ fontSize: "11px", color: "#FCD34D", marginTop: "8px" }}>★★★★★</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ padding: "80px 24px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#2563EB", letterSpacing: "0.1em", marginBottom: "12px", fontFamily: font }}>FAQ</p>
            <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0A1628", fontFamily: font }}>자주 묻는 질문</h2>
          </div>
          {[
            { q: "상담은 정말 무료인가요?", a: "네, 상담은 100% 무료입니다. 정책자금이 승인된 경우에만 성공 수수료가 발생하며, 상담 자체는 어떠한 비용도 없습니다. 미승인 시 착수금 100% 환불을 보장합니다." },
            { q: "신용점수가 낮아도 신청 가능한가요?", a: "물론입니다. 신용점수가 낮더라도 신청 가능한 자금이 다수 있습니다. 지역신보 보증부대출, 소진공 긴급경영안정자금 등 다양한 옵션이 있으니 상담을 통해 확인해보세요." },
            { q: "사업 기간이 짧아도 됩니까?", a: "업력 1년 미만 창업자도 신청 가능한 자금이 있습니다. 소진공 창업자금, 중진공 창업기반지원자금 등 신규 창업자를 위한 전용 상품이 마련되어 있습니다." },
            { q: "이미 대출이 있어도 추가로 받을 수 있나요?", a: "기대출이 있어도 기대출 미적용 상품을 먼저 진행하면 추가 자금 조달이 가능합니다. 신청 순서가 매우 중요하기 때문에 전문가와 함께 전략을 세우는 것이 핵심입니다." },
            { q: "신청 후 얼마나 걸리나요?", a: "상담 신청 후 영업일 기준 1일 이내 전담 매니저가 연락을 드립니다. 자금 집행까지는 보통 2~6주가 소요됩니다." },
            { q: "전국 어디서나 상담 가능한가요?", a: "네, 전국 어디서나 비대면으로 상담이 가능합니다. 방문 없이도 온라인과 전화로 모든 절차가 진행됩니다." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 4px", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: font, textAlign: "left" }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628" }}>Q. {faq.q}</span>
                <span style={{ fontSize: "20px", color: "#2563EB", transition: "transform 0.3s", transform: openFaq === i ? "rotate(45deg)" : "none", flexShrink: 0 }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 4px 20px" }}>
                  <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.8", fontFamily: font, backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "16px" }}>A. {faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA 섹션 (설문 시작 유도) ══ */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(160deg, #0A1628 0%, #0D2244 50%, #112D5E 100%)" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "13px", fontWeight: "700", color: "#60A5FA", letterSpacing: "0.1em", marginBottom: "16px", fontFamily: font }}>FREE CONSULTATION</p>
          <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#FFFFFF", marginBottom: "16px", lineHeight: "1.3", fontFamily: font }}>
            대표님의 사업자금 고민<br />
            <span style={{ color: "#60A5FA" }}>반드시 해결해 드리겠습니다.</span>
          </h2>
          <p style={{ fontSize: "16px", color: "#94A3B8", marginBottom: "14px", lineHeight: "1.7", fontFamily: font }}>
            간단한 질문 몇 가지로 맞춤 정책자금을 분석해드립니다
          </p>
          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "36px", fontFamily: font }}>
            ✔ 소요시간 약 3분 &nbsp;·&nbsp; ✔ 상담비 0원 &nbsp;·&nbsp; ✔ 24시간 신청 가능
          </p>
          <button onClick={goSurvey}
            style={{ padding: "18px 56px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "18px", fontWeight: "900", cursor: "pointer", fontFamily: font, boxShadow: "0 8px 32px rgba(37,99,235,0.4)", marginBottom: "16px" }}>
            무료 상담 시작하기 →
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", marginTop: "16px" }}>
            {["✔ 상담비 0원", "✔ 24시간 신청", "✔ 미승인 시 착수금 100% 환불", "✔ 전국 어디서나 비대면 진행"].map(t => (
              <span key={t} style={{ fontSize: "13px", color: "#64748B", fontFamily: font }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 푸터 ══ */}
      <footer style={{ backgroundColor: "#060E1A", padding: "32px 24px", borderTop: "1px solid #1E2D47" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}><Image src="/logo.png" alt="EMFRONTIER LAB" width={24} height={24} style={{ objectFit: "contain", filter: "invert(1)" }} /><p style={{ fontSize: "15px", fontWeight: "800", color: "#FFFFFF", fontFamily: font }}>EMFRONTIER LAB</p></div>
            <p style={{ fontSize: "12px", color: "#475569", fontFamily: font }}>경영컨설팅업 정식 등록 · 법인사업자 2024년 설립</p>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Link href="/consult/lookup" style={{ fontSize: "12px", color: "#475569", textDecoration: "none", fontFamily: font }}>상담 조회</Link>
            <Link href="/client/login" style={{ fontSize: "12px", color: "#475569", textDecoration: "none", fontFamily: font }}>회원 로그인</Link>
            <Link href="/client/register" style={{ fontSize: "12px", color: "#475569", textDecoration: "none", fontFamily: font }}>회원가입</Link>
          </div>
          <p style={{ fontSize: "11px", color: "#334155", fontFamily: font }}>© 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved</p>
        </div>
      </footer>

      {/* ══ 플로팅 버튼 ══ */}
      {floatVisible && (
        <button onClick={goSurvey}
          style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 200, padding: "14px 24px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "14px", fontWeight: "800", cursor: "pointer", fontFamily: font, boxShadow: "0 8px 32px rgba(37,99,235,0.5)" }}>
          🔥 무료 상담 신청
        </button>
      )}
    </div>
  );
}
