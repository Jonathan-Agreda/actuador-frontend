// src/components/ui/button.tsx
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={clsx(
        "px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50",
        className
      )}
    />
  );
}
