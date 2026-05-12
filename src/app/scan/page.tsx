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
      const { base64, mimeType } = await compressToJpeg(file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem("geminiResult", JSON.stringify(data));
      router.push("/scan/confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "辨識失敗，請重試");
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
        className="flex-1 flex flex-col items-center justify-center gap-6 rounded-2xl"
        style={{ border: "2px dashed var(--border)", minHeight: 300 }}
      >
        {loading ? (
          <>
            <div className="text-4xl animate-bounce">🔍</div>
            <p style={{ color: "var(--muted)" }}>AI 辨識中⋯⋯</p>
          </>
        ) : (
          <>
            <div className="text-6xl">🧾</div>
            <p className="text-lg font-medium">選擇收據照片</p>
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
          disabled={loading}
          className="flex-1 h-12 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          📷 開相機
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={loading}
          className="flex-1 h-12 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          🖼️ 從相簿選
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </main>
  );
}

function compressToJpeg(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1600;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = reject;
    img.src = url;
  });
}
