import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { itemId, deliveredData, subscriptionStartDate, subscriptionEndDate, variantLabel } = await req.json();

    await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        deliveredData,
        deliveredAt: new Date(),
        variantLabel: variantLabel || null,
        subscriptionStartDate: subscriptionStartDate ? new Date(subscriptionStartDate) : new Date(),
        subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : null,
      },
    });

    // Check if all items are delivered
    const allItems = await prisma.orderItem.findMany({ where: { orderId: params.id } });
    const allDelivered = allItems.every((item) => item.deliveredData);

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: allDelivered ? { status: "DELIVERED" } : { status: "PROCESSING" },
      include: {
        user: true,
        payment: true,
        items: { include: { product: { include: { category: true } } } },
      },
    });

    if (allDelivered) {
      await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: "تم تسليم طلبك! 🎉",
          body: `تم تسليم طلبك ${updatedOrder.orderNumber} بنجاح. يمكنك الاطلاع على بيانات الاشتراك من لوحة التحكم.`,
          type: "ORDER_UPDATE",
          orderId: params.id,
        },
      });
    }

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "DELIVER_ORDER_ITEM",
        entity: "OrderItem",
        entityId: itemId,
        details: { orderId: params.id, subscriptionEndDate },
      },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
