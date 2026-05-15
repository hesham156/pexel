import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const row = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        ...(body.titleAr    !== undefined && { titleAr:    body.titleAr }),
        ...(body.type       !== undefined && { type:       body.type }),
        ...(body.link       !== undefined && { link:       body.link || null }),
        ...(body.couponCode !== undefined && { couponCode: body.couponCode || null }),
        ...(body.bgColor    !== undefined && { bgColor:    body.bgColor }),
        ...(body.textColor  !== undefined && { textColor:  body.textColor }),
        ...(body.isActive   !== undefined && { isActive:   body.isActive }),
        ...(body.expiresAt  !== undefined && { expiresAt:  body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(body.sortOrder  !== undefined && { sortOrder:  body.sortOrder }),
      },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    return serverError("PATCH /api/admin/announcements/[id]", err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  await prisma.announcement.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
