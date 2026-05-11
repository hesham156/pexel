import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">د</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">متجر رقمي</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} متجر الاشتراكات الرقمية
      </footer>
    </div>
  );
}
