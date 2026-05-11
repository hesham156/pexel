import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  if (session.user.id === params.id) {
    return NextResponse.json({ success: false, error: "لا يمكن حذف حسابك الخاص" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
