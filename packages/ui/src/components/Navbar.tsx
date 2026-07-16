'use client';

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../utils";

export interface NavbarProps extends HTMLMotionProps<"header"> {}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.header
        ref={ref}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-14 mt-4 mx-4 sm:mx-6 lg:mx-8 px-6 rounded-2xl flex items-center justify-between sticky top-4 z-40",
          "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-black/5 dark:border-white/10",
          "shadow-sm dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]",
          className
        )}
        {...props}
      >
        {children}
      </motion.header>
    );
  }
);
Navbar.displayName = "Navbar";
export { Navbar };
