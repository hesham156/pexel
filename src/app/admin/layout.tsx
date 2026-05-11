import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <div className="hidden lg:flex shrink-0 border-e border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <main className="p-6 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
