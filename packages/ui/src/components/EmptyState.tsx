import * as React from "react";
import { cn } from "../utils";
import { motion } from "framer-motion";
import { MotionTokens } from "../styles/tokens";

export interface EmptyStateProps extends Omit<React.ComponentProps<typeof motion.div>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MotionTokens.spring.smooth}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center glass-1 rounded-xl",
          className
        )}
        {...props}
      >
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </motion.div>
    );
  }
);
EmptyState.displayName = "EmptyState";
export { EmptyState };
