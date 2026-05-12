"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setLoading(true);
    setError("");
    try {
      const base64 = await toBase64(file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem("geminiResult", JSON.stringify(data));
      router.push("/scan/confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "辨識失敗，請手動輸入");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-svh flex flex-col p-6 gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl">←</button>
        <h1 className="text-xl font-bold">拍照記帳</h1>
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center gap-6 rounded-2xl cursor-pointer"
        style={{ border: "2px dashed var(--border)", minHeight: 300 }}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <>
            <div className="text-4xl animate-bounce">🔍</div>
            <p style={{ color: "var(--muted)" }}>AI 辨識中⋯⋯</p>
          </>
        ) : (
          <>
            <div className="text-6xl">📷</div>
            <p className="text-lg font-medium">點擊拍照或選取收據照片</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              支援 JPG、PNG、HEIC
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-xl p-4 text-center" style={{ background: "#450a0a", color: "#fca5a5" }}>
          <p>{error}</p>
          <button
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#7f1d1d", color: "#fca5a5" }}
            onClick={() => { setError(""); inputRef.current?.click(); }}
          >
            重新拍照
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex-1 h-12 rounded-xl font-medium flex items-center justify-center gap-2"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          📷 開相機
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          className="flex-1 h-12 rounded-xl font-medium flex items-center justify-center gap-2"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          🖼️ 從相簿選
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </main>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
