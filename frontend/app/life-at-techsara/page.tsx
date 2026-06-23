import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import CareersInteractivity from "../careers/CareersInteractivity";
import "../careers/careers.css";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const description =
  "A day in the life at TechSara - meaningful work, genuine connection, world-class resources, and a culture engineered around the people who do the work.";

const title = "Life at Techsara | Culture & Careers - Frisco, TX";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/life-at-techsara" },
  openGraph: pageOpenGraph({
    title,
    description,
    path: "/life-at-techsara",
  }),
};

export default function LifeAtTechsaraPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
    { name: "Life at Techsara", path: "/life-at-techsara" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("life-at-techsara.html") }} />
      <LegacyScripts page="home" />
      <CareersInteractivity />
    </>
  );
}
