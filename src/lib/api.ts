/**
 * Shared API helpers — import in every route instead of repeating inline.
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/** Returns session if ADMIN or STAFF, otherwise null. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return null;
  return session;
}

/** Returns session for any authenticated user, otherwise null. */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  return session ?? null;
}

/** Standard error responses */
export const unauthorized = () =>
  NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });

export const notFound = (msg = "غير موجود") =>
  NextResponse.json({ success: false, error: msg }, { status: 404 });

export const badRequest = (msg = "البيانات غير صحيحة") =>
  NextResponse.json({ success: false, error: msg }, { status: 400 });

export const serverError = (label: string, err: unknown) => {
  console.error(`[${label}]`, err);
  return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
};
