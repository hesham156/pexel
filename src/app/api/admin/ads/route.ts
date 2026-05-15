import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, badRequest, serverError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType");
    const isActive = searchParams.get("isActive");

    let whereClause: any = {};
    if (targetType) whereClause.targetType = targetType;
    if (isActive) whereClause.isActive = isActive === "true";

    const ads = await prisma.advertisement.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        targetUsers: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({ ads });
  } catch (err) {
    return serverError("GET /api/admin/ads", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const body = await req.json();
    const { title, image, link, isActive, targetType, placement, targetUserIds } = body;

    if (!title || !image) {
      return badRequest("Title and Image are required");
    }

    const ad = await prisma.advertisement.create({
      data: {
        title,
        image,
        link,
        isActive: isActive !== undefined ? isActive : true,
        targetType: targetType || "ALL",
        placement: placement || "DASHBOARD_MAIN",
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

    return NextResponse.json({ success: true, ad }, { status: 201 });
  } catch (err) {
    return serverError("POST /api/admin/ads", err);
  }
}
