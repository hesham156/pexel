"use client";

import { Zap, Shield, Star, HeadphonesIcon, CreditCard, RefreshCw, Globe } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import type { TimelineItem } from "@/components/ui/radial-orbital-timeline";

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "تسليم فوري",
    date: "< 1 دقيقة",
    content: "معظم الاشتراكات تُسلَّم تلقائياً فور اعتماد الدفع دون انتظار. نظام آلي يعمل 24/7.",
    category: "delivery",
    icon: Zap,
    relatedIds: [2, 5],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "آمان تام",
    date: "AES-256",
    content: "بياناتك محمية بأحدث معايير التشفير. لا نحتفظ بمعلومات الدفع الحساسة على خوادمنا.",
    category: "security",
    icon: Shield,
    relatedIds: [1, 5],
    status: "completed",
    energy: 95,
  },
  {
    id: 3,
    title: "أسعار تنافسية",
    date: "وفر 70%",
    content: "أفضل الأسعار في السوق مقارنةً بالمنصات العالمية مع اشتراكات مشتركة للتوفير الأقصى.",
    category: "pricing",
    icon: Star,
    relatedIds: [4, 7],
    status: "completed",
    energy: 90,
  },
  {
    id: 4,
    title: "دعم 24/7",
    date: "< 5 دقائق",
    content: "فريق دعم متخصص على مدار الساعة لحل أي مشكلة عبر الواتساب والبريد الإلكتروني.",
    category: "support",
    icon: HeadphonesIcon,
    relatedIds: [3, 1],
    status: "completed",
    energy: 98,
  },
  {
    id: 5,
    title: "دفع مرن",
    date: "+10 طرق",
    content: "بطاقات بنكية، فودافون كاش، إنستاباي، وتحويل بنكي — بدون رسوم خفية.",
    category: "payment",
    icon: CreditCard,
    relatedIds: [1, 2],
    status: "completed",
    energy: 85,
  },
  {
    id: 6,
    title: "تجديد ذكي",
    date: "تلقائي",
    content: "إشعار تذكير قبل انتهاء الاشتراك بثلاثة أيام وتجديد تلقائي بنقرة واحدة.",
    category: "renewal",
    icon: RefreshCw,
    relatedIds: [1, 5],
    status: "in-progress",
    energy: 75,
  },
  {
    id: 7,
    title: "منتجات عالمية",
    date: "+50 خدمة",
    content: "نتفليكس، سبوتيفاي، ChatGPT، Adobe، Microsoft 365 وأكثر من 50 خدمة رقمية عالمية.",
    category: "catalog",
    icon: Globe,
    relatedIds: [3, 4],
    status: "completed",
    energy: 92,
  },
];

export function FeaturesTimeline() {
  return <RadialOrbitalTimeline timelineData={timelineData} />;
}
