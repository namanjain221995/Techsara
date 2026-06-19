"use client";

import { useState } from "react";
import Link from "next/link";
import { APPLYABLE_STATUSES, type PublicJob } from "@/lib/jobs";
import ApplyModal from "../ApplyModal";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const mi = Number(m) - 1;
  if (!y || mi < 0 || mi > 11 || !d) return iso;
  return `${MONTHS[mi]} ${Number(d)}, ${y}`;
}

type Block =
  | { type: "subhead"; text: string }
  | { type: "para"; text: string }
  | { type: "list"; items: string[] };

/** Free-text Salesforce description → clean paragraphs / sub-headings / bullet lists. */
function parseDescription(text: string): Block[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const blocks: Block[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) { blocks.push({ type: "list", items: list }); list = []; }
  };
  for (const line of lines) {
    if (/^[•\-*]\s*/.test(line)) {
      list.push(line.replace(/^[•\-*]\s*/, "").replace(/\.{2,}$/, "."));
    } else if (line.endsWith(":") && line.length <= 60) {
      flush();
      blocks.push({ type: "subhead", text: line });
    } else {
      flush();
      blocks.push({ type: "para", text: line });
    }
  }
  flush();
  return blocks;
}

export default function JobDetailClient({ job }: { job: PublicJob }) {
  const [applyOpen, setApplyOpen] = useState(false);
  const canApply = APPLYABLE_STATUSES.includes(job.jobStatus);
  const showPriority =
    job.priority === "Urgent" || job.priority === "Critical" || job.priority === "High";
  const blocks = parseDescription((job.jobDescription || "").trim());

  const ApplyButton = (
    <button
      type="button"
      className="job-apply-btn"
      disabled={!canApply}
      onClick={() => setApplyOpen(true)}
    >
      {canApply ? "Apply Now" : "Not accepting applications"}
    </button>
  );

  return (
    <main className="jobs-root jobdetail-root">
      <div className="jdp-wrap">
        <Link href="/jobsearch" className="jdp-back">← Back to all roles</Link>

        <div className="jdp-grid">
          {/* MAIN */}
          <div className="jdp-main">
            <div className="jdp-badges">
              <span className={`job-status status-${job.jobStatus.replace(/\s+/g, "-").toLowerCase()}`}>
                {job.jobStatus || "—"}
              </span>
              {job.employmentType ? <span className="job-field-tag">{job.employmentType}</span> : null}
              {showPriority ? <span className="job-priority">{job.priority} priority</span> : null}
            </div>

            <h1 className="jdp-title">{job.jobTitle}</h1>

            {/* top apply */}
            <div className="jdp-apply jdp-apply-top">
              {ApplyButton}
              {canApply ? <span className="jdp-apply-note">Takes ~2 min</span> : null}
            </div>

            {/* Label: Value info */}
            <dl className="jdp-info">
              {job.jobRequirementName ? (
                <div><dt>Requisition ID:</dt><dd>{job.jobRequirementName}</dd></div>
              ) : null}
              {job.location ? <div><dt>Location:</dt><dd>{job.location}</dd></div> : null}
              {job.workMode ? <div><dt>Work Mode:</dt><dd>{job.workMode}</dd></div> : null}
              {job.employmentType ? <div><dt>Employment Type:</dt><dd>{job.employmentType}</dd></div> : null}
              {job.numberOfOpenings > 0 ? (
                <div><dt>Number of Openings:</dt><dd>{job.numberOfOpenings}</dd></div>
              ) : null}
              {job.duration ? <div><dt>Duration:</dt><dd>{job.duration}</dd></div> : null}
              {job.clientName ? <div><dt>Client:</dt><dd>{job.clientName}</dd></div> : null}
              {job.postedDate ? <div><dt>Posting Date:</dt><dd>{formatDate(job.postedDate)}</dd></div> : null}
              {job.submissionDeadline ? (
                <div><dt>Apply By:</dt><dd>{formatDate(job.submissionDeadline)}</dd></div>
              ) : null}
              {job.requiredVisaStatus.length ? (
                <div><dt>Required Visa Status:</dt><dd>{job.requiredVisaStatus.join(", ")}</dd></div>
              ) : null}
            </dl>

            {/* description */}
            {blocks.length ? (
              <>
                <h2 className="jdp-dh">Job Description</h2>
                <div className="jdp-desc">
                  {blocks.map((b, i) => {
                    if (b.type === "subhead") return <h3 key={i} className="jdp-subhead">{b.text}</h3>;
                    if (b.type === "list") {
                      return (
                        <ul key={i} className="jdp-list">
                          {b.items.map((it, j) => <li key={j}>{it}</li>)}
                        </ul>
                      );
                    }
                    return <p key={i} className="jdp-para">{b.text}</p>;
                  })}
                </div>
              </>
            ) : null}

            {/* skills */}
            {job.primarySkills.length ? (
              <>
                <h2 className="jdp-dh">Primary Skills</h2>
                <div className="job-skills">
                  {job.primarySkills.map((s) => (
                    <span className="job-skill" key={s}>{s}</span>
                  ))}
                </div>
              </>
            ) : null}

            {/* bottom apply */}
            <div className="jdp-apply jdp-apply-bottom">{ApplyButton}</div>
          </div>

          {/* SIDEBAR */}
          <aside className="jdp-side">
            <div className="jdp-promo">
              <h3>Life at Techsara</h3>
              <p>
                See what it&apos;s like to work, grow, and build your career with
                people genuinely invested in your success.
              </p>
              <Link href="/life-at-techsara" className="jdp-promo-link">
                Explore Life at Techsara ›
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {applyOpen ? <ApplyModal job={job} onClose={() => setApplyOpen(false)} /> : null}
    </main>
  );
}
