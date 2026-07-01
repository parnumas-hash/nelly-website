"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import Button from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Thank you
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Order received
        </h1>
        {orderNumber ? (
          <p className="mt-4 text-neutral-600">
            Your order number is <span className="font-semibold">{orderNumber}</span>.
            Our team will contact you to confirm payment and delivery.
          </p>
        ) : (
          <p className="mt-4 text-neutral-600">
            Our team will contact you to confirm payment and delivery.
          </p>
        )}
        <Link href="/shop" className="mt-8">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    </PageTransition>
  );
}
