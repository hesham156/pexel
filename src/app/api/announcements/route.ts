import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: announcements });
  } catch {
    return NextResponse.json({ success: false, data: [] });
  }
}
