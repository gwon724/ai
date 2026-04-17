import type { Metadata } from "next";
import "./globals.css";

// 구글 폰트 import 제거 - 인라인 폰트 스택 사용 (네트워크 차단 방지)

export const metadata: Metadata = {
  title: "EMFRONTIER LAB - 정책자금 AI 진단",
  description: "정책자금 신청을 위한 AI 진단 시스템",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
