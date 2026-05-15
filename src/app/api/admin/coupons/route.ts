import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: coupons });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
    if (existing) return NextResponse.json({ success: false, error: "الكود موجود بالفعل" }, { status: 409 });

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code,
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minOrderAmount: body.minOrderAmount || null,
        maxUses: body.maxUses || null,
        isActive: body.isActive ?? true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    await prisma.adminLog.create({
      data: { userId: session.user.id, action: "CREATE_COUPON", entity: "Coupon", entityId: coupon.id },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (err) {
    return serverError("POST /api/admin/coupons", err);
  }
}
