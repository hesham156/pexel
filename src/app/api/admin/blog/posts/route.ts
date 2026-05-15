export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, badRequest, serverError } from "@/lib/api";

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
    if (!await requireAdmin()) return unauthorized();

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
  } catch (err) {
    return serverError("GET /api/admin/blog/posts", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorized();

    const body = await req.json();
    const { title, titleAr, slug, excerpt, excerptAr, content, contentAr, coverImage, categoryId, status, tags, metaTitle, metaTitleAr, metaDescription, metaDescriptionAr } = body;

    if (!title || !titleAr || !content || !contentAr) {
      return badRequest("العنوان والمحتوى مطلوبان");
    }

    const finalSlug = slug || slugify(title);
    const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return badRequest("الرابط مستخدم بالفعل");
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
  } catch (err) {
    return serverError("POST /api/admin/blog/posts", err);
  }
}
