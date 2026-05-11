import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calcReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const posts = await prisma.post.findMany({
      where: {
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { titleAr: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(status && { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }),
        ...(categoryId && { categoryId }),
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, nameAr: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("[GET /api/admin/blog/posts]", error);
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
    const { title, titleAr, slug, excerpt, excerptAr, content, contentAr, coverImage, categoryId, status, tags, metaTitle, metaTitleAr, metaDescription, metaDescriptionAr } = body;

    if (!title || !titleAr || !content || !contentAr) {
      return NextResponse.json({ success: false, error: "العنوان والمحتوى مطلوبان" }, { status: 400 });
    }

    const finalSlug = slug || slugify(title);
    const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "الرابط مستخدم بالفعل" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        titleAr,
        slug: finalSlug,
        excerpt,
        excerptAr,
        content,
        contentAr,
        coverImage,
        categoryId: categoryId || null,
        status: status || "DRAFT",
        tags: tags || [],
        metaTitle,
        metaTitleAr,
        metaDescription,
        metaDescriptionAr,
        readingTime: calcReadingTime(content),
        authorId: session.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: { author: { select: { id: true, name: true } }, category: true },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("[POST /api/admin/blog/posts]", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
