import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SolutionDetailClient from "@/components/SolutionDetailClient";
import { solutionDetails, solutionSlugs } from "@/components/solution-details-data";
import { serviceJsonLd, breadcrumbJsonLd, pageOpenGraph } from "@/lib/seo";

type Params = { slug: string };

export function generateStaticParams() {
  return solutionSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const data = solutionDetails[params.slug];
  if (!data) {
    return { title: "Service" };
  }
  const description = data.metaDescription;
  const path = `/services/${params.slug}`;
  return {
    title: { absolute: data.metaTitle },
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title: data.metaTitle, description, path }),
  };
}

export default function ServiceDetailPage({ params }: { params: Params }) {
  const data = solutionDetails[params.slug];
  if (!data) {
    notFound();
  }
  const path = `/services/${params.slug}`;
  const jsonLd = [
    serviceJsonLd({ name: data.title, description: data.description, path }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: data.title, path },
    ]),
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SolutionDetailClient data={data} />
    </>
  );
}
