import { SitePageSection } from "@/lib/site-pages";

export default function ContentSections({
  sections,
}: {
  sections: SitePageSection[];
}) {
  return (
    <>
      {sections.map((section, index) => (
        <section key={section.heading ?? index}>
          {section.heading ? (
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              {section.heading}
            </h2>
          ) : null}
          <div className="space-y-4">
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400"
              >
                {paragraph}
              </p>
            ))}
          </div>
          {section.bullets && section.bullets.length > 0 ? (
            <ul className="mt-4 list-disc space-y-2 pl-5">
              {section.bullets.map((item) => (
                <li
                  key={item}
                  className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </>
  );
}
