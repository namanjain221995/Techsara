"use client";

import { useEffect } from "react";
import ContactForm from "@/components/ContactForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
};

export default function ContactModal({ isOpen, onClose, defaultTopic = "" }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Pause Lenis smooth-scroll while the modal is open so the page behind doesn't scroll
    const lenis = (window as unknown as { __techsaraLenis?: { stop: () => void; start: () => void } }).__techsaraLenis;
    lenis?.stop();

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      lenis?.start();
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose} role="presentation" data-lenis-prevent="true">
      <div
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="contact-modal-close"
          onClick={onClose}
          aria-label="Close contact form"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <header className="contact-modal-head">
          <h2 id="contact-modal-title">Let&apos;s start a conversation</h2>
          <p>
            Tell us a bit about your initiative and a Techsara lead will respond within one
            business day.
          </p>
        </header>

        <ContactForm variant="modal" defaultTopic={defaultTopic} onClose={onClose} />
      </div>
    </div>
  );
}
