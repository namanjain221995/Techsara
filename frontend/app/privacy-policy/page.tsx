import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const title = "Privacy Policy | Techsara Solutions";
const description =
  "Privacy Policy for Techsara Solutions - how the Techsara QuickBooks-Salesforce Invoice Integration App accesses, uses, stores, and protects your business information, and the choices available to you.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/privacy-policy" },
  openGraph: pageOpenGraph({ title, description, path: "/privacy-policy" }),
};

export default function PrivacyPolicyPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("privacy-policy.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
