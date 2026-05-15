"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge, getStatusBadge } from "@/components/ui/Badge";
import { DataTable, Column, Pagination } from "@/components/ui/DataTable";
import { Select, Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderWithDetails } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/orders${qs}`);
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); setPage(1); }, [fetchOrders]);

  const filteredOrders = search.trim()
    ? orders.filter((o) => {
        const q = search.toLowerCase();
        return (
          o.orderNumber?.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q)
        );
      })
    : orders;

  const columns: Column<OrderWithDetails>[] = [
    {
      key: "orderNumber",
      title: "رقم الطلب",
      render: (_, row) => (
        <Link href={`/admin/orders/${row.id}`} className="font-mono text-primary-600 dark:text-primary-400 hover:underline text-xs font-bold">
          {row.orderNumber}
        </Link>
      ),
    },
    {
      key: "user",
      title: "العميل",
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.user?.name}</p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: "total",
      title: "الإجمالي",
      render: (val) => <span className="font-bold">{formatCurrency(String(val))}</span>,
    },
    {
      key: "status",
      title: "الحالة",
      render: (val) => { const b = getStatusBadge(String(val)); return <Badge variant={b.variant}>{b.label}</Badge>; },
    },
    {
      key: "payment",
      title: "الدفع",
      render: (_, row) => {
        if (!row.payment) return <span className="text-gray-400 text-xs">—</span>;
        const b = getStatusBadge(row.payment.status);
        return <Badge variant={b.variant}>{b.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      title: "التاريخ",
      render: (val) => <span className="text-xs text-gray-500">{formatDate(String(val))}</span>,
    },
    {
      key: "id",
      title: "إجراءات",
      render: (_, row) => (
        <Link href={`/admin/orders/${row.id}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
          عرض
        </Link>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الطلبات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{orders.length} طلب</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="بحث برقم الطلب أو اسم العميل..."
            className="ps-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-52"
          options={[
            { value: "", label: "جميع الحالات" },
            { value: "PENDING", label: "في الانتظار" },
            { value: "PENDING_PAYMENT_REVIEW", label: "بانتظار مراجعة الدفع" },
            { value: "PAYMENT_APPROVED", label: "تم الموافقة على الدفع" },
            { value: "PROCESSING", label: "جاري المعالجة" },
            { value: "DELIVERED", label: "تم التسليم" },
            { value: "CANCELLED", label: "ملغي" },
            { value: "REFUNDED", label: "مسترد" },
          ]}
        />
      </div>

      <DataTable columns={columns} data={paginatedOrders} loading={loading} emptyMessage="لا توجد طلبات" />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}
