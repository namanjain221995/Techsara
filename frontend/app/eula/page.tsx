import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";

export const metadata: Metadata = {
  title: "End-User License Agreement — Techsara",
  description:
    "End-User License Agreement (EULA) for the Techsara QuickBooks-Salesforce Invoice Integration App.",
};

export default function EulaPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("eula.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
