/**
 * JOB REQUIREMENT DATA LAYER
 * ──────────────────────────
 * Single source of truth for job openings shown on /jobsearch.
 *
 * SOURCE: when Salesforce env vars are configured (.env.local), jobs are fetched
 * live from the Salesforce "Job Requirements" Apex REST API (see lib/salesforce.ts).
 * Otherwise — or if the API call fails — we fall back to MOCK_JOBS so local dev
 * never hard-breaks. The Salesforce team can post / edit / delete / extend jobs in
 * Salesforce and they flow straight through here; no front-end change needed.
 *
 * The string-typed enum-ish fields (jobStatus, priority, workMode, employmentType,
 * rateType) are intentionally plain `string` — Salesforce is the source of truth and
 * may add picklist values; facets derive their options from the data at runtime.
 *
 * SECURITY: `clientBillRate` (and any other internal field) is INTERNAL margin data.
 * It lives on JobRequirement (server-side) but is stripped by `toPublicJob()` before
 * anythingis aches the browser. Never pass a raw JobRequirement to a client component.
 */


import { fetchSalesforceJobs, isSalesforceConfigured } from "@/lib/salesforce";

/** Full record. Mirrors the Salesforce "Job Requirement" object. Server-side only. */
export interface JobRequirement {
  /** Salesforce record id — used as the "Applied Job Requirement" id on apply. */
  id: string;
  /** Salesforce requirement number, e.g. "JR-00024". */
  jobRequirementName: string;
  externalJobId?: string;
  jobTitle: string;
  jobStatus: string;
  priority: string;
  /** YYYY-MM-DD — when the requirement was created/posted. */
  postedDate: string;
  /** YYYY-MM-DD — submission deadline. */
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
  /** INTERNAL — never expose to the public. Stripped by toPublicJob(). */
  clientBillRate: string | number | null;
}

/** Public-safe shape sent to the browser (no internal bill rate). */
export type PublicJob = Omit<JobRequirement, "clientBillRate">;

/** Statuses that accept applications. */
export const APPLYABLE_STATUSES = ["Open", "New"];

/** Fallback data for local dev when Salesforce is not configured/reachable. */
const MOCK_JOBS: JobRequirement[] = [
  {
    id: "JR-MOCK-1",
    jobRequirementName: "JR-MOCK-1",
    jobTitle: "Senior AI / ML Engineer",
    jobStatus: "Open",
    priority: "High",
    postedDate: "2026-05-28",
    submissionDeadline: "2026-07-31",
    location: "Frisco, TX",
    workMode: "Hybrid",
    employmentType: "Full-Time",
    primarySkills: ["Python", "PyTorch", "MLOps", "LLMs"],
    jobDescription:
      "Design, train and ship production machine-learning systems end to end. (Mock fallback — Salesforce not configured.)",
    duration: "Permanent",
    numberOfOpenings: 2,
    rateType: "Salary",
    requiredVisaStatus: ["USC", "GC", "H1B"],
    clientBillRate: null,
  },
  {
    id: "JR-MOCK-2",
    jobRequirementName: "JR-MOCK-2",
    jobTitle: "Generative AI Engineer (LLM / RAG)",
    jobStatus: "Open",
    priority: "Critical",
    postedDate: "2026-06-05",
    submissionDeadline: "2026-06-30",
    location: "Remote (US)",
    workMode: "Remote",
    employmentType: "Contract",
    primarySkills: ["LLM", "RAG", "LangChain", "Python"],
    jobDescription:
      "Build retrieval-augmented generation pipelines and ship reliable AI products. (Mock fallback.)",
    duration: "12 months",
    numberOfOpenings: 3,
    rateType: "Hourly",
    requiredVisaStatus: ["USC", "GC", "H1B", "OPT"],
    clientBillRate: null,
  },
  {
    id: "JR-MOCK-3",
    jobRequirementName: "JR-MOCK-3",
    jobTitle: "Cloud Solutions Architect",
    jobStatus: "On Hold",
    priority: "Medium",
    postedDate: "2026-04-30",
    submissionDeadline: "2026-09-15",
    location: "Austin, TX",
    workMode: "Remote",
    employmentType: "Full-Time",
    primarySkills: ["AWS", "Azure", "Terraform"],
    jobDescription:
      "Design reference architectures across AWS, Azure and GCP. (Mock fallback.)",
    duration: "Permanent",
    numberOfOpenings: 1,
    rateType: "Salary",
    requiredVisaStatus: ["USC", "GC"],
    clientBillRate: null,
  },
];

/** Strip internal-only fields before sending a job to the browser. */
export function toPublicJob(job: JobRequirement): PublicJob {
  const { clientBillRate: _clientBillRate, ...pub } = job;
  return pub;
}

/** All job requirements — live from Salesforce, or mock fallback. */
export async function getJobs(): Promise<JobRequirement[]> {
  if (isSalesforceConfigured()) {
    try {
      return await fetchSalesforceJobs();
    } catch (err) {
      console.error("[jobs] Salesforce fetch failed — using mock fallback:", err);
      return MOCK_JOBS;
    }
  }
  return MOCK_JOBS;
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
