import * as React from "react";
import { cn } from "../utils";
import { Loader2 } from "lucide-react";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        className={cn("h-4 w-4 animate-spin text-muted-foreground", className)}
        {...props}
      />
    );
  }
);
Spinner.displayName = "Spinner";
export { Spinner };
