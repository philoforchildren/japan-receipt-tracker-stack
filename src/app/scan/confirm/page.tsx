"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GeminiResult, Currency, Category, Trip } from "@/lib/types";
import ReceiptForm from "@/components/ReceiptForm";

export default function ConfirmPage() {
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<GeminiResult> | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("geminiResult");
    if (!raw) { router.push("/scan"); return; }
    setInitial(JSON.parse(raw) as GeminiResult);
  }, [router]);

  if (!initial) return null;

  return (
    <main className="min-h-svh flex flex-col p-6 gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl">←</button>
        <h1 className="text-xl font-bold">確認明細</h1>
        <span
          className="ml-auto text-xs px-2 py-1 rounded-full"
          style={{ background: "#14532d", color: "#86efac" }}
        >
          AI 已辨識
        </span>
      </div>
      <ReceiptForm initial={initial} />
    </main>
  );
}
