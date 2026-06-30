import type { Metadata } from "next";
import ContactPageContent from "@/components/content/ContactPageContent";
import { contactPage } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: contactPage.title,
  description: contactPage.description,
};

export default function ContactPage() {
  return <ContactPageContent />;
}
