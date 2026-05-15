import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, badRequest, notFound, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdmin()) return unauthorized();
  const invoices = await prisma.invoice.findMany({
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { nameAr: true } } } },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ success: true, data: invoices });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  try {
    const { orderId } = await req.json();
    if (!orderId) return badRequest("رقم الطلب مطلوب");

    const existing = await prisma.invoice.findUnique({ where: { orderId } });
    if (existing) return NextResponse.json({ success: false, error: "تم إصدار فاتورة لهذا الطلب مسبقاً", data: existing });

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return notFound("الطلب غير موجود");

    const taxSetting = await prisma.setting.findUnique({ where: { key: "tax_rate" } });
    const taxRate   = parseFloat(taxSetting?.value ?? "15");
    const subtotal  = Number(order.subtotal);
    const discount  = Number(order.discount ?? 0);
    const total     = Number(order.total);
    const taxAmount = total * taxRate / (100 + taxRate);

    // Race-safe invoice number: find max sequence for this year
    const year   = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const last   = await prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });
    const lastSeq = last ? parseInt(last.invoiceNumber.replace(prefix, ""), 10) : 0;
    const invNum  = `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;

    const invoice = await prisma.invoice.create({
      data: { invoiceNumber: invNum, orderId, subtotal, discountAmount: discount, taxRate, taxAmount, total },
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (err) {
    return serverError("POST /api/admin/accounting/invoices", err);
  }
}
