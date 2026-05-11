"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.length < 2) errs.name = "الاسم يجب أن يكون حرفين على الأقل";
    if (!form.email.includes("@")) errs.email = "البريد الإلكتروني غير صحيح";
    if (form.password.length < 8) errs.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "كلمتا المرور غير متطابقتين";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrors({ general: data.error || "حدث خطأ في إنشاء الحساب" });
        setLoading(false);
        return;
      }

      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      toast.success("تم إنشاء حسابك بنجاح! مرحباً بك 🎉");
      router.push("/dashboard");
    } catch {
      setErrors({ general: "حدث خطأ. حاول مرة أخرى" });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إنشاء حساب</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">انضم إلينا وابدأ التسوق الآن</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5 text-sm text-red-700 dark:text-red-400">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="محمد أحمد"
            error={errors.name}
            startIcon={<User className="h-4 w-4" />}
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="example@email.com"
            error={errors.email}
            startIcon={<Mail className="h-4 w-4" />}
          />
          <Input
            label="رقم الهاتف (اختياري)"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+966 50 000 0000"
            startIcon={<Phone className="h-4 w-4" />}
          />
          <div className="relative">
            <Input
              label="كلمة المرور"
              type={showPass ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8 أحرف على الأقل"
              error={errors.password}
              startIcon={<Lock className="h-4 w-4" />}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute top-[38px] start-3 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input
            label="تأكيد كلمة المرور"
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="أعد إدخال كلمة المرور"
            error={errors.confirmPassword}
            startIcon={<Lock className="h-4 w-4" />}
          />

          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
            إنشاء الحساب
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          بإنشائك الحساب، توافق على{" "}
          <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
            الشروط والأحكام
          </Link>
        </p>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
