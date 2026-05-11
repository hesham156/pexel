import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple" | "gray";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-primary-500",
    primary: "bg-primary-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

export function getStatusBadge(status: string) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: "warning", label: "في الانتظار" },
    PENDING_PAYMENT_REVIEW: { variant: "info", label: "بانتظار مراجعة الدفع" },
    PAYMENT_APPROVED: { variant: "purple", label: "تم الموافقة على الدفع" },
    PROCESSING: { variant: "default", label: "جاري المعالجة" },
    DELIVERED: { variant: "success", label: "تم التسليم" },
    CANCELLED: { variant: "danger", label: "ملغي" },
    REFUNDED: { variant: "gray", label: "مسترد" },
    OPEN: { variant: "info", label: "مفتوح" },
    IN_PROGRESS: { variant: "warning", label: "قيد المعالجة" },
    RESOLVED: { variant: "success", label: "محلول" },
    CLOSED: { variant: "gray", label: "مغلق" },
    UPLOADED: { variant: "info", label: "تم الرفع" },
    APPROVED: { variant: "success", label: "موافق عليه" },
    REJECTED: { variant: "danger", label: "مرفوض" },
    LOW: { variant: "gray", label: "منخفض" },
    MEDIUM: { variant: "warning", label: "متوسط" },
    HIGH: { variant: "danger", label: "عالي" },
    URGENT: { variant: "danger", label: "عاجل" },
  };
  return map[status] || { variant: "gray" as BadgeVariant, label: status };
}
