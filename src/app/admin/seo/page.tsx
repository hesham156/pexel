"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Search, Share2, Bot, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// These map to Setting.key in the DB
const SEO_KEYS = [
  "seo_site_name",
  "seo_site_url",
  "seo_meta_title",
  "seo_meta_description",
  "seo_meta_keywords",
  "seo_og_title",
  "seo_og_description",
  "seo_og_image",
  "seo_twitter_handle",
  "seo_google_verification",
  "seo_bing_verification",
  "seo_google_analytics",
  "seo_google_tag_manager",
  "seo_robots_index",
];

const SEO_DEFAULTS: Record<string, { labelAr: string; type: string; placeholder?: string; hint?: string }> = {
  seo_site_name:           { labelAr: "اسم الموقع", type: "text", placeholder: "متجر الاشتراكات الرقمية" },
  seo_site_url:            { labelAr: "رابط الموقع الرئيسي", type: "text", placeholder: "https://yourstore.com" },
  seo_meta_title:          { labelAr: "عنوان الصفحة الرئيسية", type: "text", placeholder: "متجر الاشتراكات الرقمية - اشتر بأفضل الأسعار" },
  seo_meta_description:    { labelAr: "وصف الموقع (Meta Description)", type: "textarea", placeholder: "منصتك الموثوقة للاشتراكات الرقمية..." },
  seo_meta_keywords:       { labelAr: "الكلمات المفتاحية", type: "textarea", placeholder: "اشتراكات رقمية، نتفليكس، سبوتيفاي...", hint: "افصل بين الكلمات بفواصل" },
  seo_og_title:            { labelAr: "عنوان Open Graph (OG)", type: "text" },
  seo_og_description:      { labelAr: "وصف Open Graph (OG)", type: "textarea" },
  seo_og_image:            { labelAr: "صورة Open Graph", type: "text", placeholder: "https://yourstore.com/og-image.png", hint: "الحجم المثالي 1200×630 بكسل" },
  seo_twitter_handle:      { labelAr: "حساب تويتر/X", type: "text", placeholder: "@yourstore" },
  seo_google_verification: { labelAr: "كود تحقق Google Search Console", type: "text", placeholder: "abcdef1234567890" },
  seo_bing_verification:   { labelAr: "كود تحقق Bing Webmaster", type: "text" },
  seo_google_analytics:    { labelAr: "Google Analytics ID", type: "text", placeholder: "G-XXXXXXXXXX", hint: "أو UA-XXXXXXXXX للإصدار القديم" },
  seo_google_tag_manager:  { labelAr: "Google Tag Manager ID", type: "text", placeholder: "GTM-XXXXXXX" },
  seo_robots_index:        { labelAr: "السماح لمحركات البحث بالفهرسة", type: "boolean" },
};

interface Section {
  title: string;
  icon: React.ReactNode;
  color: string;
  keys: string[];
}

const SECTIONS: Section[] = [
  {
    title: "المعلومات الأساسية",
    icon: <Globe className="h-4 w-4" />,
    color: "bg-blue-50 dark:bg-blue-900/10",
    keys: ["seo_site_name", "seo_site_url"],
  },
  {
    title: "Meta Tags – محركات البحث",
    icon: <Search className="h-4 w-4" />,
    color: "bg-purple-50 dark:bg-purple-900/10",
    keys: ["seo_meta_title", "seo_meta_description", "seo_meta_keywords", "seo_robots_index"],
  },
  {
    title: "Open Graph & Social Sharing",
    icon: <Share2 className="h-4 w-4" />,
    color: "bg-indigo-50 dark:bg-indigo-900/10",
    keys: ["seo_og_title", "seo_og_description", "seo_og_image", "seo_twitter_handle"],
  },
  {
    title: "أدوات التحليل والتحقق",
    icon: <Bot className="h-4 w-4" />,
    color: "bg-green-50 dark:bg-green-900/10",
    keys: ["seo_google_verification", "seo_bing_verification", "seo_google_analytics", "seo_google_tag_manager"],
  },
];

export default function AdminSeoPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch from the general settings API, filtering seo_ keys
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const v: Record<string, string> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.data as any[]).forEach((s) => {
            if (SEO_KEYS.includes(s.key)) v[s.key] = s.value;
          });
          // Fill defaults for missing keys
          SEO_KEYS.forEach((k) => { if (!(k in v)) v[k] = ""; });
          setValues(v);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, val: string) => setValues((p) => ({ ...p, [key]: val }));
  const bool = (key: string) => values[key] === "true";

  const handleSave = async () => {
    setSaving(true);
    // Upsert via settings API
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: values }),
    });
    const data = await res.json();
    if (data.success) toast.success("تم حفظ إعدادات SEO ✓");
    else toast.error(data.error || "حدث خطأ");
    setSaving(false);
  };

  // Character counters for important fields
  const titleLen = (values["seo_meta_title"] || "").length;
  const descLen  = (values["seo_meta_description"] || "").length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-700" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            إعدادات SEO
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            تحسين محركات البحث ومشاركة المحتوى على الشبكات الاجتماعية
          </p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>

      {/* Search Preview */}
      <Card className="p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">معاينة نتيجة Google</p>
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-1 bg-white dark:bg-gray-900">
          <p className="text-xs text-green-600 dark:text-green-400 truncate">
            {values["seo_site_url"] || "https://yourstore.com"} ›
          </p>
          <p className={cn(
            "text-base font-medium truncate",
            titleLen > 60 ? "text-orange-500" : "text-blue-600 dark:text-blue-400"
          )}>
            {values["seo_meta_title"] || "عنوان الصفحة يظهر هنا"}
          </p>
          <p className={cn(
            "text-sm leading-relaxed line-clamp-2",
            descLen > 160 ? "text-orange-500" : "text-gray-600 dark:text-gray-400"
          )}>
            {values["seo_meta_description"] || "وصف الصفحة يظهر هنا في نتائج Google..."}
          </p>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span className={titleLen > 60 ? "text-orange-500 font-bold" : ""}>
            العنوان: {titleLen}/60 حرف {titleLen > 60 ? "⚠️ طويل" : titleLen > 50 ? "✅" : ""}
          </span>
          <span className={descLen > 160 ? "text-orange-500 font-bold" : ""}>
            الوصف: {descLen}/160 حرف {descLen > 160 ? "⚠️ طويل" : descLen > 120 ? "✅" : ""}
          </span>
        </div>
      </Card>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <Card key={section.title} className="overflow-hidden p-0">
          <div className={cn("flex items-center gap-2 px-6 py-4 border-b dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200", section.color)}>
            {section.icon}
            {section.title}
          </div>
          <div className="px-6 py-5 space-y-4">
            {section.keys.map((key) => {
              const conf = SEO_DEFAULTS[key];
              if (!conf) return null;

              if (conf.type === "boolean") {
                return (
                  <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{conf.labelAr}</p>
                      <p className="text-xs text-gray-500 mt-0.5">إيقاف الفهرسة يمنع ظهور موقعك في محركات البحث</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set(key, bool(key) ? "false" : "true")}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        bool(key) ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform",
                        bool(key) ? "-translate-x-1 rtl:translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </label>
                );
              }

              if (conf.type === "textarea") {
                return (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {conf.labelAr}
                    </label>
                    <textarea
                      value={values[key] || ""}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={conf.placeholder}
                      rows={3}
                      className={cn(
                        "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                        "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 transition-colors resize-none"
                      )}
                    />
                    {conf.hint && <p className="text-xs text-gray-400">{conf.hint}</p>}
                  </div>
                );
              }

              return (
                <Input
                  key={key}
                  label={conf.labelAr}
                  value={values[key] || ""}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={conf.placeholder}
                  hint={conf.hint}
                />
              );
            })}
          </div>
        </Card>
      ))}

      {/* SEO tips */}
      <Card className="p-5 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <p className="font-bold text-amber-800 dark:text-amber-300 mb-3 text-sm">💡 نصائح SEO مهمة</p>
        <ul className="space-y-1.5 text-xs text-amber-700 dark:text-amber-400">
          <li>• عنوان الصفحة بين 50-60 حرف للحصول على أفضل ظهور في Google</li>
          <li>• وصف الصفحة بين 120-160 حرف – يجذب المستخدمين للنقر</li>
          <li>• صورة OG بحجم 1200×630 بكسل للمشاركة المثلى على السوشيال ميديا</li>
          <li>• الكلمات المفتاحية لا تؤثر مباشرة على Google لكنها مفيدة لمحركات أخرى</li>
          <li>• بعد الحفظ، أرسل sitemap.xml إلى Google Search Console</li>
        </ul>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} loading={saving} size="lg">
          <Save className="h-4 w-4" />
          حفظ جميع إعدادات SEO
        </Button>
      </div>
    </div>
  );
}
