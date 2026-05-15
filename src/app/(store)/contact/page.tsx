"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Mail, Phone, MessageSquare, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast.success("تم إرسال رسالتك بنجاح!");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.error || "حدث خطأ، حاول مرة أخرى");
      }
    } catch {
      toast.error("تعذّر الإرسال، تحقق من اتصالك بالإنترنت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">تواصل معنا</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">نحن هنا لمساعدتك في أي وقت</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {[
              {
                icon: Mail, title: "البريد الإلكتروني",
                lines: ["support@store.com", "يُردّ خلال 2-6 ساعات"],
                color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
              },
              {
                icon: Phone, title: "الهاتف / واتساب",
                lines: ["+966 50 123 4567", "السبت - الخميس: 9ص - 11م"],
                color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
              },
              {
                icon: MessageSquare, title: "تذكرة الدعم",
                lines: ["عبر لوحة التحكم", "أسرع طريقة للمساعدة"],
                color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
              },
              {
                icon: Clock, title: "ساعات العمل",
                lines: ["السبت - الخميس: 9ص - 11م", "الجمعة: 2م - 11م"],
                color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</p>
                  {item.lines.map((line) => (
                    <p key={line} className="text-sm text-gray-500 dark:text-gray-400">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تم الإرسال!</h2>
                  <p className="text-gray-500 dark:text-gray-400">سيتواصل معك فريقنا في أقرب وقت ممكن.</p>
                  <Button className="mt-6" onClick={() => setSent(false)} variant="outline">
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">أرسل رسالة</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="الاسم" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="محمد أحمد" />
                    <Input label="البريد الإلكتروني" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" />
                  </div>
                  <Input label="الموضوع" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="استفسار عن..." />
                  <Textarea label="الرسالة" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا..." rows={5} />
                  <Button type="submit" loading={loading} fullWidth size="lg">
                    إرسال الرسالة
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
