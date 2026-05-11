"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1",
        className
      )}
    >
      {[
        { value: "light", icon: Sun },
        { value: "system", icon: Monitor },
        { value: "dark", icon: Moon },
      ].map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "rounded-lg p-1.5 transition-all",
            theme === value
              ? "bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
