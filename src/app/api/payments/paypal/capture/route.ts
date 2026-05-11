import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const token = searchParams.get("token"); // PayPal Order ID

    if (!orderId || !token) {
      return NextResponse.redirect(new URL(`/dashboard/orders?error=missing_parameters`, req.url));
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || !order.payment) {
      return NextResponse.redirect(new URL(`/dashboard/orders?error=order_not_found`, req.url));
    }

    // Check if it's already captured
    if (order.payment.status === "APPROVED") {
      return NextResponse.redirect(new URL(`/dashboard/orders/${orderId}?payment=success`, req.url));
    }

    // Ensure it's the correct PayPal token
    if (order.payment.transactionId !== token) {
      return NextResponse.redirect(new URL(`/dashboard/orders/${orderId}?error=invalid_token`, req.url));
    }

    // Capture the payment via PayPal API
    const captureData = await capturePayPalOrder(token);

    if (captureData.status === "COMPLETED") {
      // Payment successful!
      await prisma.$transaction([
        prisma.payment.update({
          where: { orderId: orderId },
          data: {
            status: "APPROVED",
            // Save capture ID if available
            transactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || token,
          },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: "PAYMENT_APPROVED" },
        }),
      ]);

      // Automatically deliver AUTOMATIC products (Optional, but good for digital products)
      // Here we just redirect and let the webhook or polling handle it, 
      // or the site owner's existing logic.
      // Wait, there is already an admin panel to approve or maybe an auto-delivery cron.
      // For now, updating status to PAYMENT_APPROVED is enough.

      return NextResponse.redirect(new URL(`/dashboard/orders/${orderId}?payment=success`, req.url));
    } else {
      // Payment not completed
      return NextResponse.redirect(new URL(`/dashboard/orders/${orderId}?payment=failed`, req.url));
    }

  } catch (error) {
    console.error("PayPal Capture Error:", error);
    const orderId = req.nextUrl.searchParams.get("orderId");
    const redirectUrl = orderId ? `/dashboard/orders/${orderId}?error=capture_failed` : `/dashboard/orders?error=capture_failed`;
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
}
