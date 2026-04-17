/**
 * /api/db  — 서버사이드 파일 기반 영구 데이터 저장소
 *
 * GET  /api/db?key=users          → 저장된 JSON 반환
 * POST /api/db  { key, value }    → JSON 파일에 저장
 * DELETE /api/db?key=users        → 해당 키 파일 삭제
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// data 디렉토리가 없으면 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(key: string): string {
  // 키 이름 sanitize (보안: 경로 traversal 방지)
  const safe = key.replace(/[^a-zA-Z0-9_\-]/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key");
    if (!key) {
      // key 없이 GET → 전체 키 목록 반환
      const files = fs.existsSync(DATA_DIR)
        ? fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""))
        : [];
      return NextResponse.json({ keys: files });
    }

    const filePath = getFilePath(key);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ value: null });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const value = JSON.parse(raw);
    return NextResponse.json({ value });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const filePath = getFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf-8");

    return NextResponse.json({ ok: true, key });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const filePath = getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ ok: true, key });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
