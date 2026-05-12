"use client";

import { useRouter } from "next/navigation";
import ReceiptForm from "@/components/ReceiptForm";

export default function AddPage() {
  const router = useRouter();
  return (
    <main className="min-h-svh flex flex-col p-6 gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl">←</button>
        <h1 className="text-xl font-bold">手動輸入</h1>
      </div>
      <ReceiptForm initial={{}} />
    </main>
  );
}
