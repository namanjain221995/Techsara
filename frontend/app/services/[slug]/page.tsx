import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody, getServiceSlugs } from "@/lib/legacy-html";

type ServicePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: ServicePageProps): Metadata {
  return {
    title: `${params.slug.replace(/-/g, " ")} - Techsara`,
    description: "Techsara service detail.",
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("service.html") }} />
      <LegacyScripts page="service" serviceSlug={params.slug} />
    </>
  );
}
