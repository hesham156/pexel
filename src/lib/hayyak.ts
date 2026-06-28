/**
 * تكامل منصة "حياك" (Hayyak) — متجر مبرمَج خاص
 * ----------------------------------------------------------------------------
 * يدفع هذا المتجر بياناته إلى حياك عبر طلبات HTTP موقّعة بـ HMAC-SHA256:
 *   - الكتالوج الكامل  → POST /webhooks/custom/{store_id}/catalog
 *   - الأحداث اللحظية  → POST /webhooks/custom/{store_id}/events
 *
 * الإعداد عبر متغيرات البيئة (.env):
 *   HAYYAK_SIGNING_SECRET   مفتاح التوقيع (whsec_...)  — إلزامي لتفعيل التكامل
 *   HAYYAK_STORE_ID         معرّف المتجر في حياك        — افتراضي "pexelco"
 *   HAYYAK_BASE_URL         عنوان حياك                  — افتراضي "https://7ayak.app"
 *
 * كل الدوال "أطلق وانسَ" (fire-and-forget): تلتقط أي خطأ داخلياً ولا توقف
 * المسار الأساسي للطلب أبداً، حتى لو كان حياك معطّلاً أو غير متاح.
 */
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const SIGNING_SECRET = process.env.HAYYAK_SIGNING_SECRET || "";
const STORE_ID = process.env.HAYYAK_STORE_ID || "pexelco";
const BASE_URL = (process.env.HAYYAK_BASE_URL || "https://7ayak.app").replace(/\/+$/, "");

/** هل التكامل مفعّل؟ (يحتاج مفتاح توقيع فقط) */
export function isHayyakEnabled(): boolean {
  return SIGNING_SECRET.length > 0;
}

/** حالة التكامل للعرض في لوحة الإدارة — لا يكشف المفتاح السري إطلاقاً */
export function getHayyakStatus() {
  return {
    enabled: isHayyakEnabled(),
    storeId: STORE_ID,
    baseUrl: BASE_URL,
    catalogUrl: `${BASE_URL}${catalogPath()}`,
    eventsUrl: `${BASE_URL}${eventsPath()}`,
  };
}

/** توقيع البايتات الخام تماماً كما تُرسَل بـ HMAC-SHA256 */
function sign(rawBody: string): string {
  return crypto.createHmac("sha256", SIGNING_SECRET).update(rawBody).digest("hex");
}

/**
 * إرسال طلب POST موقّع إلى حياك. لا يرمي استثناءً أبداً — يعيد نجاح/فشل فقط.
 * نوقّع نفس السلسلة النصية التي نرسلها بالضبط (لا إعادة تنسيق بعد التوقيع).
 */
async function post(path: string, payload: unknown): Promise<boolean> {
  if (!isHayyakEnabled()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[hayyak] HAYYAK_SIGNING_SECRET غير مضبوط — تم تجاهل الإرسال.");
    }
    return false;
  }

  try {
    const rawBody = JSON.stringify(payload);
    const signature = sign(rawBody);

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hayyak-Signature": `sha256=${signature}`,
      },
      body: rawBody,
      // لا نريد لانتظار حياك أن يعلّق طلب المتجر
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[hayyak] فشل ${path} → ${res.status} ${text.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[hayyak] خطأ أثناء الإرسال إلى ${path}:`, err);
    return false;
  }
}

const eventsPath = () => `/webhooks/custom/${STORE_ID}/events`;
const catalogPath = () => `/webhooks/custom/${STORE_ID}/catalog`;

// ── أنواع الأحداث ────────────────────────────────────────────────────────────

export type HayyakEvent =
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "order.created"
  | "order.status_updated"
  | "cart.abandoned";

/**
 * إرسال حدث لحظي واحد إلى حياك بالشكل { event, data }.
 * الأحداث تُعالَج لا-تزامنياً مع منع التكرار، فإعادة الإرسال آمنة.
 */
export async function sendHayyakEvent(event: HayyakEvent, data: unknown): Promise<boolean> {
  return post(eventsPath(), { event, data });
}

// ── محوّلات البيانات (Mappers) ───────────────────────────────────────────────

/** خريطة حالة الطلب الداخلية → نص عربي مفهوم للعميل */
const ORDER_STATUS_AR: Record<string, string> = {
  PENDING: "بانتظار الدفع",
  PENDING_PAYMENT_REVIEW: "قيد مراجعة الدفع",
  PAYMENT_APPROVED: "تمت الموافقة على الدفع",
  PROCESSING: "قيد المعالجة",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
  REFUNDED: "مُسترجَع",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_AR[status] || status;
}

/** الحد الأدنى لشكل الطلب المطلوب لبناء حمولة الحدث */
type OrderForEvent = {
  id: string;
  orderNumber: string;
  status: string;
  total: unknown; // Prisma.Decimal | number | string
  user?: { name?: string | null; phone?: string | null } | null;
};

function buildOrderData(order: OrderForEvent, currency: string) {
  return {
    id: order.id,
    reference_id: order.orderNumber,
    total: Number(order.total),
    currency,
    status: orderStatusLabel(order.status),
    customer_name: order.user?.name || "",
    customer_phone: order.user?.phone || "",
  };
}

/** تحويل منتج Prisma إلى عنصر كتالوج/حدث بصيغة حياك */
function buildProductData(
  product: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    descriptionAr?: string | null;
    description?: string | null;
    price: unknown;
    comparePrice?: unknown;
    image?: string | null;
    images?: string[];
    stockCount?: number;
    tags?: string[];
    category?: { nameAr?: string | null; name?: string | null } | null;
  },
  domain: string
) {
  // الفاريانتات مخزّنة داخل tags بالشكل "variant:<label>:<price>"
  const variantValues = (product.tags || [])
    .filter((t) => t.startsWith("variant:"))
    .map((t) => t.split(":")[1])
    .filter(Boolean);

  const data: Record<string, unknown> = {
    id: product.id,
    name: product.nameAr || product.name,
    description: product.descriptionAr || product.description || "",
    price: Number(product.price),
    sku: product.slug,
    quantity: product.stockCount ?? 0,
    image: product.image || (product.images && product.images[0]) || undefined,
    url: domain ? `${domain}/products/${product.slug}` : undefined,
  };

  if (product.comparePrice != null) {
    data.regular_price = Number(product.comparePrice);
  }
  if (product.category?.nameAr || product.category?.name) {
    data.categories = [product.category.nameAr || product.category.name];
  }
  if (variantValues.length > 0) {
    data.options = [{ option: "الخيار", values: variantValues }];
  }

  return data;
}

// ── معلومات المتجر (من الإعدادات) ────────────────────────────────────────────

async function getStoreInfo() {
  const keys = ["site_name", "currency", "site_email"];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const get = (k: string) => settings.find((s) => s.key === k)?.value;

  const domain = (process.env.NEXTAUTH_URL || "").replace(/\/+$/, "");
  return {
    name: get("site_name") || "المتجر",
    currency: get("currency") || "SAR",
    email: get("site_email") || undefined,
    domain,
  };
}

// ── واجهات عامة لإطلاق الأحداث ────────────────────────────────────────────────

/** حدث: تم إنشاء طلب → رسالة تأكيد واتساب للعميل */
export async function notifyOrderCreated(order: OrderForEvent): Promise<void> {
  const { currency } = await getStoreInfo();
  await sendHayyakEvent("order.created", buildOrderData(order, currency));
}

/** حدث: تغيّرت حالة الطلب → إشعار واتساب بالحالة الجديدة */
export async function notifyOrderStatusUpdated(order: OrderForEvent): Promise<void> {
  const { currency } = await getStoreInfo();
  await sendHayyakEvent("order.status_updated", buildOrderData(order, currency));
}

/** حدث: إنشاء/تحديث منتج → تحديث الكتالوج فوراً في حياك */
export async function notifyProductUpserted(
  product: Parameters<typeof buildProductData>[0],
  isNew: boolean
): Promise<void> {
  const { domain } = await getStoreInfo();
  await sendHayyakEvent(
    isNew ? "product.created" : "product.updated",
    buildProductData(product, domain)
  );
}

/** حدث: حذف منتج → إزالته من الكتالوج في حياك */
export async function notifyProductDeleted(productId: string): Promise<void> {
  await sendHayyakEvent("product.deleted", { id: productId });
}

/** حدث: سلة متروكة → تسجيلها + تذكير واتساب + إشعار التاجر */
export async function notifyCartAbandoned(data: {
  customer_name?: string;
  customer_phone: string;
  total?: number;
  currency?: string;
  items?: Array<{ id: string; name: string; quantity: number; price: number }>;
}): Promise<void> {
  const { currency } = await getStoreInfo();
  await sendHayyakEvent("cart.abandoned", { currency, ...data });
}

// ── رفع الكتالوج الكامل ───────────────────────────────────────────────────────

/**
 * بناء ورفع الكتالوج الكامل من قاعدة البيانات إلى حياك.
 * يُستدعى عند الربط أول مرة، ثم دورياً أو عند أي تغيير كبير.
 * يستبدل الكتالوج المخزَّن بالكامل.
 */
export async function pushFullCatalog(): Promise<{ ok: boolean; products: number }> {
  const store = await getStoreInfo();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      include: { category: { select: { nameAr: true, name: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, nameAr: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const payload = {
    store: {
      name: store.name,
      domain: store.domain,
      currency: store.currency,
      email: store.email,
    },
    products: products.map((p) => buildProductData(p, store.domain)),
    categories: categories.map((c) => ({ id: c.id, name: c.nameAr || c.name })),
  };

  const ok = await post(catalogPath(), payload);
  return { ok, products: products.length };
}
