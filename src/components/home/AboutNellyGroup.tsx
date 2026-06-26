import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import Logo from "@/components/ui/Logo";

export default function AboutNellyGroup() {
  return (
    <Section id="about" background="gray" ariaLabel="About NELLY GROUP">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-900 dark:ring-neutral-800 md:p-12">
          <Logo asLink={false} size="2xl" className="mx-auto w-full max-w-sm" />
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
            About Us
          </p>
          <h2 className="font-display text-[32px] font-bold tracking-tight text-neutral-900 dark:text-white md:text-[44px]">
            About NELLY GROUP
          </h2>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-neutral-500">
            <p>
              NELLY GROUP is Thailand&apos;s destination for premium pet
              lifestyle — curating the world&apos;s most distinguished brands
              under one refined roof.
            </p>
            <p>
              From Japanese-engineered strollers to artisan leather collars,
              every product is selected for quality, design, and the joy it
              brings to your companion. We believe luxury is intentional — not
              excessive.
            </p>
            <p>
              Visit our flagship stores or explore online. Either way, welcome
              to a new standard of pet living.
            </p>
          </div>
          <TextLink href="/shop" className="mt-8">
            Explore the Collection
          </TextLink>
        </div>
      </div>
    </Section>
  );
}
