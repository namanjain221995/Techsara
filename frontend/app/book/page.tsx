import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const title = "Book a Free AI Consultation | Techsara - 30 Min";
const description =
  "Book a free 30-minute consultation with a senior Techsara AI engineer. Discuss your AI roadmap, cloud architecture, deployment, and team needs - practical next steps, no sales fluff.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/book" },
  openGraph: pageOpenGraph({ title, description, path: "/book" }),
};

export default function BookPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Book a Consultation", path: "/book" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("book.html") }} />
      <LegacyScripts page="book" />
    </>
  );
}
