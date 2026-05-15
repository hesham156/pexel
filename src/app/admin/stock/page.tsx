"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column, Pagination } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface StockItem {
  id: string;
  productId: string;
  data: string;
  isDelivered: boolean;
  createdAt: string;
  product: { nameAr: string };
}

interface Product { id: string; nameAr: string }

export default function AdminStockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showData, setShowData] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ productId: "", data: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    const [stockRes, prodRes] = await Promise.all([
      fetch("/api/admin/stock"),
      fetch("/api/products?limit=100"),
    ]);
    const stockData = await stockRes.json();
    const prodData = await prodRes.json();
    if (stockData.success) setStock(stockData.data);
    if (prodData.success) setProducts(prodData.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.data.trim()) { toast.error("اختر المنتج وأدخل البيانات"); return; }
    setAddLoading(true);
    const lines = form.data.split("\n---\n").filter((l) => l.trim());
    const res = await fetch("/api/admin/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: form.productId, items: lines }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`تم إضافة ${lines.length} عنصر بنجاح`);
      setAddOpen(false);
      setForm({ productId: "", data: "" });
      fetchStock();
    } else {
      toast.error(data.error || "حدث خطأ");
    }
    setAddLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/stock/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast.success("تم الحذف"); setConfirmDeleteId(null); fetchStock(); }
    else toast.error(data.error || "حدث خطأ");
  };

  const columns: Column<StockItem>[] = [
    {
      key: "product",
      title: "المنتج",
      render: (_, row) => <span className="font-medium text-sm">{row.product?.nameAr}</span>,
    },
    {
      key: "data",
      title: "البيانات",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-500 max-w-xs truncate">
            {showData[row.id] ? String(val) : "••••••••••••"}
          </span>
          <button
            onClick={() => setShowData(prev => ({ ...prev, [row.id]: !prev[row.id] }))}
            className="text-gray-400 hover:text-gray-600"
          >
            {showData[row.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      ),
    },
    {
      key: "isDelivered",
      title: "الحالة",
      render: (val) => <Badge variant={val ? "gray" : "success"}>{val ? "مُسلَّم" : "متاح"}</Badge>,
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
        !row.isDelivered ? (
          confirmDeleteId === row.id ? (
            <div className="flex items-center gap-2">
              <button onClick={() => handleDelete(row.id)} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg">تأكيد</button>
              <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border">إلغاء</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDeleteId(row.id)} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          )
        ) : <span className="text-gray-300">—</span>
      ),
    },
  ];

  const available = stock.filter((s) => !s.isDelivered).length;
  const delivered = stock.filter((s) => s.isDelivered).length;
  const totalPages = Math.ceil(stock.length / pageSize);
  const paginatedStock = stock.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مخزون الاشتراكات</h1>
          <p className="text-gray-500 text-sm mt-1">
            {available} متاح • {delivered} مُسلَّم
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          إضافة مخزون
        </Button>
      </div>

      <DataTable columns={columns} data={paginatedStock} loading={loading} emptyMessage="لا يوجد مخزون" />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={stock.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="إضافة مخزون جديد" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <Select
            label="المنتج"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            options={[
              { value: "", label: "اختر منتجاً..." },
              ...products.map((p) => ({ value: p.id, label: p.nameAr })),
            ]}
            required
          />
          <Textarea
            label="بيانات الاشتراكات"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            placeholder="أدخل بيانات الاشتراك الواحد هنا&#10;---&#10;بيانات اشتراك ثانٍ هنا&#10;---&#10;..."
            hint="افصل بين كل اشتراك بـ --- في سطر منفرد لإضافة متعددة"
            rows={8}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button type="submit" loading={addLoading}>إضافة</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
