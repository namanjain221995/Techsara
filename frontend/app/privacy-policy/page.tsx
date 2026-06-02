import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the Techsara QuickBooks-Salesforce Invoice Integration App accesses, uses, stores, and protects your business information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("privacy-policy.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
