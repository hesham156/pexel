"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable, Column, Pagination } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Admin { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string }

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/admins");
    const data = await res.json();
    if (data.success) setAdmins(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) { toast.success("تم إنشاء المشرف"); setAddOpen(false); fetchAdmins(); }
    else toast.error(data.error || "حدث خطأ");
    setAddLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/admins/${deleteId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast.success("تم الحذف"); fetchAdmins(); }
    else toast.error(data.error || "حدث خطأ");
    setDeleteId(null);
  };

  const columns: Column<Admin>[] = [
    {
      key: "name",
      title: "الاسم",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "الدور",
      render: (val) => (
        <Badge variant={val === "ADMIN" ? "default" : "purple"}>
          {val === "ADMIN" ? "مدير عام" : "موظف"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      title: "الحالة",
      render: (val) => <Badge variant={val ? "success" : "danger"}>{val ? "نشط" : "معطل"}</Badge>,
    },
    {
      key: "createdAt",
      title: "تاريخ الإضافة",
      render: (val) => <span className="text-xs text-gray-500">{formatDate(String(val))}</span>,
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

  const totalPages = Math.ceil(admins.length / pageSize);
  const paginatedAdmins = admins.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المشرفون والموظفون</h1>
          <p className="text-gray-500 text-sm mt-1">{admins.length} مشرف</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />مشرف جديد</Button>
      </div>

      <DataTable columns={columns} data={paginatedAdmins} loading={loading} emptyMessage="لا يوجد مشرفون" />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={admins.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="إضافة مشرف جديد">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="كلمة المرور" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required hint="8 أحرف على الأقل" />
          <Select
            label="الدور"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[{ value: "STAFF", label: "موظف" }, { value: "ADMIN", label: "مدير عام" }]}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button type="submit" loading={addLoading}>إضافة</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف المشرف" message="هل تريد حذف هذا المشرف؟" />
    </div>
  );
}
