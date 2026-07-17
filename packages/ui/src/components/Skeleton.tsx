import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../utils";

function Skeleton({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className={cn("rounded-md bg-muted", className)}
      {...props}
    />
  );
}
export { Skeleton };
