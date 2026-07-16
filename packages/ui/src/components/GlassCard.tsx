import * as React from "react";
import { Card } from "./Card";
import { cn } from "../utils";

const GlassCard = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Card>>(
  ({ className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("glass-1 border-white/10", className)}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
export { GlassCard };
