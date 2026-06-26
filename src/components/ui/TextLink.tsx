import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export default function TextLink({
  href,
  children,
  className,
  external,
}: TextLinkProps) {
  const classes = cn(
    "inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 transition-colors hover:text-primary dark:text-white dark:hover:text-primary",
    className
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
