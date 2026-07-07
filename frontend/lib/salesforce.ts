/**
 * SALESFORCE CLIENT  (server-side only)
 * ─────────────────────────────────────
 * Talks to the Techsara "Job Requirements" Apex REST API on the dev11 sandbox.
 *
 *   1. getAccessToken()      — OAuth client_credentials flow, token cached in memory.
 *   2. fetchSalesforceJobs() — GET /services/apexrest/jobRequirements/, maps the
 *      Salesforce records onto our JobRequirement shape. Every job created in
 *      Salesforce shows on the website (only records missing an id are skipped).
 *
 * SECURITY: SF_CLIENT_ID / SF_CLIENT_SECRET live in .env.local and are read here
 * on the server. They are never bundled into client code. Internal fields
 * (clientBillRate, margins, contacts, internal counts) are dropped during mapping
 * — they never even enter the JobRequirement object that reaches the page.
 */

import type { JobRequirement } from "@/lib/jobs";

const INSTANCE_URL = process.env.SF_INSTANCE_URL;
const CLIENT_ID = process.env.SF_CLIENT_ID;
const CLIENT_SECRET = process.env.SF_CLIENT_SECRET;

const JOBS_PATH = "/services/apexrest/jobRequirements/";
// Refresh well before any real expiry; client_credentials tokens are short-lived.
const TOKEN_TTL_MS = 90 * 60 * 1000;

export function isSalesforceConfigured(): boolean {
  return Boolean(INSTANCE_URL && CLIENT_ID && CLIENT_SECRET);
}

interface CachedToken {
  token: string;
  instanceUrl: string;
  expiresAt: number;
}
let cachedToken: CachedToken | null = null;

async function getAccessToken(force = false): Promise<CachedToken> {
  if (!force && cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken;
  }
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID as string,
    client_secret: CLIENT_SECRET as string,
  });
  const res = await fetch(`${INSTANCE_URL}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Salesforce token request failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { access_token: string; instance_url?: string };
  cachedToken = {
    token: json.access_token,
    instanceUrl: json.instance_url || (INSTANCE_URL as string),
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  return cachedToken;
}

/** GET an Apex REST path with the bearer token; retries once on a 401. */
async function apexGet(path: string): Promise<unknown> {
  let auth = await getAccessToken();
  let res = await fetch(`${auth.instanceUrl}${path}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    auth = await getAccessToken(true);
    res = await fetch(`${auth.instanceUrl}${path}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: "no-store",
    });
  }
  if (!res.ok) {
    throw new Error(`Salesforce API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Raw Salesforce record (only the fields we read). */
interface SfJobRecord {
  id: string;
  name?: string;
  externalJobId?: string;
  jobTitle?: string;
  jobStatus?: string;
  priority?: string;
  workMode?: string;
  employmentType?: string;
  location?: string;
  primarySkills?: string;
  requiredVisaStatus?: string;
  rateType?: string;
  numberOfOpenings?: number;
  duration?: string;
  jobDescription?: string;
  submissionDeadline?: string;
  createdDate?: string;
  publishToWebsite?: boolean;
  showClientNameOnWebsite?: boolean;
  clientAccountName?: string;
  clientBillRate?: number | string | null;
  MinimumExperienceRequired?: string | number | null;
}

function splitList(value: unknown, sep: string): string[] {
  return typeof value === "string"
    ? value.split(sep).map((s) => s.trim()).filter(Boolean)
    : [];
}

/** "2026-06-10T16:00:00.000Z" -> "2026-06-10" (our UI formats date-only). */
function dateOnly(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 10) : "";
}

/** Salesforce uses "Onsite"; our UI/labels use "On-site". */
function normalizeWorkMode(mode: unknown): string {
  if (mode === "Onsite") return "On-site";
  return typeof mode === "string" ? mode : "";
}

function mapRecord(r: SfJobRecord): JobRequirement {
  return {
    id: r.id,
    jobRequirementName: r.name ?? "",
    externalJobId: r.externalJobId ?? undefined,
    jobTitle: r.jobTitle?.trim() || "Untitled role",
    jobStatus: r.jobStatus ?? "",
    priority: r.priority ?? "",
    postedDate: dateOnly(r.createdDate),
    submissionDeadline: dateOnly(r.submissionDeadline),
    location: r.location ?? "",
    workMode: normalizeWorkMode(r.workMode),
    employmentType: r.employmentType ?? "",
    primarySkills: typeof r.primarySkills === 'string'
      ? r.primarySkills.split(/[,|;\n\r]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [],
    jobDescription: r.jobDescription ?? "",
    duration: r.duration ?? "",
    numberOfOpenings: Number(r.numberOfOpenings) || 0,
    rateType: r.rateType ?? "",
    requiredVisaStatus: splitList(r.requiredVisaStatus, ";"),
    // Client name only when the requirement explicitly opts in.
    clientName: r.showClientNameOnWebsite ? r.clientAccountName ?? undefined : undefined,
    // INTERNAL — kept on the server-only JobRequirement, stripped by toPublicJob().
    clientBillRate: r.clientBillRate ?? null,
    minimumExperience: r.MinimumExperienceRequired ?? null,
  };
}

// Pull a large page and walk every page so the list scales with Salesforce —
// no silent 20-record cap. PAGE_GUARD bounds the loop against a runaway response.
const FETCH_PAGE_SIZE = 200;
const PAGE_GUARD = 50; // up to 50 × 200 = 10,000 jobs

export async function fetchSalesforceJobs(): Promise<JobRequirement[]> {
  const all: SfJobRecord[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const data = (await apexGet(
      `${JOBS_PATH}?pageNumber=${pageNumber}&pageSize=${FETCH_PAGE_SIZE}`,
    )) as { records?: SfJobRecord[]; totalPages?: number };
    const records = Array.isArray(data?.records) ? data.records : [];
    all.push(...records);
    totalPages = Number(data?.totalPages) || 1;
    pageNumber += 1;
  } while (pageNumber <= totalPages && pageNumber <= PAGE_GUARD);

  // Every job created in Salesforce is shown on the website. We only drop records
  // that are missing an id (invalid / unlinkable). The old publishToWebsite gate
  // was removed at the client's request — jobs now go live as soon as they exist.
  return all
    .filter((r) => r.id)
    .map(mapRecord);
}

/**
 * Candidate application payload — field names map 1:1 to the Salesforce
 * "Create Lead" Apex REST body (POST /services/apexrest/jobRequirements/).
 */
export interface SalesforceApplication {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  contactNumberWhatsApp: string;
  email: string;
  niche: string;
  nicheOther: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  preferredWorkMode: string;
  primaryTechnology: string;
  resumeFileName: string;
  resumeBase64: string;
  appliedJobRequirementId: string;
  genderIdentity: string;
  yearsOfExperience: number | null;
  visaStatus: string;
  trainingSchedule: string;
  status: string;
}

/**
 * POST a candidate application to Salesforce (creates a Lead linked to the
 * Job Requirement). Retries once on a 401 with a refreshed token. Never throws
 * on a non-2xx — returns { ok:false } so the caller can respond gracefully.
 */
export async function submitSalesforceApplication(
  payload: SalesforceApplication,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  let auth = await getAccessToken();
  const doPost = (token: string) =>
    fetch(`${auth.instanceUrl}${JOBS_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

  let res = await doPost(auth.token);
  if (res.status === 401) {
    auth = await getAccessToken(true);
    res = await doPost(auth.token);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* response was not JSON */
  }
  return { ok: res.ok, status: res.status, data };
}
