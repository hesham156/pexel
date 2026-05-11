import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { ArrowLeft, Zap, Shield, Star, ChevronLeft, HeadphonesIcon } from "lucide-react";
import type { ProductWithCategory } from "@/types";
import { getActiveCategories, getFeaturedProducts, getRecentProducts } from "@/lib/queries";
import type { Metadata } from "next";

// Force dynamic rendering — Neon serverless DB not available at build time
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXTAUTH_URL || "https://yourstore.com";
const siteName = "متجر الاشتراكات الرقمية";

export const metadata: Metadata = {
  title: `اشتر اشتراكات رقمية بأفضل الأسعار | ${siteName}`,
  description: "منصتك الموثوقة لشراء نتفليكس، سبوتيفاي، ChatGPT، VPN، وأكثر من 50 خدمة رقمية عالمية بأسعار مناسبة مع تسليم فوري.",
  keywords: [
    "اشتراكات رقمية", "نتفليكس", "سبوتيفاي", "ChatGPT", "VPN",
    "اشتراك نتفليكس رخيص", "اشتراكات رخيصة", "متجر اشتراكات",
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: siteName,
    description: "منصتك الموثوقة لشراء اشتراكات رقمية بأسعار تنافسية مع تسليم فوري.",
    url: siteUrl,
    locale: "ar_SA",
    type: "website",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: siteName }],
  },
};


const features = [
  { icon: Zap, title: "تسليم فوري", desc: "معظم الاشتراكات تُسلَّم تلقائياً فور اعتماد الدفع", color: "yellow" },
  { icon: Shield, title: "آمان تام", desc: "بيانات مشفرة وحماية كاملة لمعلوماتك الشخصية", color: "green" },
  { icon: Star, title: "أسعار تنافسية", desc: "أفضل الأسعار مقارنةً بالمنصات العالمية", color: "blue" },
  { icon: HeadphonesIcon, title: "دعم 24/7", desc: "فريق دعم متخصص على مدار الساعة لمساعدتك", color: "purple" },
];

export default async function HomePage() {
  const [featured, categories, recent] = await Promise.all([
    getFeaturedProducts(),
    getActiveCategories(),
    getRecentProducts(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        {/* Glow effects */}
        <div className="absolute top-1/4 start-1/4 w-72 h-72 bg-purple-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-primary-500 rounded-full opacity-10 blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 border border-white/20">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              تسليم فوري لمعظم الاشتراكات
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              اشتراكاتك الرقمية
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-400 to-orange-400">
                بأفضل الأسعار
              </span>
            </h1>

            <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              منصتك الموثوقة لشراء نتفليكس، سبوتيفاي، ChatGPT، VPN، وأكثر من 50 خدمة رقمية عالمية بأسعار مناسبة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-lg shadow-black/20 text-base"
              >
                تصفح المنتجات
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-base"
              >
                إنشاء حساب مجاني
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-4">
              {[
                { label: "عميل راضٍ", value: "+5000" },
                { label: "منتج رقمي", value: "+50" },
                { label: "طلب مكتمل", value: "+10K" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الفئات</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">تصفح منتجاتنا حسب الفئة</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:gap-2 transition-all font-medium">
              عرض الكل
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                  style={{ background: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {cat.nameAr}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {cat._count.products} منتج
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المنتجات المميزة</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">اختارها فريقنا خصيصاً لك</p>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:gap-2 transition-all font-medium">
                عرض الكل
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">لماذا تختارنا؟</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">نحن نضمن لك أفضل تجربة شراء</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const colors: Record<string, string> = {
                yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
                green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
              };
              return (
                <div key={f.title} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colors[f.color]}`}>
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Products */}
      {recent.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">أحدث المنتجات</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">آخر ما أضفناه لمتجرنا</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recent.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-black text-white mb-4">جاهز للبدء؟</h2>
          <p className="text-white/80 mb-8 text-lg max-w-xl mx-auto">
            سجل حساباً مجانياً الآن واستمتع بأفضل الاشتراكات الرقمية
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-lg text-base"
            >
              إنشاء حساب مجاني
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-white border-2 border-white/30 font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all text-base"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
