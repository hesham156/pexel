import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const row = await prisma.upsell.update({
      where: { id: params.id },
      data: {
        ...(body.headlineAr        !== undefined && { headlineAr:        body.headlineAr }),
        ...(body.descriptionAr     !== undefined && { descriptionAr:     body.descriptionAr || null }),
        ...(body.triggerType       !== undefined && { triggerType:       body.triggerType }),
        ...(body.triggerProductIds !== undefined && { triggerProductIds: body.triggerProductIds }),
        ...(body.offerProductId    !== undefined && { offerProductId:    body.offerProductId }),
        ...(body.discountType      !== undefined && { discountType:      (body.discountType && body.discountType !== "NONE") ? body.discountType : null }),
        ...(body.discountValue     !== undefined && { discountValue:     (body.discountType && body.discountType !== "NONE") ? body.discountValue : null }),
        ...(body.isActive          !== undefined && { isActive:          body.isActive }),
      },
      include: {
        offerProduct: {
          select: { id: true, nameAr: true, name: true, price: true, image: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    return serverError("PATCH /api/admin/upsells/[id]", err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  try {
    await prisma.upsell.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("DELETE /api/admin/upsells/[id]", err);
  }
}
