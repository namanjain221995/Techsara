"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Re-runs a legacy script's renderer after a client-side navigation.
 *
 * The scripts under /public/legacy are IIFEs: they execute once, when the file
 * loads. That was fine for full page loads, but the App Router keeps a script it
 * has already fetched and does not execute it again on a soft navigation - while
 * it *does* re-create the empty container the script was supposed to fill.
 *
 * The visible result was a page with a header and footer and nothing in between,
 * hit by moving between service pages faster than a full reload. It affects any
 * page whose content is built by JS rather than shipped in the HTML: the service
 * detail pages (#service-root) and the booking calendar.
 *
 * Each script now registers its renderer on window.__techsaraLegacy; this calls
 * the matching one after every route change. Re-rendering is safe - both replace
 * their container's contents, so old nodes and their listeners are discarded.
 */

declare global {
  interface Window {
    __techsaraLegacy?: Record<string, undefined | (() => void)>;
  }
}

export default function LegacyRerun({ name }: { name: "service" | "book" }) {
  const pathname = usePathname();

  useEffect(() => {
    // On a first load the script runs itself and may not have registered yet;
    // there is nothing to do then, and nothing to wait for.
    const run = window.__techsaraLegacy?.[name];
    if (typeof run !== "function") return;

    // After paint, so the new page's container exists in the DOM.
    const id = requestAnimationFrame(() => {
      try {
        run();
      } catch {
        /* a broken legacy render must not take the React tree down with it */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, name]);

  return null;
}
