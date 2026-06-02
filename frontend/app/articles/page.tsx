import type { Metadata } from "next";
import TrendsPageClient from "@/components/TrendsPageClient";
import { pageOpenGraph } from "@/lib/seo";

const title = "Articles & Insights on Enterprise AI";
const description =
  "Read Techsara articles on enterprise AI, cloud, generative AI, and industry solutions — thought leadership and success stories.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/articles" },
  openGraph: pageOpenGraph({ title: `${title} | Techsara`, description, path: "/articles" }),
};

export default function ArticlesPage() {
  return <TrendsPageClient />;
}
