"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ContactModal from "@/components/ContactModal";

const DELAY_MS = 30_000;
const SESSION_KEY = "techsara:autoContactShown";
const START_KEY = "techsara:sessionStart";
const EXCLUDED_PATHS = ["/book"];
const TOAST_MESSAGE =
  "You've already sent us a message — a Techsara lead will be in touch within one business day.";
const TOAST_DURATION_MS = 4000;

export default function AutoContactPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const pathname = usePathname();

  // Refs mirror state so setTimeout / event listeners always read the latest value
  // without re-binding the listeners every render.
  const isOpenRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { hasSubmittedRef.current = hasSubmitted; }, [hasSubmitted]);

  function showToast() {
    setToastVisible(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, TOAST_DURATION_MS);
  }

  // Auto-popup timer (cumulative across pages, never re-opens once shown or after engagement)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasSubmitted) return;
    if (window.sessionStorage.getItem(SESSION_KEY)) return;

    let startTime = Number(window.sessionStorage.getItem(START_KEY)) || 0;
    if (!startTime) {
      startTime = Date.now();
      window.sessionStorage.setItem(START_KEY, String(startTime));
    }

    if (pathname && EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    const elapsed = Date.now() - startTime;
    const remaining = DELAY_MS - elapsed;

    const fire = () => {
      // Latest state via refs — modal may have been opened manually since the timer was set
      if (hasSubmittedRef.current) return;
      try { window.sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      if (isOpenRef.current) return; // already open from a manual click — don't fight with it
      setIsOpen(true);
    };

    if (remaining <= 0) {
      fire();
      return;
    }

    const timer = window.setTimeout(fire, remaining);
    return () => window.clearTimeout(timer);
  }, [pathname, hasSubmitted]);

  // Event listeners — programmatic open, click delegation, and "user engaged" signal
  useEffect(() => {
    if (typeof window === "undefined") return;

    const openHandler = () => {
      if (hasSubmittedRef.current) { showToast(); return; }
      if (isOpenRef.current) return; // already open, nothing to do
      setIsOpen(true);
    };
    const engagedHandler = () => setHasSubmitted(true);

    const clickHandler = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest('[data-action="open-contact"]');
      if (!trigger) return;
      event.preventDefault();
      if (hasSubmittedRef.current) { showToast(); return; }
      if (isOpenRef.current) return;
      setIsOpen(true);
    };

    window.addEventListener("techsara:openContact", openHandler);
    window.addEventListener("techsara:userEngaged", engagedHandler);
    document.addEventListener("click", clickHandler);

    return () => {
      window.removeEventListener("techsara:openContact", openHandler);
      window.removeEventListener("techsara:userEngaged", engagedHandler);
      document.removeEventListener("click", clickHandler);
    };
  }, []);

  return (
    <>
      <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {toastVisible ? (
        <div className="contact-toast" role="status" aria-live="polite">
          <span className="contact-toast-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="contact-toast-text">{TOAST_MESSAGE}</span>
        </div>
      ) : null}
    </>
  );
}
