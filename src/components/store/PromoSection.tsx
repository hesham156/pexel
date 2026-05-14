"use client";

import { useState, useEffect } from "react";
import { Tag, Percent, Copy, Check, ExternalLink, Megaphone, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/store/AnimatedSection";

interface Announcement {
  id: string;
  titleAr: string;
  type: string;
  link?: string | null;
  couponCode?: string | null;
  bgColor: string;
  textColor: string;
  expiresAt?: string | null;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; gradient: string; border: string }> = {
  COUPON:  { icon: Tag,      label: "كوبون خصم",  gradient: "from-violet-500 to-purple-600",  border: "border-violet-200 dark:border-violet-800" },
  SALE:    { icon: Percent,  label: "عرض خاص",    gradient: "from-rose-500 to-pink-600",     border: "border-rose-200 dark:border-rose-800" },
  INFO:    { icon: Megaphone,label: "إعلان",       gradient: "from-blue-500 to-indigo-600",   border: "border-blue-200 dark:border-blue-800" },
  SUCCESS: { icon: Zap,      label: "خبر سار",    gradient: "from-emerald-500 to-teal-600",  border: "border-emerald-200 dark:border-emerald-800" },
  WARNING: { icon: Clock,    label: "عرض محدود",  gradient: "from-amber-500 to-orange-600",  border: "border-amber-200 dark:border-amber-800" },
};

function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("انتهى العرض"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setRemaining(`ينتهي خلال ${d} يوم`);
      } else {
        setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
      <Clock className="h-3 w-3" />{remaining}
    </span>
  );
}

export function PromoSection() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => { if (d.success) setItems(d.data); })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`تم نسخ الكوبون: ${code} 🎉`);
    setTimeout(() => setCopied(null), 3000);
  };

  return (
    <section className="py-14 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold mb-3">
            <Zap className="h-4 w-4" />
            عروض حصرية
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">الإعلانات والعروض</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">استفد من أفضل العروض والكوبونات المتاحة</p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.INFO;
            const Icon = cfg.icon;

            return (
              <StaggerItem key={item.id}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
                  transition={{ duration: 0.22 }}
                  className={`relative overflow-hidden rounded-2xl border ${cfg.border} bg-white dark:bg-gray-800`}
                >
                  {/* Top gradient band */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.gradient}`} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${cfg.gradient} text-white`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-3">
                      {item.titleAr}
                    </p>

                    {/* Coupon code */}
                    {item.couponCode && (
                      <button
                        onClick={() => copyCoupon(item.couponCode!)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group mb-3"
                      >
                        <span className="font-mono font-black text-lg tracking-widest text-primary-700 dark:text-primary-300 group-hover:scale-105 transition-transform">
                          {item.couponCode}
                        </span>
                        <span className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          copied === item.couponCode
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 group-hover:text-primary-700"
                        }`}>
                          {copied === item.couponCode
                            ? <><Check className="h-3 w-3" />تم النسخ</>
                            : <><Copy className="h-3 w-3" />انسخ</>
                          }
                        </span>
                      </button>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2">
                      {item.expiresAt && <CountdownBadge expiresAt={item.expiresAt} />}
                      {item.link && (
                        <Link
                          href={item.link}
                          className={`ms-auto inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r ${cfg.gradient} text-white hover:opacity-90 transition-opacity`}
                        >
                          اكتشف الآن <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
