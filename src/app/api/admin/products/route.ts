import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const onlyActive = searchParams.get("active"); // if null = all, "true" = active only

  const where: Record<string, unknown> = { isDeleted: false };
  if (onlyActive === "true") where.isActive = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameAr: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { nameAr: true, icon: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameAr: body.nameAr,
        slug: body.slug,
        description: body.description,
        descriptionAr: body.descriptionAr,
        price: body.price,
        comparePrice: body.comparePrice || null,
        categoryId: body.categoryId,
        image: body.image || null,
        features: body.features || [],
        tags: body.tags || [],
        deliveryMethod: body.deliveryMethod || "MANUAL",
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        sortOrder: body.sortOrder || 0,
      },
    });

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_PRODUCT",
        entity: "Product",
        entityId: product.id,
        details: { name: product.nameAr },
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
