import { Card } from "@/components/ui/Card";
import { getHayyakStatus } from "@/lib/hayyak";
import { HayyakSyncButton } from "./HayyakSyncButton";
import { CheckCircle2, XCircle, Plug, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "التكاملات" };

export default function IntegrationsPage() {
  const hayyak = getHayyakStatus();

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Plug className="h-6 w-6 text-primary-600" />
          التكاملات
        </h1>
        <p className="text-gray-500 text-sm mt-1">ربط المتجر بالخدمات الخارجية</p>
      </div>

      {/* Hayyak card */}
      <Card className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">حياك (Hayyak)</h2>
              <p className="text-xs text-gray-500">المساعد الذكي، الردود التلقائية، واسترجاع السلات المتروكة عبر واتساب</p>
            </div>
          </div>

          {hayyak.enabled ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 shrink-0">
              <CheckCircle2 className="h-4 w-4" /> مفعّل
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 shrink-0">
              <XCircle className="h-4 w-4" /> غير مفعّل
            </span>
          )}
        </div>

        {!hayyak.enabled && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            التكامل غير مفعّل. اضبط متغيّر البيئة{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">HAYYAK_SIGNING_SECRET</code>{" "}
            بمفتاح التوقيع من لوحة حياك، ثم أعد تشغيل الخادم.
          </div>
        )}

        {/* Connection details */}
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
            <dt className="text-xs text-gray-400 mb-1">معرّف المتجر</dt>
            <dd className="font-mono text-gray-900 dark:text-white">{hayyak.storeId}</dd>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:col-span-2 min-w-0">
            <dt className="text-xs text-gray-400 mb-1">نقطة الكتالوج</dt>
            <dd className="font-mono text-gray-900 dark:text-white text-xs break-all">{hayyak.catalogUrl}</dd>
          </div>
        </dl>

        {/* Events sent */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الأحداث المُرسَلة تلقائياً</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            {[
              "إنشاء/تحديث/حذف منتج → مزامنة الكتالوج",
              "إنشاء طلب → تأكيد واتساب للعميل",
              "تغيّر حالة الطلب → إشعار واتساب",
              "رفع إثبات الدفع → تحديث الحالة",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Sync action */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-gray-500 max-w-sm">
            ارفع الكتالوج الكامل عند الربط أول مرة أو بعد أي تغيير كبير في المنتجات. يستبدل الكتالوج المخزَّن في حياك بالكامل.
          </p>
          <HayyakSyncButton disabled={!hayyak.enabled} />
        </div>
      </Card>
    </div>
  );
}
