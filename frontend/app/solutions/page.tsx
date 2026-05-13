import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";

export const metadata: Metadata = {
  title: "Solutions — Techsara",
  description:
    "End-to-end AI solutions from Techsara — generative AI, computer vision, agents, MLOps, cloud and on-premise deployment, and strategic consulting.",
};

export default function SolutionsIndexPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("services.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
