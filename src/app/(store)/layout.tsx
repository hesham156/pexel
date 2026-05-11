import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { CartSidebar } from "@/components/store/CartSidebar";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
