/**
 * /api/backup  — 전체 데이터 백업/복원 API
 *
 * GET  /api/backup            → 전체 데이터 JSON 다운로드
 * POST /api/backup            → 백업 JSON 업로드해서 복원
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 전체 데이터 내보내기
export async function GET() {
  try {
    const result: Record<string, unknown> = {};
    if (fs.existsSync(DATA_DIR)) {
      const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
      for (const file of files) {
        const key = file.replace(".json", "");
        try {
          const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
          result[key] = JSON.parse(raw);
        } catch {
          result[key] = null;
        }
      }
    }

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: result,
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="emfrontier-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 데이터 복원
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
    }

    // { exportedAt, version, data: { key: value } } 형식
    const data = body.data || body; // 직접 key-value도 허용

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let restored = 0;
    for (const [key, value] of Object.entries(data)) {
      const safe = key.replace(/[^a-zA-Z0-9_\-]/g, "_");
      const filePath = path.join(DATA_DIR, `${safe}.json`);
      fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf-8");
      restored++;
    }

    return NextResponse.json({ ok: true, restored, restoredAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
