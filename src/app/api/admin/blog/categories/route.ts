import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.postCategory.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("[GET /api/admin/blog/categories]", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, nameAr, slug, description, color, sortOrder } = body;

    if (!name || !nameAr) {
      return NextResponse.json({ success: false, error: "الاسم مطلوب" }, { status: 400 });
    }

    const finalSlug = slug || slugify(name);
    const category = await prisma.postCategory.create({
      data: { name, nameAr, slug: finalSlug, description, color, sortOrder: sortOrder || 0 },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("[POST /api/admin/blog/categories]", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
