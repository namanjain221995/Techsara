"use client";

import { useEffect } from "react";

const MIN_DURATION_MS = 700;
const MAX_DURATION_MS = 8000;

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

    const waitForVideos = () =>
      Promise.all(
        Array.from(document.querySelectorAll<HTMLVideoElement>("video")).map(
          (video) =>
            new Promise<void>((resolve) => {
              if (video.readyState >= 3) {
                resolve();
                return;
              }
              const onReady = () => {
                video.removeEventListener("canplay", onReady);
                video.removeEventListener("loadeddata", onReady);
                video.removeEventListener("error", onReady);
                resolve();
              };
              video.addEventListener("canplay", onReady, { once: true });
              video.addEventListener("loadeddata", onReady, { once: true });
              video.addEventListener("error", onReady, { once: true });
            }),
        ),
      );

    const onLoad = () => {
      waitForVideos().then(finish);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    fallbackId = window.setTimeout(finish, MAX_DURATION_MS);

    return () => {
      window.removeEventListener("load", onLoad);
      if (fallbackId) window.clearTimeout(fallbackId);
    };
  }, []);

  return null;
}
