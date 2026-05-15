"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
};

type TopicOption = { value: string; label: string };

const TOPIC_OPTIONS: TopicOption[] = [
  { value: "it-staffing", label: "IT and Staffing" },
  { value: "Healthcare and Recruitment", label: "Healthcare and Recruitment" },
  { value: "Non-IT Staffing and Recruitment", label: "Non-IT Staffing and Recruitment" },
  { value: "Recruitment Process Outsourcing", label: "Recruitment Process Outsourcing" },
  { value: "IT Consulting and IT Solutions", label: "IT Consulting and IT Solutions" },
  { value: "IT Development Support", label: "IT Development Support" },
  { value: "Additional Recruitment Services", label: "Additional Recruitment Services" },
  { value: "other", label: "Other" },
];

// Same-origin proxy → Next.js route → AWS API (avoids CORS)
const CONTACT_ENDPOINT = "/api/contact-message";
const AUTO_POPUP_SESSION_KEY = "techsara:autoContactShown";

export default function ContactModal({ isOpen, onClose, defaultTopic = "" }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [topic, setTopic] = useState(defaultTopic);
  const [topicOpen, setTopicOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (topicOpen) setTopicOpen(false);
        else onClose();
      }
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
  }, [isOpen, onClose, topicOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setSubmitting(false);
      setErrorMessage(null);
      setTopicOpen(false);
      setTopic(defaultTopic);
    }
  }, [isOpen, defaultTopic]);

  useEffect(() => {
    if (!topicOpen) return;
    const position = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };
    position();
    const handleClickOutside = (event: MouseEvent) => {
      const wrap = wrapRef.current;
      if (wrap && !wrap.contains(event.target as Node)) {
        setTopicOpen(false);
      }
    };
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("resize", position);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [topicOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
    setErrorMessage(null);

    const payload = {
      firstName: raw.firstName || "",
      lastName: raw.lastName || "",
      email: raw.email || "",
      company: raw.company || "",
      phoneNumber: raw.phone || "",
      discussionTopic: raw.topic || "",
      notes: raw.message || "",
    };

    setSubmitting(true);
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let isValidation = res.status === 422;
        try {
          const body = await res.json();
          if (body && body.error === "VALIDATION_ERROR") isValidation = true;
        } catch {
          /* response body wasn't JSON — fall back to status check */
        }
        throw new Error(
          isValidation
            ? "Please fill out the full form before submitting."
            : "Something went wrong. Please try again.",
        );
      }
      // Successful submit → suppress the auto-contact popup for the rest of the session
      try {
        window.sessionStorage.setItem(AUTO_POPUP_SESSION_KEY, "1");
      } catch {
        /* sessionStorage may be unavailable in some private modes */
      }
      // Notify AutoContactPopup so it shows an "already sent" toast on subsequent triggers
      window.dispatchEvent(new CustomEvent("techsara:userEngaged"));
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedLabel =
    TOPIC_OPTIONS.find((opt) => opt.value === topic)?.label || "Select a topic";
  const isPlaceholder = !topic;

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

        {!submitted ? (
          <>
            <header className="contact-modal-head">
              <h2 id="contact-modal-title">Let&apos;s start a conversation</h2>
              <p>
                Tell us a bit about your initiative and a Techsara lead will respond within one
                business day.
              </p>
            </header>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <label className="contact-form-field">
                  <span>First name</span>
                  <input type="text" name="firstName" required autoComplete="given-name" />
                </label>
                <label className="contact-form-field">
                  <span>Last name</span>
                  <input type="text" name="lastName" required autoComplete="family-name" />
                </label>
              </div>

              <div className="contact-form-row">
                <label className="contact-form-field">
                  <span>Work email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                </label>
                <label className="contact-form-field">
                  <span>Company</span>
                  <input type="text" name="company" required autoComplete="organization" />
                </label>
              </div>

              <label className="contact-form-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </label>

              <label className="contact-form-field">
                <span>What would you like to discuss?</span>
                <div
                  ref={wrapRef}
                  className={`custom-select${topicOpen ? " is-open" : ""}`}
                >
                  <button
                    ref={triggerRef}
                    type="button"
                    className="custom-select__trigger"
                    aria-haspopup="listbox"
                    aria-expanded={topicOpen}
                    onClick={() => setTopicOpen((v) => !v)}
                  >
                    <span
                      className={`custom-select__value${isPlaceholder ? " is-placeholder" : ""}`}
                    >
                      {selectedLabel}
                    </span>
                    <svg
                      className="custom-select__chevron"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <select
                    name="topic"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="custom-select__native"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    {TOPIC_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {topicOpen && (
                    <div
                      className="custom-select__panel is-open"
                      role="listbox"
                      style={panelStyle}
                      data-lenis-prevent="true"
                    >
                      {TOPIC_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={topic === opt.value}
                          className={`custom-select__option${
                            topic === opt.value ? " is-selected" : ""
                          }`}
                          onClick={() => {
                            setTopic(opt.value);
                            setTopicOpen(false);
                            triggerRef.current?.focus();
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              <label className="contact-form-field">
                <span>
                  Anything we should know?{" "}
                  
                </span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="A sentence or two about the problem, current stack, or timeline."
                />
              </label>

              {errorMessage ? (
                <p className="contact-form-error" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <div className="contact-form-actions">
                <button
                  type="button"
                  className="contact-form-cancel"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="contact-form-submit"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Send message"}
                  {submitting ? null : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="contact-success">
            <span className="contact-success-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2>Thanks - we&apos;ll be in touch.</h2>
            <p>
              We&apos;ve received your message. A Techsara lead will reach out to your work email
              within one business day.
            </p>
            <button type="button" className="contact-form-submit" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
