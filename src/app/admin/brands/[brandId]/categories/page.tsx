import { redirect } from "next/navigation";

export default function LegacyBrandCategoriesRoute() {
  redirect("/admin/categories");
}
