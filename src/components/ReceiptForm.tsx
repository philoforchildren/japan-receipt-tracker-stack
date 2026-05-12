"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Currency, Category, GeminiResult, Trip } from "@/lib/types";

const CURRENCIES: Currency[] = ["日圓", "台幣", "美元", "歐元", "其他"];
const CATEGORIES: Category[] = ["餐飲", "交通", "門票", "購物", "住宿", "其他"];

interface Props {
  initial: Partial<GeminiResult>;
}

export default function ReceiptForm({ initial }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [storeName, setStoreName] = useState(initial.storeName ?? "");
  const [items, setItems] = useState(initial.items ?? "");
  const [amount, setAmount] = useState(initial.amount?.toString() ?? "");
  const [currency, setCurrency] = useState<Currency>(initial.currency ?? "日圓");
  const [amountTWD, setAmountTWD] = useState("");
  const [category, setCategory] = useState<Category>(initial.category ?? "餐飲");
  const [date, setDate] = useState(initial.date ?? today);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripId, setTripId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [rateLabel, setRateLabel] = useState("");

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((data: Trip[]) => {
        setTrips(data);
        const saved = localStorage.getItem("selectedTripId");
        const match = data.find((t) => t.id === saved) ?? data[0];
        if (match) setTripId(match.id);
      });
  }, []);

  useEffect(() => {
    if (currency === "台幣") {
      setAmountTWD(amount);
      setRateLabel("");
      return;
    }
    if (currency === "其他" || !amount) {
      setRateLabel("");
      return;
    }
    fetch(`/api/rate?from=${encodeURIComponent(currency)}`)
      .then((r) => r.json())
      .then(({ rate }: { rate: number }) => {
        if (rate > 0) {
          const twd = Math.round(parseFloat(amount) * rate);
          setAmountTWD(twd.toString());
          setRateLabel(`1 ${currency} ≈ NT$${rate.toFixed(2)}`);
        }
      })
      .catch(() => {});
  }, [amount, currency]);

  const handleSave = async () => {
    if (!storeName && !items) { setError("請至少填入店名或品項"); return; }
    if (!amount || isNaN(parseFloat(amount))) { setError("請填入金額"); return; }
    setSaving(true);
    setError("");
    try {
      const tripName = trips.find((t) => t.id === tripId)?.name ?? "";
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          items,
          amount: parseFloat(amount),
          currency,
          amountTWD: parseFloat(amountTWD) || 0,
          category,
          date: date || today,
          notes,
          tripId,
          tripName,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setSaved(true);
      localStorage.setItem("selectedTripId", tripId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <div className="text-6xl">✅</div>
        <p className="text-xl font-bold">已記錄到 Notion</p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/scan")}
            className="px-6 py-3 rounded-xl font-medium"
            style={{ background: "var(--accent)", color: "#000" }}
          >
            再拍一張
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl font-medium"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <Field label="旅行">
        <select
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="input"
        >
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </Field>

      <Field label="店名">
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="例：全家便利商店"
          className="input"
        />
      </Field>

      <Field label="品項">
        <input
          type="text"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          placeholder="例：飯糰・綠茶"
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="金額">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="input"
          />
        </Field>
        <Field label="幣別">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="input"
          >
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label={`台幣換算${rateLabel ? `　${rateLabel}` : ""}`}>
        <input
          type="number"
          inputMode="decimal"
          value={amountTWD}
          onChange={(e) => setAmountTWD(e.target.value)}
          placeholder="自動換算"
          className="input"
        />
      </Field>

      <Field label="類別">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
              style={
                category === c
                  ? { background: "var(--accent)", color: "#000" }
                  : { background: "var(--card)", border: "1px solid var(--border)" }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="日期">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="備註">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="稅制、折扣等"
          className="input"
        />
      </Field>

      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ background: "#450a0a", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-14 rounded-2xl text-lg font-bold mt-2 transition-opacity disabled:opacity-50"
        style={{ background: "var(--accent)", color: "#000" }}
      >
        {saving ? "儲存中⋯⋯" : "✅ 儲存到 Notion"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</label>
      {children}
    </div>
  );
}
