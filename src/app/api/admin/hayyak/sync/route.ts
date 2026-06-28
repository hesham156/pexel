import { NextResponse } from "next/server";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";
import { isHayyakEnabled, pushFullCatalog } from "@/lib/hayyak";

export const dynamic = "force-dynamic";

/**
 * رفع الكتالوج الكامل إلى حياك يدوياً.
 * استدعِه عند الربط أول مرة أو عند أي تغيير كبير في المنتجات.
 *   POST /api/admin/hayyak/sync
 */
export async function POST() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  if (!isHayyakEnabled()) {
    return NextResponse.json(
      { success: false, error: "تكامل حياك غير مفعّل. اضبط HAYYAK_SIGNING_SECRET في متغيرات البيئة." },
      { status: 400 }
    );
  }

  try {
    const result = await pushFullCatalog();
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: "فشل رفع الكتالوج إلى حياك. راجع سجلّات الخادم." },
        { status: 502 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `تم رفع الكتالوج إلى حياك بنجاح (${result.products} منتج).`,
      products: result.products,
    });
  } catch (err) {
    return serverError("POST /api/admin/hayyak/sync", err);
  }
}
