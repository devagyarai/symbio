import * as React from "react";
import { Input, InputProps } from "./Input";
import { Search } from "lucide-react";
import { cn } from "../utils";

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          type="search"
          className={cn("pl-9", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
export { SearchInput };
