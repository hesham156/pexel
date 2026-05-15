import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, notFound } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: {
            include: { product: { select: { nameAr: true, name: true } } },
          },
          coupon: { select: { code: true, discountType: true, discountValue: true } },
        },
      },
    },
  });

  if (!invoice) return notFound("الفاتورة غير موجودة");

  // Also fetch company settings
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["site_name", "tax_number", "company_address", "tax_rate"] } },
    select: { key: true, value: true },
  });
  const cfg = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return NextResponse.json({ success: true, data: { invoice, cfg } });
}
