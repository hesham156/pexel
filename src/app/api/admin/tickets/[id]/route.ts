import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { status } = await req.json();
    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status },
    });

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_TICKET_STATUS",
        entity: "SupportTicket",
        entityId: ticket.id,
        details: { status },
      },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
