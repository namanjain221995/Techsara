import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";

export const metadata: Metadata = {
  title: "Book a consultation - Techsara",
  description: "Book a 30-minute consultation with a senior Techsara engineer.",
};

export default function BookPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("book.html") }} />
      <LegacyScripts page="book" />
    </>
  );
}
