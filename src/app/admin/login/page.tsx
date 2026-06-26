import { Suspense } from "react";
import AdminLoginPage from "./AdminLoginPage";

export default function AdminLoginRoutePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}
