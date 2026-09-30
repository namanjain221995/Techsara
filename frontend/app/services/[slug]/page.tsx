import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ServiceDetail from "@/components/ServiceDetail";
import { getService, getServiceSlugList } from "@/lib/services-data";
import { serviceJsonLd, breadcrumbJsonLd, pageOpenGraph, clampDescription } from "@/lib/seo";

type ServicePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getServiceSlugList().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: ServicePageProps): Metadata {
  const service = getService(params.slug);
  if (!service) return { title: { absolute: "Service Not Found | Techsara" } };

  const description = clampDescription(
    service.intro,
    `${service.name} from Techsara - enterprise AI solutions engineered for production, with eval pipelines, security, cloud and on-premise deployment, and senior engineering support built in for US enterprises.`,
  );
  const path = `/services/${params.slug}`;
  const seoTitle = `${service.name} | Techsara USA`;
  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title: seoTitle, description, path }),
  };
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  // Rendered on the server from the catalogue. An unknown slug is a real 404 now
  // rather than a message painted into the page by a script.
  const service = getService(params.slug);
  if (!service) notFound();

  const path = `/services/${params.slug}`;
  const jsonLd = [
    serviceJsonLd({
      name: service.name,
      description: service.intro,
      path,
      category: service.category,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: service.name, path },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <ServiceDetail data={service} />
      <SiteFooter />
    </>
  );
}
