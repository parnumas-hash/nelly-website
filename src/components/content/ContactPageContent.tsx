"use client";

import Link from "next/link";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import { CONTACT_EMAIL, CONTACT_LINE, contactPage } from "@/lib/site-pages";
import { useCatalog } from "@/context/CatalogContext";

export default function ContactPageContent() {
  const { homepageContent } = useCatalog();
  const stores = homepageContent.storeLocator.stores;

  return (
    <ContentPageLayout
      title={contactPage.title}
      description={contactPage.description}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex gap-4 rounded-2xl border border-neutral-200 p-6 transition-colors hover:border-primary/30 dark:border-neutral-800"
        >
          <Mail className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Email
            </p>
            <p className="mt-1 text-sm text-neutral-500">{CONTACT_EMAIL}</p>
          </div>
        </a>
        <div className="flex gap-4 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              LINE Official
            </p>
            <p className="mt-1 text-sm text-neutral-500">{CONTACT_LINE}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
          <MapPin className="h-5 w-5 text-primary" />
          Visit Us
        </h2>
        <ul className="space-y-4">
          {stores.map((store) => (
            <li
              key={store.id}
              className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800"
            >
              <p className="font-medium text-neutral-900 dark:text-white">
                {store.name}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {store.address}, {store.city}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{store.hours}</p>
              <a
                href={`tel:${store.phone.replace(/\s/g, "")}`}
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                {store.phone}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/#stores"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          View Store Locator
        </Link>
      </section>
    </ContentPageLayout>
  );
}
