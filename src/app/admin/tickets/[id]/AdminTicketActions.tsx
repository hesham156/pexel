"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

interface Props {
  ticketId: string;
  status: string;
}

export default function AdminTicketActions({ ticketId, status }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [newStatus, setNewStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إرسال الرد");
        setMessage("");
        router.refresh();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    const res = await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("تم تحديث الحالة");
      router.refresh();
    } else {
      toast.error(data.error || "حدث خطأ");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select
              label="تغيير الحالة"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              options={[
                { value: "OPEN", label: "مفتوحة" },
                { value: "IN_PROGRESS", label: "قيد المعالجة" },
                { value: "RESOLVED", label: "محلولة" },
                { value: "CLOSED", label: "مغلقة" },
              ]}
            />
          </div>
          <Button onClick={handleStatusChange} variant="secondary" disabled={newStatus === status}>
            حفظ الحالة
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <form onSubmit={handleReply} className="space-y-3">
          <Textarea
            label="رد الدعم الفني"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="اكتب ردك هنا..."
            required
          />
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>إرسال الرد</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
