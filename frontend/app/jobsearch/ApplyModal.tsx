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

export default function ApplyModal({
  job,
  onClose,
}: {
  job: PublicJob;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
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

  /** Validate a chosen/dropped file and reflect it in the hidden input + UI. */
  function setResumeFile(file: File | undefined) {
    if (!file) {
      setFileName("");
      setResumeError("");
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setResumeError("Please upload a PDF, DOC or DOCX file.");
      clearFile();
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError(
        `Resume must be less than ${MAX_RESUME_MB} MB - this file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please upload a smaller file.`,
      );
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
    // Resume is required (enforced here since the file input is visually hidden).
    if (!fileInputRef.current?.files?.length) {
      setResumeError("Please upload your resume (PDF, DOC or DOCX).");
      return;
    }
    // Block submit while an oversized / invalid resume is flagged.
    if (resumeError) {
      setStatus("error");
      setErrorMsg(resumeError);
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const data = new FormData(formRef.current);
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
            <p>Thanks for applying to <strong>{job.jobTitle}</strong>. Our recruiters will review your profile and reach out to you about the next steps.</p>
            <button type="button" className="job-apply-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form ref={formRef} className="apply-form" onSubmit={handleSubmit}>
            {/* Hidden - links the application to the Job Requirement (used for verification). */}
            <input type="hidden" name="appliedJobRequirementId" value={job.id} />

            <div className="apply-grid">
              <Field label="First Name" required>
                <input name="firstName" type="text" required autoComplete="given-name" />
              </Field>
              <Field label="Last Name" required>
                <input name="lastName" type="text" required autoComplete="family-name" />
              </Field>
              <Field label="Gender Identity" required>
                <select name="genderIdentity" defaultValue="" required>
                  <option value="">Select…</option>
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Email" required>
                <input name="email" type="email" required autoComplete="email" />
              </Field>
              <Field label="Phone" required>
                <input name="phone" type="tel" required autoComplete="tel" />
              </Field>
              <Field label="WhatsApp Number" required>
                <input name="whatsapp" type="tel" required />
              </Field>
            </div>

            {/* ADDRESS - AWS Location autocomplete + auto-fill */}
            <AddressAutocomplete />

            {/* PROFESSIONAL */}
            <div className="apply-grid">
              <Field label="Years of Experience" required>
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
                  }}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setYearsOfExperience(val.toFixed(1));
                  }}
                />
              </Field>
              <Field label="Visa Status" required>
                <select name="visaStatus" defaultValue="" required>
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
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`apply-field${full ? " full" : ""}`}>
      <span className="apply-label">
        {label}
        {required ? <span className="apply-req"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
