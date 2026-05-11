"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable, Column, Pagination } from "@/components/ui/DataTable";
import { formatDate, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState({
    code: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "",
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    if (data.success) setCoupons(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: true,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("تم إنشاء الكوبون");
      setAddOpen(false);
      fetchCoupons();
    } else {
      toast.error(data.error || "حدث خطأ");
    }
    setAddLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/coupons/${deleteId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast.success("تم حذف الكوبون"); fetchCoupons(); }
    else toast.error(data.error || "حدث خطأ");
    setDeleteId(null);
  };

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      title: "الكود",
      render: (val) => <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{String(val)}</span>,
    },
    {
      key: "discountType",
      title: "نوع الخصم",
      render: (val, row) => (
        <span className="font-bold">
          {val === "PERCENTAGE" ? `${row.discountValue}%` : formatCurrency(row.discountValue)}
        </span>
      ),
    },
    {
      key: "usedCount",
      title: "الاستخدام",
      render: (val, row) => (
        <span>{String(val)} / {row.maxUses ? row.maxUses : "∞"}</span>
      ),
    },
    {
      key: "isActive",
      title: "الحالة",
      render: (val) => <Badge variant={val ? "success" : "gray"}>{val ? "نشط" : "معطل"}</Badge>,
    },
    {
      key: "expiresAt",
      title: "انتهاء الصلاحية",
      render: (val) => <span className="text-xs text-gray-500">{val ? formatDate(String(val)) : "لا يوجد"}</span>,
    },
    {
      key: "id",
      title: "حذف",
      render: (_, row) => (
        <button onClick={() => setDeleteId(row.id)} className="text-red-500 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const totalPages = Math.ceil(coupons.length / pageSize);
  const paginatedCoupons = coupons.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الكوبونات</h1>
          <p className="text-gray-500 text-sm mt-1">{coupons.length} كوبون</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />كوبون جديد</Button>
      </div>

      <DataTable columns={columns} data={paginatedCoupons} loading={loading} emptyMessage="لا توجد كوبونات" />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={coupons.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="إنشاء كوبون جديد">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="كود الكوبون" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" required />
          <Select
            label="نوع الخصم"
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            options={[{ value: "PERCENTAGE", label: "نسبة مئوية %" }, { value: "FIXED", label: "مبلغ ثابت" }]}
          />
          <Input label="قيمة الخصم" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="20" required />
          <Input label="الحد الأدنى للطلب" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="100" hint="اختياري" />
          <Input label="الحد الأقصى للاستخدام" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="50" hint="اتركه فارغاً لعدد غير محدود" />
          <Input label="تاريخ الانتهاء" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} hint="اختياري" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button type="submit" loading={addLoading}>إنشاء</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف الكوبون" message="هل تريد حذف هذا الكوبون نهائياً؟" />
    </div>
  );
}
