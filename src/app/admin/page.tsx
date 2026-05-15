import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  ShoppingBag, Users, DollarSign, Package, AlertCircle, CheckCircle, Clock, MessageSquare,
  TrendingUp, Star, Percent,
} from "lucide-react";
import { formatCurrency, formatDate, serializeData } from "@/lib/utils";
import { Badge, getStatusBadge } from "@/components/ui/Badge";
import { Card, StatsCard } from "@/components/ui/Card";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  const [
    totalRevenue,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalCustomers,
    totalProducts,
    openTickets,
    recentOrders,
    lowStockProducts,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { status: "DELIVERED" }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "PENDING_PAYMENT_REVIEW", "PAYMENT_APPROVED", "PROCESSING"] } } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true, payment: true, items: true },
    }),
    // Low-stock: count actual undelivered SubscriptionStock rows (accurate)
    (async () => {
      const stockGroups = await prisma.subscriptionStock.groupBy({
        by: ["productId"],
        where: { isDelivered: false },
        _count: { _all: true },
      });
      const countMap = new Map(stockGroups.map((g) => [g.productId, g._count._all]));
      const autoProducts = await prisma.product.findMany({
        where: { isActive: true, deliveryMethod: "AUTOMATIC" },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      });
      return autoProducts
        .filter((p) => (countMap.get(p.id) ?? 0) < 5)
        .slice(0, 5);
    })(),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, _count: { select: { orderItems: true } } },
      orderBy: { orderItems: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const revenue = parseFloat(String(totalRevenue._sum.total || 0));
  const conversionRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const safeRecentOrders = serializeData(recentOrders);
  const safeLowStock = serializeData(lowStockProducts);
  const safeTopProducts = serializeData(topProducts);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة التحليلات</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">نظرة شاملة على أداء المتجر</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="إجمالي الإيرادات" value={formatCurrency(revenue)} icon={<DollarSign className="h-6 w-6" />} color="primary" />
        <StatsCard title="إجمالي الطلبات" value={totalOrders} icon={<ShoppingBag className="h-6 w-6" />} color="blue" />
        <StatsCard title="العملاء" value={totalCustomers} icon={<Users className="h-6 w-6" />} color="green" />
        <StatsCard title="المنتجات النشطة" value={totalProducts} icon={<Package className="h-6 w-6" />} color="purple" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{pendingOrders}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">طلبات معلقة</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{deliveredOrders}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">طلبات مكتملة</p>
            </div>
          </div>
        </Card>
        <Link href="/admin/tickets">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{openTickets}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">تذاكر مفتوحة</p>
              </div>
            </div>
          </Card>
        </Link>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{conversionRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">معدل الإتمام</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">آخر الطلبات</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">عرض الكل</Link>
          </div>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {["رقم الطلب", "العميل", "المبلغ", "الحالة", "التاريخ"].map((h) => (
                      <th key={h} className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {safeRecentOrders.map((order) => {
                    const { variant, label } = getStatusBadge(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${order.id}`} className="font-mono text-primary-600 dark:text-primary-400 hover:underline text-xs">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.user.name}</td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{formatCurrency(parseFloat(String(order.total)))}</td>
                        <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Top Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-500" />
                الأكثر مبيعاً
              </h2>
              <Link href="/admin/products" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-2">
              {safeTopProducts.map((product, i) => (
                <Link key={product.id} href={`/admin/products/${product.id}`}>
                  <Card hover className="flex items-center gap-3 p-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{product.nameAr}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category?.nameAr}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-bold shrink-0">
                      <Star className="h-3 w-3" />
                      {product._count?.orderItems || 0}
                    </div>
                  </Card>
                </Link>
              ))}
              {safeTopProducts.length === 0 && (
                <Card className="text-center py-4">
                  <p className="text-sm text-gray-400">لا توجد بيانات مبيعات بعد</p>
                </Card>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                تنبيه المخزون
              </h2>
              <Link href="/admin/stock" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">إدارة</Link>
            </div>
            <div className="space-y-3">
              {safeLowStock.length === 0 ? (
                <Card className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">جميع المنتجات لديها مخزون كافٍ ✅</p>
                </Card>
              ) : (
                safeLowStock.map((product) => (
                  <Card key={product.id} className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{product.nameAr}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category.nameAr}</p>
                      </div>
                      <span className={`font-black text-lg ${product.stockCount === 0 ? "text-red-600" : "text-orange-600"}`}>
                        {product.stockCount}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
