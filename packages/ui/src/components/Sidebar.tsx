import * as React from "react";
import { cn } from "../utils";

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn("h-screen w-64 border-r bg-surface glass-3 flex flex-col", className)}
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";
export { Sidebar };
