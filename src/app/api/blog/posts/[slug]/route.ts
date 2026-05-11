import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true, avatar: true } },
      category: { select: { nameAr: true, name: true, slug: true, color: true } },
    },
  });

  if (!post) return NextResponse.json({ success: false, error: "المقال غير موجود" }, { status: 404 });

  // Increment view count (fire and forget)
  prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json({ success: true, data: post });
}
