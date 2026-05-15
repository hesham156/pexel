export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement");

    if (!placement) {
      return NextResponse.json({ error: "Placement is required" }, { status: 400 });
    }

    const ads = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        placement: placement,
        OR: session?.user?.id ? [
          { targetType: "ALL" },
          { targetUsers: { some: { id: session.user.id } } }
        ] : [
          { targetType: "ALL" }
        ]
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ads });
  } catch (error: any) {
    console.error("Ads GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}
