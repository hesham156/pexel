"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

export function HayyakSyncButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hayyak/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "تم رفع الكتالوج إلى حياك بنجاح");
      } else {
        toast.error(data.error || "فشل رفع الكتالوج");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleSync} loading={loading} disabled={disabled}>
      <RefreshCw className="h-4 w-4" />
      رفع الكتالوج الكامل الآن
    </Button>
  );
}
