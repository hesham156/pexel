import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calcReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: { select: { id: true, name: true } }, category: true },
    });

    if (!post) return NextResponse.json({ success: false, error: "المقال غير موجود" }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("[GET /api/admin/blog/posts/:id]", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, contentAr, status, ...rest } = body;

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ success: false, error: "المقال غير موجود" }, { status: 404 });

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
  } catch (error) {
    console.error("[PATCH /api/admin/blog/posts/:id]", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/blog/posts/:id]", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
