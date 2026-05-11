"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
}

const emptyForm = { name: "", nameAr: "", slug: "", icon: "", color: "#7c3aed", sortOrder: 0, isActive: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) { toast.success("تم إنشاء الفئة"); setAddOpen(false); setForm(emptyForm); fetch_(); }
    else toast.error(data.error || "حدث خطأ");
    setSaveLoading(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSaveLoading(true);
    const res = await fetch(`/api/admin/categories/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) { toast.success("تم التحديث"); setEditId(null); setForm(emptyForm); fetch_(); }
    else toast.error(data.error || "حدث خطأ");
    setSaveLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast.success("تم الحذف"); fetch_(); }
    else toast.error(data.error || "حدث خطأ");
    setDeleteId(null);
  };

  const openEdit = (row: Category) => {
    setForm({ name: row.name, nameAr: row.nameAr, slug: row.slug, icon: row.icon || "", color: row.color || "#7c3aed", sortOrder: row.sortOrder, isActive: row.isActive });
    setEditId(row.id);
  };

  const columns: Column<Category>[] = [
    {
      key: "nameAr",
      title: "الفئة",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: `${row.color}20` }}>
            {row.icon}
          </div>
          <div>
            <p className="font-semibold">{row.nameAr}</p>
            <p className="text-xs text-gray-500">{row.name}</p>
          </div>
        </div>
      ),
    },
    { key: "slug", title: "الرابط", render: (val) => <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{String(val)}</code> },
    {
      key: "_count",
      title: "المنتجات",
      render: (val) => <span className="font-bold">{(val as { products: number })?.products || 0}</span>,
    },
    {
      key: "isActive",
      title: "الحالة",
      render: (val) => <Badge variant={val ? "success" : "gray"}>{val ? "نشطة" : "معطلة"}</Badge>,
    },
    {
      key: "id",
      title: "إجراءات",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><Edit className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  const CategoryForm = ({ onSubmit }: { onSubmit: (e: React.FormEvent) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="الاسم بالعربي" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
      <Input label="الاسم بالإنجليزي" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input label="الرابط (slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required hint="مثال: streaming" />
      <Input label="الأيقونة (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📺" />
      <div className="flex gap-4">
        <Input label="اللون" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <Input label="الترتيب" type="number" value={String(form.sortOrder)} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
        <span className="text-sm text-gray-700 dark:text-gray-300">نشطة</span>
      </label>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" type="button" onClick={() => { setAddOpen(false); setEditId(null); setForm(emptyForm); }}>إلغاء</Button>
        <Button type="submit" loading={saveLoading}>{editId ? "حفظ التغييرات" : "إنشاء"}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الفئات</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} فئة</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus className="h-4 w-4" />فئة جديدة</Button>
      </div>

      <DataTable columns={columns} data={categories} loading={loading} emptyMessage="لا توجد فئات" />

      <Modal isOpen={addOpen} onClose={() => { setAddOpen(false); setForm(emptyForm); }} title="إنشاء فئة جديدة">
        <CategoryForm onSubmit={handleAdd} />
      </Modal>

      <Modal isOpen={!!editId} onClose={() => { setEditId(null); setForm(emptyForm); }} title="تعديل الفئة">
        <CategoryForm onSubmit={handleEdit} />
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف الفئة" message="هل تريد حذف هذه الفئة؟" />
    </div>
  );
}
