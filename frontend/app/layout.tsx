import type { Metadata, Viewport } from "next";
import "./styles.css";
import "./showcase.css";
import "./book.css";
import "./service.css";
import AutoContactPopup from "@/components/AutoContactPopup";
import AppLoader from "@/components/AppLoader";
import RouteProgress from "@/components/RouteProgress";
import { SITE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Techsara — Enterprise-Grade AI, Engineered for Your Business",
    // Child pages set just their page name; this stamps the brand on every title.
    template: "%s | Techsara",
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "enterprise AI development",
    "generative AI consulting",
    "LLM development company",
    "computer vision solutions",
    "MLOps services",
    "AI consulting USA",
    "on-premise AI deployment",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: "Techsara — Enterprise-Grade AI, Engineered for Your Business",
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: "Techsara — Enterprise-Grade AI, Engineered for Your Business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Techsara — Enterprise-Grade AI, Engineered for Your Business",
    description: SITE.description,
    site: SITE.twitter,
    creator: SITE.twitter,
    images: [SITE.ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href="/assets/techsara-logo.png" fetchPriority="high" />
        {/* Brand + site entity for Google Knowledge Graph and AI search. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body>
        <div id="app-splash" aria-hidden="true">
          <div className="app-splash-inner">
            <img src="/assets/techsara-logo.png" alt="" className="app-splash-logo" />
            <span className="app-splash-brand">TECHSARA</span>
            <div className="app-splash-spinner" />
          </div>
        </div>
        <AppLoader />
        <RouteProgress />
        {children}
        <AutoContactPopup />
      </body>
    </html>
  );
}
