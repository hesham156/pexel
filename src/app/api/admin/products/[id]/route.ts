import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return null;
  return session;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

  try {
    const body = await req.json();

    // Build update data dynamically – only include fields that are present in the request body
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    if (body.name        !== undefined) data.name         = body.name;
    if (body.nameAr      !== undefined) data.nameAr       = body.nameAr;
    if (body.slug        !== undefined) data.slug         = body.slug;
    if (body.description !== undefined) data.description  = body.description;
    if (body.descriptionAr !== undefined) data.descriptionAr = body.descriptionAr;
    if (body.price       !== undefined) data.price        = body.price;
    if (body.comparePrice !== undefined) data.comparePrice = body.comparePrice || null;
    if (body.categoryId  !== undefined) data.categoryId   = body.categoryId;
    if (body.deliveryMethod !== undefined) data.deliveryMethod = body.deliveryMethod;
    if (body.isActive    !== undefined) data.isActive     = body.isActive;
    if (body.isFeatured  !== undefined) data.isFeatured   = body.isFeatured;
    if (body.features    !== undefined) data.features     = body.features || [];
    if (body.tags        !== undefined) data.tags         = body.tags || [];
    if (body.image       !== undefined) data.image        = body.image || null;
    if (body.sortOrder   !== undefined) data.sortOrder    = body.sortOrder ?? 0;

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: true },
    });

    await prisma.adminLog.create({
      data: { userId: session.user.id, action: "UPDATE_PRODUCT", entity: "Product", entityId: params.id },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { orderItems: true }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
    }

    if (product.orderItems.length > 0) {
      // Soft delete product if it has orders
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false, isDeleted: true }
      });
    } else {
      // Hard delete product
      await prisma.subscriptionStock.deleteMany({
        where: { productId: params.id }
      });
      await prisma.product.delete({
        where: { id: params.id }
      });
    }

    await prisma.adminLog.create({
      data: { userId: session.user.id, action: "DELETE_PRODUCT", entity: "Product", entityId: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
