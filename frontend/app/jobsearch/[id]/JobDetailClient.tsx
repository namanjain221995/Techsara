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
  if (!iso) return "-";
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

export default function JobDetailClient({
  job,
  recommended = [],
}: {
  job: PublicJob;
  recommended?: PublicJob[];
}) {
  const [applyOpen, setApplyOpen] = useState(false);
  const hasRec = recommended.length > 0;
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

        <div className={`jdp-grid${hasRec ? "" : " jdp-grid-solo"}`}>
          {/* MAIN */}
          <div className="jdp-main">
            <div className="jdp-badges">
              <span className={`job-status status-${job.jobStatus.replace(/\s+/g, "-").toLowerCase()}`}>
                {job.jobStatus || "-"}
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

            {/* Spec-sheet info card (Label / Value) */}
            <dl className="jdp-info">
              {job.jobRequirementName ? (
                <div><dt>Requisition ID</dt><dd>{job.jobRequirementName}</dd></div>
              ) : null}
              {job.location ? <div><dt>Location</dt><dd>{job.location}</dd></div> : null}
              {job.workMode ? <div><dt>Work Mode</dt><dd>{job.workMode}</dd></div> : null}
              {job.employmentType ? <div><dt>Employment Type</dt><dd>{job.employmentType}</dd></div> : null}
              {job.numberOfOpenings > 0 ? (
                <div><dt>Number of Openings</dt><dd>{job.numberOfOpenings}</dd></div>
              ) : null}
              {job.duration ? <div><dt>Duration</dt><dd>{job.duration}</dd></div> : null}
              {job.clientName ? <div><dt>Client</dt><dd>{job.clientName}</dd></div> : null}
              {job.postedDate ? <div><dt>Posting Date</dt><dd>{formatDate(job.postedDate)}</dd></div> : null}
              {job.submissionDeadline ? (
                <div><dt>Apply By</dt><dd>{formatDate(job.submissionDeadline)}</dd></div>
              ) : null}
              {job.requiredVisaStatus.length ? (
                <div><dt>Required Visa Status</dt><dd>{job.requiredVisaStatus.join(", ")}</dd></div>
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

          {/* SIDEBAR (right) - skill-matched recommendations (only when present) */}
          {hasRec ? (
            <aside className="jdp-side">
              <section className="jdp-rec">
                <h3 className="jdp-rec-title">Recommended roles</h3>
                <p className="jdp-rec-sub">Based on matching skills.</p>
                <div className="jdp-rec-list">
                  {recommended.map((r) => (
                    <Link
                      key={r.id}
                      href={`/jobsearch/${encodeURIComponent(r.jobRequirementName || r.id)}`}
                      className="jdp-rec-card"
                    >
                      <div className="jdp-rec-tags">
                        <span className={`job-status status-${r.jobStatus.replace(/\s+/g, "-").toLowerCase()}`}>
                          {r.jobStatus || "-"}
                        </span>
                        {r.employmentType ? <span className="job-field-tag">{r.employmentType}</span> : null}
                      </div>
                      <h4 className="jdp-rec-jobtitle">{r.jobTitle}</h4>
                      <p className="jdp-rec-meta">
                        {[r.location, r.workMode].filter(Boolean).join(" · ")}
                      </p>
                      {r.primarySkills.length ? (
                        <div className="job-skills">
                          {r.primarySkills.slice(0, 3).map((s) => (
                            <span className="job-skill" key={s}>{s}</span>
                          ))}
                          {r.primarySkills.length > 3 ? (
                            <span className="job-skill job-skill-more">+{r.primarySkills.length - 3}</span>
                          ) : null}
                        </div>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          ) : null}
        </div>
      </div>

      {applyOpen ? <ApplyModal job={job} onClose={() => setApplyOpen(false)} /> : null}
    </main>
  );
}
