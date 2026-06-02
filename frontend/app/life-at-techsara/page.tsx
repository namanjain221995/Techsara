import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import CareersInteractivity from "../careers/CareersInteractivity";
import "../careers/careers.css";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "A day in the life at TechSara — meaningful work, genuine connection, world-class resources, and a culture engineered around the people who do the work.";

export const metadata: Metadata = {
  title: "Life at Techsara",
  description,
  alternates: { canonical: "/life-at-techsara" },
  openGraph: pageOpenGraph({
    title: "Life at Techsara | Techsara",
    description,
    path: "/life-at-techsara",
  }),
};

export default function LifeAtTechsaraPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("life-at-techsara.html") }} />
      <LegacyScripts page="home" />
      <CareersInteractivity />
    </>
  );
}
