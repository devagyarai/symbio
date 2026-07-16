import * as React from "react";
import { Badge, BadgeProps } from "./Badge";

const Chip = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, ...props }, ref) => {
    return (
      <Badge
        variant="glass"
        className={className}
        ref={ref as any}
        {...props}
      />
    );
  }
);
Chip.displayName = "Chip";
export { Chip };
