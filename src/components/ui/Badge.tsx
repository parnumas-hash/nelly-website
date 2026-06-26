import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "new" | "sale";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        {
          "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300":
            variant === "default",
          "bg-primary text-white": variant === "primary",
          "bg-black text-white dark:bg-white dark:text-black": variant === "new",
          "bg-primary/10 text-primary": variant === "sale",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
