import { cn } from "@/lib/utils";

const LOGO_URL = "/logo.jpg";

interface SiteLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 rounded-lg",
  sm: "w-8 h-8 rounded-xl",
  md: "w-10 h-10 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
  xl: "w-20 h-20 rounded-2xl",
};

export function SiteLogo({ size = "md", className }: SiteLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="شعار المنصة"
      className={cn(
        sizes[size],
        "object-cover ring-1 ring-white/10 shadow-lg",
        className
      )}
    />
  );
}
