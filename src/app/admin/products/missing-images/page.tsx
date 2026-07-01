import { Suspense } from "react";
import MissingImagesAdminPage from "@/components/admin/MissingImagesAdminPage";

export default function MissingImagesRoute() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-neutral-400">Loading...</div>
      }
    >
      <MissingImagesAdminPage />
    </Suspense>
  );
}
