"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicJob } from "@/lib/jobs";
import {
  GENDER_OPTIONS,
  VISA_STATUS_OPTIONS,
} from "@/lib/application";
import AddressAutocomplete from "./AddressAutocomplete";

type Status = "idle" | "submitting" | "success" | "error";

const MAX_RESUME_MB = 3;
const MAX_RESUME_BYTES = MAX_RESUME_MB * 1024 * 1024;

// Kept in step with the booking and contact forms: a name is letters plus the
// punctuation real names use, and a phone number holds no letters at all.
// Without these, "45654654" passed as a name and "abc1234567" as a number,
// because a bare non-empty check and a digit count each let them through.
const NAME_RE = /^\p{L}[\p{L}\s.'-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// No minimum length: single-character names are ordinary in Chinese, Japanese
// and Korean, and rejecting a real name is worse than allowing an initial.
// `label` names the field in the message, matching the booking and contact forms.
function nameError(value: string, label: string): string | undefined {
  if (!value) return `${label} is required.`;
  if (/\d/.test(value)) return "Names cannot contain numbers.";
  if (!NAME_RE.test(value)) return "Use letters, spaces, hyphens or apostrophes only.";
  return undefined;
}

function phoneError(value: string, label: string): string | undefined {
  if (!value) return `${label} is required.`;
  if (/[A-Za-z]/.test(value)) return `${label} cannot contain letters.`;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return `Enter a valid ${label.toLowerCase()} (7-15 digits).`;
  return undefined;
}

function validate(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const get = (k: string) => ((data.get(k) as string) || "").trim();
  const set = (k: string, msg: string | undefined) => { if (msg) errors[k] = msg; };
  const required = (k: string, label: string) => { if (!get(k)) errors[k] = `${label} is required.`; };

  set("firstName", nameError(get("firstName"), "First Name"));
  set("lastName", nameError(get("lastName"), "Last Name"));

  const email = get("email");
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  set("phone", phoneError(get("phone"), "Phone"));
  set("whatsApp", phoneError(get("whatsapp"), "WhatsApp Number"));

  required("genderIdentity", "Gender Identity");
  required("visaStatus", "Visa Status");

  const yearsOfExperience = get("yearsOfExperience");
  const years = parseFloat(yearsOfExperience);
  if (!yearsOfExperience) errors.yearsOfExperience = "Years of Experience is required.";
  else if (isNaN(years) || years < 0) errors.yearsOfExperience = "Enter a valid number of years.";
  else if (years > 70) errors.yearsOfExperience = "Enter 70 years or fewer.";

  if (!get("addressSearch")) errors.address = "Address is required.";
  required("street", "Street");
  required("city", "City");
  required("state", "State");
  required("country", "Country");

  const zip = get("zip");
  if (!zip) errors.zip = "Zip / Postal Code is required.";
  else if (!/^\d{5}(-\d{4})?$/.test(zip)) errors.zip = "Use a US ZIP like 12345 or 12345-6789.";

  return errors;
}

export default function ApplyModal({
  job,
  onClose,
}: {
  job: PublicJob;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resumeError, setResumeError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // When a submit error appears, scroll it into view so the user always sees it
  // (the error sits near the bottom of a long form).
  useEffect(() => {
    if (status === "error" && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status, errorMsg]);

  const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  /** Validate a chosen/dropped file and reflect it in the hidden input + UI. */
  function setResumeFile(file: File | undefined) {
    if (!file) {
      setFileName("");
      setResumeError("");
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setResumeError("Only PDF, DOC, or DOCX files are allowed");
      clearFile();
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("File size must be under 3MB");
      clearFile();
      return;
    }
    setResumeError("");
    setFileName(`${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  }

  function clearFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setResumeFile(e.target.files?.[0]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Push the dropped file into the hidden <input> so the form submits it.
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
    }
    setResumeFile(file);
  }

  // Close on Escape, lock background scroll, and pause Lenis smooth-scroll so the
  // modal's own scroll area works (Lenis otherwise hijacks the wheel).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const lenis = (window as unknown as {
      __techsaraLenis?: { stop: () => void; start: () => void };
    }).__techsaraLenis;
    lenis?.stop();

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      lenis?.start();
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;

    const data = new FormData(formRef.current);
    const errors = validate(data);

    // Resume: show inline error and block submission without touching the bottom banner.
    if (!fileInputRef.current?.files?.length) {
      setResumeError("Please upload your resume");
    }

    if (Object.keys(errors).length > 0 || !fileInputRef.current?.files?.length || resumeError) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/apply", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  return (
    <div
      className="apply-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Apply for ${job.jobTitle}`}
      data-lenis-prevent="true"
      onMouseDown={onClose}
    >
      <div className="apply-modal" data-lenis-prevent="true" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="apply-close" aria-label="Close" onClick={onClose}>×</button>

        <div className="apply-head">
          <div className="apply-eyebrow">Apply for</div>
          <h2 className="apply-title">{job.jobTitle}</h2>
          <p className="apply-sub">
            {job.location} · {job.workMode} · {job.employmentType}
          </p>
        </div>

        {status === "success" ? (
          <div className="apply-success">
            <div className="apply-success-icon">✓</div>
            <h3>Application submitted!</h3>
            <p>Thanks for applying to <strong>{job.jobTitle}</strong>. Our Talent Acquisition Team will review your profile and reach out to you about the next steps.</p>
            <button type="button" className="job-apply-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form ref={formRef} className="apply-form" onSubmit={handleSubmit} noValidate>
            {/* Hidden - links the application to the Job Requirement (used for verification). */}
            <input type="hidden" name="appliedJobRequirementId" value={job.id} />

            <div className="apply-grid">
              <Field label="First Name" required error={fieldErrors.firstName}>
                <input name="firstName" type="text" required autoComplete="given-name"
                  onChange={() => clearFieldError("firstName")} />
              </Field>
              <Field label="Last Name" required error={fieldErrors.lastName}>
                <input name="lastName" type="text" required autoComplete="family-name"
                  onChange={() => clearFieldError("lastName")} />
              </Field>
              <Field label="Gender Identity" required error={fieldErrors.genderIdentity}>
                <select name="genderIdentity" defaultValue="" required
                  onChange={() => clearFieldError("genderIdentity")}>
                  <option value="">Select…</option>
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Email" required error={fieldErrors.email}>
                <input name="email" type="email" required autoComplete="email"
                  onChange={() => clearFieldError("email")} />
              </Field>
              <Field label="Phone" required error={fieldErrors.phone}>
                <input name="phone" type="tel" required autoComplete="tel"
                  onChange={() => clearFieldError("phone")} />
              </Field>
              <Field label="WhatsApp Number" required error={fieldErrors.whatsApp}>
                <input name="whatsapp" type="tel" required
                  onChange={() => clearFieldError("whatsApp")} />
              </Field>
            </div>

            {/* ADDRESS - AWS Location autocomplete + auto-fill */}
            <AddressAutocomplete errors={fieldErrors} onClearError={clearFieldError} />

            {/* PROFESSIONAL */}
            <div className="apply-grid">
              <Field label="Years of Experience" required error={fieldErrors.yearsOfExperience}>
                <input
                  type="number"
                  name="yearsOfExperience"
                  min="0"
                  max="50"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={yearsOfExperience}
                  required
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d+(\.\d{0,1})?$/.test(val)) {
                      setYearsOfExperience(val);
                    }
                    clearFieldError("yearsOfExperience");
                  }}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setYearsOfExperience(val.toFixed(1));
                  }}
                />
              </Field>
              <Field label="Visa Status" required error={fieldErrors.visaStatus}>
                <select name="visaStatus" defaultValue="" required
                  onChange={() => clearFieldError("visaStatus")}>
                  <option value="">Select…</option>
                  {VISA_STATUS_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              {/* NOTE: a plain <div>, NOT the <label>-based <Field> - a <label>
                  wrapping a file input makes any click on it open the picker
                  natively, which double-fired with our onClick (picker reopened). */}
              <div className="apply-field full">
                <span className="apply-label">
                  Resume / CV (PDF, DOC, DOCX · max {MAX_RESUME_MB} MB)
                  <span className="apply-req"> *</span>
                </span>
                <div
                  className={`apply-dropzone${dragActive ? " drag" : ""}${resumeError ? " has-error" : ""}${fileName ? " has-file" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    name="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="apply-dropzone-input"
                    onChange={handleInputChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {fileName ? (
                    <div className="apply-dropzone-file">
                      <span className="apply-dropzone-icon" aria-hidden="true">📄</span>
                      <span className="apply-dropzone-name">{fileName}</span>
                      <button
                        type="button"
                        className="apply-dropzone-remove"
                        onClick={(e) => { e.stopPropagation(); clearFile(); setResumeError(""); }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="apply-dropzone-prompt">
                      <span className="apply-dropzone-icon" aria-hidden="true">⬆️</span>
                      <span className="apply-dropzone-text">
                        <strong>Click to upload</strong> or drag &amp; drop
                      </span>
                      <span className="apply-dropzone-hint">PDF, DOC or DOCX · max {MAX_RESUME_MB} MB</span>
                    </div>
                  )}
                </div>
                {resumeError ? (
                  <span className="apply-field-error">{resumeError}</span>
                ) : null}
              </div>
            </div>

            {status === "error" ? (
              <div ref={errorRef} className="apply-error" role="alert">
                <span className="apply-error-icon" aria-hidden="true">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            ) : null}

            <div className="apply-actions">
              <button type="button" className="apply-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="job-apply-btn" disabled={status === "submitting"}>
                {status === "submitting" ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`apply-field${full ? " full" : ""}`}>
      <span className="apply-label">
        {label}
        {required ? <span className="apply-req"> *</span> : null}
      </span>
      {children}
      {error ? <span className="apply-field-error">{error}</span> : null}
    </label>
  );
}
