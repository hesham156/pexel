"use client";

import {
  Bot, Palette, Play, Music2, Pen, Figma, PenTool, Youtube,
  MessageSquare, LayoutGrid, Shield, FileText, BookOpen,
  Cloud, Video, Box, Zap, Globe, Star, Cpu, Lock, Rss,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface IconDef {
  Icon: LucideIcon;
  color: string;   // brand bg color
  fg: string;      // icon color
}

const ICONS: IconDef[] = [
  { Icon: Bot,          color: "#10a37f", fg: "#ffffff" },
  { Icon: Palette,      color: "#000000", fg: "#ffffff" },
  { Icon: Play,         color: "#e50914", fg: "#ffffff" },
  { Icon: Music2,       color: "#1db954", fg: "#ffffff" },
  { Icon: Pen,          color: "#ff0000", fg: "#ffffff" },
  { Icon: Figma,        color: "#f24e1e", fg: "#ffffff" },
  { Icon: PenTool,      color: "#00c4cc", fg: "#ffffff" },
  { Icon: Youtube,      color: "#ff0000", fg: "#ffffff" },
  { Icon: MessageSquare,color: "#5865f2", fg: "#ffffff" },
  { Icon: LayoutGrid,   color: "#f25022", fg: "#ffffff" },
  { Icon: Lock,         color: "#6366f1", fg: "#ffffff" },
  { Icon: FileText,     color: "#191919", fg: "#ffffff" },
  { Icon: BookOpen,     color: "#58cc02", fg: "#ffffff" },
  { Icon: Cloud,        color: "#4285f4", fg: "#ffffff" },
  { Icon: Video,        color: "#2d8cff", fg: "#ffffff" },
  { Icon: Shield,       color: "#15c39a", fg: "#ffffff" },
  { Icon: Box,          color: "#0061ff", fg: "#ffffff" },
  { Icon: Globe,        color: "#ff6b35", fg: "#ffffff" },
  { Icon: Zap,          color: "#7c3aed", fg: "#ffffff" },
  { Icon: Cpu,          color: "#ec4899", fg: "#ffffff" },
  { Icon: Star,         color: "#f59e0b", fg: "#ffffff" },
  { Icon: Rss,          color: "#059669", fg: "#ffffff" },
];

// [left%, top%, size(px), duration(s), delay(s)]
const ITEMS: [number, number, number, number, number][] = [
  [10,  15,  72,  6.0, 0.0],
  [30,  8,   56,  7.5, 1.2],
  [55,  20,  80,  5.5, 0.5],
  [78,  10,  64,  8.0, 2.1],
  [90,  35,  72,  6.5, 0.8],
  [5,   50,  80,  7.0, 3.0],
  [20,  60,  56,  5.0, 1.7],
  [42,  45,  96,  8.5, 0.3],
  [65,  55,  64,  6.0, 2.5],
  [85,  65,  72,  7.5, 1.0],
  [15,  75,  80,  5.5, 3.8],
  [38,  80,  56,  9.0, 0.6],
  [60,  70,  88,  6.5, 2.9],
  [80,  80,  64,  7.0, 1.5],
  [50,  10,  56,  8.0, 4.2],
  [70,  30,  72,  5.5, 0.9],
  [25,  35,  64,  7.5, 3.5],
  [45,  65,  80,  6.0, 1.8],
  [3,   30,  56,  8.5, 2.3],
  [93,  50,  72,  6.0, 0.4],
  [50,  88,  64,  7.0, 3.2],
  [70,  88,  56,  5.5, 1.1],
];

export default function FloatingIcons() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {ITEMS.map(([left, top, size, dur, delay], i) => {
        const { Icon, color, fg } = ICONS[i % ICONS.length];
        const iconSize = Math.round(size * 0.44);
        return (
          <div
            key={i}
            className="absolute animate-fly-out"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              "--fly-duration": `${dur}s`,
              "--fly-delay": `${delay}s`,
            } as React.CSSProperties}
          >
            <div
              className="w-full h-full rounded-2xl flex items-center justify-center shadow-xl"
              style={{ backgroundColor: color }}
            >
              <Icon size={iconSize} color={fg} strokeWidth={1.8} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
