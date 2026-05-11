import { AuthSwitch } from "@/components/ui/auth-switch";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "إنشاء حساب | متجر الاشتراكات الرقمية",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthSwitch defaultMode="register" />
    </Suspense>
  );
}
