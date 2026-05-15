export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, notFound, serverError } from "@/lib/api";

function calcReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: { select: { id: true, name: true } }, category: true },
    });

    if (!post) return notFound("المقال غير موجود");
    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    return serverError("GET /api/admin/blog/posts/[id]", err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const body = await req.json();
    const { content, contentAr, status, ...rest } = body;

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) return notFound("المقال غير موجود");

    const wasPublished = existing.status === "PUBLISHED";
    const nowPublished = status === "PUBLISHED";

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(content !== undefined && { content, readingTime: calcReadingTime(content) }),
        ...(contentAr !== undefined && { contentAr }),
        ...(status !== undefined && { status }),
        ...(!wasPublished && nowPublished && { publishedAt: new Date() }),
        categoryId: body.categoryId || null,
      },
      include: { author: { select: { id: true, name: true } }, category: true },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    return serverError("PATCH /api/admin/blog/posts/[id]", err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("DELETE /api/admin/blog/posts/[id]", err);
  }
}
