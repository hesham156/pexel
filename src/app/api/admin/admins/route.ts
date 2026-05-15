import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  // Only ADMIN (not STAFF) can manage admins
  if (session.user.role !== "ADMIN") return unauthorized();

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: admins });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  if (session.user.role !== "ADMIN") return unauthorized();

  try {
    const { name, email, password, role } = await req.json();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ success: false, error: "البريد الإلكتروني مستخدم" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "STAFF" },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.adminLog.create({
      data: { userId: session.user.id, action: "CREATE_ADMIN", entity: "User", entityId: admin.id },
    });

    return NextResponse.json({ success: true, data: admin });
  } catch (err) {
    return serverError("POST /api/admin/admins", err);
  }
}
