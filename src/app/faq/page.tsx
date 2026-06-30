import type { Metadata } from "next";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import FaqList from "@/components/content/FaqList";
import { faqItems } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about NELLY GROUP orders, shipping, returns, and authentic premium pet products.",
};

export default function FaqPage() {
  return (
    <ContentPageLayout
      title="Frequently Asked Questions"
      description="Everything you need to know about shopping with NELLY GROUP."
    >
      <FaqList items={faqItems} />
    </ContentPageLayout>
  );
}
