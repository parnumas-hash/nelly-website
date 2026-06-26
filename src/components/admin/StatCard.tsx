interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      )}
    </div>
  );
}
