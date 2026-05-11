import { WaitlistHero } from "@/components/ui/waitlist-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قائمة الانتظار | متجر الاشتراكات الرقمية",
  description: "انضم إلى قائمة الانتظار وكن أول من يعلم عند الإطلاق.",
};

export default function WaitlistPage() {
  return <WaitlistHero />;
}
