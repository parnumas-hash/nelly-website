import { instagramPosts } from "@/lib/instagram";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import InstagramTile from "@/components/ui/InstagramTile";
import TextLink from "@/components/ui/TextLink";

export default function InstagramGallery() {
  return (
    <Section id="instagram" background="gray" ariaLabel="Instagram gallery">
      <SectionHeader
        title="Instagram Gallery"
        description="@nellygroup — share your moments and tag us to be featured."
        align="center"
      />
      <div className="mb-8 text-center">
        <TextLink href="https://instagram.com/nellygroup" external>
          Follow @nellygroup
        </TextLink>
      </div>

      <div className="-mx-4 grid grid-cols-2 gap-1 md:-mx-6 md:grid-cols-3 lg:grid-cols-6">
        {instagramPosts.map((post, i) => (
          <InstagramTile key={post.id} post={post} index={i} />
        ))}
      </div>
    </Section>
  );
}
