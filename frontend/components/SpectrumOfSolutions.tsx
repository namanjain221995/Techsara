"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const spectrumSolutions = [
  {
    id: "talent",
    title: "Talent Solutions",
    description:
      "Save time finding the right resource for your team while we connect you with the best talent in the marketplace.",
    href: "/solutions/talent",
    image: "/uploads/talent-solution-hero.png",
  },
  {
    id: "team",
    title: "Team Solutions",
    description:
      "Take charge of your most valued initiatives while we provide a dedicated team offering technical expertise and services.",
    href: "/solutions/team",
    image: "/uploads/hero_teamsolutions.webp",
  },
  {
    id: "project",
    title: "Project Solutions",
    description:
      "Transform your business while we help you connect strategy to execution to tackle your most challenging initiatives.",
    href: "/solutions/project",
    image: "/uploads/hero_projectsolution.webp",
  },
  {
    id: "international",
    title: "International Talent Solutions",
    description:
      "Connect with the specialized onshore talent you need while we provide risk mitigation, immigration strategy and visa sponsorship.",
    href: "/solutions/international",
    image: "/uploads/international_Talent_Solutions.webp",
  },
];

export default function SpectrumOfSolutions() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    spectrumSolutions.forEach((sol) => {
      const img = new Image();
      img.decoding = "async";
      img.src = sol.image;
    });
  }, []);

  return (
    <section className="spectrum-section" id="spectrum-of-solutions">
      <div className="container">
        <div className="spectrum-header">
          <p className="spectrum-kicker">SPECTRUM OF SOLUTIONS</p>
        </div>

        <div className="spectrum-deck" data-active={String(activeIndex + 1)}>
          {spectrumSolutions.map((sol, i) => (
            <article
              key={sol.id}
              className={`spectrum-card${i === activeIndex ? " active" : ""}`}
              tabIndex={0}
              aria-expanded={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => setActiveIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveIndex(i);
                }
              }}
              style={{ backgroundImage: `url(${sol.image})` }}
            >
              <div className="spectrum-card-inner">
                <div className="spectrum-card-copy">
                  <h3>{sol.title}</h3>
                  <p>{sol.description}</p>
                  <Link
                    href={sol.href}
                    className="spectrum-learn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Learn More</span>
                    <span className="spectrum-arrow" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
