import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import CareersInteractivity from "./CareersInteractivity";
import "./careers.css";

export const metadata: Metadata = {
  title: "Careers — Techsara",
  description:
    "Join Techsara — work alongside senior engineers building AI, cloud and data systems for regulated, high-stakes domains.",
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
