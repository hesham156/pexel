import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session && (session.user?.role === "ADMIN" || session.user?.role === "STAFF");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

  const rows = await (prisma as any).announcement.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

  try {
    const body = await req.json();
    const row = await (prisma as any).announcement.create({
      data: {
        titleAr:    body.titleAr,
        type:       body.type       || "INFO",
        link:       body.link       || null,
        couponCode: body.couponCode || null,
        bgColor:    body.bgColor    || "#7c3aed",
        textColor:  body.textColor  || "#ffffff",
        isActive:   body.isActive   ?? true,
        expiresAt:  body.expiresAt  ? new Date(body.expiresAt) : null,
        sortOrder:  body.sortOrder  ?? 0,
      },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
