import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: coupons });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

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
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
