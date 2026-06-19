import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { getJobByRef, toPublicJob } from "@/lib/jobs";
import JobDetailClient from "./JobDetailClient";
import "../jobsearch.css";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SLOT = "<!--JOBS_APP_SLOT-->";

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const job = await getJobByRef(decodeURIComponent(params.id));
  if (!job) return { title: { absolute: "Job not found | Techsara" } };
  const title = `${job.jobTitle} | Careers at Techsara`;
  const description =
    (job.jobDescription || `Apply for ${job.jobTitle} at Techsara.`).slice(0, 160);
  const path = `/jobsearch/${params.id}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function JobDetailPage(
  { params }: { params: { id: string } },
) {
  const job = await getJobByRef(decodeURIComponent(params.id));
  if (!job) notFound();

  const publicJob = toPublicJob(job);
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Open Roles", path: "/jobsearch" },
    { name: job.jobTitle, path: `/jobsearch/${params.id}` },
  ]);

  const shell = getLegacyBody("jobsearch.html");
  const [navHtml, footerHtml] = shell.includes(SLOT)
    ? shell.split(SLOT)
    : [shell, ""];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: navHtml }} />
      <JobDetailClient job={publicJob} />
      <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
      <LegacyScripts page="home" />
    </>
  );
}
