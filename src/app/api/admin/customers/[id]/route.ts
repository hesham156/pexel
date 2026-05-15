import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, notFound } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  const customer = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, email: true, phone: true,
      isActive: true, role: true, createdAt: true, avatar: true,
      orders: {
        select: {
          id: true, orderNumber: true, total: true, status: true, createdAt: true,
          items: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { orders: true } },
    },
  });

  if (!customer) return notFound("العميل غير موجود");

  return NextResponse.json({ success: true, data: customer });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  // Only ADMIN (not STAFF) can toggle customer active state
  if (session.user.role !== "ADMIN") return unauthorized();

  const { isActive } = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { isActive },
    select: { id: true, isActive: true },
  });

  return NextResponse.json({ success: true, data: user });
}
