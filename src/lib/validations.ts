import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CRYPTO", "PAYPAL"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const ticketSchema = z.object({
  subject: z.string().min(5, "الموضوع يجب أن يكون 5 أحرف على الأقل"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  orderId: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  nameAr: z.string().min(2, "الاسم العربي مطلوب"),
  slug: z.string().min(2, "الرابط مطلوب"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  comparePrice: z.number().positive().optional(),
  categoryId: z.string().min(1, "الفئة مطلوبة"),
  deliveryMethod: z.enum(["AUTOMATIC", "MANUAL"]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  image: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  nameAr: z.string().min(2, "الاسم العربي مطلوب"),
  slug: z.string().min(2, "الرابط مطلوب"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const couponSchema = z.object({
  code: z.string().min(3, "كود الكوبون مطلوب").toUpperCase(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("قيمة الخصم يجب أن تكون أكبر من صفر"),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
