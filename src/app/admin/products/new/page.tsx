"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Plus, Trash2, GripVertical, Check, Zap, Clock,
  Star, Package, Eye, AlertCircle, CheckCircle2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Category { id: string; nameAr: string; icon?: string }
interface Variant { label: string; price: string; comparePrice: string }

/* ─── Checklist item ─── */
function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", done ? "text-green-600 dark:text-green-400" : "text-gray-400")}>
      {done
        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        : <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      }
      {label}
    </div>
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [form, setForm] = useState({
    nameAr: "", name: "", slug: "", descriptionAr: "", description: "",
    price: "", comparePrice: "", categoryId: "", image: "",
    featuresAr: "", features: "", deliveryMethod: "MANUAL",
    duration: "", isFeatured: false, sortOrder: "0",
  });

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => {
      if (d.success) setCategories(d.data);
    });
  }, []);

  /* ── Variant helpers ── */
  const addVariant = () => {
    setVariants(v => [...v, { label: "", price: "", comparePrice: "" }]);
  };
  const removeVariant = (i: number) => {
    setVariants(v => v.filter((_, idx) => idx !== i));
    setSelectedVariantIdx(0);
  };
  const updateVariant = (i: number, field: keyof Variant, val: string) =>
    setVariants(v => v.map((vr, idx) => idx === i ? { ...vr, [field]: val } : vr));

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const v of variants) {
      if (!v.label.trim() || !v.price) {
        toast.error("كل خيار يجب أن يكون له اسم وسعر");
        return;
      }
    }
    setLoading(true);
    try {
      const variantTags = variants.map(v =>
        `variant:${v.label.trim()}:${parseFloat(v.price)}${v.comparePrice ? `:${parseFloat(v.comparePrice)}` : ""}`
      );
      const basePrice = variants.length > 0 ? parseFloat(variants[0].price) : parseFloat(form.price);
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: basePrice,
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
          sortOrder: parseInt(form.sortOrder),
          featuresAr: form.featuresAr.split("\n").filter(Boolean),
          features: form.features.split("\n").filter(Boolean),
          tags: variantTags,
        }),
      });
      const data = await res.json();
      if (data.success) { toast.success("تم إنشاء المنتج"); router.push("/admin/products"); }
      else toast.error(data.error || "حدث خطأ");
    } finally { setLoading(false); }
  };

  const set = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const hasVariants = variants.length > 0;
  const selectedCat = categories.find(c => c.id === form.categoryId);

  /* ── Preview computed values ── */
  const activeVariant = hasVariants ? variants[selectedVariantIdx] : null;
  const previewPrice = activeVariant
    ? (parseFloat(activeVariant.price) || 0)
    : (parseFloat(form.price) || 0);
  const previewCompare = activeVariant
    ? (parseFloat(activeVariant.comparePrice) || 0)
    : (parseFloat(form.comparePrice) || 0);
  const discount = previewCompare > previewPrice
    ? Math.round(((previewCompare - previewPrice) / previewCompare) * 100)
    : 0;
  const featuresList = form.featuresAr.split("\n").filter(Boolean);

  /* Checklist */
  const checks = [
    { done: !!form.nameAr,        label: "الاسم بالعربي" },
    { done: !!form.name,          label: "الاسم بالإنجليزي" },
    { done: !!form.slug,          label: "الرابط (slug)" },
    { done: !!form.categoryId,    label: "الفئة" },
    { done: hasVariants || !!form.price, label: "السعر أو الخيارات" },
    { done: !!form.descriptionAr, label: "الوصف" },
    { done: !!form.image,         label: "الصورة" },
    { done: featuresList.length > 0, label: "المميزات" },
  ];
  const completeness = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">منتج جديد</h1>
        <p className="text-gray-500 text-sm mt-1">إنشاء منتج اشتراك جديد</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">

        {/* ════ LEFT: Form ════ */}
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">المعلومات الأساسية</h2>
            <Input label="الاسم بالعربي" value={form.nameAr} onChange={e => set("nameAr", e.target.value)} required />
            <Input label="الاسم بالإنجليزي" value={form.name} onChange={e => set("name", e.target.value)} required />
            <Input label="الرابط (slug)" value={form.slug} onChange={e => set("slug", e.target.value)} required hint='مثال: netflix-premium' />
            <Select
              label="الفئة"
              value={form.categoryId}
              onChange={e => set("categoryId", e.target.value)}
              required
              options={[{ value: "", label: "اختر الفئة" }, ...categories.map(c => ({ value: c.id, label: c.nameAr }))]}
            />
            <Textarea label="الوصف بالعربي" value={form.descriptionAr} onChange={e => set("descriptionAr", e.target.value)} rows={3} />
            <Textarea label="الوصف بالإنجليزي" value={form.description} onChange={e => set("description", e.target.value)} rows={3} />
          </Card>

          {/* Variants */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-700 dark:text-gray-300">خيارات الاشتراك (Variants)</h2>
                <p className="text-xs text-gray-400 mt-0.5">مثال: شهر / 3 شهور / 6 شهور – كل خيار بسعره</p>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={addVariant}>
                <Plus className="h-4 w-4" />إضافة خيار
              </Button>
            </div>

            {variants.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm">لا توجد خيارات – اضغط "إضافة خيار" لإضافة مدد الاشتراك</p>
                <p className="text-gray-300 text-xs mt-1">أو اترك فارغاً لمنتج بسعر موحد</p>
              </div>
            )}

            {variants.map((v, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <GripVertical className="h-5 w-5 text-gray-300 mt-2 shrink-0" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="اسم الخيار" value={v.label} onChange={e => updateVariant(i, "label", e.target.value)} placeholder="شهر واحد" required />
                  <Input label="السعر (ر.س)" type="number" step="0.01" value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} placeholder="29.99" required />
                  <Input label="السعر الأصلي" type="number" step="0.01" value={v.comparePrice} onChange={e => updateVariant(i, "comparePrice", e.target.value)} placeholder="49.99" />
                </div>
                <button type="button" onClick={() => removeVariant(i)} className="mt-7 text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>

          {/* Price & Delivery */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">السعر والتوصيل</h2>
            {!hasVariants ? (
              <div className="grid grid-cols-2 gap-4">
                <Input label="السعر (ر.س)" type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} required />
                <Input label="السعر الأصلي (اختياري)" type="number" step="0.01" value={form.comparePrice} onChange={e => set("comparePrice", e.target.value)} />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 text-sm text-primary-700 dark:text-primary-300">
                💡 السعر سيُحدَّد تلقائياً من الخيار المختار
              </div>
            )}
            <Select
              label="طريقة التوصيل"
              value={form.deliveryMethod}
              onChange={e => set("deliveryMethod", e.target.value)}
              options={[{ value: "MANUAL", label: "يدوي" }, { value: "AUTOMATIC", label: "تلقائي من المخزون" }]}
            />
            <Input label="مدة الاشتراك" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="مثال: شهر واحد، سنة" />
          </Card>

          {/* Features & Image */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">المميزات والصورة</h2>
            <Textarea label="المميزات بالعربي (كل ميزة في سطر)" value={form.featuresAr} onChange={e => set("featuresAr", e.target.value)} rows={4} placeholder={"جودة 4K\nأجهزة متعددة\nدعم فني"} />
            <Textarea label="المميزات بالإنجليزي (كل ميزة في سطر)" value={form.features} onChange={e => set("features", e.target.value)} rows={4} placeholder={"4K Quality\nMultiple devices\nSupport"} />
            <Input label="رابط الصورة" value={form.image} onChange={e => set("image", e.target.value)} placeholder="https://..." />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={e => set("isFeatured", e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 dark:text-gray-300">منتج مميز (يظهر في الصفحة الرئيسية)</label>
            </div>
            <Input label="الترتيب" type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)} />
          </Card>

          <div className="flex gap-3 justify-end pb-6">
            <Button variant="secondary" type="button" onClick={() => router.push("/admin/products")}>إلغاء</Button>
            <Button type="submit" loading={loading}>إنشاء المنتج</Button>
          </div>
        </form>

        {/* ════ RIGHT: Live Preview Panel ════ */}
        <div className="hidden xl:block sticky top-6 space-y-4">

          {/* ─ Completeness ─ */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary-600" />
                اكتمال المنتج
              </h3>
              <span className={cn(
                "text-sm font-bold",
                completeness === 100 ? "text-green-600" : completeness >= 60 ? "text-amber-500" : "text-red-500"
              )}>
                {completeness}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  completeness === 100 ? "bg-green-500" : completeness >= 60 ? "bg-amber-400" : "bg-red-400"
                )}
                style={{ width: `${completeness}%` }}
              />
            </div>
            {/* Checklist */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {checks.map(c => <CheckItem key={c.label} done={c.done} label={c.label} />)}
            </div>
          </Card>

          {/* ─ Product Card Preview ─ */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400 ms-2">معاينة بطاقة المنتج</span>
            </div>

            {/* Mini product card */}
            <div className="p-4">
              <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                {/* Image area */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                  {form.image ? (
                    <Image src={form.image} alt="preview" fill className="object-contain p-4" unoptimized onError={() => {}} />
                  ) : (
                    <span className="text-4xl">{selectedCat?.icon || "📦"}</span>
                  )}
                  {discount > 0 && (
                    <div className="absolute top-2 start-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                      -{discount}%
                    </div>
                  )}
                  <div className="absolute top-2 end-2">
                    <div className={cn(
                      "text-xs px-2 py-0.5 rounded-lg font-medium flex items-center gap-1",
                      form.deliveryMethod === "AUTOMATIC"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    )}>
                      {form.deliveryMethod === "AUTOMATIC"
                        ? <><Zap className="h-2.5 w-2.5" />فوري</>
                        : <><Clock className="h-2.5 w-2.5" />يدوي</>
                      }
                    </div>
                  </div>
                  {form.isFeatured && (
                    <div className="absolute top-2 start-2 mt-6">
                      <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Star className="h-2.5 w-2.5" />مميز
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {selectedCat?.nameAr || "الفئة"}
                  </p>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-1">
                    {form.nameAr || "اسم المنتج"}
                  </h3>

                  {/* Variants mini-selector */}
                  {hasVariants && (
                    <div className="flex flex-wrap gap-1">
                      {variants.slice(0, 3).map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedVariantIdx(i)}
                          className={cn(
                            "px-2 py-0.5 text-xs rounded-lg border transition-all",
                            selectedVariantIdx === i
                              ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                              : "border-gray-200 dark:border-gray-600 text-gray-500"
                          )}
                        >
                          {v.label || `خيار ${i + 1}`}
                        </button>
                      ))}
                      {variants.length > 3 && (
                        <span className="text-xs text-gray-400 self-center">+{variants.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  {featuresList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {featuresList.slice(0, 2).map(f => (
                        <span key={f} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price row */}
                  <div className="flex items-center justify-between pt-1 border-t dark:border-gray-700">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {previewPrice > 0 ? formatCurrency(previewPrice) : "—"}
                      </p>
                      {previewCompare > 0 && previewCompare > previewPrice && (
                        <p className="text-xs text-gray-400 line-through">{formatCurrency(previewCompare)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-primary-600 text-white px-2.5 py-1.5 rounded-xl">
                      <Package className="h-3 w-3" />أضف
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ─ Product page preview snippet ─ */}
          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">معاينة نتيجة Google</h3>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 space-y-1">
              <p className="text-xs text-green-600 truncate">yourstore.com › products › {form.slug || "..."}</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                {form.nameAr || "اسم المنتج"}{selectedCat ? ` | ${selectedCat.nameAr}` : ""}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {form.descriptionAr || `اشتر ${form.nameAr || "المنتج"} بأفضل الأسعار...`}
              </p>
            </div>

            {/* Variants summary */}
            {hasVariants && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">خيارات الاشتراك</p>
                <div className="space-y-1">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{v.label || `خيار ${i + 1}`}</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {v.price ? `${parseFloat(v.price)} ر.س` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick tips */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-3 space-y-1.5">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">💡 نصائح سريعة</p>
              <ul className="text-xs text-amber-700 dark:text-amber-500 space-y-1">
                <li>• الصورة تزيد المبيعات 40%</li>
                <li>• الوصف يحسن ظهور Google</li>
                <li>• الخيارات تزيد متوسط الطلب</li>
                <li>• اجعل المميزات واضحة ومختصرة</li>
              </ul>
            </div>
          </Card>

          {/* Sticky submit */}
          <div className="flex gap-2">
            <Button variant="secondary" type="button" fullWidth onClick={() => router.push("/admin/products")}>إلغاء</Button>
            <Button type="submit" fullWidth form="product-form" loading={loading}>إنشاء المنتج</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
