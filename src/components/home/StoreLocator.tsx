"use client";

import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { useCatalog } from "@/context/CatalogContext";

export default function StoreLocator() {
  const { homepageContent } = useCatalog();
  const content = homepageContent.storeLocator;

  return (
    <Section id="stores" background="white" ariaLabel="Store locator">
      <SectionHeader
        title={content.title}
        description={content.description}
        align="center"
      />

      <div className="grid gap-5 md:grid-cols-3">
        {content.stores.map((store) => (
          <article
            key={store.id}
            className="rounded-2xl border border-neutral-200/80 bg-white p-6 transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">
              {store.name}
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-neutral-500">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {store.address}
                  <br />
                  {store.city}
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {store.hours}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {store.phone}
              </li>
            </ul>

            <a
              href={store.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Get Directions
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </article>
        ))}
      </div>
    </Section>
  );
}
