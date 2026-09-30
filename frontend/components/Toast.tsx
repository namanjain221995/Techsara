"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_EVENT, type ToastInput } from "@/lib/toast";

/**
 * Top-centre toast stack, mounted once in the root layout.
 *
 * Listens for the `techsara:toast` window event so both React forms and the
 * legacy booking script can raise one. Success messages auto-dismiss; errors
 * stay longer, because the reader may need to act on them.
 */

type Toast = ToastInput & { id: number };

const DISMISS_MS = { success: 5000, error: 8000 };

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, number>());
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastInput>).detail;
      if (!detail?.title) return;

      const id = nextId.current++;
      const variant = detail.variant ?? "success";
      // Keep the stack short - an older message is never more useful than the
      // three most recent.
      setToasts((list) => [...list.slice(-2), { ...detail, variant, id }]);

      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DISMISS_MS[variant]),
      );
    };

    window.addEventListener(TOAST_EVENT, onToast);
    const running = timers.current;
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      running.forEach((t) => window.clearTimeout(t));
      running.clear();
    };
  }, [dismiss]);

  if (!toasts.length) return null;

  return (
    <div className="ts-toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`ts-toast ts-toast--${t.variant}`}
          role="status"
          // Errors interrupt; successes wait for a pause in the screen reader.
          aria-live={t.variant === "error" ? "assertive" : "polite"}
        >
          <span className="ts-toast-icon" aria-hidden="true">
            {t.variant === "error" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>

          <span className="ts-toast-copy">
            <strong className="ts-toast-title">{t.title}</strong>
            {t.body ? <span className="ts-toast-body">{t.body}</span> : null}
          </span>

          <button
            type="button"
            className="ts-toast-close"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
