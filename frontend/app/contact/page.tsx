import type { Metadata } from "next";
import ContactPageClient from "@/components/ContactPageClient";
import { breadcrumbJsonLd, pageOpenGraph } from "@/lib/seo";

const title = "Contact Techsara | AI & IT Staffing — Frisco, TX";
const description =
  "Get in touch with Techsara's team in Frisco, Texas. Call (323) 486-6123, email hello@techsarasolutions.com, or fill out our form for a same-day response.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/contact" },
  openGraph: pageOpenGraph({ title, description, path: "/contact" }),
};

export default function ContactPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPageClient />
    </>
  );
}
