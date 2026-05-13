import type { Metadata } from "next";
import TrendsPageClient from "@/components/TrendsPageClient";

export const metadata: Metadata = {
  title: "Articles - Techsara",
  description:
    "Read Techsara articles on enterprise AI, cloud, generative AI, and industry solutions — thought leadership and success stories.",
};

export default function ArticlesPage() {
  return <TrendsPageClient />;
}
