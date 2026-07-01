import type {
  FaqItem,
  HowToShopStep,
  SitePageSection,
} from "@/types";
import { formatPrice, FREE_SHIPPING_MIN, STANDARD_SHIPPING_FEE } from "@/lib/utils";

export type { FaqItem, HowToShopStep, SitePageSection };

export const CONTACT_EMAIL = "hello@nellygroup.com";
export const CONTACT_LINE = "@nellygroup";

export {
  getDefaultSitePagesContent,
  normalizeSitePagesContent,
} from "@/lib/admin/site-pages-content";

export const shippingPage = {
  title: "Shipping & Delivery",
  description:
    "Complimentary express delivery on qualifying orders. Carefully packaged and shipped across Thailand.",
  sections: [
    {
      heading: "Delivery Areas",
      paragraphs: [
        "We deliver nationwide across Thailand. Bangkok and surrounding provinces typically receive orders within 1–3 business days. Other provinces may take 3–7 business days depending on location.",
      ],
    },
    {
      heading: "Shipping Rates",
      paragraphs: [
        `Orders over ${formatPrice(FREE_SHIPPING_MIN)} qualify for complimentary express delivery. Standard shipping is ${formatPrice(STANDARD_SHIPPING_FEE)} for orders below this threshold.`,
        "All orders are carefully packaged to protect premium products during transit.",
      ],
    },
    {
      heading: "Order Tracking",
      paragraphs: [
        "Once your order ships, you will receive a confirmation email with tracking details. For assistance, contact our concierge team — we respond within one business day.",
      ],
    },
  ] satisfies SitePageSection[],
};

export const returnsPage = {
  title: "Returns & Exchanges",
  description:
    "30-day hassle-free returns on unused items in original packaging.",
  sections: [
    {
      heading: "Return Policy",
      paragraphs: [
        "We want you and your companion to love every purchase. If something is not quite right, you may return unused items in their original packaging within 30 days of delivery.",
      ],
      bullets: [
        "Items must be unused and in original condition with all tags attached",
        "Original packaging and accessories must be included",
        "Proof of purchase is required",
        "Final sale items and opened consumables (treats, grooming liquids) are not eligible",
      ],
    },
    {
      heading: "How to Start a Return",
      paragraphs: [
        "Email us at hello@nellygroup.com with your order details and reason for return. Our team will guide you through the process and arrange collection or drop-off at a NELLY GROUP store.",
      ],
    },
    {
      heading: "Refunds",
      paragraphs: [
        "Approved refunds are processed within 5–10 business days to your original payment method once we receive and inspect the returned item.",
      ],
    },
  ] satisfies SitePageSection[],
};

export const faqItems: FaqItem[] = [
  {
    question: "Are all products authentic?",
    answer:
      "Yes. Every item is sourced directly from authorized distributors and brand partners. We guarantee 100% authenticity — no counterfeits, ever.",
  },
  {
    question: "How do I choose the right size or variant?",
    answer:
      "Each product page lists available colors, sizes, and scents. When in doubt, contact our concierge team — we are happy to help you find the perfect fit for your companion.",
  },
  {
    question: "When will my order arrive?",
    answer:
      "Bangkok and surrounding areas: 1–3 business days. Other provinces: 3–7 business days. You will receive tracking information once your order ships.",
  },
  {
    question: "Do you offer free shipping?",
    answer: `Complimentary express delivery applies to orders over ${formatPrice(FREE_SHIPPING_MIN)}. Orders below this amount incur a ${formatPrice(STANDARD_SHIPPING_FEE)} shipping fee.`,
  },
  {
    question: "Can I return an item?",
    answer:
      "Unused items in original packaging may be returned within 30 days. See our Returns & Exchanges page for full details.",
  },
  {
    question: "Do you have physical stores?",
    answer:
      "Yes. Visit our Store Locator on the homepage to find NELLY GROUP locations in Bangkok. You can also shop online 24/7.",
  },
  {
    question: "How do I care for my product?",
    answer:
      "Care instructions are included on each product page and in the packaging. For brand-specific guidance, our concierge team can connect you with the right resources.",
  },
];

export const howToShopSteps: HowToShopStep[] = [
  {
    step: 1,
    title: "Explore Our Curated Collection",
    description:
      "Browse by brand or collection. Every product is hand-selected for quality, design, and your companion's wellbeing.",
  },
  {
    step: 2,
    title: "Choose Your Variant",
    description:
      "Select color, size, or scent on the product page. Check stock availability before adding to cart.",
  },
  {
    step: 3,
    title: "Add to Cart & Review",
    description:
      "Review your selections in the cart. Adjust quantities or save favourites to your wishlist for later.",
  },
  {
    step: 4,
    title: "Complete Your Order",
    description:
      "Proceed to checkout with your delivery details. Need help? Our concierge team is one message away.",
  },
];

export const contactPage = {
  title: "Contact Us",
  description:
    "Our pet lifestyle concierge team is here to help with product advice, orders, and after-sales care.",
};

export const privacyPage = {
  title: "Privacy Policy",
  description: "How NELLY GROUP collects, uses, and protects your personal information.",
  sections: [
    {
      paragraphs: [
        "NELLY GROUP respects your privacy. This policy explains how we handle information when you visit our website, create an account, or place an order.",
      ],
    },
    {
      heading: "Information We Collect",
      paragraphs: [
        "We may collect your name, email address, phone number, delivery address, and order history when you shop with us or contact our team.",
      ],
      bullets: [
        "Account and profile information you provide",
        "Order and payment details (processed securely by our payment partners)",
        "Website usage data such as pages visited and device type",
        "Communications with our concierge team",
      ],
    },
    {
      heading: "How We Use Your Information",
      paragraphs: [
        "We use your information to process orders, provide customer support, improve our services, and — with your consent — share updates about new collections and offers.",
      ],
    },
    {
      heading: "Your Rights",
      paragraphs: [
        "You may request access to, correction of, or deletion of your personal data by contacting hello@nellygroup.com. We respond to all requests within 30 days.",
      ],
    },
  ] satisfies SitePageSection[],
};

export const termsPage = {
  title: "Terms of Service",
  description: "Terms governing your use of the NELLY GROUP website and services.",
  sections: [
    {
      paragraphs: [
        "By using the NELLY GROUP website, you agree to these terms. Please read them carefully before placing an order.",
      ],
    },
    {
      heading: "Products & Pricing",
      paragraphs: [
        "All products are subject to availability. Prices are listed in Thai Baht (THB) and may change without notice. We reserve the right to limit quantities.",
      ],
    },
    {
      heading: "Orders & Payment",
      paragraphs: [
        "An order is confirmed once payment is received. We reserve the right to cancel orders affected by pricing errors or stock unavailability.",
      ],
    },
    {
      heading: "Intellectual Property",
      paragraphs: [
        "All content on this website — including images, text, and branding — is owned by NELLY GROUP or our brand partners and may not be reproduced without permission.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about these terms? Email hello@nellygroup.com and our team will assist you.",
      ],
    },
  ] satisfies SitePageSection[],
};
