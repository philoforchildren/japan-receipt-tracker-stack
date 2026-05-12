import { NextRequest, NextResponse } from "next/server";
import { saveReceipt } from "@/lib/notion";
import type { ReceiptData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: ReceiptData = await req.json();
    await saveReceipt(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Notion save error:", e);
    return NextResponse.json({ error: "儲存失敗，請再試一次" }, { status: 500 });
  }
}
