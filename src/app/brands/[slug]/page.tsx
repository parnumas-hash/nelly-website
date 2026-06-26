import { redirect } from "next/navigation";



interface PageProps {

  params: Promise<{ slug: string }>;

}



export default async function BrandPage({ params }: PageProps) {

  const { slug } = await params;

  redirect(`/shop?brand=${slug}`);

}


