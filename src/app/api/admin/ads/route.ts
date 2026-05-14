import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
  } catch (error: any) {
    console.error("Ads GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, image, link, isActive, targetType, placement, targetUserIds } = body;

    if (!title || !image) {
      return NextResponse.json({ error: "Title and Image are required" }, { status: 400 });
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
  } catch (error: any) {
    console.error("Ads POST Error:", error);
    return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
  }
}
