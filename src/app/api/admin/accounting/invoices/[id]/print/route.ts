import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return new NextResponse("غير مصرح", { status: 403 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: { include: { product: { select: { nameAr: true } } } },
          coupon: { select: { code: true } },
        },
      },
    },
  });
  if (!invoice) return new NextResponse("الفاتورة غير موجودة", { status: 404 });

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["site_name", "tax_number", "company_address", "currency_symbol"] } },
    select: { key: true, value: true },
  });
  const cfg = Object.fromEntries(settings.map(s => [s.key, s.value]));
  const siteName  = cfg.site_name   || "المتجر الرقمي";
  const taxNumber = cfg.tax_number  || "—";
  const address   = cfg.company_address || "المملكة العربية السعودية";
  const currency  = cfg.currency_symbol || "ر.س";

  const fmt = (n: number | string) =>
    `${Number(n).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

  const issueDate = new Date(invoice.issuedAt).toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const itemsHtml = invoice.order.items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${item.product?.nameAr ?? "منتج"}${(item as any).variantLabel ? ` — ${(item as any).variantLabel}` : ""}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:end;">${fmt(Number(item.price))}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:end;font-weight:700;">${fmt(Number(item.price) * item.quantity)}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>فاتورة ${invoice.invoiceNumber}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f8f9fa;color:#1a1a2e;font-size:14px;direction:rtl}
    .page{max-width:800px;margin:20px auto;background:#fff;border-radius:16px;box-shadow:0 4px 32px rgba(0,0,0,.08);overflow:hidden}
    .header{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:36px 40px;display:flex;justify-content:space-between;align-items:flex-start}
    .logo{font-size:22px;font-weight:900;letter-spacing:-.5px}
    .logo-sub{font-size:11px;opacity:.8;margin-top:4px}
    .inv-title{text-align:end}
    .inv-title h1{font-size:26px;font-weight:900;letter-spacing:1px}
    .inv-title p{font-size:12px;opacity:.8;margin-top:4px}
    .body{padding:32px 40px}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
    .meta-box h4{font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
    .meta-box p{font-size:13px;color:#374151;line-height:1.7}
    .meta-box .strong{font-weight:700;color:#111}
    table{width:100%;border-collapse:collapse;margin-bottom:24px}
    thead{background:#f9f5ff}
    thead th{padding:10px 12px;text-align:end;font-size:12px;font-weight:700;color:#6d28d9;border-bottom:2px solid #ede9fe}
    thead th:first-child{text-align:start}
    tbody tr:hover{background:#fafafa}
    .totals{display:flex;justify-content:flex-end;margin-bottom:32px}
    .totals-box{min-width:280px;background:#f9f5ff;border-radius:12px;padding:20px;border:1px solid #ede9fe}
    .totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#374151}
    .totals-row.bold{font-weight:700;color:#111;font-size:15px;border-top:1px solid #ddd6fe;margin-top:8px;padding-top:12px}
    .totals-row.tax{color:#d97706;font-weight:600}
    .footer{background:#f9f5ff;border-top:1px solid #ede9fe;padding:20px 40px;display:flex;justify-content:space-between;align-items:center}
    .footer p{font-size:11px;color:#6b7280}
    .badge{background:#7c3aed;color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700}
    @media print{body{background:#fff}.page{box-shadow:none;border-radius:0;margin:0}.no-print{display:none}}
  </style>
</head>
<body>
  <div style="text-align:center;padding:16px;" class="no-print">
    <button onclick="window.print()" style="background:#7c3aed;color:#fff;border:none;padding:10px 28px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">🖨️ طباعة الفاتورة</button>
  </div>
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">${siteName}</div>
        <div class="logo-sub">${address}</div>
        <div style="margin-top:12px;font-size:11px;opacity:.8;">الرقم الضريبي: ${taxNumber}</div>
      </div>
      <div class="inv-title">
        <h1>فاتورة ضريبية</h1>
        <p>${invoice.invoiceNumber}</p>
        <p style="margin-top:8px;">${issueDate}</p>
      </div>
    </div>
    <div class="body">
      <div class="meta">
        <div class="meta-box">
          <h4>فاتورة إلى</h4>
          <p class="strong">${invoice.order.user.name}</p>
          <p>${invoice.order.user.email}</p>
          ${invoice.order.user.phone ? `<p>${invoice.order.user.phone}</p>` : ""}
        </div>
        <div class="meta-box" style="text-align:end;">
          <h4>تفاصيل الفاتورة</h4>
          <p>رقم الطلب: <span class="strong">${invoice.order.orderNumber}</span></p>
          <p>تاريخ الإصدار: <span class="strong">${issueDate}</span></p>
          <p>نسبة الضريبة: <span class="strong">${Number(invoice.taxRate)}%</span></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align:start;">المنتج</th>
            <th style="text-align:center;">الكمية</th>
            <th>سعر الوحدة</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div class="totals">
        <div class="totals-box">
          <div class="totals-row"><span>المجموع قبل الضريبة</span><span>${fmt(Number(invoice.subtotal) - Number(invoice.taxAmount) - (Number(invoice.discountAmount) > 0 ? -Number(invoice.discountAmount) : 0))}</span></div>
          ${Number(invoice.discountAmount) > 0 ? `<div class="totals-row" style="color:#16a34a;"><span>الخصم</span><span>— ${fmt(Number(invoice.discountAmount))}</span></div>` : ""}
          <div class="totals-row tax"><span>ضريبة القيمة المضافة (${Number(invoice.taxRate)}%)</span><span>${fmt(Number(invoice.taxAmount))}</span></div>
          <div class="totals-row bold"><span>الإجمالي</span><span>${fmt(Number(invoice.total))}</span></div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>شكراً لتعاملكم معنا — ${siteName}</p>
      <span class="badge">فاتورة ضريبية رسمية</span>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
