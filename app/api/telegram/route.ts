/**
 * /api/telegram — 텔레그램 알림 발송
 * POST /api/telegram { consultation }
 */

import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consultation } = body;

    if (!consultation) {
      return NextResponse.json({ error: "consultation is required" }, { status: 400 });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn("[Telegram] BOT_TOKEN 또는 CHAT_ID가 설정되지 않았습니다.");
      return NextResponse.json({ ok: false, reason: "Telegram not configured" });
    }

    const c = consultation;
    const message = `
📋 *새 상담 신청이 접수되었습니다!*

🆔 접수번호: \`${c.id}\`
👤 이름: ${c.name}
📱 연락처: ${c.phone}
📧 이메일: ${c.email || "미입력"}

🏢 *사업 정보*
• 업종: ${c.businessType}
• 사업 기간: ${c.businessPeriod}
• 연매출: ${c.annual_revenue ? Number(c.annual_revenue).toLocaleString() + "원" : "미입력"}
• 자금 목적: ${c.purposeType}
• 희망 금액: ${c.desiredAmount}
• 기존 대출: ${c.currentDebt ? Number(c.currentDebt).toLocaleString() + "원" : "미입력"}

💳 *신용 정보*
• NICE 점수: ${c.nice_score || "미입력"}

📝 *문의 내용*
${c.inquiryContent || "없음"}

⏰ 접수 시간: ${c.createdAt}
`.trim();

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const result = await telegramRes.json();

    if (!result.ok) {
      console.error("[Telegram] 발송 실패:", result);
      return NextResponse.json({ ok: false, error: result.description });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Telegram] 오류:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
