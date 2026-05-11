import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "STAFF";
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = isAdmin ? {} : { userId: session.user.id };
  if (status) where.status = status;

  const tickets = await prisma.supportTicket.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: tickets });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const { subject, message, priority, orderId } = body;

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: "الموضوع والرسالة مطلوبان" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        userId: session.user.id,
        subject,
        priority: priority || "MEDIUM",
        orderId,
        messages: {
          create: {
            userId: session.user.id,
            message,
            isStaff: false,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
