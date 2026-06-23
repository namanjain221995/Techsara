import type { Metadata } from "next";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { getPublicJobs } from "@/lib/jobs";
import JobSearchClient from "./JobSearchClient";
import "./jobsearch.css";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

const title = "Open Roles | Careers at Techsara — Frisco, TX";
const description =
  "Explore open roles at Techsara — AI, ML, cloud, data, and engineering positions in Frisco, TX and remote across the US. Apply in minutes and our recruiters will reach out about the next steps.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/jobsearch" },
  openGraph: pageOpenGraph({ title, description, path: "/jobsearch" }),
};

const SLOT = "<!--JOBS_APP_SLOT-->";

// Always render on-demand so jobs come live from Salesforce on every request —
// never statically prerendered (which would serve a stale/mock snapshot).
export const dynamic = "force-dynamic";

export default async function JobSearchPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
    { name: "Open Positions", path: "/jobsearch" },
  ]);

  // The legacy shell (nav + footer) wraps a slot marker; we split on it and
  // render the React job UI in between so jobs stay data-driven (Salesforce-ready).
  const shell = getLegacyBody("jobsearch.html");
  const [navHtml, footerHtml] = shell.includes(SLOT)
    ? shell.split(SLOT)
    : [shell, ""];

  // Live from Salesforce (server-side); internal fields already stripped.
  const jobs = await getPublicJobs();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: navHtml }} />
      <JobSearchClient jobs={jobs} />
      <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
      <LegacyScripts page="home" />
    </>
  );
}
