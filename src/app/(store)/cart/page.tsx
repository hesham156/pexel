"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/context/CurrencyContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { formatAmount } = useCurrency();
  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">السلة فارغة</h1>
          <p className="text-gray-500 dark:text-gray-400">لم تضف أي منتجات بعد</p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="h-4 w-4" />
              تصفح المنتجات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">سلة الشراء</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 hover:underline">
            مسح الكل
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <div className="w-20 h-20 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.nameAr} width={80} height={80} className="object-contain p-2" unoptimized />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {item.nameAr}
                    </h3>
                  </Link>
                  <p className="text-primary-600 dark:text-primary-400 font-bold text-lg mt-1">
                    {formatAmount(item.price * item.quantity)}
                  </p>
                  <p className="text-xs text-gray-400">{formatAmount(item.price)} × {item.quantity}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate pe-2">
                      {item.nameAr} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white shrink-0">
                      {formatAmount(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">الإجمالي</span>
                  <span className="font-black text-primary-600 dark:text-primary-400 text-2xl">
                    {formatAmount(total)}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button fullWidth size="lg">
                  إتمام الشراء
                </Button>
              </Link>
              <Link href="/products">
                <Button fullWidth variant="ghost" size="md" className="mt-2">
                  مواصلة التسوق
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
