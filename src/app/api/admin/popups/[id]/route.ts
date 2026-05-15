import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const row = await prisma.popup.update({
      where: { id: params.id },
      data: {
        ...(body.titleAr      !== undefined && { titleAr:      body.titleAr }),
        ...(body.contentAr    !== undefined && { contentAr:    body.contentAr    || null }),
        ...(body.type         !== undefined && { type:         body.type }),
        ...(body.delay        !== undefined && { delay:        body.delay }),
        ...(body.scrollDepth  !== undefined && { scrollDepth:  body.scrollDepth }),
        ...(body.targetPages  !== undefined && { targetPages:  body.targetPages }),
        ...(body.buttonTextAr !== undefined && { buttonTextAr: body.buttonTextAr || null }),
        ...(body.buttonLink   !== undefined && { buttonLink:   body.buttonLink   || null }),
        ...(body.couponCode   !== undefined && { couponCode:   body.couponCode   || null }),
        ...(body.bgColor      !== undefined && { bgColor:      body.bgColor }),
        ...(body.textColor    !== undefined && { textColor:    body.textColor }),
        ...(body.showOnce     !== undefined && { showOnce:     body.showOnce }),
        ...(body.isActive     !== undefined && { isActive:     body.isActive }),
        ...(body.sortOrder    !== undefined && { sortOrder:    body.sortOrder }),
      },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    return serverError("PATCH /api/admin/popups/[id]", err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  try {
    await prisma.popup.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("DELETE /api/admin/popups/[id]", err);
  }
}
