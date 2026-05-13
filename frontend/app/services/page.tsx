import type { Metadata } from "next";
import SolutionsPageClient from "@/components/SolutionsPageClient";

export const metadata: Metadata = {
  title: "Services — Techsara",
  description:
    "Explore Techsara's full suite of services — talent, team, project and international staffing solutions engineered for enterprise outcomes.",
};

export default function ServicesIndexPage() {
  return <SolutionsPageClient />;
}
