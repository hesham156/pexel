"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function NewTicketModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", priority: "MEDIUM" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.subject.length < 5 || form.message.length < 10) {
      toast.error("يرجى ملء جميع الحقول بشكل صحيح");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إنشاء تذكرة الدعم بنجاح");
        setOpen(false);
        setForm({ subject: "", message: "", priority: "MEDIUM" });
        router.refresh();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        تذكرة جديدة
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="فتح تذكرة دعم جديدة" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الموضوع"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="وصف مختصر للمشكلة..."
          />
          <Select
            label="الأولوية"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[
              { value: "LOW", label: "منخفض" },
              { value: "MEDIUM", label: "متوسط" },
              { value: "HIGH", label: "عالي" },
              { value: "URGENT", label: "عاجل" },
            ]}
          />
          <Textarea
            label="تفاصيل المشكلة"
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="اشرح مشكلتك بالتفصيل..."
            rows={5}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" loading={loading}>إرسال التذكرة</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
