import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  try {
    const stock = await prisma.subscriptionStock.findUnique({ where: { id: params.id } });
    if (!stock) return NextResponse.json({ success: false, error: "العنصر غير موجود" }, { status: 404 });
    if (stock.isDelivered) return NextResponse.json({ success: false, error: "لا يمكن حذف عنصر مُسلَّم" }, { status: 400 });

    await prisma.subscriptionStock.delete({ where: { id: params.id } });
    await prisma.product.update({ where: { id: stock.productId }, data: { stockCount: { decrement: 1 } } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
