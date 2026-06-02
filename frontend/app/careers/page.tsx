import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import CareersInteractivity from "./CareersInteractivity";
import "./careers.css";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Join Techsara — work alongside senior engineers building AI, cloud and data systems for regulated, high-stakes domains.";

export const metadata: Metadata = {
  title: "Careers",
  description,
  alternates: { canonical: "/careers" },
  openGraph: pageOpenGraph({ title: "Careers | Techsara", description, path: "/careers" }),
};

export default function CareersPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("careers.html") }} />
      <LegacyScripts page="home" />
      <CareersInteractivity />
    </>
  );
}
