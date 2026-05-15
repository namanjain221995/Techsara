"use client";

import { useEffect } from "react";

export default function CareersInteractivity() {
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>(".careers-root .reveal");
    if (!reveals.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -50px 0px" },
    );
    reveals.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
