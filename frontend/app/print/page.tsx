import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";

export const metadata: Metadata = {
  title: "Print view",
  // Internal print rendering — keep it out of the index so it never competes with the real home page.
  robots: { index: false, follow: false },
};

export default function PrintPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("index-print.html") }} />
      <LegacyScripts page="print" />
    </>
  );
}
