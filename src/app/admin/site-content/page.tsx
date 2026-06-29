import { redirect } from "next/navigation";
import { SITE_CONTENT_TABS } from "@/lib/admin/site-content-tabs";

export default function SiteContentIndexPage() {
  redirect(SITE_CONTENT_TABS[0].href);
}
