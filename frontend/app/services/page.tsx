import type { Metadata } from "next";
import SolutionsPageClient from "@/components/SolutionsPageClient";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const title = "IT Staffing & AI Talent Services | Techsara USA";
const description =
  "Techsara provides IT staffing, team augmentation, project outsourcing, and international talent solutions for US tech companies - senior AI, cloud, and software engineering teams that scale with your roadmap.";

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
      <SolutionsPageClient />
    </>
  );
}
