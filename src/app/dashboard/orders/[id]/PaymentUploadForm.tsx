"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function PaymentUploadForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) { toast.error("اختر ملفاً أولاً"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", orderId);
      const res = await fetch("/api/payments/upload-proof", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("تم رفع إثبات الدفع بنجاح!");
        router.refresh();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ. حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5">
      <h3 className="font-bold text-yellow-900 dark:text-yellow-300 mb-3 flex items-center gap-2">
        <Upload className="h-4 w-4" />
        رفع إثبات الدفع
      </h3>
      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
        لتسريع معالجة طلبك، ارفع صورة من إيصال التحويل البنكي.
      </p>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="input-base text-sm mb-3"
      />
      {file && <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-3">✅ {file.name}</p>}
      <Button onClick={handleUpload} loading={loading} size="sm" variant="secondary">
        رفع الإثبات
      </Button>
    </div>
  );
}
