"use client";

import { useEffect } from "react";

const MIN_DURATION_MS = 350;
const MAX_DURATION_MS = 2500;

export default function AppLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const start = performance.now();
    let fallbackId: number | undefined;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_DURATION_MS - elapsed);
      window.setTimeout(() => {
        document.documentElement.classList.add("splash-done");
      }, wait);
      if (fallbackId) window.clearTimeout(fallbackId);
    };

    // Hide the splash as soon as the document is interactive — do NOT wait
    // for the hero video to buffer. The video has its own poster background
    // and will fade in when ready. Waiting for canplay on a 4MB video over
    // a slow connection blocks first paint for many seconds.
    if (document.readyState === "interactive" || document.readyState === "complete") {
      // Defer to the next frame so the first paint includes hero text.
      requestAnimationFrame(() => requestAnimationFrame(finish));
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        () => requestAnimationFrame(() => requestAnimationFrame(finish)),
        { once: true },
      );
    }

    fallbackId = window.setTimeout(finish, MAX_DURATION_MS);

    return () => {
      if (fallbackId) window.clearTimeout(fallbackId);
    };
  }, []);

  return null;
}
