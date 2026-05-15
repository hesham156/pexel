"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, X, Send, Eye, EyeOff, CalendarDays, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, getStatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { formatCurrency, formatDateTime, formatDate, getPaymentMethodLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import type { OrderWithDetails } from "@/types";

interface DeliveryForm {
  data: string;
  startDate: string;
  endDate: string;
  variantLabel: string;
}

function defaultStartEnd() {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | false>(false);
  const [deliveryForms, setDeliveryForms] = useState<Record<string, DeliveryForm>>({});
  const [adminNotes, setAdminNotes] = useState("");
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data);
          // Pre-fill delivery forms with default dates
          const forms: Record<string, DeliveryForm> = {};
          data.data.items?.forEach((item: { id: string; product: { nameAr: string } }) => {
            forms[item.id] = { data: "", variantLabel: "", ...defaultStartEnd() };
          });
          setDeliveryForms(forms);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateForm = (itemId: string, field: keyof DeliveryForm, value: string) =>
    setDeliveryForms(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));

  const handlePaymentAction = async (action: "approve" | "reject") => {
    setActionLoading("payment");
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === "approve" ? "✅ تم الموافقة على الدفع" : "❌ تم رفض الدفع");
        setOrder(data.data);
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverItem = async (itemId: string) => {
    const form = deliveryForms[itemId];
    if (!form?.data.trim()) { toast.error("أدخل بيانات التسليم أولاً"); return; }
    setActionLoading(itemId);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          deliveredData: form.data,
          subscriptionStartDate: form.startDate,
          subscriptionEndDate: form.endDate,
          variantLabel: form.variantLabel,
        }),
      });
      const result = await res.json();
      if (result.success) { toast.success("✅ تم التسليم بنجاح"); setOrder(result.data); }
      else toast.error(result.error || "حدث خطأ");
    } catch {
      toast.error("تعذّر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  );
  if (!order) return <div className="text-center py-20 text-gray-500">الطلب غير موجود</div>;

  const { variant, label } = getStatusBadge(order.status);
  const payBadge = order.payment ? getStatusBadge(order.payment.status) : null;
  const canDeliver = order.status === "PAYMENT_APPROVED" || order.status === "PROCESSING";

  return (
    <div className="space-y-6 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-primary-600">لوحة الإدارة</Link>
        <ArrowRight className="h-4 w-4" />
        <Link href="/admin/orders" className="hover:text-primary-600">الطلبات</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-white">{order.orderNumber}</span>
      </nav>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge variant={variant} className="text-sm">{label}</Badge>
      </div>

      {/* Payment review banner */}
      {order.payment?.status === "UPLOADED" && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                🔔 بانتظار مراجعة إثبات الدفع
              </h2>
              {order.payment.proofImage && (
                <a href={order.payment.proofImage} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <Eye className="h-3.5 w-3.5" /> عرض إثبات الدفع
                </a>
              )}
              <div className="mt-2">
                <Textarea label="ملاحظة للعميل (اختياري)" value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)} placeholder="سبب الرفض أو ملاحظة..." rows={2} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handlePaymentAction("approve")} loading={actionLoading === "payment"} variant="success">
                <Check className="h-4 w-4" /> موافقة
              </Button>
              <Button onClick={() => handlePaymentAction("reject")} loading={actionLoading === "payment"} variant="danger">
                <X className="h-4 w-4" /> رفض
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">المنتجات والتسليم</h2>
            <div className="space-y-5">
              {order.items?.map((item) => {
                const form = deliveryForms[item.id] || {};
                const isDelivered = !!item.deliveredData;
                const daysLeft = item.subscriptionEndDate
                  ? Math.ceil((new Date(item.subscriptionEndDate).getTime() - Date.now()) / 86400000)
                  : null;

                return (
                  <div key={item.id} className={`rounded-xl border p-4 ${isDelivered ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10" : "border-gray-200 dark:border-gray-700"}`}>
                    {/* Product header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        {item.product.image
                          ? <Image src={item.product.image} alt={item.product.nameAr} width={48} height={48} className="object-contain p-1" unoptimized />
                          : <span className="text-xl">📦</span>}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{item.product.nameAr}</p>
                        <p className="text-sm text-gray-500">الكمية: {item.quantity} • {formatCurrency(item.price)}</p>
                        {item.variantLabel && (
                          <span className="inline-block text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full mt-1">{item.variantLabel}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {item.product.deliveryMethod === "AUTOMATIC"
                          ? <><Zap className="h-3.5 w-3.5 text-yellow-500" /> تلقائي</>
                          : <><Clock className="h-3.5 w-3.5" /> يدوي</>}
                      </div>
                    </div>

                    {isDelivered ? (
                      <div className="space-y-3">
                        {/* Delivered badge + subscription timeline */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 dark:text-green-300">
                            <Check className="h-4 w-4" /> تم التسليم في {formatDate(item.deliveredAt!)}
                          </span>
                          {daysLeft !== null && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              daysLeft < 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                              daysLeft <= 7 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                              "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            }`}>
                              {daysLeft < 0 ? `انتهى منذ ${Math.abs(daysLeft)} يوم` : `باقي ${daysLeft} يوم`}
                            </span>
                          )}
                        </div>

                        {(item.subscriptionStartDate || item.subscriptionEndDate) && (
                          <div className="flex gap-4 text-xs text-gray-500">
                            {item.subscriptionStartDate && (
                              <div className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> بدأ: {formatDate(item.subscriptionStartDate)}</div>
                            )}
                            {item.subscriptionEndDate && (
                              <div className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> ينتهي: {formatDate(item.subscriptionEndDate)}</div>
                            )}
                          </div>
                        )}

                        {/* Credentials toggle */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                          <button onClick={() => setShowCredentials(p => ({ ...p, [item.id]: !p[item.id] }))}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-1">
                            {showCredentials[item.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {showCredentials[item.id] ? "إخفاء البيانات" : "عرض بيانات الاشتراك"}
                          </button>
                          {showCredentials[item.id] && (
                            <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                              {item.deliveredData}
                            </pre>
                          )}
                        </div>
                      </div>
                    ) : canDeliver ? (
                      <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">تسليم الاشتراك</h3>
                        <Textarea label="بيانات الاشتراك (بريد + كلمة مرور أو كود)"
                          value={form.data || ""} onChange={e => updateForm(item.id, "data", e.target.value)}
                          placeholder={"email: user@example.com\npassword: pass123"} rows={3} />
                        <Input label="اسم الباقة (اختياري)" value={form.variantLabel || ""}
                          onChange={e => updateForm(item.id, "variantLabel", e.target.value)} placeholder="مثال: شهر 1 / سنة" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input label="تاريخ البدء" type="date" value={form.startDate || ""}
                            onChange={e => updateForm(item.id, "startDate", e.target.value)} />
                          <Input label="تاريخ الانتهاء" type="date" value={form.endDate || ""}
                            onChange={e => updateForm(item.id, "endDate", e.target.value)} />
                        </div>
                        <Button size="sm" onClick={() => handleDeliverItem(item.id)} loading={actionLoading === item.id}>
                          <Send className="h-4 w-4" /> تسليم الاشتراك
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">في انتظار الموافقة على الدفع</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">ملخص الطلب</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {parseFloat(String(order.discount)) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>الإجمالي</span>
                <span className="text-primary-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">العميل</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.user?.name}</p>
              <p className="text-gray-500">{order.user?.email}</p>
              {order.user?.phone && <p className="text-gray-500">{order.user.phone}</p>}
            </div>
          </Card>

          {order.payment && (
            <Card>
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">الدفع</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الطريقة</span>
                  <span>{getPaymentMethodLabel(order.payment.method)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">الحالة</span>
                  {payBadge && <Badge variant={payBadge.variant}>{payBadge.label}</Badge>}
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم المعاملة</span>
                    <span className="font-mono text-xs">{order.payment.transactionId}</span>
                  </div>
                )}
                {order.payment.proofImage && (
                  <a href={order.payment.proofImage} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    <Eye className="h-3 w-3" /> عرض إثبات الدفع
                  </a>
                )}
              </div>
            </Card>
          )}

          {order.notes && (
            <Card>
              <h2 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">ملاحظات العميل</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{order.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
