'use client';

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../utils";

export interface SidebarProps extends HTMLMotionProps<"aside"> {
  collapsed?: boolean;
  children?: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, children, ...props }, ref) => {
    return (
      <motion.aside
        ref={ref}
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-screen flex flex-col overflow-hidden bg-background/80 backdrop-blur-xl border-r border-border/50",
          "shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]",
          "relative z-20 group/sidebar",
          className
        )}
        {...props}
      >
        {/* Subtle accent glow at the top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />
        
        {children}
      </motion.aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

export { Sidebar };
