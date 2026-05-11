import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const orderId = formData.get("orderId") as string;

    if (!file || !orderId) {
      return NextResponse.json({ success: false, error: "ملف أو معرف الطلب مفقود" }, { status: 400 });
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
    });
    if (!order) return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const filename = `proof-${orderId}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    const url = `/uploads/${filename}`;

    // Update payment
    await prisma.payment.update({
      where: { orderId },
      data: { proofImage: url, status: "UPLOADED" },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PENDING_PAYMENT_REVIEW" },
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "حدث خطأ في رفع الملف" }, { status: 500 });
  }
}
