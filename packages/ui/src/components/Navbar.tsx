import * as React from "react";
import { cn } from "../utils";

const Navbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn("h-16 border-b glass-3 flex items-center px-6 w-full sticky top-0 z-40", className)}
        {...props}
      />
    );
  }
);
Navbar.displayName = "Navbar";
export { Navbar };
