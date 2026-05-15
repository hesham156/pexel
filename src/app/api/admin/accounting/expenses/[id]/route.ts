import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return unauthorized();

  const body = await req.json();
  const expense = await prisma.expense.update({
    where: { id: params.id },
    data: {
      ...(body.titleAr  && { titleAr: body.titleAr }),
      ...(body.amount   && { amount: parseFloat(body.amount) }),
      ...(body.category && { category: body.category }),
      ...(body.date     && { date: new Date(body.date) }),
      ...(body.notes    !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json({ success: true, data: expense });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  // Only ADMIN (not STAFF) can delete expenses
  if (session.user.role !== "ADMIN") return unauthorized();

  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
