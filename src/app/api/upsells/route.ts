import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productIdsParam = searchParams.get("productIds") || "";
  const trigger = searchParams.get("trigger") || "ADD_TO_CART";

  const productIds = productIdsParam
    ? productIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  const rows = await prisma.upsell.findMany({
    where: {
      isActive: true,
      triggerType: trigger as "ADD_TO_CART" | "CHECKOUT",
      // Offer product must not already be in the cart
      ...(productIds.length > 0 && {
        offerProductId: { notIn: productIds },
      }),
      // triggerProductIds is empty (any product) OR contains one of the provided productIds
      OR: [
        { triggerProductIds: { isEmpty: true } },
        ...(productIds.length > 0
          ? productIds.map((id) => ({ triggerProductIds: { has: id } }))
          : []),
      ],
    },
    include: {
      offerProduct: {
        include: {
          category: { select: { id: true, nameAr: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: rows });
}
