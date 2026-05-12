import type { Metadata } from "next";
import "./styles.css";
import "./showcase.css";
import "./book.css";
import "./service.css";

export const metadata: Metadata = {
  title: "Techsara - Enterprise-Grade AI, Engineered for Your Business",
  description:
    "Techsara delivers end-to-end AI development, cloud and on-premise deployment, and strategic consulting for enterprises.",
  icons: {
    icon: "/assets/techsara-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
