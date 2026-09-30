import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const title = "Enterprise AI Solutions | Generative AI & MLOps | USA";
const description =
  "End-to-end AI solutions from Techsara - generative AI, computer vision, AI agents, MLOps, plus cloud and on-premise deployment, with eval pipelines, security, and engineering support built in for US enterprises.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/services" },
  openGraph: pageOpenGraph({ title, description, path: "/services" }),
};

export default function ServicesIndexPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">Enterprise AI Solutions - Generative AI, Computer Vision, Agents & MLOps</h1>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("services.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
