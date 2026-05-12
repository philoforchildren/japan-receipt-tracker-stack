export type Currency = "日圓" | "台幣" | "美元" | "歐元" | "其他";
export type Category = "餐飲" | "交通" | "門票" | "購物" | "住宿" | "其他";

export interface ReceiptData {
  storeName: string;
  items: string;
  amount: number;
  currency: Currency;
  amountTWD: number;
  category: Category;
  date: string;
  notes: string;
  tripId: string;
  tripName: string;
}

export interface Trip {
  id: string;
  name: string;
  status: string;
}

export interface GeminiResult {
  storeName: string;
  items: string;
  amount: number;
  currency: Currency;
  category: Category;
  date: string | null;
  notes: string;
}
