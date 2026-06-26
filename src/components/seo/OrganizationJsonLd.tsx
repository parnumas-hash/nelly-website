import { getSiteUrl } from "@/lib/site-config";

export default function OrganizationJsonLd() {
  const baseUrl = getSiteUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NELLY GROUP",
    url: baseUrl,
    logo: `${baseUrl}/images/nelly-group-logo.png`,
    description:
      "Premium pet lifestyle store featuring curated international pet brands.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
