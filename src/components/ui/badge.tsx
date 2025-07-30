// src/components/ui/badge.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "destructive";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const base = "inline-block px-2 py-1 text-xs rounded font-semibold";

  const variants = {
    default: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white",
    success:
      "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200",
    destructive: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200",
  };

  return <span className={clsx(base, variants[variant])}>{children}</span>;
}
