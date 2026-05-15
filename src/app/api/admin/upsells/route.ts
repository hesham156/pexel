import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdmin()) return unauthorized();

  const rows = await prisma.upsell.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      offerProduct: {
        select: { id: true, nameAr: true, name: true, price: true, image: true },
      },
    },
  });
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const row = await prisma.upsell.create({
      data: {
        headlineAr:       body.headlineAr,
        descriptionAr:    body.descriptionAr    || null,
        triggerType:      body.triggerType      || "ADD_TO_CART",
        triggerProductIds: body.triggerProductIds || [],
        offerProductId:   body.offerProductId,
        discountType:     (body.discountType && body.discountType !== "NONE") ? body.discountType : null,
        discountValue:    (body.discountType && body.discountType !== "NONE") ? (body.discountValue ?? 0) : null,
        isActive:         body.isActive         ?? true,
      },
      include: {
        offerProduct: {
          select: { id: true, nameAr: true, name: true, price: true, image: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    return serverError("POST /api/admin/upsells", err);
  }
}
