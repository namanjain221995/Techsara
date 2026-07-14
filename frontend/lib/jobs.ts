/**
 * JOB REQUIREMENT DATA LAYER
 * ──────────────────────────
 * Single source of truth for job openings shown on /jobsearch.
 *
 * SOURCE: when Salesforce env vars are configured (.env.local), jobs are fetched
 * live from the Salesforce "Job Requirements" Apex REST API (see lib/salesforce.ts).
 * Otherwise - or if the API call fails - we fall back to MOCK_JOBS so local dev
 * never hard-breaks. The Salesforce team can post / edit / delete / extend jobs in
 * Salesforce and they flow straight through here; no front-end change needed.
 *
 * The string-typed enum-ish fields (jobStatus, priority, workMode, employmentType,
 * rateType) are intentionally plain `string` - Salesforce is the source of truth and
 * may add picklist values; facets derive their options from the data at runtime.
 *
 * SECURITY: `clientBillRate` (and any other internal field) is INTERNAL margin data.
 * It lives on JobRequirement (server-side) but is stripped by `toPublicJob()` before
 * anythingis aches the browser. Never pass a raw JobRequirement to a client component.
 */


import { fetchSalesforceJobs, isSalesforceConfigured } from "@/lib/salesforce";

/** Full record. Mirrors the Salesforce "Job Requirement" object. Server-side only. */
export interface JobRequirement {
  /** Salesforce record id - used as the "Applied Job Requirement" id on apply. */
  id: string;
  /** Salesforce requirement number, e.g. "JR-00024". */
  jobRequirementName: string;
  externalJobId?: string;
  jobTitle: string;
  jobStatus: string;
  priority: string;
  /** YYYY-MM-DD - when the requirement was created/posted. */
  postedDate: string;
  /** YYYY-MM-DD - submission deadline. */
  submissionDeadline: string;
  location: string;
  workMode: string;
  employmentType: string;
  primarySkills: string[];
  jobDescription: string;
  duration: string;
  numberOfOpenings: number;
  rateType: string;
  requiredVisaStatus: string[];
  /** Public only when the requirement opts in (showClientNameOnWebsite). */
  clientName?: string;
  minimumExperience?: string | number | null;
  /** INTERNAL - never expose to the public. Stripped by toPublicJob(). */
  clientBillRate: string | number | null;
}

/** Public-safe shape sent to the browser (no internal bill rate). */
export type PublicJob = Omit<JobRequirement, "clientBillRate">;

/** Statuses that accept applications. */
export const APPLYABLE_STATUSES = ["Open", "New"];


/** Strip internal-only fields before sending a job to the browser. */
export function toPublicJob(job: JobRequirement): PublicJob {
  const { clientBillRate: _clientBillRate, ...pub } = job;
  return pub;
}

/** All job requirements - live from Salesforce, or empty if unavailable. */
export async function getJobs(): Promise<JobRequirement[]> {
  if (isSalesforceConfigured()) {
    try {
      return await fetchSalesforceJobs();
    } catch (err) {
      console.error("[jobs] Salesforce fetch failed:", err);
      return [];
    }
  }
  return [];
}

/** Public-safe list for client rendering (no clientBillRate). */
export async function getPublicJobs(): Promise<PublicJob[]> {
  const jobs = await getJobs();
  return jobs.map(toPublicJob);
}

export async function getJobById(id: string): Promise<JobRequirement | null> {
  const jobs = await getJobs();
  return jobs.find((j) => j.id === id) ?? null;
}

/** Look up a job by its Salesforce id OR its requirement number (e.g. "JR-00074"). */
export async function getJobByRef(ref: string): Promise<JobRequirement | null> {
  const jobs = await getJobs();
  return jobs.find((j) => j.id === ref || j.jobRequirementName === ref) ?? null;
}
