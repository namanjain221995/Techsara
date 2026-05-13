import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SolutionDetailClient from "@/components/SolutionDetailClient";
import { solutionDetails, solutionSlugs } from "@/components/solution-details-data";

type Params = { slug: string };

export function generateStaticParams() {
  return solutionSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const data = solutionDetails[params.slug];
  if (!data) {
    return { title: "Service - Techsara" };
  }
  return {
    title: `${data.title} - Techsara`,
    description: data.description,
  };
}

export default function ServiceDetailPage({ params }: { params: Params }) {
  const data = solutionDetails[params.slug];
  if (!data) {
    notFound();
  }
  return <SolutionDetailClient data={data} />;
}
