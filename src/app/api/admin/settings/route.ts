import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();

  const settings = await prisma.setting.findMany({ orderBy: { group: "asc" } });
  return NextResponse.json({ success: true, data: settings });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  // Only ADMIN (not STAFF) can update settings
  if (session.user.role !== "ADMIN") return unauthorized();

  try {
    const { settings } = await req.json();
    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.setting.update({ where: { key }, data: { value: String(value) } })
    );
    await Promise.all(updates);

    await prisma.adminLog.create({
      data: { userId: session.user.id, action: "UPDATE_SETTINGS", entity: "Setting", details: settings },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("PATCH /api/admin/settings", err);
  }
}
