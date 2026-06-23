import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody, getServiceSlugs, getServiceMeta } from "@/lib/legacy-html";
import { serviceJsonLd, breadcrumbJsonLd, pageOpenGraph, clampDescription } from "@/lib/seo";

type SolutionPageProps = {
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

export function generateMetadata({ params }: SolutionPageProps): Metadata {
  const meta = getServiceMeta(params.slug);
  const name = meta?.name || titleCase(params.slug);
  // Word-boundary clamp into the 150–220 band; falls back to a keyword-rich template when
  // the service intro is too short, so no slug ships a thin or mid-word-cut description.
  const description = clampDescription(
    meta?.intro || "",
    `${name} from Techsara — enterprise AI solutions engineered for production, with eval pipelines, security, cloud and on-premise deployment, and senior engineering support built in for US enterprises.`,
  );
  const path = `/solutions/${params.slug}`;
  // Geo/US-modified title applied uniformly to every service slug.
  const seoTitle = `${name} | Techsara USA`;
  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title: seoTitle, description, path }),
  };
}

export default function SolutionDetailPage({ params }: SolutionPageProps) {
  const meta = getServiceMeta(params.slug);
  const name = meta?.name || titleCase(params.slug);
  const path = `/solutions/${params.slug}`;
  const jsonLd = [
    serviceJsonLd({
      name,
      description: meta?.intro || name,
      path,
      category: meta?.category,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
      { name, path },
    ]),
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* The detail body is hydrated client-side into #service-root, so SSR ships no
          heading — emit a crawlable H1 server-side so the page is indexable without JS. */}
      <h1 className="sr-only">{name}</h1>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("service.html") }} />
      <LegacyScripts page="service" serviceSlug={params.slug} />
    </>
  );
}
