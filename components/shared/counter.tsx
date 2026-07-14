"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  /** Locale used for number formatting. */
  locale?: string;
}

/**
 * Counts up from 0 to `value` the first time it scrolls into view.
 * Renders "0" on the server and before entering the viewport so it is
 * hydration-safe and never flashes the final number prematurely.
 */
export function AnimatedCounter({
  value,
  duration = 1.3,
  decimals = 0,
  className,
  locale = "en-US",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        node.textContent = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest);
      },
    });

    return () => controls.stop();
  }, [inView, value, duration, decimals, locale]);

  return (
    <span ref={ref} className={cn(className)}>
      0
    </span>
  );
}
