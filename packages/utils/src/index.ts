import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./response";
export * from "./async";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
