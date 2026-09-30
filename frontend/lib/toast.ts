/**
 * Toast messages.
 *
 * Fired as a window event rather than through React context, so the legacy
 * scripts under /public/legacy (the booking flow) can raise one too - they are
 * plain JS with no access to the React tree.
 *
 * <ToastHost /> in the root layout listens and renders. See components/Toast.tsx.
 */

export type ToastVariant = "success" | "error";

export type ToastInput = {
  /** Short, bold. "Message sent", "Couldn't send". */
  title: string;
  /** One line of detail. Optional. */
  body?: string;
  variant?: ToastVariant;
};

export const TOAST_EVENT = "techsara:toast";

export function showToast(toast: ToastInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastInput>(TOAST_EVENT, { detail: toast }));
}

/** The copy, in one place so the wording stays consistent across the forms. */
export const TOASTS = {
  contactSent: {
    title: "Your message is sent",
    body: "A Techsara lead will reply within one business day.",
  },
  contactFailed: {
    title: "Message could not be sent",
    body: "Please check your connection and try again.",
    variant: "error" as const,
  },
  bookingConfirmed: (when: string) => ({
    title: `Your consultation call is booked for ${when}`,
    body: "Zoom link sent to your email.",
  }),
  bookingFailed: {
    title: "Consultation booking failed",
    body: "That slot may have just been taken. Please pick another.",
    variant: "error" as const,
  },
  applicationSent: {
    title: "Your application is submitted",
    body: "Our recruiting team will be in touch soon.",
  },
  applicationFailed: {
    title: "Application could not be submitted",
    body: "Please try again.",
    variant: "error" as const,
  },
  signedIn: { title: "You are signed in" },
} satisfies Record<string, ToastInput | ((arg: string) => ToastInput)>;
