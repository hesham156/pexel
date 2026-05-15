import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const existing = await prisma.category.findUnique({ where: { slug: body.slug } });
    if (existing) return NextResponse.json({ success: false, error: "الرابط مستخدم بالفعل" }, { status: 409 });

    const category = await prisma.category.create({
      data: {
        name: body.name,
        nameAr: body.nameAr,
        slug: body.slug,
        description: body.description,
        descriptionAr: body.descriptionAr,
        icon: body.icon,
        color: body.color,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    return serverError("POST /api/admin/categories", err);
  }
}
