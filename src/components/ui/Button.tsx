import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-white hover:bg-primary-600 active:scale-[0.98]":
              variant === "primary",
            "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200":
              variant === "secondary",
            "hover:bg-neutral-100 dark:hover:bg-neutral-900": variant === "ghost",
            "border border-neutral-300 dark:border-neutral-700 hover:border-primary hover:text-primary":
              variant === "outline",
            "h-9 px-4 text-sm rounded-full": size === "sm",
            "h-11 px-6 text-sm rounded-full": size === "md",
            "h-14 px-8 text-base rounded-full": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
