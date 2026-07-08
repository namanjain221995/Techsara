import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/lib/jobs";
import {
  isSalesforceConfigured,
  submitSalesforceApplication,
  type SalesforceApplication,
} from "@/lib/salesforce";

export const runtime = "nodejs";

const MAX_RESUME_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_RESUME_EXT = [".pdf", ".doc", ".docx"];

const GENERIC_ERROR = "We couldn't submit your application. Please try again.";

// Verbose request/response logging. ON in development; OFF in production unless
// APPLY_DEBUG=true is explicitly set - keeps candidate PII out of prod logs.
const DEBUG =
  process.env.APPLY_DEBUG === "true" || process.env.NODE_ENV !== "production";

function debugLog(label: string, data?: unknown) {
  if (!DEBUG) return;
  if (data === undefined) console.log(`\n[apply:debug] ${label}`);
  else console.log(`\n[apply:debug] ${label}\n${JSON.stringify(data, null, 2)}`);
}

/** Redact the huge resume base64 blob so the log stays readable. */
function redactForLog(p: SalesforceApplication) {
  return {
    ...p,
    resumeBase64: p.resumeBase64
      ? `[base64 omitted - ${p.resumeBase64.length} chars]`
      : "",
  };
}

/** "5–8 years" -> 5 ; "" -> null. Salesforce expects a number. */
function parseYears(value: string): number | null {
  const m = value.match(/\d+/);
  return m ? Number(m[0]) : null;
}

/**
 * POST /api/apply - receives a candidate application (multipart/form-data,
 * because of the resume file), maps it to the Salesforce "Create Lead" body,
 * and submits it (creates a Lead linked to the Job Requirement).
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected multipart/form-data." },
      { status: 400 },
    );
  }

  const get = (key: string) => String(form.get(key) ?? "").trim();

  const jobId = get("appliedJobRequirementId");
  const firstName = get("firstName");
  const lastName = get("lastName");
  const email = get("email");
  const phone = get("phone");

  // Verify the application is tied to a real, known Job Requirement.
  const job = await getJobById(jobId);
  if (!job) {
    return NextResponse.json(
      { ok: false, error: "Unknown or missing Job Requirement id." },
      { status: 400 },
    );
  }

  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json(
      { ok: false, error: "First name, last name, email and phone are required." },
      { status: 400 },
    );
  }

  // Resume → base64 (with server-side type + size validation).
  const resume = form.get("resume");
  let resumeFileName = "";
  let resumeBase64 = "";
  if (resume && typeof resume === "object" && "arrayBuffer" in resume) {
    const file = resume as File;
    resumeFileName = file.name;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_RESUME_EXT.includes(ext)) {
      return NextResponse.json(
        { ok: false, error: "Resume must be a PDF, DOC or DOCX file." },
        { status: 400 },
      );
    }
    if (file.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Resume must be less than 3 MB." },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    resumeBase64 = buf.toString("base64");
  }

  debugLog(
    `Incoming application  (job "${job.jobTitle}", linking id ${jobId})`,
    {
      ...Object.fromEntries([...form.entries()].filter(([k]) => k !== "resume")),
      resume: resumeFileName
        ? `${resumeFileName} (${(resumeBase64.length * 0.75 / 1024).toFixed(1)} KB)`
        : "(none)",
    },
  );

  const payload: SalesforceApplication = {
    firstName,
    lastName,
    company: get("company") || "N/A",
    phone,
    contactNumberWhatsApp: get("whatsapp"),
    email,
    niche: get("niche"),
    nicheOther: get("nicheOther"),
    street: get("street"),
    city: get("city"),
    state: get("state"),
    country: get("country"),
    postalCode: get("zip"),
    preferredWorkMode: get("preferredWorkMode"),
    primaryTechnology: get("primaryTechnology"),
    resumeFileName,
    resumeBase64,
    appliedJobRequirementId: jobId,
    genderIdentity: get("genderIdentity"),
    yearsOfExperience: parseYears(get("yearsOfExperience")),
    visaStatus: get("visaStatus"),
    trainingSchedule: get("trainingSchedule"),
    status: "Open - Not Contacted",
  };

  // Dev fallback: if Salesforce isn't configured, accept the application locally.
  if (!isSalesforceConfigured()) {
    console.info("[apply] Salesforce not configured - accepted locally (dev only).");
    return NextResponse.json({
      ok: true,
      message: `Application received for ${job.jobTitle}.`,
    });
  }

  try {
    debugLog("POST → Salesforce  /services/apexrest/jobRequirements/  (Content-Type: application/json)", redactForLog(payload));
    const result = await submitSalesforceApplication(payload);
    debugLog(`← Salesforce response  [HTTP ${result.status}, ok=${result.ok}]`, result.data);
    if (!result.ok) {
      const sfMessage =
        result.data && typeof result.data === "object" && "message" in result.data
          ? String((result.data as { message?: unknown }).message ?? "")
          : "";
      // Log status/message for debugging - but never the candidate's PII.
      console.error("[apply] Salesforce rejected application:", result.status, sfMessage);

      // Same candidate (by email) re-applying to the SAME job - Salesforce blocks
      // this by email + job requirement. Show a clear, specific message.
      if (/already applied/i.test(sfMessage)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "You've already applied to this job.",
          },
          { status: 409 },
        );
      }

      // Salesforce duplicate-management rule → a clear, friendly message.
      if (/duplicate/i.test(sfMessage)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "It looks like you've already applied - our team already has your details and will be in touch.",
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      message: `Application received for ${job.jobTitle}.`,
    });
  } catch (err) {
    console.error("[apply] Salesforce submit failed:", err);
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 });
  }
}
