import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session && (session.user?.role === "ADMIN" || session.user?.role === "STAFF");
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

  try {
    const body = await req.json();
    const row = await (prisma as any).announcement.update({
      where: { id: params.id },
      data: {
        ...(body.titleAr    !== undefined && { titleAr:    body.titleAr }),
        ...(body.type       !== undefined && { type:       body.type }),
        ...(body.link       !== undefined && { link:       body.link || null }),
        ...(body.couponCode !== undefined && { couponCode: body.couponCode || null }),
        ...(body.bgColor    !== undefined && { bgColor:    body.bgColor }),
        ...(body.textColor  !== undefined && { textColor:  body.textColor }),
        ...(body.isActive   !== undefined && { isActive:   body.isActive }),
        ...(body.expiresAt  !== undefined && { expiresAt:  body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(body.sortOrder  !== undefined && { sortOrder:  body.sortOrder }),
      },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

  await (prisma as any).announcement.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
