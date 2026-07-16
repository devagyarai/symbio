import * as React from "react";
import { cn } from "../utils";
import { ChevronRight } from "lucide-react";

export const Breadcrumb = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {item.href ? (
          <a href={item.href} className="hover:text-foreground transition-colors">{item.label}</a>
        ) : (
          <span className="text-foreground">{item.label}</span>
        )}
        {index < items.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
      </React.Fragment>
    ))}
  </nav>
);
