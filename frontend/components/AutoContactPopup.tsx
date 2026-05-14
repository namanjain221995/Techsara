"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ContactModal from "@/components/ContactModal";

const DELAY_MS = 30_000;
const SESSION_KEY = "techsara:autoContactShown";
const START_KEY = "techsara:sessionStart";
const EXCLUDED_PATHS = ["/book"];

export default function AutoContactPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY)) return;

    // Anchor the cumulative session clock on the very first page the visitor lands on
    // (even excluded pages count toward total elapsed time).
    let startTime = Number(window.sessionStorage.getItem(START_KEY)) || 0;
    if (!startTime) {
      startTime = Date.now();
      window.sessionStorage.setItem(START_KEY, String(startTime));
    }

    // Never open the popup while the visitor is on an excluded page (e.g. /book).
    if (pathname && EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    const elapsed = Date.now() - startTime;
    const remaining = DELAY_MS - elapsed;

    if (remaining <= 0) {
      // Cumulative threshold already passed on a prior page — open immediately.
      setIsOpen(true);
      window.sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openHandler = () => setIsOpen(true);
    window.addEventListener("techsara:openContact", openHandler);

    const clickHandler = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest('[data-action="open-contact"]');
      if (!trigger) return;
      event.preventDefault();
      setIsOpen(true);
    };
    document.addEventListener("click", clickHandler);

    return () => {
      window.removeEventListener("techsara:openContact", openHandler);
      document.removeEventListener("click", clickHandler);
    };
  }, []);

  return <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
