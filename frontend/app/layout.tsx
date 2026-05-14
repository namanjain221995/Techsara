import type { Metadata } from "next";
import "./styles.css";
import "./showcase.css";
import "./book.css";
import "./service.css";
import AutoContactPopup from "@/components/AutoContactPopup";
import AppLoader from "@/components/AppLoader";
import RouteProgress from "@/components/RouteProgress";

export const metadata: Metadata = {
  title: "Techsara - Enterprise-Grade AI, Engineered for Your Business",
  description:
    "Techsara delivers end-to-end AI development, cloud and on-premise deployment, and strategic consulting for enterprises.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href="/assets/techsara-logo.png" fetchPriority="high" />
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
