"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, X, Check, TrendingDown, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

interface Expense {
  id: string;
  titleAr: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

const CATEGORIES = [
  { value: "HOSTING",   label: "🖥 استضافة وخوادم" },
  { value: "MARKETING", label: "📣 تسويق وإعلانات" },
  { value: "SALARY",    label: "👤 رواتب" },
  { value: "TOOLS",     label: "🛠 برامج وأدوات" },
  { value: "PURCHASE",  label: "📦 مشتريات" },
  { value: "TAX",       label: "🏛 ضرائب ورسوم" },
  { value: "OTHER",     label: "📁 أخرى" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));

const CATEGORY_COLORS: Record<string, string> = {
  HOSTING: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  MARKETING: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  SALARY: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  TOOLS: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  PURCHASE: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  TAX: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  OTHER: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
};

const emptyForm = { titleAr: "", amount: "", category: "OTHER", date: new Date().toISOString().split("T")[0], notes: "" };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const qs = filterCat ? `?category=${filterCat}` : "";
    const res = await fetch(`/api/admin/accounting/expenses${qs}`);
    const data = await res.json();
    if (data.success) setExpenses(data.data);
    setLoading(false);
  }, [filterCat]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const handleSave = async () => {
    if (!form.titleAr.trim() || !form.amount) return toast.error("يرجى ملء الحقول المطلوبة");
    setSaving(true);
    const url = editId ? `/api/admin/accounting/expenses/${editId}` : "/api/admin/accounting/expenses";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) {
      toast.success(editId ? "تم تعديل المصروف" : "تم إضافة المصروف");
      setShowForm(false); setEditId(null); setForm(emptyForm);
      fetchExpenses();
    } else {
      toast.error(data.error || "حدث خطأ");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/accounting/expenses/${id}`, { method: "DELETE" });
    if ((await res.json()).success) { toast.success("تم حذف المصروف"); fetchExpenses(); }
    setDeleteId(null);
  };

  const startEdit = (e: Expense) => {
    setForm({ titleAr: e.titleAr, amount: String(e.amount), category: e.category, date: e.date.split("T")[0], notes: e.notes || "" });
    setEditId(e.id); setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المصاريف والتكاليف</h1>
          <p className="text-gray-500 text-sm mt-1">تسجيل ومتابعة جميع مصاريف العمل</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة مصروف
        </Button>
      </div>

      {/* Summary + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="p-4 flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {totalExpenses.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
            </p>
            <p className="text-xs text-gray-500">إجمالي المصاريف المعروضة</p>
          </div>
        </Card>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <button onClick={() => setFilterCat("")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${!filterCat ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>الكل</button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilterCat(c.value)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterCat === c.value ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-5 border-2 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">{editId ? "تعديل المصروف" : "إضافة مصروف جديد"}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="وصف المصروف *" value={form.titleAr} onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))} placeholder="مثال: استضافة VPS شهر يناير" />
            <Input label="المبلغ (ريال) *" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الفئة</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Input label="التاريخ" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <div className="sm:col-span-2">
              <Input label="ملاحظات (اختياري)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="تفاصيل إضافية..." />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleSave} loading={saving} className="gap-2"><Check className="h-4 w-4" />{editId ? "حفظ التعديلات" : "إضافة"}</Button>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>إلغاء</Button>
          </div>
        </Card>
      )}

      {/* Expenses Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">جاري التحميل...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">📂</div>
            <p className="font-semibold text-gray-600 dark:text-gray-400">لا توجد مصاريف</p>
            <p className="text-sm text-gray-400 mt-1">أضف أول مصروف للبدء في تتبع التكاليف</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {/* Table head */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">الوصف</div>
              <div className="col-span-2">الفئة</div>
              <div className="col-span-2">التاريخ</div>
              <div className="col-span-2 text-end">المبلغ</div>
              <div className="col-span-2 text-center">إجراءات</div>
            </div>
            {expenses.map(expense => (
              <div key={expense.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="col-span-4">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{expense.titleAr}</p>
                  {expense.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{expense.notes}</p>}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${CATEGORY_COLORS[expense.category] ?? CATEGORY_COLORS.OTHER}`}>
                    {CATEGORY_MAP[expense.category] ?? expense.category}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(expense.date).toLocaleDateString("ar-SA")}
                </div>
                <div className="col-span-2 text-end font-bold text-gray-900 dark:text-white">
                  {Number(expense.amount).toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
                </div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button onClick={() => startEdit(expense)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  {deleteId === expense.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(expense.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(expense.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
