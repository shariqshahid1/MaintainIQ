"use client";

import { motion } from "framer-motion";

/**
 * Wraps every authenticated route. Next.js re-renders this template on each
 * navigation, giving a smooth enter transition between pages without any
 * client-side router plumbing.
 */
export default function AuthenticatedTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
