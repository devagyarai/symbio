import * as React from "react";
import { Button, ButtonProps } from "./Button";

const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        ref={ref}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";
export { IconButton };
