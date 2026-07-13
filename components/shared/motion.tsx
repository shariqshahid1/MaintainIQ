"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}

interface RevealItemProps extends HTMLMotionProps<"div"> {
  variant?: Variants;
}

/** Staggered container: children using `RevealItem` animate in sequence. */
export function Reveal({
  children,
  className,
  delay = 0,
  ...props
}: RevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variant = fadeUp,
  ...props
}: RevealItemProps) {
  return (
    <motion.div className={cn(className)} variants={variant} {...props}>
      {children}
    </motion.div>
  );
}

/** Single element entrance used for heroes, panels and standalone blocks. */
export function RevealBlock({
  children,
  className,
  variant = fadeUp,
  delay = 0,
  ...props
}: RevealProps & { variant?: Variants }) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="show"
      variants={variant}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
