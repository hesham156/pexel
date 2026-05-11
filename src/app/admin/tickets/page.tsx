"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatDateTime, getTicketStatusLabel, getPriorityLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Send, Search, RefreshCw, Circle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message { id: string; message: string; isStaff: boolean; createdAt: string }
interface Ticket {
  id: string; ticketNumber: string; subject: string; status: string; priority: string;
  createdAt: string; updatedAt: string;
  user: { name: string; email: string };
  messages: Message[];
  orderId?: string;
}

const priorityColor: Record<string, string> = {
  LOW: "text-gray-400", MEDIUM: "text-blue-500", HIGH: "text-orange-500", URGENT: "text-red-500",
};
const statusColor: Record<string, "warning" | "default" | "success" | "gray"> = {
  OPEN: "warning", IN_PROGRESS: "default", RESOLVED: "success", CLOSED: "gray",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = useCallback(async () => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/tickets${qs}`);
    const data = await res.json();
    if (data.success) {
      setTickets(data.data);
      if (selected) {
        const updated = data.data.find((t: Ticket) => t.id === selected.id);
        if (updated) setSelected(updated);
      }
    }
    setLoading(false);
  }, [statusFilter, selected?.id]);

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSending(true);
    const res = await fetch(`/api/tickets/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    const data = await res.json();
    if (data.success) { setReply(""); await fetchTickets(); }
    else toast.error("فشل إرسال الرد");
    setSending(false);
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("تم تحديث الحالة");
    await fetchTickets();
  };

  const filtered = tickets.filter((t) =>
    !search || t.subject.includes(search) || t.user.name.includes(search) || t.ticketNumber.includes(search)
  );

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">

      {/* ══ LEFT: Ticket List ══ */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-e border-gray-200 dark:border-gray-700",
        selected && "hidden md:flex"
      )}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">تذاكر الدعم</h2>
              {tickets.filter(t => t.status === "OPEN").length > 0 && (
                <span className="text-xs text-orange-600 font-medium">
                  {tickets.filter(t => t.status === "OPEN").length} مفتوحة
                </span>
              )}
            </div>
            <button onClick={fetchTickets} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <div className="relative mb-2">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث..." className="w-full ps-9 pe-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={[
            { value: "", label: "كل الحالات" }, { value: "OPEN", label: "مفتوحة" },
            { value: "IN_PROGRESS", label: "قيد المعالجة" }, { value: "RESOLVED", label: "محلولة" },
            { value: "CLOSED", label: "مغلقة" },
          ]} />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          )) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">لا توجد تذاكر</div>
          ) : filtered.map(ticket => {
            const lastMsg = ticket.messages[ticket.messages.length - 1];
            return (
              <button key={ticket.id} onClick={() => setSelected(ticket)}
                className={cn("w-full text-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                  selected?.id === ticket.id && "bg-primary-50 dark:bg-primary-900/20 border-e-2 border-primary-500"
                )}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {ticket.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{ticket.user.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(ticket.updatedAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{ticket.subject}</p>
                    {lastMsg && <p className="text-xs text-gray-400 truncate mt-0.5">{lastMsg.isStaff ? "أنت: " : ""}{lastMsg.message}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={statusColor[ticket.status]}>{getTicketStatusLabel(ticket.status)}</Badge>
                      <span className={cn("text-xs font-medium", priorityColor[ticket.priority])}>{getPriorityLabel(ticket.priority)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ RIGHT: Chat ══ */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-900">
            <button onClick={() => setSelected(null)} className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft className="h-5 w-5 text-gray-500 rotate-180" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
              {selected.user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{selected.user.name}</p>
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              </div>
              <p className="text-xs text-gray-500">{selected.subject} · {selected.ticketNumber}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selected.orderId && (
                <a href={`/admin/orders/${selected.orderId}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  عرض الطلب
                </a>
              )}
              <Select value={selected.status} onChange={e => handleStatusChange(selected.id, e.target.value)} options={[
                { value: "OPEN", label: "مفتوحة" }, { value: "IN_PROGRESS", label: "قيد المعالجة" },
                { value: "RESOLVED", label: "محلولة" }, { value: "CLOSED", label: "مغلقة" },
              ]} className="text-xs" />
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950/50">
            {selected.messages.map(msg => (
              <div key={msg.id} className={cn("flex", msg.isStaff ? "justify-end" : "justify-start")}>
                {!msg.isStaff && (
                  <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold shrink-0 me-2 mt-auto mb-1">
                    {selected.user.name.charAt(0)}
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                  msg.isStaff ? "bg-primary-600 text-white rounded-tl-sm" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tr-sm border border-gray-200 dark:border-gray-700"
                )}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  <p className={cn("text-xs mt-1", msg.isStaff ? "text-primary-200" : "text-gray-400")}>
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {selected.status === "CLOSED" ? (
              <p className="text-center text-sm text-gray-400 py-2">هذه التذكرة مغلقة</p>
            ) : (
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <textarea
                  value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as React.FormEvent); } }}
                  placeholder="اكتب ردك... (Enter للإرسال، Shift+Enter لسطر جديد)"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
                <Button type="submit" loading={sending} disabled={!reply.trim()} size="sm" className="h-10 px-4 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950/50">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="font-semibold text-gray-900 dark:text-white">اختر تذكرة للرد</p>
            <p className="text-sm text-gray-500 mt-1">اضغط على أي تذكرة من القائمة لعرض المحادثة</p>
          </div>
        </div>
      )}
    </div>
  );
}
