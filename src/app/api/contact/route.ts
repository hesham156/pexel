import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    let userId: string;

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Guest: find or create a user account from the submitted email
      let guestUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (!guestUser) {
        const bcrypt = (await import("bcryptjs")).default;
        const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
        guestUser = await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: randomPassword,
            role: "CUSTOMER",
          },
        });
      }
      userId = guestUser.id;
    }

    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
    await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject: subject.trim(),
        priority: "MEDIUM",
        messages: {
          create: {
            userId,
            message: message.trim(),
            isStaff: false,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONTACT API]", error);
    return NextResponse.json({ success: false, error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}
