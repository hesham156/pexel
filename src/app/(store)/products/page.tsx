import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductWithCategory } from "@/types";
import { SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://yourstore.com";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const title = searchParams.search
    ? `نتائج البحث عن "${searchParams.search}" | جميع المنتجات`
    : searchParams.category
    ? `تصفح فئة ${searchParams.category}`
    : "جميع المنتجات - اشتراكات رقمية بأفضل الأسعار";
  const description = "تصفح مجموعة واسعة من الاشتراكات الرقمية - نتفليكس، سبوتيفاي، ChatGPT، VPN وأكثر بأسعار تنافسية";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products`,
      locale: "ar_SA",
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    alternates: { canonical: `${siteUrl}/products` },
    robots: { index: true, follow: true },
  };
}

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}

async function getProducts(params: SearchParams) {
  const page = parseInt(params.page || "1");
  const perPage = 12;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = { isActive: true };

  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.search) {
    where.OR = [
      { nameAr: { contains: params.search, mode: "insensitive" } },
      { name: { contains: params.search, mode: "insensitive" } },
      { tags: { has: params.search } },
    ];
  }

  const orderBy: Record<string, string> = {};
  switch (params.sort) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    case "newest": orderBy.createdAt = "desc"; break;
    default: orderBy.sortOrder = "asc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { products: products as unknown as ProductWithCategory[], total, page, perPage };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ products, total, page, perPage }, categories] = await Promise.all([
    getProducts(searchParams),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">جميع المنتجات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{total} منتج متاح</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">التصفية</h3>
              </div>

              {/* Search */}
              <form method="get" className="mb-5">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="ابحث عن منتج..."
                  className="input-base text-sm"
                />
                {searchParams.category && (
                  <input type="hidden" name="category" value={searchParams.category} />
                )}
                <button type="submit" className="btn-primary w-full mt-2 text-sm py-2">
                  بحث
                </button>
              </form>

              {/* Category Filter */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الفئة</p>
                <div className="space-y-1">
                  <a
                    href="/products"
                    className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                      !searchParams.category
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    جميع الفئات
                  </a>
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                        searchParams.category === cat.slug
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.nameAr}
                    </a>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الترتيب</p>
                <div className="space-y-1">
                  {[
                    { value: "", label: "الأفضل مطابقةً" },
                    { value: "newest", label: "الأحدث" },
                    { value: "price_asc", label: "السعر: الأقل أولاً" },
                    { value: "price_desc", label: "السعر: الأعلى أولاً" },
                  ].map((opt) => (
                    <a
                      key={opt.value}
                      href={`/products?${searchParams.category ? `category=${searchParams.category}&` : ""}sort=${opt.value}`}
                      className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                        (searchParams.sort || "") === opt.value
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {opt.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لم يتم العثور على منتجات</h3>
                <p className="text-gray-500 dark:text-gray-400">جرب تغيير معايير البحث أو الفئة</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`/products?${searchParams.category ? `category=${searchParams.category}&` : ""}${searchParams.sort ? `sort=${searchParams.sort}&` : ""}page=${p}`}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-primary-600 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300"
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
