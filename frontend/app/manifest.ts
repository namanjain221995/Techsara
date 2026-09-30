import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Techsara - AI Development & IT Staffing",
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#04142F",
    theme_color: "#04142F",
    lang: "en-US",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
