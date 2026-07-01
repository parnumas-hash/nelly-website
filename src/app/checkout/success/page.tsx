import { Suspense } from "react";
import CheckoutSuccessPage from "@/components/checkout/CheckoutSuccessPage";

export default function CheckoutSuccessRoute() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-neutral-400">Loading...</div>
      }
    >
      <CheckoutSuccessPage />
    </Suspense>
  );
}
