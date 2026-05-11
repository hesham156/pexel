import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const search = searchParams.get("search") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
  const cursor = searchParams.get("cursor") || undefined;

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(tag && { tags: { has: tag } }),
      ...(search && {
        OR: [
          { titleAr: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { excerptAr: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      slug: true,
      titleAr: true,
      title: true,
      excerptAr: true,
      excerpt: true,
      coverImage: true,
      readingTime: true,
      viewCount: true,
      publishedAt: true,
      tags: true,
      author: { select: { name: true } },
      category: { select: { nameAr: true, name: true, slug: true, color: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({ success: true, data, nextCursor });
}
