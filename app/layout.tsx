import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

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
    <html lang="ko" className={notoSansKR.variable}>
      <head />
      <body className={notoSansKR.className}>{children}</body>
    </html>
  );
}
