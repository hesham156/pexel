import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, badRequest, serverError } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const body = await req.json();
    const category = await prisma.postCategory.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    return serverError("PATCH /api/admin/blog/categories/[id]", err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await requireAdmin()) return unauthorized();

    const count = await prisma.post.count({ where: { categoryId: params.id } });
    if (count > 0) {
      return badRequest(`لا يمكن الحذف — توجد ${count} مقالات في هذه الفئة`);
    }

    await prisma.postCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("DELETE /api/admin/blog/categories/[id]", err);
  }
}
