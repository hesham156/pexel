import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public settings that are safe to expose to the storefront
const PUBLIC_KEYS = [
  "site_name",
  "site_phone",
  "currency",
  "currency_symbol",
  "tabby_enabled",
  "tabby_installments",
  "tamara_enabled",
  "tamara_installments",
];

export const revalidate = 300; // 5 min ISR cache

export async function GET() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
    select: { key: true, value: true, type: true },
  });

  const settings: Record<string, string | boolean | number> = {};
  for (const row of rows) {
    if (row.type === "boolean") {
      settings[row.key] = row.value === "true";
    } else if (row.type === "number") {
      settings[row.key] = parseFloat(row.value);
    } else {
      settings[row.key] = row.value;
    }
  }

  return NextResponse.json(
    { success: true, data: settings },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
