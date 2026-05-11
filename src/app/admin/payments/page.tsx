"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge, getStatusBadge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Input";
import { formatCurrency, formatDate, getPaymentMethodLabel } from "@/lib/utils";

interface Payment {
  id: string;
  method: string;
  status: string;
  amount: number;
  proofImage?: string;
  transactionId?: string;
  reviewedAt?: string;
  createdAt: string;
  order: { id: string; orderNumber: string; user: { name: string; email: string } };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/payments${qs}`);
    const data = await res.json();
    if (data.success) setPayments(data.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const columns: Column<Payment>[] = [
    {
      key: "order",
      title: "الطلب",
      render: (_, row) => (
        <Link href={`/admin/orders/${row.order?.id}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-xs font-bold">
          {row.order?.orderNumber}
        </Link>
      ),
    },
    {
      key: "order",
      title: "العميل",
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium">{row.order?.user?.name}</p>
          <p className="text-xs text-gray-500">{row.order?.user?.email}</p>
        </div>
      ),
    },
    {
      key: "amount",
      title: "المبلغ",
      render: (val) => <span className="font-bold">{formatCurrency(String(val))}</span>,
    },
    {
      key: "method",
      title: "الطريقة",
      render: (val) => <span className="text-sm">{getPaymentMethodLabel(String(val))}</span>,
    },
    {
      key: "status",
      title: "الحالة",
      render: (val) => { const b = getStatusBadge(String(val)); return <Badge variant={b.variant}>{b.label}</Badge>; },
    },
    {
      key: "proofImage",
      title: "الإثبات",
      render: (val) => val ? (
        <a href={String(val)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">عرض</a>
      ) : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      key: "createdAt",
      title: "التاريخ",
      render: (val) => <span className="text-xs text-gray-500">{formatDate(String(val))}</span>,
    },
    {
      key: "id",
      title: "مراجعة",
      render: (_, row) => (
        row.status === "UPLOADED" ? (
          <Link href={`/admin/orders/${row.order?.id}`} className="text-sm font-medium text-orange-600 hover:underline">
            مراجعة
          </Link>
        ) : <span className="text-gray-400 text-xs">—</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المدفوعات</h1>
          <p className="text-gray-500 text-sm mt-1">{payments.length} عملية دفع</p>
        </div>
      </div>

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-48"
        options={[
          { value: "", label: "جميع الحالات" },
          { value: "PENDING", label: "في الانتظار" },
          { value: "UPLOADED", label: "تم الرفع" },
          { value: "APPROVED", label: "موافق عليه" },
          { value: "REJECTED", label: "مرفوض" },
        ]}
      />

      <DataTable columns={columns} data={payments} loading={loading} emptyMessage="لا توجد مدفوعات" />
    </div>
  );
}
