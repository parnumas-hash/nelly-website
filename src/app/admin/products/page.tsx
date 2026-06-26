import { Suspense } from "react";
import ProductsAdminPage from "@/components/admin/ProductsAdminPage";

export default function AdminProductsRoute() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-neutral-400">Loading...</div>
      }
    >
      <ProductsAdminPage />
    </Suspense>
  );
}
