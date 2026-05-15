import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    secretLength: process.env.NEXTAUTH_SECRET?.length ?? 0,
    nextauthUrl: process.env.NEXTAUTH_URL ?? "NOT SET",
    nodeEnv: process.env.NODE_ENV,
    session: session ? { user: session.user?.email, role: session.user?.role } : null,
  });
}
