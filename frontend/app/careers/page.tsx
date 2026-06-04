import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import CareersInteractivity from "./CareersInteractivity";
import "./careers.css";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const title = "AI & Tech Careers | Join Techsara — Frisco, TX";
const description =
  "Build your career at Techsara. We're hiring AI engineers, ML specialists, and tech talent in Frisco, TX and remote across the United States. Apply today.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/careers" },
  openGraph: pageOpenGraph({ title, description, path: "/careers" }),
};

export default function CareersPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("careers.html") }} />
      <LegacyScripts page="home" />
      <CareersInteractivity />
    </>
  );
}
