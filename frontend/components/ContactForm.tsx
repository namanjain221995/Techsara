"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// useLayoutEffect warns during SSR; the positioning it does is client-only.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type TopicOption = { value: string; label: string };

export const TOPIC_OPTIONS: TopicOption[] = [
  { value: "it-staffing", label: "IT and Staffing" },
  { value: "Healthcare and Recruitment", label: "Healthcare and Recruitment" },
  { value: "Non-IT Staffing and Recruitment", label: "Non-IT Staffing and Recruitment" },
  { value: "Recruitment Process Outsourcing", label: "Recruitment Process Outsourcing" },
  { value: "IT Consulting and IT Solutions", label: "IT Consulting and IT Solutions" },
  { value: "IT Development Support", label: "IT Development Support" },
  { value: "Additional Recruitment Services", label: "Additional Recruitment Services" },
  { value: "other", label: "Other" },
];

const CONTACT_ENDPOINT = "/api/contact-message";
const AUTO_POPUP_SESSION_KEY = "techsara:autoContactShown";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// A name is letters plus the punctuation real names use. Without this, "45654654"
// passed a bare length check and reached the team's inbox as the contact's name.
const NAME_RE = /^\p{L}[\p{L}\s.'-]*$/u;

function nameError(value: string): string | undefined {
  if (/\d/.test(value)) return "Names cannot contain numbers.";
  // Deliberately no minimum length: single-character names are ordinary in
  // Chinese, Japanese and Korean, and rejecting them is worse than letting
  // someone enter an initial.
  if (!NAME_RE.test(value)) return "Use letters, spaces, hyphens or apostrophes only.";
  return undefined;
}

// "Other" on its own only sends the literal string "other", which tells the team
// nothing. Send what the visitor typed instead. Lambda caps discussionTopic at 150.
const TOPIC_MAX = 150;
const OTHER_PREFIX = "Other - ";
const OTHER_DETAIL_MAX = TOPIC_MAX - OTHER_PREFIX.length;

function buildDiscussionTopic(topic: string, otherDetail: string): string {
  if (topic !== "other") return topic;
  const detail = otherDetail.trim();
  if (!detail) return "Other";
  return (OTHER_PREFIX + detail).slice(0, TOPIC_MAX);
}

const PANEL_GAP = 8;
// Must clear .contact-modal-overlay (z-index 1000), which the panel would
// otherwise render behind once it is portalled onto <body>.
const PANEL_Z = 1100;

type PanelPos = { top: number; left: number; width: number };

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  phone?: string;
  topic?: string;
  otherTopic?: string;
  message?: string;
};

type Props = {
  variant?: "modal" | "inline";
  defaultTopic?: string;
  onClose?: () => void;
};

export default function ContactForm({ variant = "modal", defaultTopic = "", onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [topic, setTopic] = useState(defaultTopic);
  const [otherTopic, setOtherTopic] = useState("");
  const [topicOpen, setTopicOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

  // The panel is rendered on <body> rather than inside the field. Its ancestor
  // .cta-banner sets overflow:hidden to clip its gradient to the rounded
  // corners, which also clipped the dropdown at the card's bottom edge and made
  // the last option ("Other") unreachable. A portal escapes that clip; the
  // trade-off is that the panel no longer follows the page, so it is
  // repositioned on scroll and resize below.
  function positionPanel() {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelH = panelRef.current?.offsetHeight ?? 0;
    const roomBelow = window.innerHeight - rect.bottom - PANEL_GAP;
    const roomAbove = rect.top - PANEL_GAP;
    const dropUp = panelH > roomBelow && roomAbove > roomBelow;

    setPanelPos({
      top: dropUp
        ? Math.max(PANEL_GAP, rect.top - PANEL_GAP - panelH)
        : rect.bottom + PANEL_GAP,
      left: rect.left,
      width: rect.width,
    });
  }

  // Runs once the portalled panel is in the DOM, so its real height decides
  // whether it opens downward or flips above the trigger.
  useIsoLayoutEffect(() => {
    if (!topicOpen) return;
    positionPanel();

    const reposition = () => positionPanel();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicOpen]);

  // Close dropdown on outside click or Escape key.
  useEffect(() => {
    if (!topicOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const wrap = wrapRef.current;
      const panel = panelRef.current;
      const target = event.target as Node;
      // The panel now lives on <body>, so it is no longer inside wrap - without
      // this second check, mousedown on an option would close the panel before
      // its click handler could run.
      if (wrap && !wrap.contains(target) && !panel?.contains(target)) {
        setTopicOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setTopicOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey, true);
    };
  }, [topicOpen]);

  function clearError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // Moving off "Other" drops the extra field, so stale text is never submitted
  // and its errors don't linger on a topic that no longer asks for it.
  function chooseTopic(value: string) {
    setTopic(value);
    clearError("topic");
    if (value !== "other") {
      setOtherTopic("");
      setFieldErrors((prev) => ({ ...prev, otherTopic: undefined, message: undefined }));
    }
  }

  function validate(raw: Record<string, string>): FieldErrors {
    const errors: FieldErrors = {};

    // Assign only when there is a message: validate()'s caller treats any key
    // present as a failure, so an empty string here would block every submit.
    const firstName = (raw.firstName || "").trim();
    const firstNameError = firstName ? nameError(firstName) : "First Name is required.";
    if (firstNameError) errors.firstName = firstNameError;

    const lastName = (raw.lastName || "").trim();
    const lastNameError = lastName ? nameError(lastName) : "Last Name is required.";
    if (lastNameError) errors.lastName = lastNameError;

    const email = (raw.email || "").trim();
    if (!email) errors.email = "Work Email is required.";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

    const company = (raw.company || "").trim();
    if (!company) errors.company = "Company is required.";
    else if (company.length < 2) errors.company = "Must be at least 2 characters.";

    const phone = (raw.phone || "").trim();
    if (!phone) {
      errors.phone = "Phone Number is required.";
    } else if (/[A-Za-z]/.test(phone)) {
      // "abc1234567" cleared the digit count on its own, so letters need their
      // own check rather than relying on it.
      errors.phone = "Phone numbers cannot contain letters.";
    } else {
      const digits = (phone.match(/\d/g) || []).length;
      if (digits < 7 || digits > 15) errors.phone = "Enter a valid phone number (7-15 digits).";
    }

    if (!raw.topic) {
      errors.topic = "Please select a topic.";
    } else if (raw.topic === "other") {
      // "Other" carries no meaning on its own, so both the short subject line and
      // the detail box become required.
      if (!(raw.otherTopic || "").trim()) errors.otherTopic = "Please tell us what you'd like to discuss.";
      if (!(raw.message || "").trim()) errors.message = "Please add a little detail.";
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
    setServerError(null);

    const errors = validate(raw);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      email: raw.email.trim(),
      company: raw.company.trim(),
      phoneNumber: raw.phone.trim(),
      discussionTopic: buildDiscussionTopic(raw.topic, raw.otherTopic || ""),
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
          /* not JSON */
        }
        throw new Error(
          isValidation
            ? "Please fill out the full form before submitting."
            : "Something went wrong. Please try again.",
        );
      }
      try {
        window.sessionStorage.setItem(AUTO_POPUP_SESSION_KEY, "1");
      } catch {
        /* sessionStorage unavailable */
      }
      window.dispatchEvent(new CustomEvent("techsara:userEngaged"));
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedLabel =
    TOPIC_OPTIONS.find((opt) => opt.value === topic)?.label || "Select a topic";
  const isPlaceholder = !topic;

  if (submitted) {
    return (
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
        {variant === "modal" && onClose ? (
          <button type="button" className="contact-form-submit" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-row">
        <label className="contact-form-field">
          <span>First Name</span>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            aria-invalid={!!fieldErrors.firstName}
            onChange={() => clearError("firstName")}
          />
          {fieldErrors.firstName && (
            <span className="contact-field-error" role="alert">{fieldErrors.firstName}</span>
          )}
        </label>
        <label className="contact-form-field">
          <span>Last Name</span>
          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            aria-invalid={!!fieldErrors.lastName}
            onChange={() => clearError("lastName")}
          />
          {fieldErrors.lastName && (
            <span className="contact-field-error" role="alert">{fieldErrors.lastName}</span>
          )}
        </label>
      </div>

      <div className="contact-form-row">
        <label className="contact-form-field">
          <span>Work Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!fieldErrors.email}
            onChange={() => clearError("email")}
          />
          {fieldErrors.email && (
            <span className="contact-field-error" role="alert">{fieldErrors.email}</span>
          )}
        </label>
        <label className="contact-form-field">
          <span>Company</span>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            aria-invalid={!!fieldErrors.company}
            onChange={() => clearError("company")}
          />
          {fieldErrors.company && (
            <span className="contact-field-error" role="alert">{fieldErrors.company}</span>
          )}
        </label>
      </div>

      <label className="contact-form-field">
        <span>Phone Number</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+1 (555) 123-4567"
          aria-invalid={!!fieldErrors.phone}
          onChange={() => clearError("phone")}
        />
        {fieldErrors.phone && (
          <span className="contact-field-error" role="alert">{fieldErrors.phone}</span>
        )}
      </label>

      <label className="contact-form-field">
        <span>What would you like to discuss?</span>
        <div ref={wrapRef} className={`custom-select${topicOpen ? " is-open" : ""}${fieldErrors.topic ? " has-error" : ""}`}>
          <button
            ref={triggerRef}
            type="button"
            className="custom-select__trigger"
            aria-haspopup="listbox"
            aria-expanded={topicOpen}
            aria-invalid={!!fieldErrors.topic}
            onClick={() => {
              clearError("topic");
              if (topicOpen) {
                setTopicOpen(false);
                return;
              }
              // Seed a position before the panel mounts so it never paints at
              // the top-left corner for a frame; the layout effect refines it.
              const rect = triggerRef.current?.getBoundingClientRect();
              if (rect) {
                setPanelPos({
                  top: rect.bottom + PANEL_GAP,
                  left: rect.left,
                  width: rect.width,
                });
              }
              setTopicOpen(true);
            }}
          >
            <span className={`custom-select__value${isPlaceholder ? " is-placeholder" : ""}`}>
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
            value={topic}
            onChange={(e) => chooseTopic(e.target.value)}
            className="custom-select__native"
            tabIndex={-1}
            aria-hidden="true"
          >
            <option value="" disabled>Select a topic</option>
            {TOPIC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {topicOpen && panelPos && createPortal(
            <div
              ref={panelRef}
              className="custom-select__panel is-open"
              role="listbox"
              data-lenis-prevent="true"
              style={{
                position: "fixed",
                top: panelPos.top,
                left: panelPos.left,
                width: panelPos.width,
                right: "auto",
                zIndex: PANEL_Z,
              }}
            >
              {TOPIC_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={topic === opt.value}
                  className={`custom-select__option${topic === opt.value ? " is-selected" : ""}`}
                  onClick={() => {
                    chooseTopic(opt.value);
                    setTopicOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>,
            document.body,
          )}
        </div>
        {fieldErrors.topic && (
          <span className="contact-field-error" role="alert">{fieldErrors.topic}</span>
        )}
      </label>

      {topic === "other" && (
        <label className="contact-form-field">
          <span>Please tell us briefly</span>
          <input
            name="otherTopic"
            type="text"
            maxLength={OTHER_DETAIL_MAX}
            value={otherTopic}
            onChange={(e) => {
              setOtherTopic(e.target.value);
              clearError("otherTopic");
            }}
            aria-invalid={!!fieldErrors.otherTopic}
            placeholder="e.g. Visa sponsorship for three developers"
          />
          {fieldErrors.otherTopic && (
            <span className="contact-field-error" role="alert">{fieldErrors.otherTopic}</span>
          )}
        </label>
      )}

      <label className="contact-form-field">
        <span>Anything we should know?</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          onChange={() => clearError("message")}
          aria-invalid={!!fieldErrors.message}
          placeholder={
            topic === "other"
              ? "Tell us a bit more about what you need help with."
              : "A sentence or two about the problem, current stack, or timeline."
          }
        />
        {fieldErrors.message && (
          <span className="contact-field-error" role="alert">{fieldErrors.message}</span>
        )}
      </label>

      {serverError && (
        <p className="contact-form-error" role="alert">{serverError}</p>
      )}

      <div className={`contact-form-actions${variant === "inline" ? " is-inline" : ""}`}>
        {variant === "modal" && onClose ? (
          <button
            type="button"
            className="contact-form-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        ) : null}
        <button type="submit" className="contact-form-submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send Message"}
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
  );
}
