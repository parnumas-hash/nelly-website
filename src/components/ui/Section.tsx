import { cn } from "@/lib/utils";
import Container from "./Container";

type SectionBackground = "white" | "gray" | "dark";

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  background?: SectionBackground;
  className?: string;
  containerClassName?: string;
  ariaLabel?: string;
}

const backgrounds: Record<SectionBackground, string> = {
  white: "bg-white dark:bg-neutral-950",
  gray: "bg-neutral-50 dark:bg-neutral-900/50",
  dark: "bg-neutral-950 text-white",
};

export default function Section({
  id,
  children,
  background = "white",
  className,
  containerClassName,
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn("py-16 md:py-24", backgrounds[background], className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
