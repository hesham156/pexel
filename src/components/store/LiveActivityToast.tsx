"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useConversion } from "@/context/ConversionContext";

const PRODUCTS = [
  "Adobe Creative Cloud",
  "Microsoft 365",
  "Canva Pro",
  "Spotify Premium",
  "Netflix",
  "ChatGPT Plus",
  "Midjourney",
  "Figma Pro",
];

const TIMES = [
  "منذ لحظات",
  "منذ دقيقة",
  "منذ دقيقتين",
  "منذ 3 دقائق",
  "منذ 5 دقائق",
  "منذ 8 دقائق",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function LiveActivityToast() {
  const settings = useConversion();
  const [visible, setVisible] = useState(false);
  const [item, setItem] = useState({ name: "", city: "", product: "", time: "" });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const names = settings.live_activity_names.split(",").map((s) => s.trim()).filter(Boolean);
  const cities = settings.live_activity_cities.split(",").map((s) => s.trim()).filter(Boolean);

  const showNext = useCallback(() => {
    setItem({
      name: pick(names),
      city: pick(cities),
      product: pick(PRODUCTS),
      time: pick(TIMES),
    });
    setVisible(true);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => setVisible(false), 5000);
  }, [names, cities]);

  useEffect(() => {
    if (!settings.live_activity_enabled) return;
    const delay = setTimeout(() => {
      showNext();
      intervalRef.current = setInterval(showNext, settings.live_activity_interval * 1000);
    }, 6000);
    return () => {
      clearTimeout(delay);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [settings.live_activity_enabled, settings.live_activity_interval, showNext]);

  if (!settings.live_activity_enabled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={item.name + item.time}
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 start-6 z-[9990] max-w-[280px]"
        >
          <div className="relative flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 pr-8 cursor-pointer hover:shadow-xl transition-shadow">
            {/* Green dot */}
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {item.name} من {item.city}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                اشترى {item.product} · {item.time}
              </p>
            </div>
            {/* Pulse dot */}
            <span className="absolute top-3 end-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {/* Close */}
            <button
              onClick={() => setVisible(false)}
              className="absolute top-1.5 end-1.5 p-0.5 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
