"use client";

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    toast.success("تم تعليم جميع الإشعارات كمقروءة");
    router.refresh();
    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={handle} loading={loading}>
      تعليم الكل كمقروء
    </Button>
  );
}
