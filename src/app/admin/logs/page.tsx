"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { formatDateTime } from "@/lib/utils";

interface Log {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then((data) => { if (data.success) setLogs(data.data); })
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Log>[] = [
    {
      key: "user",
      title: "المستخدم",
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.user?.name}</p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: "action",
      title: "الإجراء",
      render: (val) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{String(val)}</span>
      ),
    },
    {
      key: "entity",
      title: "الكيان",
      render: (val) => <span className="text-sm font-medium">{String(val)}</span>,
    },
    {
      key: "entityId",
      title: "المعرّف",
      render: (val) => <span className="font-mono text-xs text-gray-500">{val ? String(val).slice(0, 8) + "..." : "—"}</span>,
    },
    {
      key: "ipAddress",
      title: "عنوان IP",
      render: (val) => <span className="text-xs text-gray-500">{String(val || "—")}</span>,
    },
    {
      key: "createdAt",
      title: "التاريخ والوقت",
      render: (val) => <span className="text-xs text-gray-500">{formatDateTime(String(val))}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">سجل النشاطات</h1>
        <p className="text-gray-500 text-sm mt-1">جميع إجراءات المشرفين</p>
      </div>

      <DataTable columns={columns} data={logs} loading={loading} emptyMessage="لا توجد سجلات" />
    </div>
  );
}
