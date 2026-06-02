import type { Metadata } from "next";
import SolutionsPageClient from "@/components/SolutionsPageClient";
import { pageOpenGraph } from "@/lib/seo";

const title = "AI Talent, Team & Project Services";
const description =
  "Explore Techsara's full suite of services — talent, team, project and international staffing solutions engineered for enterprise outcomes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  openGraph: pageOpenGraph({ title: `${title} | Techsara`, description, path: "/services" }),
};

export default function ServicesIndexPage() {
  return <SolutionsPageClient />;
}
