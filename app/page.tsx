"use client";
import Link from "next/link";
import { LOGO_B64, FONT } from "@/lib/store";

const font = FONT;

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: font }}>

      {/* ── 헤더 네비게이션 ── */}
      <header style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 24px",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", height: "64px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={LOGO_B64} alt="EMFRONTIER LAB" width={36} height={36} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#1E293B", letterSpacing: "-0.3px" }}>EMFRONTIER LAB</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link href="/client/login" style={{ fontSize: "14px", fontWeight: "600", color: "#374151", textDecoration: "none", padding: "8px 16px", borderRadius: "8px" }}>
              로그인
            </Link>
            <Link href="/client/register" style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", backgroundColor: "#2563EB", textDecoration: "none", padding: "9px 20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
              무료 시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* ── 히어로 섹션 ── */}
      <section style={{
        background: "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 50%, #EFF6FF 100%)",
        padding: "80px 24px 72px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#DBEAFE", borderRadius: "999px", padding: "6px 16px", marginBottom: "24px" }}>
            <span style={{ fontSize: "14px" }}>🤖</span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#1D4ED8" }}>AI 기반 정책자금 매칭 시스템</span>
          </div>
          <h1 style={{ fontSize: "46px", fontWeight: "900", color: "#0F172A", lineHeight: "1.2", marginBottom: "20px", letterSpacing: "-1px" }}>
            내 사업에 맞는<br />
            <span style={{ color: "#2563EB" }}>정책자금</span>을 AI가 찾아드립니다
          </h1>
          <p style={{ fontSize: "17px", color: "#475569", lineHeight: "1.8", marginBottom: "36px" }}>
            신용점수 · 연매출 · 부채 정보만 입력하면<br />
            AI가 최적의 정책자금을 즉시 추천해드립니다.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/client/register" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: "#2563EB", color: "#ffffff",
              fontSize: "16px", fontWeight: "700",
              padding: "14px 36px", borderRadius: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
            }}>
              무료 회원가입 →
            </Link>
            <Link href="/consult" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: "#ffffff", color: "#1E293B",
              fontSize: "16px", fontWeight: "600",
              padding: "14px 32px", borderRadius: "10px",
              textDecoration: "none",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              무료 상담 신청
            </Link>
          </div>
        </div>
      </section>

      {/* ── 통계 배너 ── */}
      <section style={{ backgroundColor: "#1E293B", padding: "32px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", textAlign: "center" }}>
          {[
            { num: "98%", label: "고객 만족도", icon: "⭐" },
            { num: "5,200+", label: "누적 상담 건수", icon: "📋" },
            { num: "평균 2.1억", label: "고객당 승인 금액", icon: "💰" },
            { num: "94%", label: "자금 승인율", icon: "✅" },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontSize: "22px", marginBottom: "4px" }}>{s.icon}</p>
              <p style={{ fontSize: "26px", fontWeight: "900", color: "#60A5FA", marginBottom: "4px" }}>{s.num}</p>
              <p style={{ fontSize: "12px", color: "#94A3B8" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 주요 기능 ── */}
      <section style={{ padding: "72px 24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#2563EB", marginBottom: "10px", letterSpacing: "1px" }}>FEATURES</p>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>왜 엠프론티어 LAB인가요?</h2>
            <p style={{ fontSize: "15px", color: "#64748B", lineHeight: "1.7" }}>복잡한 정책자금 신청, AI가 처음부터 끝까지 도와드립니다.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              {
                icon: "🤖",
                title: "AI SOHO 등급 진단",
                desc: "신용점수·매출·부채를 입력하면 AI가 A~D 등급을 즉시 산정합니다. 복잡한 계산 없이 내 사업 역량을 한눈에 확인하세요.",
                color: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8",
              },
              {
                icon: "💼",
                title: "맞춤 정책자금 추천",
                desc: "등급에 맞는 정책자금 목록을 자동 추천합니다. 소진공·중진공·신보·기보·시중은행 상품을 한 번에 비교하세요.",
                color: "#F0FDF4", border: "#BBF7D0", text: "#166534",
              },
              {
                icon: "🎯",
                title: "한도 직접 조절",
                desc: "원하는 자금을 최대 3개 선택하고, 슬라이더로 신청 한도를 직접 조절할 수 있습니다. 내 상황에 꼭 맞게 신청하세요.",
                color: "#FFF7ED", border: "#FED7AA", text: "#C2410C",
              },
              {
                icon: "📊",
                title: "실시간 진행 현황",
                desc: "접수대기 → 진행중 → 집행완료까지 전 단계를 대시보드에서 실시간으로 확인할 수 있습니다.",
                color: "#FDF4FF", border: "#E9D5FF", text: "#7C3AED",
              },
              {
                icon: "📱",
                title: "QR 코드 공유",
                desc: "내 정보를 QR 코드로 생성해 담당 매니저와 안전하게 공유할 수 있습니다. 방문 상담 시 매우 편리합니다.",
                color: "#FFFBEB", border: "#FDE68A", text: "#D97706",
              },
              {
                icon: "🔒",
                title: "안전한 데이터 관리",
                desc: "모든 개인정보는 암호화 처리되며, 전담 매니저만 열람 가능합니다. 정보 유출 걱정 없이 안심하고 이용하세요.",
                color: "#F0F9FF", border: "#BAE6FD", text: "#0369A1",
              },
            ].map(f => (
              <div key={f.title} style={{
                backgroundColor: f.color,
                border: `1.5px solid ${f.border}`,
                borderRadius: "14px",
                padding: "24px 22px",
              }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.8" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 이용 방법 ── */}
      <section style={{ padding: "72px 24px", backgroundColor: "#F8FAFC" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "13px", fontWeight: "700", color: "#2563EB", marginBottom: "10px", letterSpacing: "1px" }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#0F172A", marginBottom: "48px" }}>3단계로 끝나는 정책자금 신청</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[
              { step: "01", icon: "✍️", title: "회원가입", desc: "이메일·신용점수·매출 등 기본 정보를 입력하고 회원가입을 완료하세요." },
              { step: "02", icon: "🤖", title: "AI 진단 & 자금 선택", desc: "AI가 SOHO 등급을 산정하고 맞춤 자금을 추천합니다. 원하는 자금을 최대 3개 선택하세요." },
              { step: "03", icon: "🎉", title: "신청 & 진행 확인", desc: "신청이 완료되면 담당 매니저가 연락드립니다. 대시보드에서 진행 현황을 확인하세요." },
            ].map((s, i) => (
              <div key={s.step} style={{ position: "relative" }}>
                {i < 2 && (
                  <div style={{ position: "absolute", top: "28px", right: "-12px", fontSize: "20px", color: "#CBD5E1", zIndex: 1 }}>→</div>
                )}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2E8F0" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "13px", fontWeight: "800", color: "#ffffff" }}>
                    {s.step}
                  </div>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>{s.icon}</div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A", marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.7" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 섹션 ── */}
      <section style={{ background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)", padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", marginBottom: "14px", lineHeight: "1.3" }}>
            지금 바로 무료로 시작하세요
          </h2>
          <p style={{ fontSize: "15px", color: "#BFDBFE", marginBottom: "32px", lineHeight: "1.7" }}>
            회원가입 후 즉시 AI 진단을 받아보실 수 있습니다.<br />
            가입비·수수료 없이 완전 무료입니다.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/client/register" style={{
              display: "inline-block", backgroundColor: "#ffffff", color: "#2563EB",
              fontSize: "15px", fontWeight: "700",
              padding: "13px 36px", borderRadius: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}>
              무료 회원가입 →
            </Link>
            <Link href="/client/login" style={{
              display: "inline-block",
              backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff",
              fontSize: "15px", fontWeight: "600",
              padding: "13px 32px", borderRadius: "10px",
              textDecoration: "none",
              border: "1.5px solid rgba(255,255,255,0.35)",
            }}>
              로그인
            </Link>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{ backgroundColor: "#0F172A", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "12px" }}>
            <img src={LOGO_B64} alt="EMFRONTIER LAB" width={28} height={28} style={{ objectFit: "contain", filter: "invert(1)", opacity: 0.7 }} />
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#94A3B8" }}>EMFRONTIER LAB</span>
          </div>
          <p style={{ fontSize: "12px", color: "#475569", marginBottom: "8px" }}>
            정책자금 AI 진단 시스템 · AI-powered Policy Fund Matching
          </p>
          <p style={{ fontSize: "11px", color: "#334155" }}>
            Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
          </p>
        </div>
      </footer>

    </div>
  );
}
