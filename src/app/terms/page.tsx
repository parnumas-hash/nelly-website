import type { Metadata } from "next";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import ContentSections from "@/components/content/ContentSections";
import { termsPage } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: termsPage.title,
  description: termsPage.description,
};

export default function TermsPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title={termsPage.title}
      description={termsPage.description}
    >
      <ContentSections sections={termsPage.sections} />
    </ContentPageLayout>
  );
}
