import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStorageAlert from "@/components/admin/AdminStorageAlert";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
