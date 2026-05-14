import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const ad = await prisma.advertisement.findUnique({
      where: { id: params.id },
      include: {
        targetUsers: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ ad });
  } catch (error: any) {
    console.error("Ad GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisement" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
  } catch (error: any) {
    console.error("Ad PUT Error:", error);
    return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.advertisement.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Ad DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
  }
}
