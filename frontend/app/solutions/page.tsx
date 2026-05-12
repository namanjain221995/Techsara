import type { Metadata } from "next";
import SolutionsPageClient from "@/components/SolutionsPageClient";

export const metadata: Metadata = {
  title: "Solutions - Techsara",
  description:
    "Explore Techsara's AI engineering, cloud, industry and advisory solutions engineered for enterprise outcomes.",
};

export default function SolutionsPage() {
  return <SolutionsPageClient />;
}
