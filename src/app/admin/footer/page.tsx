import { redirect } from "next/navigation";

export default function AdminFooterRedirectPage() {
  redirect("/admin/site-content/footer");
}
