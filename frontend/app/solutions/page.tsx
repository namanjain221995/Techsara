import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph } from "@/lib/seo";

const title = "Enterprise AI Solutions";
const description =
  "End-to-end AI solutions from Techsara — generative AI, computer vision, agents, MLOps, cloud and on-premise deployment, and strategic consulting.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/solutions" },
  openGraph: pageOpenGraph({ title: `${title} | Techsara`, description, path: "/solutions" }),
};

export default function SolutionsIndexPage() {
  return (
    <>
      {/* The legacy markup only carries section-level H2s — give the page one crawlable H1. */}
      <h1 className="sr-only">Enterprise AI Solutions — Generative AI, Computer Vision, Agents & MLOps</h1>
      <div dangerouslySetInnerHTML={{ __html: getLegacyBody("services.html") }} />
      <LegacyScripts page="home" />
    </>
  );
}
