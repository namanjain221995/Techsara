import type { Metadata } from "next";
import TrendsPageClient from "@/components/TrendsPageClient";

export const metadata: Metadata = {
  title: "AI Trends - Techsara",
  description:
    "Explore enterprise AI trends, readiness signals, and practical next steps from Techsara.",
};

export default function TrendsPage() {
  return <TrendsPageClient />;
}
