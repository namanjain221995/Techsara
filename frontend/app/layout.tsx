import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./styles.css";
import "./showcase.css";
import "./book.css";
import "./service.css";
import "./blog.css";
import AutoContactPopup from "@/components/AutoContactPopup";
import AppLoader from "@/components/AppLoader";
import RouteProgress from "@/components/RouteProgress";
import { SITE, organizationJsonLd, websiteJsonLd, professionalServiceJsonLd, jsonLdScript } from "@/lib/seo";

// Self-hosted Google Fonts (next/font). This eliminates the render-blocking
// fonts.googleapis.com stylesheet and the gstatic/googleapis network round-trips —
// the font CSS is inlined, files are served first-party, and font-display:swap avoids
// invisible text. The CSS variables are consumed by --font-* tokens in styles.css.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-instrument",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains",
});
const fontVariables = `${inter.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Techsara | AI Staffing & Technology Solutions — USA",
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
    title: "Techsara | AI Staffing & Technology Solutions — USA",
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: "Techsara | AI Staffing & Technology Solutions — USA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Techsara | AI Staffing & Technology Solutions — USA",
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
    <html lang="en-US" className={fontVariables}>
      <head>
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preload" as="image" href="/assets/techsara-logo.webp" fetchPriority="high" />
        {/* Brand + site entity for Google Knowledge Graph and AI search. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
        {/* LocalBusiness entity — NAP, hours and US service area for local + AI search. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(professionalServiceJsonLd()) }}
        />
      </head>
      <body>
        <div id="app-splash" aria-hidden="true">
          <div className="app-splash-inner">
            <img src="/assets/techsara-logo.webp" alt="" className="app-splash-logo" />
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
