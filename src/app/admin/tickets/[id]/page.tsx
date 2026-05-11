import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatDateTime, getTicketStatusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import AdminTicketActions from "./AdminTicketActions";

export default async function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/login");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) notFound();

  // Fetch sender names for all messages
  const userIds = Array.from(new Set(ticket.messages.map((m) => m.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const statusColors: Record<string, string> = {
    OPEN: "warning",
    IN_PROGRESS: "primary",
    RESOLVED: "success",
    CLOSED: "gray",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {ticket.ticketNumber} · {ticket.user.name} · {ticket.user.email}
          </p>
        </div>
        <Badge variant={statusColors[ticket.status] as "warning" | "primary" | "success" | "gray" | undefined}>
          {getTicketStatusLabel(ticket.status)}
        </Badge>
      </div>

      <div className="space-y-4">
        {ticket.messages.map((msg) => {
          const isStaff = msg.isStaff;
          const senderName = userMap[msg.userId] ?? "مجهول";
          return (
            <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isStaff
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}>
                <p className={`text-xs font-medium mb-1 ${isStaff ? "text-primary-100" : "text-gray-500"}`}>
                  {senderName} · {isStaff ? "الدعم" : "العميل"}
                </p>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className={`text-xs mt-1 ${isStaff ? "text-primary-200" : "text-gray-400"}`}>
                  {formatDateTime(msg.createdAt.toString())}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <AdminTicketActions ticketId={ticket.id} status={ticket.status} />
    </div>
  );
}
