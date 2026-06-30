"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface AdminToastContextValue {
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const DEFAULT_SUCCESS = "บันทึกสำเร็จ";
const DEFAULT_ERROR = "ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง";
const AUTO_DISMISS_MS = 3200;

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      idRef.current += 1;
      setToast({ id: idRef.current, message, tone });
      timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const showSuccess = useCallback(
    (message = DEFAULT_SUCCESS) => show(message, "success"),
    [show]
  );

  const showError = useCallback(
    (message = DEFAULT_ERROR) => show(message, "error"),
    [show]
  );

  useEffect(() => dismiss, [dismiss]);

  const value = useMemo(
    () => ({ showSuccess, showError }),
    [showSuccess, showError]
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-6 z-[100] flex justify-center px-4"
        >
          <div
            className={cn(
              "pointer-events-auto flex max-w-md animate-fade-up items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm",
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/90 dark:text-emerald-100"
                : "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/90 dark:text-red-100"
            )}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return context;
}

export function useSiteContentSave() {
  const { showSuccess, showError } = useAdminToast();

  return useCallback(
    (saveFn: () => boolean, successMessage?: string) => {
      if (saveFn()) {
        showSuccess(successMessage);
      } else {
        showError();
      }
    },
    [showSuccess, showError]
  );
}
