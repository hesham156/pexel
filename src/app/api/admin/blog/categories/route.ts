export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, badRequest, serverError } from "@/lib/api";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export async function GET() {
  try {
    if (!await requireAdmin()) return unauthorized();

    const categories = await prisma.postCategory.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    return serverError("GET /api/admin/blog/categories", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const body = await req.json();
    const { name, nameAr, slug, description, color, sortOrder } = body;

    if (!name || !nameAr) {
      return badRequest("الاسم مطلوب");
    }

    const finalSlug = slug || slugify(name);
    const category = await prisma.postCategory.create({
      data: { name, nameAr, slug: finalSlug, description, color, sortOrder: sortOrder || 0 },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    return serverError("POST /api/admin/blog/categories", err);
  }
}
