"use client";

import { RefObject, useEffect } from "react";

type SwipeOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
};

// Attaches passive touch + pointer listeners to a DOM element and fires
// onSwipeLeft / onSwipeRight when a horizontal drag crosses the threshold
// without exceeding the vertical tolerance (so vertical scroll still works).
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeOptions,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (x: number, y: number) => {
      startX = x;
      startY = y;
      tracking = true;
    };

    const onEnd = (x: number, y: number) => {
      if (!tracking) return;
      tracking = false;
      const dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dy) > Math.abs(dx)) return; // vertical scroll wins
      if (Math.abs(dx) < threshold) return;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      onStart(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      onEnd(t.clientX, t.clientY);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", () => { tracking = false; }, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}
