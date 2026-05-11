import { cache } from "react";
import { prisma } from "./prisma";
import { serializeData } from "./utils";
import type { ProductWithCategory } from "@/types";

/**
 * React cache() deduplicates identical calls within the same request.
 * So if multiple components on the same page call getCategories(),
 * it only hits the DB once.
 *
 * Note: serializeData converts Prisma Decimal → string via JSON round-trip,
 * so returned prices are strings at runtime (compatible with `number | string`).
 */

export const getActiveCategories = cache(async () => {
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return serializeData(cats);
});

export const getFeaturedProducts = cache(async (): Promise<ProductWithCategory[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });
  return serializeData(products) as unknown as ProductWithCategory[];
});

export const getRecentProducts = cache(async (): Promise<ProductWithCategory[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  return serializeData(products) as unknown as ProductWithCategory[];
});

export const getProductBySlug = cache(async (slug: string): Promise<ProductWithCategory | null> => {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });
  return product ? (serializeData(product) as unknown as ProductWithCategory) : null;
});

export const getCategoryWithProducts = cache(async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!category) return null;
  const serialized = serializeData(category);
  return {
    ...serialized,
    products: serialized.products as unknown as ProductWithCategory[],
  };
});
