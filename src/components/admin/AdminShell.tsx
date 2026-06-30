"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStorageAlert from "@/components/admin/AdminStorageAlert";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import { AdminSessionProvider } from "@/context/AdminSessionContext";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const isChangePassword = pathname === "/admin/change-password";

  if (isLogin) {
    return <>{children}</>;
  }

  if (isChangePassword) {
    return (
      <AdminSessionProvider>
        <div className="min-h-screen bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </AdminSessionProvider>
    );
  }

  return (
    <AdminSessionProvider>
      <AdminToastProvider>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
          <div className="flex">
            <AdminSidebar />
            <div className="min-w-0 flex-1 lg:pl-0">
              <div className="border-b border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950 lg:px-8 lg:py-5">
                <p className="pl-12 text-xs uppercase tracking-[0.2em] text-neutral-400 lg:pl-0">
                  NELLY GROUP Admin
                </p>
              </div>
              <div className="p-4 lg:p-8">
                <AdminStorageAlert />
                {children}
              </div>
            </div>
          </div>
        </div>
      </AdminToastProvider>
    </AdminSessionProvider>
  );
}
