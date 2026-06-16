import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const title = "End-User License Agreement | Techsara Solutions";
const description =
  "End-User License Agreement (EULA) for Techsara Solutions and the Techsara QuickBooks-Salesforce Invoice Integration App — license terms, permitted use, restrictions, and your rights and responsibilities.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/eula" },
  openGraph: pageOpenGraph({ title, description, path: "/eula" }),
};

export default function EulaPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "End-User License Agreement", path: "/eula" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("eula.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
