import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

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
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

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
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
