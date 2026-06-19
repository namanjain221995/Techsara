"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { APPLYABLE_STATUSES, type PublicJob } from "@/lib/jobs";
import ApplyModal from "./ApplyModal";

// Descriptions longer than this get clamped on the card with a "More details" link.
const LONG_DESC = 160;

const PAGE_SIZE = 10;
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

/** Count occurrences of a key across all jobs (for facet labels). Skips blanks. */
function countBy(jobs: PublicJob[], pick: (j: PublicJob) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const j of jobs) {
    const k = pick(j);
    if (!k) continue;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

type SortField = "postedDate" | "jobTitle";
type SortDir = "asc" | "desc";

export default function JobSearchClient({ jobs }: { jobs: PublicJob[] }) {
  const [keyword, setKeyword] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [employmentTypes, setEmploymentTypes] = useState<Set<string>>(new Set());
  const [priorities, setPriorities] = useState<Set<string>>(new Set());
  const [locations, setLocations] = useState<Set<string>>(new Set());
  const [modes, setModes] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("postedDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<PublicJob | null>(null);

  // Facet counts come from the full set (mirrors the Salesforce filter params).
  const employmentCounts = useMemo(() => countBy(jobs, (j) => j.employmentType), [jobs]);
  const priorityCounts = useMemo(() => countBy(jobs, (j) => j.priority), [jobs]);
  const locationCounts = useMemo(() => countBy(jobs, (j) => j.location), [jobs]);
  const modeCounts = useMemo(() => countBy(jobs, (j) => j.workMode), [jobs]);
  const statusCounts = useMemo(() => countBy(jobs, (j) => j.jobStatus), [jobs]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    const list = jobs.filter((job) => {
      if (employmentTypes.size && !employmentTypes.has(job.employmentType)) return false;
      if (priorities.size && !priorities.has(job.priority)) return false;
      if (locations.size && !locations.has(job.location)) return false;
      if (modes.size && !modes.has(job.workMode)) return false;
      if (statuses.size && !statuses.has(job.jobStatus)) return false;
      if (loc && !job.location.toLowerCase().includes(loc)) return false;
      if (kw) {
        const hay = [job.jobTitle, job.jobRequirementName, ...job.primarySkills]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "jobTitle") cmp = a.jobTitle.localeCompare(b.jobTitle);
      else cmp = a.postedDate.localeCompare(b.postedDate);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [jobs, keyword, locationQuery, employmentTypes, priorities, locations, modes, statuses, sortField, sortDir]);

  // Any filter/sort change returns to page 1.
  useEffect(() => {
    setPage(1);
  }, [keyword, locationQuery, employmentTypes, priorities, locations, modes, statuses, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageJobs = filtered.slice(start, start + PAGE_SIZE);

  const openCount = jobs.filter((j) => APPLYABLE_STATUSES.includes(j.jobStatus)).length;
  const locationCount = Object.keys(locationCounts).length;

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function clearAll() {
    setKeyword("");
    setLocationQuery("");
    setEmploymentTypes(new Set());
    setPriorities(new Set());
    setLocations(new Set());
    setModes(new Set());
    setStatuses(new Set());
  }

  const activeFilterCount =
    (keyword ? 1 : 0) + (locationQuery ? 1 : 0) +
    employmentTypes.size + priorities.size + locations.size + modes.size + statuses.size;
  const hasFilters = activeFilterCount > 0;

  const locationEntries = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);
  const visibleLocations = showAllLocations ? locationEntries : locationEntries.slice(0, 6);

  return (
    <main id="top" className="jobs-root">
      {/* HERO */}
      <section className="jobs-hero">
        <div className="jobs-hero-inner">
          <div className="hero-tag">
            <div className="hero-dot" />
            Open Positions — We&apos;re Hiring
          </div>
          <h1>Find Your Next Role at Techsara</h1>
          <p className="jobs-hero-sub">
            Explore our open roles and apply in minutes. Our recruiters review every
            application and reach out to you about the next steps.
          </p>

          {/* KEYWORD + LOCATION SEARCH */}
          <div className="jobs-searchbar">
            <div className="jobs-searchbar-field">
              <input
                type="search"
                placeholder="Keyword, title or skill"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="Search by keyword"
              />
            </div>
            <div className="jobs-searchbar-field">
              <input
                type="search"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                aria-label="Search by location"
              />
            </div>
          </div>

          <div className="jobs-hero-stats">
            <div className="jobs-stat">
              <span className="jobs-stat-num">{openCount}</span>
              <span className="jobs-stat-label">Open Now</span>
            </div>
            <div className="jobs-stat">
              <span className="jobs-stat-num">{jobs.length}</span>
              <span className="jobs-stat-label">Live Roles</span>
            </div>
            <div className="jobs-stat">
              <span className="jobs-stat-num">{locationCount}</span>
              <span className="jobs-stat-label">Locations</span>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS LAYOUT */}
      <section className="jobs-layout" id="positions">
        {/* MOBILE FILTER TOGGLE (hidden on desktop via CSS) */}
        <button
          type="button"
          className="jobs-filter-toggle"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <span>
            ⚙ Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </span>
          <span className="jobs-filter-toggle-caret">{filtersOpen ? "▲" : "▼"}</span>
        </button>

        {/* SIDEBAR FACETS */}
        <aside
          className={`jobs-sidebar${filtersOpen ? " open" : ""}`}
          aria-label="Filter jobs"
        >
          <div className="jobs-sidebar-head">
            <h2>Filters</h2>
            {hasFilters ? (
              <button type="button" className="jobs-clear" onClick={clearAll}>Clear all</button>
            ) : null}
          </div>

          <FacetGroup
            title="Status"
            entries={Object.entries(statusCounts).sort((a, b) => b[1] - a[1])}
            selected={statuses}
            onToggle={(v) => toggle(statuses, setStatuses, v)}
          />

          <FacetGroup
            title="Employment Type"
            entries={Object.entries(employmentCounts).sort((a, b) => b[1] - a[1])}
            selected={employmentTypes}
            onToggle={(v) => toggle(employmentTypes, setEmploymentTypes, v)}
          />

          <FacetGroup
            title="Work Mode"
            entries={Object.entries(modeCounts).sort((a, b) => b[1] - a[1])}
            selected={modes}
            onToggle={(v) => toggle(modes, setModes, v)}
          />

          <FacetGroup
            title="Priority"
            entries={Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])}
            selected={priorities}
            onToggle={(v) => toggle(priorities, setPriorities, v)}
          />

          {locationEntries.length > 0 ? (
          <div className="facet">
            <h3 className="facet-title">Location</h3>
            <ul className="facet-list">
              {visibleLocations.map(([value, count]) => (
                <li key={value}>
                  <label className="facet-item">
                    <input
                      type="checkbox"
                      checked={locations.has(value)}
                      onChange={() => toggle(locations, setLocations, value)}
                    />
                    <span className="facet-name">{value}</span>
                    <span className="facet-count">({count})</span>
                  </label>
                </li>
              ))}
            </ul>
            {locationEntries.length > 6 ? (
              <button
                type="button"
                className="facet-more"
                onClick={() => setShowAllLocations((s) => !s)}
              >
                {showAllLocations ? "Show less" : `See all ${locationEntries.length} locations`}
              </button>
            ) : null}
          </div>
          ) : null}
        </aside>

        {/* RESULTS */}
        <div className="jobs-results">
          <div className="jobs-results-bar">
            <p className="jobs-results-count">
              {jobs.length === 0
                ? "No open positions"
                : filtered.length === 0
                ? "No matching positions"
                : <>Showing <strong>{start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}</strong> of {filtered.length} positions</>}
            </p>
            <div className="jobs-sort">
              <label>
                Sort by
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                >
                  <option value="postedDate">Posting Date</option>
                  <option value="jobTitle">Job Title</option>
                </select>
              </label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as SortDir)}
                aria-label="Sort direction"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="jobs-empty">
              {jobs.length === 0 ? (
                <>
                  <div className="jobs-empty-icon" aria-hidden="true">📭</div>
                  <p className="jobs-empty-title">No open positions right now</p>
                  <p className="jobs-empty-text">
                    We don&apos;t have any roles posted at the moment. New openings are
                    added regularly — please check back soon.
                  </p>
                </>
              ) : (
                <>
                  <div className="jobs-empty-icon" aria-hidden="true">🔍</div>
                  <p className="jobs-empty-title">No positions match your filters</p>
                  <p className="jobs-empty-text">Try removing a filter or two to see more roles.</p>
                  <button type="button" className="jobs-empty-clear" onClick={clearAll}>
                    Clear all filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="jobs-grid">
              {pageJobs.map((job) => {
                const canApply = APPLYABLE_STATUSES.includes(job.jobStatus);
                return (
                  <article className="job-card" key={job.id}>
                    <div className="job-card-main">
                      <div className="job-card-tags">
                        <span className={`job-status status-${job.jobStatus.replace(/\s+/g, "-").toLowerCase()}`}>
                          {job.jobStatus || "—"}
                        </span>
                        {job.employmentType ? (
                          <span className="job-field-tag">{job.employmentType}</span>
                        ) : null}
                        {job.priority === "Urgent" || job.priority === "Critical" || job.priority === "High" ? (
                          <span className="job-priority">{job.priority} priority</span>
                        ) : null}
                      </div>
                      <div className="job-title-row">
                        <h3 className="job-title">{job.jobTitle}</h3>
                        {job.jobRequirementName ? (
                          <span className="job-badge job-badge-ref">{job.jobRequirementName}</span>
                        ) : null}
                      </div>
                      {job.jobDescription ? (
                        <>
                          <p className={`job-desc${job.jobDescription.length > LONG_DESC ? " clamp" : ""}`}>
                            {job.jobDescription}
                          </p>
                          {job.jobDescription.length > LONG_DESC ? (
                            <Link
                              href={`/jobsearch/${encodeURIComponent(job.jobRequirementName || job.id)}`}
                              className="job-more"
                            >
                              More details
                            </Link>
                          ) : null}
                        </>
                      ) : null}
                      {job.primarySkills.length ? (
                        <div className="job-skills">
                          {job.primarySkills.map((s) => (
                            <span className="job-skill" key={s}>{s}</span>
                          ))}
                        </div>
                      ) : null}
                      <div className="job-meta">
                        {job.location ? <span className="job-badge">{job.location}</span> : null}
                        {job.workMode ? <span className="job-badge">{job.workMode}</span> : null}
                        {job.duration ? <span className="job-badge">{job.duration}</span> : null}
                        {job.numberOfOpenings > 0 ? (
                          <span className="job-badge">
                            {job.numberOfOpenings} opening{job.numberOfOpenings > 1 ? "s" : ""}
                          </span>
                        ) : null}
                        {job.requiredVisaStatus.length ? (
                          <span className="job-badge">{job.requiredVisaStatus.join(", ")}</span>
                        ) : null}
                        {job.clientName ? <span className="job-badge">{job.clientName}</span> : null}
                        {job.postedDate ? <span className="job-badge">Posted {formatDate(job.postedDate)}</span> : null}
                        {job.submissionDeadline ? (
                          <span className="job-badge">Apply by {formatDate(job.submissionDeadline)}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="job-card-action">
                      <button
                        type="button"
                        className="job-apply-btn"
                        disabled={!canApply}
                        onClick={() => setActiveJob(job)}
                      >
                        {canApply ? "Apply Now" : "Not accepting"}
                      </button>
                      {canApply ? (
                        <span className="job-apply-note">Takes ~2 min</span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 ? (
            <nav className="jobs-pagination" aria-label="Pagination">
              <button
                type="button"
                className="page-btn"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                ← Previous
              </button>
              <div className="page-nums">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`page-num${n === safePage ? " active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="page-btn"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Next →
              </button>
            </nav>
          ) : null}
        </div>
      </section>

      {activeJob ? (
        <ApplyModal job={activeJob} onClose={() => setActiveJob(null)} />
      ) : null}
    </main>
  );
}

function FacetGroup({
  title,
  entries,
  selected,
  onToggle,
}: {
  title: string;
  entries: [string, number][];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="facet">
      <h3 className="facet-title">{title}</h3>
      <ul className="facet-list">
        {entries.map(([value, count]) => (
          <li key={value}>
            <label className="facet-item">
              <input
                type="checkbox"
                checked={selected.has(value)}
                onChange={() => onToggle(value)}
              />
              <span className="facet-name">{value}</span>
              <span className="facet-count">({count})</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
