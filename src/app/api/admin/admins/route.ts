import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: admins });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

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
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
