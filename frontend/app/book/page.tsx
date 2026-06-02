import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph } from "@/lib/seo";

const title = "Book a Free AI Consultation";
const description =
  "Book a free 30-minute consultation with a senior Techsara AI engineer. Discuss your roadmap, architecture and deployment — no sales fluff.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/book" },
  openGraph: pageOpenGraph({ title: `${title} | Techsara`, description, path: "/book" }),
};

export default function BookPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("book.html") }} />
      <LegacyScripts page="book" />
    </>
  );
}
