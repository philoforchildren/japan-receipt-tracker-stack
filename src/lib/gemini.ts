import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiResult } from "./types";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

const PROMPT = `分析這張收據照片，只回傳 JSON（不要其他文字）：

{
  "storeName": "店名（繁體中文翻譯或保留原文）",
  "items": "主要品項（繁體中文，多項用「・」分隔，最多3項，若辨識不到填空字串）",
  "amount": 消費總金額（數字，不含逗號或貨幣符號）,
  "currency": "幣別（日圓/台幣/美元/歐元/其他）",
  "category": "類別（餐飲/交通/門票/購物/住宿/其他）",
  "date": "收據日期（YYYY-MM-DD，若辨識不到填 null）",
  "notes": "備註（若無則填空字串）"
}

幣別判斷：
- 有「円」「¥」「JPY」→ 日圓
- 有「NT$」「TWD」「元」或統一發票（發票號碼格式如 XX-XXXXXXXX）→ 台幣
- 有「USD」或只有「$」（美式收據）→ 美元
- 有「€」「EUR」→ 歐元
- 其他 → 其他

台灣統一發票注意事項：
- 金額看「總計」「合計」「應付」欄位
- 店名在發票最上方
- 日期格式可能是民國年（民國115年 = 2026年）

amount 只填最終付款總金額的數字。`;

export async function analyzeReceipt(
  imageBase64: string,
  mimeType: string
): Promise<GeminiResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType } },
        PROMPT,
      ]);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      return JSON.parse(jsonMatch[0]) as GeminiResult;
    } catch (e) {
      if (modelName === MODELS[MODELS.length - 1]) throw e;
    }
  }
  throw new Error("All models failed");
}
