"use client";

import { useEffect } from "react";

const SESSION_KEY = "techsara:splashShown";
const MIN_DURATION_MS = 600;
const MAX_DURATION_MS = 5000;

export default function AppLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.sessionStorage.getItem(SESSION_KEY)) {
      document.documentElement.classList.add("splash-done");
      return;
    }

    const start = performance.now();
    let fallbackId: number | undefined;

    const finish = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_DURATION_MS - elapsed);
      window.setTimeout(() => {
        document.documentElement.classList.add("splash-done");
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
      }, wait);
      if (fallbackId) window.clearTimeout(fallbackId);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      fallbackId = window.setTimeout(finish, MAX_DURATION_MS);
    }

    return () => {
      window.removeEventListener("load", finish);
      if (fallbackId) window.clearTimeout(fallbackId);
    };
  }, []);

  return null;
}
