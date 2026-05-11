"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Single animated section (fade + slide) ────────────────────────────────
interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

export function AnimatedSection({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const isInView = useInView(ref, { once, margin: "-80px 0px" });

  const initial = reduced
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: direction === "up" ? 40 : 0,
        x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
      };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: reduced ? 0.15 : 0.55, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger container (grid / list) ───────────────────────────────────────
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  delayChildren = 0,
  staggerDelay = 0.08,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger child item ─────────────────────────────────────────────────────
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reduced ? 0.15 : 0.45, ease: EASE_OUT },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
