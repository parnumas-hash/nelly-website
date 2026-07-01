import {
  FaqItem,
  HowToShopStep,
  SiteFaqContent,
  SiteHowToShopContent,
  SitePageContent,
  SitePageSection,
  SitePagesContent,
} from "@/types";
import {
  faqItems,
  howToShopSteps,
  privacyPage,
  returnsPage,
  shippingPage,
  termsPage,
} from "@/lib/site-pages";

function normalizeSection(
  section: Partial<SitePageSection> | undefined,
  fallback: SitePageSection
): SitePageSection {
  const block = section ?? fallback;
  return {
    heading: block.heading?.trim() || fallback.heading,
    paragraphs: (block.paragraphs?.length ? block.paragraphs : fallback.paragraphs).map(
      (paragraph, index) => paragraph?.trim() || fallback.paragraphs[index] || ""
    ),
    bullets: block.bullets?.length
      ? block.bullets.map((item, index) => item?.trim() || fallback.bullets?.[index] || "")
      : fallback.bullets,
  };
}

function normalizePageContent(
  stored: Partial<SitePageContent> | undefined,
  fallback: SitePageContent
): SitePageContent {
  const data = stored ?? fallback;
  const sections =
    Array.isArray(data.sections) && data.sections.length > 0
      ? data.sections
      : fallback.sections;

  return {
    title: data.title?.trim() || fallback.title,
    description: data.description?.trim() || fallback.description,
    sections: sections.map((section, index) =>
      normalizeSection(section, fallback.sections[index] ?? { paragraphs: [""] })
    ),
  };
}

function normalizeFaqItem(item: Partial<FaqItem> | undefined, fallback: FaqItem): FaqItem {
  const block = item ?? fallback;
  return {
    question: block.question?.trim() || fallback.question,
    answer: block.answer?.trim() || fallback.answer,
  };
}

function normalizeFaqContent(
  stored: Partial<SiteFaqContent> | undefined,
  fallback: SiteFaqContent
): SiteFaqContent {
  const data = stored ?? fallback;
  const items =
    Array.isArray(data.items) && data.items.length > 0 ? data.items : fallback.items;

  return {
    title: data.title?.trim() || fallback.title,
    description: data.description?.trim() || fallback.description,
    items: items.map((item, index) =>
      normalizeFaqItem(item, fallback.items[index] ?? { question: "", answer: "" })
    ),
  };
}

function normalizeHowToShopStep(
  step: Partial<HowToShopStep> | undefined,
  fallback: HowToShopStep,
  index: number
): HowToShopStep {
  const block = step ?? fallback;
  return {
    step: typeof block.step === "number" && block.step > 0 ? block.step : index + 1,
    title: block.title?.trim() || fallback.title,
    description: block.description?.trim() || fallback.description,
  };
}

function normalizeHowToShopContent(
  stored: Partial<SiteHowToShopContent> | undefined,
  fallback: SiteHowToShopContent
): SiteHowToShopContent {
  const data = stored ?? fallback;
  const steps =
    Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : fallback.steps;

  return {
    title: data.title?.trim() || fallback.title,
    description: data.description?.trim() || fallback.description,
    steps: steps.map((step, index) =>
      normalizeHowToShopStep(step, fallback.steps[index] ?? step, index)
    ),
    ctaText: data.ctaText?.trim() || fallback.ctaText,
    ctaHref: data.ctaHref?.trim() || fallback.ctaHref,
  };
}

export function getDefaultSitePagesContent(): SitePagesContent {
  return {
    shipping: {
      title: shippingPage.title,
      description: shippingPage.description,
      sections: shippingPage.sections,
    },
    returns: {
      title: returnsPage.title,
      description: returnsPage.description,
      sections: returnsPage.sections,
    },
    faq: {
      title: "Frequently Asked Questions",
      description: "Everything you need to know about shopping with NELLY GROUP.",
      items: faqItems,
    },
    howToShop: {
      title: "How to Shop",
      description: "Four simple steps to find the perfect pieces for your companion.",
      steps: howToShopSteps,
      ctaText: "Ready to explore our curated collection?",
      ctaHref: "/shop",
    },
    privacy: {
      title: privacyPage.title,
      description: privacyPage.description,
      sections: privacyPage.sections,
    },
    terms: {
      title: termsPage.title,
      description: termsPage.description,
      sections: termsPage.sections,
    },
  };
}

export function normalizeSitePagesContent(
  stored: Partial<SitePagesContent> | null | undefined
): SitePagesContent {
  const defaults = getDefaultSitePagesContent();
  const data = stored ?? {};

  return {
    shipping: normalizePageContent(data.shipping, defaults.shipping),
    returns: normalizePageContent(data.returns, defaults.returns),
    faq: normalizeFaqContent(data.faq, defaults.faq),
    howToShop: normalizeHowToShopContent(data.howToShop, defaults.howToShop),
    privacy: normalizePageContent(data.privacy, defaults.privacy),
    terms: normalizePageContent(data.terms, defaults.terms),
  };
}

export function mergeSitePagesContent(
  current: SitePagesContent,
  patch: Partial<SitePagesContent>
): SitePagesContent {
  return normalizeSitePagesContent({
    ...current,
    ...patch,
  });
}
