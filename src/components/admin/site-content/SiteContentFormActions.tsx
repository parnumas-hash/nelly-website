"use client";

import Button from "@/components/ui/Button";
import { useSiteContentSave } from "@/components/admin/AdminToast";

interface SiteContentFormActionsProps {
  saveLabel: string;
  onSave: () => boolean;
  onReset: () => void;
  successMessage?: string;
}

export default function SiteContentFormActions({
  saveLabel,
  onSave,
  onReset,
  successMessage,
}: SiteContentFormActionsProps) {
  const saveWithToast = useSiteContentSave();

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => saveWithToast(onSave, successMessage)}>{saveLabel}</Button>
      <Button type="button" variant="outline" onClick={onReset}>
        Reset to default
      </Button>
    </div>
  );
}

export const SITE_CONTENT_TEXTAREA_CLASS =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white";
