import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, MessageSquare, Bell, ArrowLeft, Zap, CheckCircle, Clock } from "lucide-react";
import { formatCurrency, formatDate, getOrderStatusLabel } from "@/lib/utils";
import { Badge, getStatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import AdBanner from "@/components/store/AdBanner";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [orders, unreadNotifications, openTickets] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } }, payment: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
    prisma.supportTicket.count({
      where: { userId: session.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
  ]);

  const totalSpent = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + parseFloat(String(o.total)), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-l from-primary-600 to-purple-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-black mb-1">
          مرحباً، {session.user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-white/70 text-sm">هذه نظرة عامة على حسابك</p>
      </div>

      {/* Ads Banners */}
      <div className="-mx-4 sm:mx-0">
        <AdBanner placement="DASHBOARD_MAIN" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShoppingBag, label: "إجمالي الطلبات", value: orders.length, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
          { icon: CheckCircle, label: "طلبات مكتملة", value: orders.filter(o => o.status === "DELIVERED").length, color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" },
          { icon: Bell, label: "إشعارات غير مقروءة", value: unreadNotifications, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" },
          { icon: MessageSquare, label: "تذاكر مفتوحة", value: openTickets, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" },
        ].map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} shrink-0`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Total Spent */}
      <Card className="bg-gradient-to-l from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المشتريات</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-5xl opacity-20">💰</div>
        </div>
      </Card>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">آخر الطلبات</h2>
          <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:gap-2 transition-all font-medium">
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">لا توجد طلبات بعد</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ابدأ بتصفح منتجاتنا</p>
            <Link href="/products" className="btn-primary inline-flex mt-4 text-sm">
              تصفح المنتجات
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const { variant, label } = getStatusBadge(order.status);
              return (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                  <Card hover className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.items.length} منتج • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={variant}>{label}</Badge>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatCurrency(parseFloat(String(order.total)))}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
