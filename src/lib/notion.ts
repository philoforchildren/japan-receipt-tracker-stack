import { Client } from "@notionhq/client";
import type { ReceiptData, Trip } from "./types";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_DATABASE_ID!;
const TRAVEL_DB_ID = process.env.NOTION_TRAVEL_DATABASE_ID!;

export async function getTrips(): Promise<Trip[]> {
  const response = await notion.databases.query({
    database_id: TRAVEL_DB_ID,
    filter: {
      or: [
        { property: "狀態", select: { equals: "計劃中" } },
        { property: "狀態", select: { equals: "待出發" } },
        { property: "狀態", select: { equals: "已完成" } },
      ],
    },
    sorts: [{ property: "日期", direction: "descending" }],
  });

  return response.results.map((page) => {
    const p = page as { id: string; properties: Record<string, { title?: Array<{ plain_text: string }>; select?: { name: string } }> };
    const nameArr = p.properties["名稱"]?.title;
    const name = nameArr?.[0]?.plain_text ?? "未命名";
    const status = p.properties["狀態"]?.select?.name ?? "";
    return { id: page.id, name, status };
  });
}

export async function saveReceipt(data: ReceiptData): Promise<void> {
  const properties: Record<string, unknown> = {
    "名稱": { title: [{ text: { content: data.storeName || "（未命名）" } }] },
    "品項": { rich_text: [{ text: { content: data.items } }] },
    "金額": { number: data.amount },
    "幣別": { select: { name: data.currency } },
    "台幣換算": { number: data.amountTWD },
    "類別": { select: { name: data.category } },
    "日期": { date: { start: data.date } },
    "備註": { rich_text: [{ text: { content: data.notes } }] },
  };

  if (data.tripId) {
    properties["旅行"] = { relation: [{ id: data.tripId }] };
  }

  await notion.pages.create({
    parent: { database_id: DB_ID },
    properties,
  });
}
