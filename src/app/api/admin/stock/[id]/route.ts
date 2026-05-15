import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, notFound, badRequest, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  try {
    const stock = await prisma.subscriptionStock.findUnique({ where: { id: params.id } });
    if (!stock) return notFound("العنصر غير موجود");
    if (stock.isDelivered) return badRequest("لا يمكن حذف عنصر مُسلَّم");

    await prisma.subscriptionStock.delete({ where: { id: params.id } });
    await prisma.product.update({ where: { id: stock.productId }, data: { stockCount: { decrement: 1 } } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("DELETE /api/admin/stock/[id]", err);
  }
}
