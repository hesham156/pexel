import Link from "next/link";
import { Mail, Phone, MapPin, Twitter, Instagram, Youtube } from "lucide-react";

const categories = [
  { href: "/categories/streaming", label: "خدمات البث" },
  { href: "/categories/software", label: "تراخيص البرامج" },
  { href: "/categories/ai-tools", label: "أدوات الذكاء الاصطناعي" },
  { href: "/categories/vpn", label: "خدمات VPN" },
  { href: "/categories/gaming", label: "الألعاب" },
  { href: "/categories/cloud", label: "التخزين السحابي" },
];

const quickLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "جميع المنتجات" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/contact", label: "اتصل بنا" },
  { href: "/terms", label: "الشروط والأحكام" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">د</span>
              </div>
              <div>
                <p className="font-bold text-white text-base">متجر رقمي</p>
                <p className="text-xs text-primary-400">للاشتراكات الرقمية</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              منصتك الموثوقة لشراء الاشتراكات الرقمية بأسعار مناسبة مع تسليم فوري وآمن.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "#", label: "تويتر" },
                { icon: Instagram, href: "#", label: "انستجرام" },
                { icon: Youtube, href: "#", label: "يوتيوب" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-white mb-4">الفئات</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-primary-400 shrink-0" />
                support@store.com
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-primary-400 shrink-0" />
                +966 50 123 4567
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-primary-400 shrink-0" />
                المملكة العربية السعودية
              </li>
            </ul>

            <div className="mt-4 p-3 rounded-xl bg-gray-800 border border-gray-700">
              <p className="text-xs text-gray-400 font-medium mb-1">ساعات الدعم</p>
              <p className="text-xs text-gray-300">السبت - الخميس: 9 ص - 11 م</p>
              <p className="text-xs text-gray-300">الجمعة: 2 م - 11 م</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} متجر الاشتراكات الرقمية. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              الشروط والأحكام
            </Link>
            <Link href="/terms#refund" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              سياسة الاسترداد
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
