import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdmin()) return unauthorized();

  const rows = await prisma.popup.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const row = await prisma.popup.create({
      data: {
        titleAr:     body.titleAr,
        contentAr:   body.contentAr    || null,
        type:        body.type         || "ON_LOAD",
        delay:       body.delay        ?? 0,
        scrollDepth: body.scrollDepth  ?? 50,
        targetPages: body.targetPages  || ["ALL"],
        buttonTextAr: body.buttonTextAr || null,
        buttonLink:  body.buttonLink   || null,
        couponCode:  body.couponCode   || null,
        bgColor:     body.bgColor      || "#7c3aed",
        textColor:   body.textColor    || "#ffffff",
        showOnce:    body.showOnce     ?? true,
        isActive:    body.isActive     ?? true,
        sortOrder:   body.sortOrder    ?? 0,
      },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    return serverError("POST /api/admin/popups", err);
  }
}
