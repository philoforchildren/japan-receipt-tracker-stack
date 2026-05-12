import { NextRequest, NextResponse } from "next/server";

const CURRENCY_MAP: Record<string, string> = {
  日圓: "JPY",
  美元: "USD",
  歐元: "EUR",
};

const FALLBACK_RATES: Record<string, number> = {
  JPY: 0.21,
  USD: 32,
  EUR: 35,
};

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? "日圓";
  const isoCode = CURRENCY_MAP[from];

  if (!isoCode || from === "台幣") {
    return NextResponse.json({ rate: 1 });
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${isoCode}&to=TWD`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const rate: number = data?.rates?.TWD ?? 0;
    if (rate > 0) return NextResponse.json({ rate });
    return NextResponse.json({ rate: FALLBACK_RATES[isoCode] ?? 1 });
  } catch {
    return NextResponse.json({ rate: FALLBACK_RATES[isoCode] ?? 1 });
  }
}
