"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const spectrumSolutions = [
  {
    id: "talent",
    title: "Talent Solutions",
    description:
      "Save time finding the right resource for your team while we connect you with the best talent in the marketplace.",
    href: "/services/talent",
    image: "/uploads/hero_talentsolution.jpg",
  },
  {
    id: "team",
    title: "Team Solutions",
    description:
      "Take charge of your most valued initiatives while we provide a dedicated team offering technical expertise and services.",
    href: "/services/team",
    image: "/uploads/hero_teamsolutions.jpg",
  },
  {
    id: "project",
    title: "Project Solutions",
    description:
      "Transform your business while we help you connect strategy to execution to tackle your most challenging initiatives.",
    href: "/services/project",
    image: "/uploads/hero_projectsolution.jpg",
  },
  {
    id: "international",
    title: "International Talent Solutions",
    description:
      "Connect with the specialized onshore talent you need while we provide risk mitigation, immigration strategy and visa sponsorship.",
    href: "/services/international",
    image: "/uploads/international_Talent_Solutions.jpg",
  },
];

const ARC_VIEW_W = 480;
const ARC_VIEW_H = 600;
const ARC_CX = 20;
const ARC_CY = 300;
const ARC_R = 250;

function arcPoint(t: number) {
  const theta = t * Math.PI;
  return {
    x: ARC_CX + ARC_R * Math.sin(theta),
    y: ARC_CY - ARC_R * Math.cos(theta),
  };
}

function arcSegmentPath(tStart: number, tEnd: number) {
  const p1 = arcPoint(tStart);
  const p2 = arcPoint(tEnd);
  return `M ${p1.x} ${p1.y} A ${ARC_R} ${ARC_R} 0 0 1 ${p2.x} ${p2.y}`;
}

export default function SpectrumOfSolutions() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = spectrumSolutions[activeIndex];
  const segmentCount = spectrumSolutions.length;

  // Warm the browser image cache once the component mounts so hovering between
  // labels doesn't trigger a fresh network round-trip each time.
  useEffect(() => {
    spectrumSolutions.forEach((sol) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = sol.image;
    });
  }, []);

  return (
    <section className="spectrum-section" id="spectrum-of-solutions">
      <div className="container">
        <div className="spectrum-inner">
          <div className="spectrum-arc-wrap">
            <svg
              className="spectrum-arc"
              viewBox={`0 0 ${ARC_VIEW_W} ${ARC_VIEW_H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {spectrumSolutions.map((_, i) => {
                const tStart = i / segmentCount;
                const tEnd = (i + 1) / segmentCount;
                const isActive = i === activeIndex;
                return (
                  <path
                    key={i}
                    d={arcSegmentPath(tStart, tEnd)}
                    className={`spectrum-arc-segment${isActive ? " is-active" : ""}`}
                  />
                );
              })}
            </svg>

            <div className="spectrum-center-text" aria-hidden="true">
              <span>SPECTRUM OF</span>
              <span>SOLUTIONS</span>
            </div>

            <div className="spectrum-labels">
              {spectrumSolutions.map((sol, i) => {
                const t = (i + 0.5) / segmentCount;
                const pos = arcPoint(t);
                const xPct = (pos.x / ARC_VIEW_W) * 100;
                const yPct = (pos.y / ARC_VIEW_H) * 100;
                const isActive = i === activeIndex;
                return (
                  <button
                    key={sol.id}
                    type="button"
                    className={`spectrum-label${isActive ? " is-active" : ""}`}
                    style={{ top: `${yPct}%`, left: `${xPct}%` }}
                    onMouseEnter={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Show ${sol.title}`}
                    aria-pressed={isActive}
                  >
                    <span className="spectrum-label-text">{sol.title}</span>
                    <span className="spectrum-label-arrow" aria-hidden="true">
                      »
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="spectrum-display">
            <div className="spectrum-image-frame">
              {/* Render all images, toggle opacity — keeps GPU work, avoids
                  remount + redownload on every hover. */}
              {spectrumSolutions.map((sol, i) => (
                <img
                  key={sol.id}
                  className={`spectrum-image${i === activeIndex ? " is-active" : ""}`}
                  src={sol.image}
                  alt=""
                  aria-hidden="true"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "low"}
                />
              ))}
            </div>

            <article className="spectrum-card" key={`card-${active.id}`}>
              <h3>{active.title}</h3>
              <p>{active.description}</p>
              <Link href={active.href} className="spectrum-link">
                Learn More
                <svg
                  width="22"
                  height="10"
                  viewBox="0 0 22 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 5h18M14 1l5 4-5 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
