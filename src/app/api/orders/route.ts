import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { createPayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } }, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: orders });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const { items, paymentMethod, couponCode, notes, proofImageUrl } = body;

    if (!items?.length || !paymentMethod) {
      return NextResponse.json({ success: false, error: "بيانات ناقصة" }, { status: 400 });
    }

    // Validate products and get prices
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ success: false, error: "بعض المنتجات غير متاحة" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: { productId: string; quantity: number; price: number }) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = parseFloat(String(product.price));
      subtotal += price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: price,
      };
    });

    // Validate coupon
    let discount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
            { OR: [{ maxUses: null }, { usedCount: { lt: 9999 } }] },
          ],
        },
      });

      if (coupon) {
        if (!coupon.minOrderAmount || subtotal >= parseFloat(String(coupon.minOrderAmount))) {
          couponId = coupon.id;
          if (coupon.discountType === "PERCENTAGE") {
            discount = subtotal * (parseFloat(String(coupon.discountValue)) / 100);
          } else {
            discount = parseFloat(String(coupon.discountValue));
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        status: paymentMethod === "BANK_TRANSFER" ? "PENDING" : "PENDING_PAYMENT_REVIEW",
        subtotal,
        discount,
        total,
        couponId,
        notes,
        items: { create: orderItems },
        payment: {
          create: {
            method: paymentMethod,
            status: proofImageUrl ? "UPLOADED" : "PENDING",
            amount: total,
            proofImage: proofImageUrl,
          },
        },
      },
      include: { items: { include: { product: true } }, payment: true },
    });

    // Update coupon usage
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Send notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "تم إنشاء طلبك",
        body: `تم إنشاء طلبك ${order.orderNumber} بنجاح. يرجى إكمال الدفع لمعالجته.`,
        type: "ORDER_UPDATE",
        orderId: order.id,
      },
    });

    let paypalApproveLink: string | undefined;

    // Handle PayPal Checkout integration
    if (paymentMethod === "PAYPAL" && total > 0) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const returnUrl = `${baseUrl}/api/payments/paypal/capture?orderId=${order.id}`;
        const cancelUrl = `${baseUrl}/dashboard/orders/${order.id}`;

        const paypalOrder = await createPayPalOrder(total, returnUrl, cancelUrl);

        if (paypalOrder.approveLink) {
          paypalApproveLink = paypalOrder.approveLink;

          // Save the PayPal Order ID in our payment record
          await prisma.payment.update({
            where: { orderId: order.id },
            data: { transactionId: paypalOrder.id },
          });
        }
      } catch (err) {
        console.error("Error integrating PayPal:", err);
        return NextResponse.json({ success: false, error: "فشل في التواصل مع خوادم PayPal. يرجى التأكد من الإعدادات." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: order, paypalApproveLink });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
