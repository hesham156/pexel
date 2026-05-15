import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

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
  } catch (err) {
    return serverError("PATCH /api/admin/tickets/[id]", err);
  }
}
