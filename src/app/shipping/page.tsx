import type { Metadata } from "next";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import ContentSections from "@/components/content/ContentSections";
import { shippingPage } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: shippingPage.title,
  description: shippingPage.description,
};

export default function ShippingPage() {
  return (
    <ContentPageLayout
      title={shippingPage.title}
      description={shippingPage.description}
    >
      <ContentSections sections={shippingPage.sections} />
    </ContentPageLayout>
  );
}
