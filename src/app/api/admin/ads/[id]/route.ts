import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, notFound, serverError } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const ad = await prisma.advertisement.findUnique({
      where: { id: params.id },
      include: {
        targetUsers: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!ad) return notFound("Ad not found");

    return NextResponse.json({ ad });
  } catch (err) {
    return serverError("GET /api/admin/ads/[id]", err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const body = await req.json();
    const { title, image, link, isActive, targetType, placement, targetUserIds } = body;

    // Disconnect existing relations if we are updating them
    await prisma.advertisement.update({
      where: { id: params.id },
      data: {
        targetUsers: {
          set: [] // Clear existing relationships first
        }
      }
    });

    const ad = await prisma.advertisement.update({
      where: { id: params.id },
      data: {
        title,
        image,
        link,
        isActive,
        targetType,
        placement,
        targetUsers: targetType === "SPECIFIC" && targetUserIds && targetUserIds.length > 0
          ? {
              connect: targetUserIds.map((id: string) => ({ id }))
            }
          : undefined,
      },
      include: {
        targetUsers: true
      }
    });

    return NextResponse.json({ success: true, ad });
  } catch (err) {
    return serverError("PUT /api/admin/ads/[id]", err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    await prisma.advertisement.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("DELETE /api/admin/ads/[id]", err);
  }
}
