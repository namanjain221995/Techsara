"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Marks the current section in the primary nav with `aria-current="page"`,
 * which styles.css renders as a tinted pill.
 *
 * The nav markup exists in fifteen places - five React components and ten legacy
 * HTML files rendered through dangerouslySetInnerHTML - so this works on the DOM
 * after render rather than in any one of them. That keeps the behaviour in a
 * single file and covers the legacy pages, which have no React nav to edit.
 *
 * `aria-current` is not a prop React manages on those elements, so re-renders
 * leave it alone; the effect re-runs on every route change regardless.
 */

// Nav items whose URL is the prefix of their whole section, e.g. /services/ai-agents.
const NAV_SECTIONS = ["/services", "/solutions", "/articles", "/careers", "/about"];

// Pages that belong to a nav item without sharing its URL prefix.
const SECTION_ALIASES: Record<string, string> = {
  "/life-at-techsara": "/careers",
  "/jobsearch": "/careers",
};

// Top-level items only. The dropdown panels hold their own links, and marking
// one of those would highlight two things at once.
const TOP_LEVEL = ".nav-links > a, .nav-links > .nav-item-dropdown > a";

function sectionFor(pathname: string): string | null {
  const inSection = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  for (const [route, section] of Object.entries(SECTION_ALIASES)) {
    if (inSection(route)) return section;
  }
  return NAV_SECTIONS.find(inSection) ?? null;
}

export default function ActiveNavHighlight() {
  const pathname = usePathname();

  useEffect(() => {
    const section = sectionFor(pathname || "/");
    document.querySelectorAll<HTMLAnchorElement>(TOP_LEVEL).forEach((link) => {
      // Compare the attribute, not link.href - the latter is absolute.
      if (section && link.getAttribute("href") === section) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }, [pathname]);

  return null;
}
