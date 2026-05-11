import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { CartSidebar } from "@/components/store/CartSidebar";
import { MaintenancePage } from "@/components/store/MaintenancePage";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const maintenanceSetting = await prisma.setting.findUnique({
    where: { key: "maintenance_mode" },
    select: { value: true },
  });

  if (maintenanceSetting?.value === "true") {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "STAFF";

    if (!isAdmin) {
      return <MaintenancePage />;
    }
  }

  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
