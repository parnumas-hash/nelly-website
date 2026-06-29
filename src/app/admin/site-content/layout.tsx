import SiteContentNav from "@/components/admin/SiteContentNav";

export default function SiteContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        Site Content
      </h1>
      <p className="mb-6 text-neutral-500">
        Manage the homepage hero banner, footer branding, and About Us section.
      </p>
      <SiteContentNav />
      {children}
    </div>
  );
}
