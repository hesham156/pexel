"use client";

import { useState, useEffect, type ReactNode } from "react";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Settings, Save, BarChart2, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface Setting { key: string; value: string; label?: string; labelAr?: string; type: string; group: string }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
          const vals: Record<string, string> = {};
          data.data.forEach((s: Setting) => { vals[s.key] = s.value; });
          setValues(vals);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: values }),
    });
    const data = await res.json();
    if (data.success) toast.success("تم حفظ الإعدادات");
    else toast.error(data.error || "حدث خطأ");
    setSaving(false);
  };

  const groups: Record<string, Setting[]> = {};
  settings.forEach((s) => {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push(s);
  });

  const groupLabels: Record<string, { label: string; icon: React.ReactNode; description?: string }> = {
    general:  { label: "إعدادات عامة",           icon: <Settings  className="h-4 w-4 text-primary-600" /> },
    payment:  { label: "إعدادات التحويل البنكي", icon: <CreditCard className="h-4 w-4 text-green-600" /> },
    payments: {
      label: "خيارات التقسيط (Tabby / Tamara)",
      icon: <CreditCard className="h-4 w-4 text-purple-600" />,
      description: "🛍️ فعّل Tabby أو Tamara لعرض شارات التقسيط تلقائياً على صفحات المنتجات وزيادة معدل التحويل.",
    },
    orders:   { label: "إعدادات الطلبات",        icon: <Settings  className="h-4 w-4 text-blue-600" /> },
    tracking: {
      label: "بكسلات التتبع والإعلانات",
      icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
      description: "💡 أضف معرفات البكسلات الخاصة بك وسيتم حقنها تلقائياً في جميع صفحات الموقع.",
    },
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإعدادات</h1>
          <p className="text-gray-500 text-sm mt-1">إعدادات المتجر العامة</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>

      {Object.entries(groups).map(([group, groupSettings]) => (
        <Card key={group}>
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            {groupLabels[group]?.icon ?? <Settings className="h-4 w-4 text-primary-600" />}
            {groupLabels[group]?.label ?? group}
          </h2>
          {groupLabels[group]?.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              {groupLabels[group].description}
            </p>
          )}
          <div className="space-y-4">
            {groupSettings.map((setting) => (
              <div key={setting.key}>
                {setting.type === "boolean" ? (
                  <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {setting.labelAr || setting.label || setting.key}
                    </span>
                    <input
                      type="checkbox"
                      checked={values[setting.key] === "true"}
                      onChange={(e) => setValues({ ...values, [setting.key]: String(e.target.checked) })}
                      className="w-4 h-4 accent-primary-600"
                    />
                  </label>
                ) : (
                  <Input
                    label={setting.labelAr || setting.label || setting.key}
                    value={values[setting.key] || ""}
                    onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
