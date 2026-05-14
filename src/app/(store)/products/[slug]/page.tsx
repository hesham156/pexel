"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingCart, Check, Zap, Clock, ArrowRight, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PaymentBadges } from "@/components/store/PaymentBadges";
import { useCartStore } from "@/store/cart";
import { parseProductVariants } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ProductWithCategory, ProductVariant } from "@/types";

interface PublicSettings {
  tabby_enabled?: boolean;
  tabby_installments?: string;
  tamara_enabled?: boolean;
  tamara_installments?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const { formatAmount } = useCurrency();
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [publicSettings, setPublicSettings] = useState<PublicSettings>({});
  const { addItem } = useCartStore();

  useEffect(() => {
    // Fetch product and public settings in parallel
    Promise.all([
      fetch(`/api/products/${params.slug}`).then((r) => r.json()),
      fetch("/api/settings/public").then((r) => r.json()),
    ]).then(([productData, settingsData]) => {
      if (productData.success) {
        const p = productData.data;
        const variants = parseProductVariants(p.tags || []);
        p.variants = variants;
        setProduct(p);
        if (variants.length > 0) setSelectedVariant(variants[0]);
      }
      if (settingsData.success) {
        setPublicSettings(settingsData.data);
      }
    }).finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-10">
        <div className="container-custom">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/2" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">المنتج غير موجود</h1>
          <Link href="/products" className="btn-primary mt-4 inline-flex">العودة للمنتجات</Link>
        </div>
      </div>
    );
  }

  // Active price: use selected variant or product base price
  const activePrice = selectedVariant
    ? selectedVariant.price
    : parseFloat(String(product.price));

  const activeComparePrice = selectedVariant?.comparePrice
    ?? (product.comparePrice ? parseFloat(String(product.comparePrice)) : null);

  const discount = activeComparePrice
    ? Math.round(((activeComparePrice - activePrice) / activeComparePrice) * 100)
    : 0;

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: activePrice,
      image: product.image || undefined,
      quantity,
      slug: product.slug,
      variantLabel: selectedVariant?.label,
    });
    setAdded(true);
    const label = selectedVariant ? ` (${selectedVariant.label})` : "";
    toast.success(`تم إضافة ${product.nameAr}${label} إلى السلة`);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">الرئيسية</Link>
          <ArrowRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary-600 dark:hover:text-primary-400">المنتجات</Link>
          <ArrowRight className="h-4 w-4" />
          <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400">{product.category.nameAr}</Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white font-medium">{product.nameAr}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
              {product.image ? (
                <Image src={product.image} alt={product.nameAr} fill className="object-contain p-12" unoptimized />
              ) : (
                <span className="text-8xl">{product.category.icon || "📦"}</span>
              )}
              {discount > 0 && (
                <div className="absolute top-4 start-4">
                  <Badge variant="danger" className="text-base font-bold px-3 py-1">-{discount}% خصم</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline mb-2"
              >
                <span>{product.category.icon}</span>
                {product.category.nameAr}
              </Link>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">{product.nameAr}</h1>

              {/* Delivery badge */}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={product.deliveryMethod === "AUTOMATIC" ? "success" : "warning"} dot>
                  {product.deliveryMethod === "AUTOMATIC" ? (
                    <><Zap className="h-3 w-3" />تسليم فوري تلقائي</>
                  ) : (
                    <><Clock className="h-3 w-3" />تسليم يدوي (1-24 ساعة)</>
                  )}
                </Badge>
                {product.isFeatured && (
                  <Badge variant="default" dot><Star className="h-3 w-3" />مميز</Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {product.descriptionAr && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.descriptionAr}</p>
            )}

            {/* Features */}
            {product.features.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary-600" />
                  ما يتضمنه الاشتراك
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Variants selector ── */}
            {hasVariants && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">اختر مدة الاشتراك</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.label === v.label;
                    const varDiscount = v.comparePrice
                      ? Math.round(((v.comparePrice - v.price) / v.comparePrice) * 100)
                      : 0;
                    return (
                      <button
                        key={v.label}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={cn(
                          "relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all duration-150",
                          isSelected
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-md shadow-primary-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                        )}
                      >
                        {varDiscount > 0 && (
                          <span className="absolute -top-2 -start-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            -{varDiscount}%
                          </span>
                        )}
                        <span className={cn(
                          "text-sm font-bold",
                          isSelected ? "text-primary-700 dark:text-primary-300" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {v.label}
                        </span>
                        <span className={cn(
                          "text-base font-black",
                          isSelected ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-white"
                        )}>
                          {formatAmount(v.price)}
                        </span>
                        {v.comparePrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatAmount(v.comparePrice)}
                          </span>
                        )}
                        {isSelected && (
                          <span className="absolute top-1.5 end-1.5 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-4">
              <div>
                <p className="text-4xl font-black text-gray-900 dark:text-white transition-all duration-200">
                  {formatAmount(activePrice)}
                </p>
                {activeComparePrice && (
                  <p className="text-lg text-gray-400 line-through">{formatAmount(activeComparePrice)}</p>
                )}
              </div>
              {discount > 0 && (
                <div className="mb-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm">
                  وفر {formatAmount(activeComparePrice! - activePrice)}
                </div>
              )}
            </div>

            {/* Payment Badges (Tabby / Tamara) */}
            <PaymentBadges
              price={activePrice}
              tabbyEnabled={!!publicSettings.tabby_enabled}
              tamaraEnabled={!!publicSettings.tamara_enabled}
              tabbyInstallments={publicSettings.tabby_installments ? parseInt(publicSettings.tabby_installments) : 4}
              tamaraInstallments={publicSettings.tamara_installments ? parseInt(publicSettings.tamara_installments) : 3}
            />

            {/* Quantity & Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الكمية:</span>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                  >-</button>
                  <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                  >+</button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                fullWidth
                size="lg"
                className="text-base"
                variant={added ? "success" : "primary"}
                disabled={hasVariants && !selectedVariant}
              >
                {added ? (
                  <><Check className="h-5 w-5" />تم الإضافة إلى السلة</>
                ) : (
                  <><ShoppingCart className="h-5 w-5" />
                    {hasVariants && selectedVariant
                      ? `أضف (${selectedVariant.label}) إلى السلة`
                      : "أضف إلى السلة"
                    }
                  </>
                )}
              </Button>

              <Link href="/checkout">
                <Button fullWidth size="lg" variant="outline" className="text-base">
                  اشتر الآن
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🔒", label: "دفع آمن" },
                { icon: "✅", label: "منتجات أصلية" },
                { icon: "🎧", label: "دعم 24/7" },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
