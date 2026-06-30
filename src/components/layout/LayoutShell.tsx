"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function SiteHeader() {
  return (
    <Suspense fallback={<header className="fixed top-0 z-40 h-[4.5rem] w-full bg-white/80 backdrop-blur-md md:h-20 dark:bg-neutral-950/80" />}>
      <Header />
    </Suspense>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-[4.5rem] md:pt-20">{children}</main>
      <Footer />
    </>
  );
}
