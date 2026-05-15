"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/context/CurrencyContext";
import { useUpsell } from "@/components/store/UpsellModal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { CartProgressBar } from "@/components/store/CartProgressBar";
import { useConversion } from "@/context/ConversionContext";

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, clearCart, addItem } = useCartStore();
  const { formatAmount } = useCurrency();
  const { showUpsell } = useUpsell();
  const router = useRouter();
  const total = getTotalPrice();
  const conversion = useConversion();

  function CartProgressBarWrapper({ total }: { total: number }) {
    if (!conversion.cart_progress_enabled) return null;
    return (
      <CartProgressBar
        currentTotal={total}
        target={conversion.cart_progress_target}
        reward={conversion.cart_progress_reward}
        coupon={conversion.cart_progress_coupon}
      />
    );
  }

  const handleCheckout = () => {
    closeCart();
    // Navigate to checkout immediately — the upsell renders as a full-screen overlay on top
    router.push("/checkout");
    // Show CHECKOUT upsell (overlay will appear on the checkout page)
    const cartProductIds = items.map((i) => i.id);
    showUpsell({
      cartProductIds,
      trigger: "CHECKOUT",
      onAccept: (upsell) => {
        const upsellVariants = upsell.offerProduct.variants ?? [];
        const upsellPrice =
          upsellVariants.length > 0 ? upsellVariants[0].price : upsell.offerProduct.price;
        const upsellLabel = upsellVariants.length > 0 ? upsellVariants[0].label : undefined;
        addItem({
          id: upsell.offerProduct.id,
          name: upsell.offerProduct.nameAr,
          nameAr: upsell.offerProduct.nameAr,
          price: upsellPrice,
          image: upsell.offerProduct.image || undefined,
          quantity: 1,
          slug: upsell.offerProduct.slug,
          variantLabel: upsellLabel,
        });
        toast.success(`تم إضافة ${upsell.offerProduct.nameAr} إلى السلة 🎉`);
      },
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary-600" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">سلة الشراء</h2>
            {items.length > 0 && (
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-600 hover:underline"
              >
                مسح الكل
              </button>
            )}
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">السلة فارغة</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">أضف منتجات لتظهر هنا</p>
              </div>
              <Button onClick={closeCart} variant="outline" size="sm">
                <Link href="/products">تصفح المنتجات</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.nameAr}
                      width={64}
                      height={64}
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {item.nameAr}
                  </p>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-bold mt-0.5">
                    {formatAmount(item.price)}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
            <CartProgressBarWrapper total={total} />
            <div className="px-6 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 font-medium">الإجمالي</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatAmount(total)}
                </span>
              </div>
              <Button fullWidth size="lg" className="text-base" onClick={handleCheckout}>
                إتمام الشراء
              </Button>
              <Link href="/cart" onClick={closeCart}>
                <Button fullWidth variant="outline" size="md">
                  عرض السلة
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
