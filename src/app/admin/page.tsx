import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  ShoppingBag, Users, DollarSign, Package, AlertCircle, CheckCircle, Clock, MessageSquare,
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
    prisma.product.findMany({
      where: { isActive: true, stockCount: { lt: 5 } },
      include: { category: true },
      take: 5,
    }),
  ]);

  const revenue = parseFloat(String(totalRevenue._sum.total || 0));
  const safeRecentOrders = serializeData(recentOrders);
  const safeLowStock = serializeData(lowStockProducts);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
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
            <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
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
              <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{openTickets}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">تذاكر مفتوحة</p>
              </div>
            </div>
          </Card>
        </Link>
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
              <Card className="text-center py-6">
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
  );
}
