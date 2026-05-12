import { NextRequest, NextResponse } from "next/server";
import { analyzeReceipt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }
    const result = await analyzeReceipt(imageBase64, mimeType);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json({ error: "辨識失敗，請手動填寫" }, { status: 500 });
  }
}
