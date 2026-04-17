import Link from "next/link";
import { LOGO_B64 } from "@/lib/store";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#E8EDFB",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
      fontFamily: "'Noto Sans KR', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    }}>
      {/* 헤더 타이틀 */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <img src={LOGO_B64} alt="EMFRONTIER LAB" width={72} height={72} style={{ objectFit: "contain", display: "block", margin: "0 auto 12px" }} />
        <h1 style={{
          fontSize: "32px",
          fontWeight: "800",
          color: "#1E293B",
          letterSpacing: "-0.5px",
          marginBottom: "6px",
        }}>
          EMFRONTIER LAB
        </h1>
        <p style={{ fontSize: "15px", fontWeight: "600", color: "#3B82F6", marginBottom: "4px" }}>
          클라이언트 포털
        </p>
        <p style={{ fontSize: "13px", color: "#6B7280" }}>
          정책자금 신청 및 조회 시스템
        </p>
      </div>

      {/* 메인 카드 */}
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(99, 120, 200, 0.12)",
        padding: "28px",
        width: "100%",
        maxWidth: "440px",
      }}>
        <p style={{
          fontSize: "15px",
          fontWeight: "700",
          color: "#1E293B",
          marginBottom: "18px",
        }}>
          서비스 안내
        </p>

        {/* 2x2 서비스 카드 그리드 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}>
          {/* AI 자동 진단 */}
          <div style={{
            backgroundColor: "#EAF2FF",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>🤖</div>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#1E293B", marginBottom: "5px" }}>
              AI 자동 진단
            </p>
            <p style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.6" }}>
              신용점수, 매출액, 부채 등을 기반으로 SOHO 등급을 자동으로 산정합니다.
            </p>
          </div>

          {/* 정책자금 추천 */}
          <div style={{
            backgroundColor: "#EDFBF0",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>💰</div>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#1E293B", marginBottom: "5px" }}>
              정책자금 추천
            </p>
            <p style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.6" }}>
              고객님에게 맞는 정책자금을 자동으로 추천해드립니다.
            </p>
          </div>

          {/* 진행상황 확인 */}
          <div style={{
            backgroundColor: "#FFFBEA",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>📊</div>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#1E293B", marginBottom: "5px" }}>
              진행상황 확인
            </p>
            <p style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.6" }}>
              실시간으로 신청 진행상황을 확인할 수 있습니다.
            </p>
          </div>

          {/* QR 코드 생성 */}
          <div style={{
            backgroundColor: "#F5EDFF",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>📱</div>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#1E293B", marginBottom: "5px" }}>
              QR 코드 생성
            </p>
            <p style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.6" }}>
              관리자와 안전하게 정보를 공유할 수 있는 QR 코드를 생성합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
        <Link href="/client/login" style={{
          display: "inline-block",
          backgroundColor: "#2563EB",
          color: "#FFFFFF",
          fontSize: "14px",
          fontWeight: "600",
          padding: "10px 32px",
          borderRadius: "8px",
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
        }}>
          로그인
        </Link>
        <Link href="/client/register" style={{
          display: "inline-block",
          backgroundColor: "#FFFFFF",
          color: "#2563EB",
          fontSize: "14px",
          fontWeight: "600",
          padding: "10px 28px",
          borderRadius: "8px",
          textDecoration: "none",
          border: "1.5px solid #2563EB",
        }}>
          회원가입
        </Link>
      </div>

      {/* 푸터 */}
      <p style={{
        marginTop: "40px",
        fontSize: "11px",
        color: "#9CA3AF",
        textAlign: "center",
      }}>
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </p>
    </div>
  );
}
