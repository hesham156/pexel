import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Bell, ShoppingBag, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { MarkAllReadButton } from "./MarkAllReadButton";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const getIcon = (type: string) => {
    if (type === "ORDER_UPDATE") return ShoppingBag;
    if (type === "TICKET_REPLY") return MessageSquare;
    return Bell;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {notifications.filter((n) => !n.isRead).length} إشعار غير مقروء
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-16">
          <Bell className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h2 className="font-bold text-gray-900 dark:text-white mb-2">لا توجد إشعارات</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ستظهر هنا الإشعارات المتعلقة بطلباتك</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                  notif.isRead
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.isRead
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    : "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${notif.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {notif.body}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDateTime(notif.createdAt)}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
