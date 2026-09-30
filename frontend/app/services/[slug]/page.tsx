import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody, getServiceSlugs, getServiceMeta } from "@/lib/legacy-html";
import { serviceJsonLd, breadcrumbJsonLd, pageOpenGraph, clampDescription } from "@/lib/seo";

type ServicePageProps = {
  params: {
    slug: string;
  };
};

function titleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: ServicePageProps): Metadata {
  const meta = getServiceMeta(params.slug);
  const name = meta?.name || titleCase(params.slug);
  const description = clampDescription(
    meta?.intro || "",
    `${name} from Techsara - enterprise AI solutions engineered for production, with eval pipelines, security, cloud and on-premise deployment, and senior engineering support built in for US enterprises.`,
  );
  const path = `/services/${params.slug}`;
  const seoTitle = `${name} | Techsara USA`;
  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title: seoTitle, description, path }),
  };
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  const meta = getServiceMeta(params.slug);
  const name = meta?.name || titleCase(params.slug);
  const path = `/services/${params.slug}`;
  const jsonLd = [
    serviceJsonLd({
      name,
      description: meta?.intro || name,
      path,
      category: meta?.category,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name, path },
    ]),
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">{name}</h1>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("service.html") }} />
      <LegacyScripts page="service" serviceSlug={params.slug} />
    </>
  );
}
