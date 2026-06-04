import type { Metadata } from "next";
import TrendsPageClient from "@/components/TrendsPageClient";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const title = "AI & Technology Insights for Enterprises | Techsara";
const description =
  "Read Techsara articles on enterprise AI, cloud, generative AI, and industry solutions — thought leadership and success stories.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/articles" },
  openGraph: pageOpenGraph({ title, description, path: "/articles" }),
};

export default function ArticlesPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrendsPageClient />
    </>
  );
}
