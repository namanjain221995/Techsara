"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;

      const newPath = href.split("#")[0].split("?")[0];
      if (newPath === window.location.pathname) return;

      setTick((t) => t + 1);
      setActive(true);
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  useEffect(() => {
    if (active) setActive(false);
  }, [pathname]);

  if (!active) return null;
  return <div key={tick} className="route-progress" aria-hidden="true" />;
}
