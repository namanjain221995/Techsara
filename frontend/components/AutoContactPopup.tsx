"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ContactModal from "@/components/ContactModal";

const DELAY_MS = 30_000;
const SESSION_KEY = "techsara:autoContactShown";
const EXCLUDED_PATHS = ["/book"];

export default function AutoContactPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY)) return;

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
