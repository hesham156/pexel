import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const stock = await prisma.subscriptionStock.findMany({
    where: productId ? { productId } : undefined,
    include: { product: { select: { nameAr: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ success: true, data: stock });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const { productId, items } = await req.json();

    const created = await prisma.subscriptionStock.createMany({
      data: items.map((data: string) => ({ productId, data, isDelivered: false })),
    });

    await prisma.product.update({
      where: { id: productId },
      data: { stockCount: { increment: items.length } },
    });

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "ADD_STOCK",
        entity: "Product",
        entityId: productId,
        details: { count: items.length },
      },
    });

    return NextResponse.json({ success: true, data: { count: created.count } });
  } catch (err) {
    return serverError("POST /api/admin/stock", err);
  }
}
