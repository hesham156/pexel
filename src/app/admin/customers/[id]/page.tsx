"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Phone, ShoppingBag, Calendar, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderNumber: string;
  total: number | string;
  status: string;
  createdAt: string;
  items: { id: string }[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  orders: Order[];
  _count: { orders: number };
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCustomer(data.data);
        else router.push("/admin/customers");
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const toggleActive = async () => {
    if (!customer) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/customers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !customer.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer((c) => (c ? { ...c, isActive: !c.isActive } : c));
        toast.success(customer.isActive ? "تم تعطيل الحساب" : "تم تفعيل الحساب");
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!customer) return null;

  const deliveredOrders = customer.orders.filter((o) => o.status === "DELIVERED");
  const totalSpent = deliveredOrders.reduce((s, o) => s + parseFloat(String(o.total)), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/admin/customers" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
        <button
          onClick={toggleActive}
          disabled={toggling}
          className={`ms-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
            customer.isActive
              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
              : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
          }`}
        >
          {customer.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {customer.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <Card className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">معلومات العميل</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{customer.name}</p>
                <Badge variant={customer.isActive ? "success" : "danger"}>
                  {customer.isActive ? "نشط" : "معطل"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              {customer.email}
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                {customer.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              تاريخ التسجيل: {formatDate(customer.createdAt)}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-black text-gray-900 dark:text-white">{customer._count.orders}</p>
            <p className="text-xs text-gray-500 mt-1">إجمالي الطلبات</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-black text-green-600 dark:text-green-400">{deliveredOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">طلبات مكتملة</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-gray-500 mt-1">إجمالي الإنفاق</p>
          </Card>
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الطلبات</h2>
        {customer.orders.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">لا توجد طلبات بعد</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {customer.orders.map((order) => {
              const { variant, label } = getStatusBadge(order.status);
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <Card hover className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">
                          {order.items.length} منتج • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={variant}>{label}</Badge>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
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
