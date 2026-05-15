"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  endsAt: string;
  label?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function FlashSaleTimer({ endsAt, label = "⚡ ينتهي العرض خلال" }: Props) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (expired || !endsAt) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <Clock className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />
      <span className="text-sm text-red-700 dark:text-red-300 font-medium">{label}</span>
      <div className="flex items-center gap-1 font-mono font-black text-red-600 dark:text-red-400 text-sm">
        {timeLeft.h > 0 && (
          <>
            <span className="bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">{pad(timeLeft.h)}</span>
            <span className="opacity-60">:</span>
          </>
        )}
        <span className="bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">{pad(timeLeft.m)}</span>
        <span className="opacity-60">:</span>
        <span className="bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">{pad(timeLeft.s)}</span>
      </div>
    </div>
  );
}
