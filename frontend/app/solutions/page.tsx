import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const title = "Enterprise AI Solutions | Generative AI & MLOps | USA";
const description =
  "End-to-end AI solutions from Techsara — generative AI, computer vision, agents, MLOps, cloud and on-premise deployment, and strategic consulting.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/solutions" },
  openGraph: pageOpenGraph({ title, description, path: "/solutions" }),
};

export default function SolutionsIndexPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Solutions", path: "/solutions" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* The legacy markup only carries section-level H2s — give the page one crawlable H1. */}
      <h1 className="sr-only">Enterprise AI Solutions — Generative AI, Computer Vision, Agents & MLOps</h1>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("services.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
