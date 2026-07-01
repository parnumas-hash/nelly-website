import { FaqItem } from "@/types";

export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-neutral-900 marker:content-none dark:text-white">
            {item.question}
            <span className="shrink-0 text-neutral-400 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 pr-8 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
