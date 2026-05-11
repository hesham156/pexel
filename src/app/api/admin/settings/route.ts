import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const settings = await prisma.setting.findMany({ orderBy: { group: "asc" } });
  return NextResponse.json({ success: true, data: settings });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

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
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
