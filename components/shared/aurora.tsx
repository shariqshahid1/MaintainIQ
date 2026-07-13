"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Living, animated gradient backdrop used on hero / public surfaces.
 * Three soft color fields drift slowly to give the product a distinctive,
 * premium "intelligent" identity without distracting from content.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        aria-hidden
        className="absolute -left-24 -top-24 size-[28rem] rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-500/25"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute right-0 top-10 size-[24rem] rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-400/20"
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-1/3 size-[22rem] rounded-full bg-blue-400/25 blur-3xl dark:bg-blue-500/20"
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
