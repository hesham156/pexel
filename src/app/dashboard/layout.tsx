import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?redirect=/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
              <Home className="h-4 w-4" />
              الرئيسية
            </Link>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">لوحة التحكم</span>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">د</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm hidden sm:block">متجر رقمي</span>
          </Link>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 shrink-0 border-e border-gray-200 dark:border-gray-800 min-h-[calc(100vh-57px)] bg-white dark:bg-gray-900">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
