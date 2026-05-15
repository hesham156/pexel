import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "HOME";

  const rows = await prisma.popup.findMany({
    where: {
      isActive: true,
      OR: [
        { targetPages: { has: "ALL" } },
        { targetPages: { has: page } },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ success: true, data: rows });
}
