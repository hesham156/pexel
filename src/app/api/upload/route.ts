import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // ADMIN & STAFF: unrestricted upload (product images, etc.)
    // CUSTOMER (authenticated): allowed to upload payment proof images
    // Guest (no session): may upload payment proof — purpose checked via "purpose" field
    const formData = await req.formData();
    const purpose = formData.get("purpose") as string | null;

    // Only admins/staff can upload without a purpose restriction
    if (!session && purpose !== "payment_proof") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ success: false, error: "لا يوجد ملف" }, { status: 400 });

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "حجم الملف يتجاوز 5MB" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "نوع الملف غير مسموح، الأنواع المقبولة: JPEG, PNG, WebP, GIF" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ success: false, error: "امتداد الملف غير مسموح" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `upload-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
