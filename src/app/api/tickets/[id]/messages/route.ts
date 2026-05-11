import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });

  try {
    const { message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ success: false, error: "الرسالة فارغة" }, { status: 400 });

    const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";

    const ticket = await prisma.supportTicket.findFirst({
      where: isStaff ? { id: params.id } : { id: params.id, userId: session.user.id },
    });

    if (!ticket) return NextResponse.json({ success: false, error: "التذكرة غير موجودة" }, { status: 404 });

    const msg = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        userId: session.user.id,
        message,
        isStaff,
      },
    });

    // Update ticket status if staff replied
    if (isStaff && ticket.status === "OPEN") {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Notify customer if staff replied
    if (isStaff) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          title: "رد جديد على تذكرتك",
          body: `تم الرد على تذكرتك "${ticket.subject}"`,
          type: "TICKET_REPLY",
        },
      });
    }

    return NextResponse.json({ success: true, data: msg });
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
