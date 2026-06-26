import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";

const lifestyleImages = [
  {
    src: "https://images.unsplash.com/photo-1548191265-cc70d3d45c01?w=800&q=80",
    alt: "Cat on a premium bed in a modern living room",
  },
  {
    src: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80",
    alt: "Dog wearing a premium collar outdoors",
  },
  {
    src: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80",
    alt: "Pet stroller on a city walk",
  },
];

export default function PetLifestyle() {
  return (
    <Section id="lifestyle" background="white" ariaLabel="Pet lifestyle">
      <div className="mb-10 text-center md:mb-14">
        <h2 className="font-display text-[32px] font-bold tracking-tight text-neutral-900 dark:text-white md:text-[40px]">
          Pet Lifestyle
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-neutral-500">
          Where design meets devotion. Explore a world curated for companions
          who live beautifully.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {lifestyleImages.map((image) => (
          <div
            key={image.src}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop">
          <Button variant="outline" size="lg">
            Explore Lifestyle
          </Button>
        </Link>
      </div>
    </Section>
  );
}
