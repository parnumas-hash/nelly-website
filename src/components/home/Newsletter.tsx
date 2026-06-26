"use client";

import { useState, FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "homepage" }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not subscribe.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe.");
    } finally {
      setLoading(false);
    }
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
          Newsletter
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-500">
          New collections, exclusive offers, and pet lifestyle inspiration —
          curated for you.
        </p>

        {submitted ? (
          <div
            className="mt-8 flex items-center justify-center gap-2 text-neutral-900 dark:text-white"
            role="status"
          >
            <Check className="h-5 w-5 text-primary" aria-hidden />
            <span className="text-[15px] font-medium">
              Thank you for subscribing.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              id="newsletter-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
              className="flex-1 bg-white dark:bg-neutral-950"
            />
            <Button type="submit" disabled={!email.trim() || loading}>
              {loading ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-sm text-primary" role="alert">
            {error}
          </p>
        )}

        <p className="mt-4 text-xs text-neutral-400">
          No spam. Unsubscribe anytime.
        </p>
      </motion.div>
    </Section>
  );
}
