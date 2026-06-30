import type { Metadata } from "next";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import ContentSections from "@/components/content/ContentSections";
import { privacyPage } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: privacyPage.title,
  description: privacyPage.description,
};

export default function PrivacyPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title={privacyPage.title}
      description={privacyPage.description}
    >
      <ContentSections sections={privacyPage.sections} />
    </ContentPageLayout>
  );
}
