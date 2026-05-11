import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { serializeData, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CalendarDays, Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

function getDaysRemaining(endDate: string | Date | null) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function SubscriptionStatusBadge({ days }: { days: number | null }) {
  if (days === null) return <Badge variant="gray">غير محدد</Badge>;
  if (days < 0) return <Badge variant="danger">منتهي</Badge>;
  if (days <= 7) return <Badge variant="warning">ينتهي قريباً</Badge>;
  return <Badge variant="success">نشط</Badge>;
}

function DaysCountdown({ days }: { days: number | null }) {
  if (days === null) return <span className="text-gray-400 text-sm">—</span>;
  if (days < 0) return (
    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
      <XCircle className="h-4 w-4" />
      <span className="text-sm font-medium">انتهى منذ {Math.abs(days)} يوم</span>
    </div>
  );
  if (days === 0) return (
    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm font-medium">ينتهي اليوم!</span>
    </div>
  );
  if (days <= 7) return (
    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm font-medium">باقي {days} أيام</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
      <CheckCircle className="h-4 w-4" />
      <span className="text-sm font-medium">باقي {days} يوم</span>
    </div>
  );
}

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const items = await prisma.orderItem.findMany({
    where: {
      order: { userId: session.user.id },
      deliveredData: { not: null },
    },
    include: {
      product: { include: { category: true } },
      order: { select: { id: true, orderNumber: true, createdAt: true } },
    },
    orderBy: { deliveredAt: "desc" },
  });

  const data = serializeData(items);

  const active = data.filter((i: typeof data[0]) => {
    const d = getDaysRemaining(i.subscriptionEndDate);
    return d === null || d >= 0;
  });
  const expired = data.filter((i: typeof data[0]) => {
    const d = getDaysRemaining(i.subscriptionEndDate);
    return d !== null && d < 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">اشتراكاتي</h1>
        <p className="text-gray-500 text-sm mt-1">{active.length} اشتراك نشط · {expired.length} منتهي</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-green-700 dark:text-green-300">{active.length}</p>
              <p className="text-xs text-green-600 dark:text-green-400">اشتراكات نشطة</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-orange-700 dark:text-orange-300">
                {active.filter((i: typeof data[0]) => { const d = getDaysRemaining(i.subscriptionEndDate); return d !== null && d <= 7 && d >= 0; }).length}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">تنتهي خلال 7 أيام</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-700 dark:text-gray-300">{expired.length}</p>
              <p className="text-xs text-gray-500">اشتراكات منتهية</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active subscriptions */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900 dark:text-white">الاشتراكات النشطة</h2>
          {active.map((item: typeof data[0]) => {
            const days = getDaysRemaining(item.subscriptionEndDate);
            const progress = item.subscriptionStartDate && item.subscriptionEndDate
              ? Math.max(0, Math.min(100, ((Date.now() - new Date(item.subscriptionStartDate).getTime()) /
                  (new Date(item.subscriptionEndDate).getTime() - new Date(item.subscriptionStartDate).getTime())) * 100))
              : null;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl shrink-0">
                    {item.product.category?.icon || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{item.product.nameAr}</p>
                        {item.variantLabel && (
                          <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{item.variantLabel}</span>
                        )}
                      </div>
                      <SubscriptionStatusBadge days={days} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      {item.subscriptionStartDate && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>بدأ: {formatDate(item.subscriptionStartDate)}</span>
                        </div>
                      )}
                      {item.subscriptionEndDate && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>ينتهي: {formatDate(item.subscriptionEndDate)}</span>
                        </div>
                      )}
                    </div>

                    <DaysCountdown days={days} />

                    {progress !== null && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>تقدم الاشتراك</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progress > 85 ? "bg-red-500" : progress > 60 ? "bg-orange-500" : "bg-green-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <Link href={`/dashboard/orders/${item.order.id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                        عرض الطلب {item.order.orderNumber}
                      </Link>
                      <Link href="/products" className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline">
                        <RefreshCw className="h-3 w-3" />
                        تجديد الاشتراك
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Expired */}
      {expired.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-500 dark:text-gray-400">الاشتراكات المنتهية</h2>
          {expired.map((item: typeof data[0]) => (
            <Card key={item.id} className="opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl shrink-0">
                  {item.product.category?.icon || "📦"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{item.product.nameAr}</p>
                  {item.subscriptionEndDate && (
                    <p className="text-xs text-gray-400">انتهى في {formatDate(item.subscriptionEndDate)}</p>
                  )}
                </div>
                <Link href="/products" className="text-xs text-primary-600 dark:text-primary-400 hover:underline shrink-0">
                  تجديد
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {data.length === 0 && (
        <Card className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">لا توجد اشتراكات بعد</h3>
          <p className="text-gray-500 text-sm mb-4">اشتر اشتراكاً لتظهر هنا مع تفاصيل الانتهاء</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
            تصفح المنتجات
          </Link>
        </Card>
      )}
    </div>
  );
}
