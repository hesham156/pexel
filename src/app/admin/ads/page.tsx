import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Image as ImageIcon, Link as LinkIcon, Users, Edit } from "lucide-react";
import { DeleteAdButton } from "./DeleteAdButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { redirect } from "next/navigation";

export default async function AdminAdsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const ads = await prisma.advertisement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { targetUsers: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">البنرات الإعلانية</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إدارة الإعلانات المعروضة في لوحة تحكم المستخدمين
          </p>
        </div>
        <Link href="/admin/ads/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          إضافة بنر جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            لا توجد بنرات إعلانية حتى الآن
          </div>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden p-0 group">
              {/* Banner Image */}
              <div className="relative h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {ad.image ? (
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={ad.isActive ? "success" : "gray"}>
                    {ad.isActive ? "نشط" : "معطل"}
                  </Badge>
                  <Badge variant="primary" className="bg-primary-500 text-white">
                    {ad.targetType === "ALL" ? "للجميع" : "مخصص"}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-lg">
                  {ad.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  {ad.link && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-primary-500" />
                      <a href={ad.link} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[200px]" dir="ltr">
                        {ad.link}
                      </a>
                    </div>
                  )}
                  {ad.targetType === "SPECIFIC" && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-500" />
                      <span>{ad._count.targetUsers} مستخدم مستهدف</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Link href={`/admin/ads/${ad.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Link>
                  <DeleteAdButton id={ad.id} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
