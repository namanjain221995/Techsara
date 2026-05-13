"use client";

import { useEffect } from "react";

export default function LegacyReinit() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".nav");
    let onScroll: (() => void) | null = null;
    const observers: IntersectionObserver[] = [];

    if (nav) {
      requestAnimationFrame(() => nav.classList.add("is-ready"));

      const darkHero = document.querySelector<HTMLElement>(".hero--dark");
      const onScrollNav = () => {
        const y = window.scrollY || document.documentElement.scrollTop;
        nav.classList.toggle("is-scrolled", y > 20);
        if (darkHero) {
          const heroBottom = darkHero.getBoundingClientRect().bottom;
          if (heroBottom > 60) {
            nav.classList.add("over-dark");
            nav.classList.remove("is-scrolled");
          } else {
            nav.classList.remove("over-dark");
          }
        }
      };
      window.addEventListener("scroll", onScrollNav, { passive: true });
      onScrollNav();
      onScroll = onScrollNav;
    }

    const counters = document.querySelectorAll<HTMLElement>("[data-countup]");
    if (counters.length) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            const target = parseFloat(el.dataset.countup || "0");
            const suffix = el.dataset.suffix || "";
            const prefix = el.dataset.prefix || "";
            const dur = 1700;
            const start = performance.now();
            const isInt = Number.isInteger(target);
            const animate = (now: number) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              const v = target * eased;
              el.textContent =
                prefix +
                (isInt ? Math.round(v).toLocaleString() : v.toFixed(1)) +
                suffix;
              if (t < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            cio.unobserve(el);
          });
        },
        { threshold: 0.4 },
      );
      counters.forEach((c) => cio.observe(c));
      observers.push(cio);
    }

    return () => {
      if (onScroll) window.removeEventListener("scroll", onScroll);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return null;
}
