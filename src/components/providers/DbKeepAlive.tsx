"use client";

import { useEffect } from "react";

// Pings the DB every 4 minutes to prevent Neon cold starts
export function DbKeepAlive() {
  useEffect(() => {
    const ping = () => fetch("/api/ping").catch(() => {});
    // Ping immediately on mount
    ping();
    // Then every 4 minutes
    const id = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}
