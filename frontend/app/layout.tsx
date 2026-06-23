import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Instrument_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
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
// fonts.googleapis.com stylesheet and the gstatic/googleapis network round-trips -
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
// Self-hosted Plus Jakarta Sans - used by the careers and jobsearch routes. Loading it here
// via next/font replaces the render-blocking `@import url(fonts.googleapis.com...)` those two
// CSS files used to carry (a CSS @import is the worst render-blocking pattern), and keeps the
// font first-party like the others. Consumed via var(--font-jakarta) in careers/jobsearch.css.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});
const fontVariables = `${inter.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} ${plusJakarta.variable}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Techsara | AI Development & IT Staffing Company USA",
    // Child pages set just their page name; this stamps the brand on every title.
    template: "%s | Techsara",
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "AI development company USA",
    "IT staffing company USA",
    "AI staffing company",
    "Frisco Texas AI company",
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
    title: "Techsara | AI Development & IT Staffing Company USA",
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: "Techsara | AI Development & IT Staffing Company USA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Techsara | AI Development & IT Staffing Company USA",
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
        {/* Warm the GA connection early, but only when analytics is actually configured. */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        ) : null}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="Techsara llms.txt" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="me" href={SITE.linkedIn} />
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
        {/* LocalBusiness entity - NAP, hours and US service area for local + AI search. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(professionalServiceJsonLd()) }}
        />
      </head>
      <body>
        <div id="app-splash" aria-hidden="true">
          <div className="app-splash-inner">
            <img src="/assets/techsara-logo.webp" alt="Techsara" className="app-splash-logo" />
            <span className="app-splash-brand">TECHSARA</span>
            <div className="app-splash-spinner" />
          </div>
        </div>
        <AppLoader />
        <RouteProgress />
        {children}
        <AutoContactPopup />
        {/* Google Analytics 4 - env-driven and non-render-blocking (afterInteractive). Renders
            nothing until NEXT_PUBLIC_GA_ID (format G-XXXXXXXXXX) is set in the environment, so
            no fake/placeholder ID ever ships. Add the real Measurement ID to .env.local. */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
