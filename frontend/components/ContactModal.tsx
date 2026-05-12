"use client";

import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
};

export default function ContactModal({ isOpen, onClose, defaultTopic = "" }: Props) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setSubmitted(false);
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    // TODO: wire to backend / email service
    // eslint-disable-next-line no-console
    console.log("Contact form submitted:", data);
    setSubmitted(true);
  }

  return (
    <div className="contact-modal-overlay" onClick={onClose} role="presentation">
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
                <span>What would you like to discuss?</span>
                <select name="topic" required defaultValue={defaultTopic}>
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option value="ai-talent">AI Talent Solutions</option>
                  <option value="dedicated-team">Dedicated AI Teams</option>
                  <option value="ai-project">AI Project Solutions</option>
                  <option value="international-talent">International Talent Solutions</option>
                  <option value="ai-engineering">AI Engineering Solutions</option>
                  <option value="genai">Generative AI / LLMs</option>
                  <option value="vision">Computer Vision</option>
                  <option value="nlp">NLP &amp; Document AI</option>
                  <option value="mlops">Predictive ML / MLOps</option>
                  <option value="cloud">Cloud Deployment</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="contact-form-field">
                <span>
                  Anything we should know?{" "}
                  <em className="contact-form-optional">&mdash; optional</em>
                </span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="A sentence or two about the problem, current stack, or timeline."
                />
              </label>

              <div className="contact-form-actions">
                <button type="button" className="contact-form-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="contact-form-submit">
                  Send message
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
            <h2>Thanks &mdash; we&apos;ll be in touch.</h2>
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
