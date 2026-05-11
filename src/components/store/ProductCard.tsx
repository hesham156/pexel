"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Zap, Clock } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import type { ProductWithCategory } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithCategory;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();

  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const comparePrice = product.comparePrice
    ? typeof product.comparePrice === "string"
      ? parseFloat(product.comparePrice)
      : product.comparePrice
    : null;

  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price,
      image: product.image || undefined,
      quantity: 1,
      slug: product.slug,
    });
    toast.success(`تم إضافة ${product.nameAr} إلى السلة`);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className={cn(
          "group relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
          className
        )}
      >
        {/* Badges */}
        <div className="absolute top-3 start-3 z-10 flex flex-col gap-1.5">
          {product.isFeatured && (
            <Badge variant="default" className="text-xs">
              <Star className="h-3 w-3" />
              مميز
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="danger" className="text-xs font-bold">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Delivery Method Badge */}
        <div className="absolute top-3 end-3 z-10">
          <Badge
            variant={product.deliveryMethod === "AUTOMATIC" ? "success" : "warning"}
            className="text-xs"
            dot
          >
            {product.deliveryMethod === "AUTOMATIC" ? (
              <>
                <Zap className="h-3 w-3" />
                تسليم فوري
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                يدوي
              </>
            )}
          </Badge>
        </div>

        {/* Product Image */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.nameAr}
              fill
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">
                {product.category.icon || "📦"}
              </div>
            </div>
          )}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
            style={{ background: product.category.color || "#7c3aed" }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
            {product.category.nameAr}
          </p>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.nameAr}
          </h3>

          {product.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(price)}
              </div>
              {comparePrice && (
                <div className="text-sm text-gray-400 line-through">
                  {formatCurrency(comparePrice)}
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              أضف
            </Button>
          </div>
        </div>

        {/* Stock indicator */}
        {product.stockCount < 5 && product.stockCount > 0 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-orange-500 font-medium">
              ⚠️ متبقي {product.stockCount} فقط!
            </p>
          </div>
        )}
        {product.stockCount === 0 && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center rounded-2xl">
            <span className="bg-gray-800 text-white px-4 py-2 rounded-xl font-bold text-sm">
              نفذ المخزون
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
