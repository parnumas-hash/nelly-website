"use client";

import { useState, FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCatalog } from "@/context/CatalogContext";

export default function Newsletter() {
  const { homepageContent } = useCatalog();
  const content = homepageContent.newsletter;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <Section background="white" ariaLabel="Newsletter">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-xl rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900/50 md:px-12"
      >
        <h2 className="font-display text-[32px] font-bold tracking-tight text-neutral-900 dark:text-white md:text-[40px]">
          {content.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-500">
          {content.description}
        </p>

        {submitted ? (
          <div
            className="mt-8 flex items-center justify-center gap-2 text-neutral-900 dark:text-white"
            role="status"
          >
            <Check className="h-5 w-5 text-primary" aria-hidden />
            <span className="text-[15px] font-medium">{content.successMessage}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              id="newsletter-email"
              type="email"
              placeholder={content.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
              className="flex-1 bg-white dark:bg-neutral-950"
            />
            <Button type="submit" disabled={!email.trim()}>
              {content.buttonLabel}
            </Button>
          </form>
        )}

        <p className="mt-4 text-xs text-neutral-400">{content.footnote}</p>
      </motion.div>
    </Section>
  );
}
