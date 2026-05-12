"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Trip } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((data: Trip[]) => {
        setTrips(data);
        const saved = localStorage.getItem("selectedTripId");
        const match = data.find((t) => t.id === saved) ?? data[0] ?? null;
        setSelectedTrip(match);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTripChange = (id: string) => {
    const trip = trips.find((t) => t.id === id) ?? null;
    setSelectedTrip(trip);
    if (id) localStorage.setItem("selectedTripId", id);
  };

  const go = (path: string) => {
    if (selectedTrip) {
      localStorage.setItem("selectedTripId", selectedTrip.id);
      localStorage.setItem("selectedTripName", selectedTrip.name);
    }
    router.push(path);
  };

  return (
    <main className="min-h-svh flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <div className="text-5xl mb-2">🧾</div>
        <h1 className="text-2xl font-bold text-white">旅行記帳</h1>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          目前旅行
        </label>
        {loading ? (
          <div className="h-12 rounded-xl animate-pulse" style={{ background: "var(--card)" }} />
        ) : (
          <select
            value={selectedTrip?.id ?? ""}
            onChange={(e) => handleTripChange(e.target.value)}
            className="w-full h-12 px-4 rounded-xl text-white text-sm"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {trips.length === 0 && <option value="">（無旅行計劃）</option>}
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <button
          onClick={() => go("/scan")}
          className="w-full h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-opacity active:opacity-70"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          <span className="text-2xl">📷</span> 拍照記帳
        </button>
        <button
          onClick={() => go("/add")}
          className="w-full h-12 rounded-2xl text-base font-medium flex items-center justify-center gap-2 transition-opacity active:opacity-70"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <span>✏️</span> 手動輸入
        </button>
      </div>
    </main>
  );
}
