import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody, getServiceSlugs } from "@/lib/legacy-html";

type SolutionPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: SolutionPageProps): Metadata {
  return {
    title: `${params.slug.replace(/-/g, " ")} - Techsara`,
    description: "Techsara solution detail.",
  };
}

export default function SolutionDetailPage({ params }: SolutionPageProps) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("service.html") }} />
      <LegacyScripts page="service" serviceSlug={params.slug} />
    </>
  );
}
