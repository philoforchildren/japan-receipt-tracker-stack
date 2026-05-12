import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiResult } from "./types";

const MODELS = [
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

const PROMPT = `分析這張收據照片，只回傳 JSON（不要其他文字）：

{
  "storeName": "店名（翻譯成繁體中文，若辨識不到填空字串）",
  "items": "品項（繁體中文，多項用「・」分隔，最多3項，若辨識不到填空字串）",
  "amount": 消費總金額（數字，不含逗號或貨幣符號）,
  "currency": "幣別（日圓/美元/歐元/台幣/其他）",
  "category": "類別（餐飲/交通/門票/購物/住宿/其他）",
  "date": "收據日期（YYYY-MM-DD，若辨識不到則填 null）",
  "notes": "備註（稅制如内税/外税/免税，若無則填空字串）"
}

注意：
- amount 只填最終付款金額的數字
- 日文收據：¥ 或「円」→ 日圓
- 美式收據：$ → 美元
- 歐洲收據：€ → 歐元`;

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
