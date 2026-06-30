import type { Metadata } from "next";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import ContentSections from "@/components/content/ContentSections";
import { returnsPage } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: returnsPage.title,
  description: returnsPage.description,
};

export default function ReturnsPage() {
  return (
    <ContentPageLayout
      title={returnsPage.title}
      description={returnsPage.description}
    >
      <ContentSections sections={returnsPage.sections} />
    </ContentPageLayout>
  );
}
