import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";

export const metadata: Metadata = {
  title: "Techsara print view",
};

export default function PrintPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("index-print.html") }} />
      <LegacyScripts page="print" />
    </>
  );
}
