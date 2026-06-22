import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyScripts from "@/components/LegacyScripts";
import { getLegacyBody } from "@/lib/legacy-html";
import { getJobByRef, getPublicJobs, toPublicJob, type PublicJob } from "@/lib/jobs";
import JobDetailClient from "./JobDetailClient";
import "../jobsearch.css";
import { pageOpenGraph, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Other published jobs that share the most primary skills with the current one. */
function getRecommended(current: PublicJob, all: PublicJob[], limit = 4): PublicJob[] {
  const wanted = new Set(current.primarySkills.map((s) => s.toLowerCase()));
  if (wanted.size === 0) return [];
  return all
    .filter((j) => j.id !== current.id)
    .map((j) => ({
      job: j,
      score: j.primarySkills.filter((s) => wanted.has(s.toLowerCase())).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.job);
}

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
  const recommended = getRecommended(publicJob, await getPublicJobs());
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
      <JobDetailClient job={publicJob} recommended={recommended} />
      <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
      <LegacyScripts page="home" />
    </>
  );
}
