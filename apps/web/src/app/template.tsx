"use client";

import { motion } from "framer-motion";
import { MotionTokens } from "ui/src/styles/tokens";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.25, ease: MotionTokens.easing.easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}
