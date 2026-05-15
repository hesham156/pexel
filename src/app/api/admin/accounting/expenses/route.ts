import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, badRequest, serverError } from "@/lib/api";
import { ExpenseCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as ExpenseCategory | null;
  const where = category ? { category } : {};
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json({ success: true, data: expenses });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  try {
    const { titleAr, amount, category, date, notes, receiptUrl } = await req.json();
    if (!titleAr || !amount) return badRequest("بيانات ناقصة");
    const expense = await prisma.expense.create({
      data: {
        titleAr,
        amount: parseFloat(amount),
        category: (category as ExpenseCategory) || "OTHER",
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
        receiptUrl: receiptUrl || null,
      },
    });
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_EXPENSE",
        entity: "Expense",
        entityId: expense.id,
        details: { titleAr, amount },
      },
    });
    return NextResponse.json({ success: true, data: expense });
  } catch (err) {
    return serverError("POST /api/admin/accounting/expenses", err);
  }
}
