import Script from "next/script";
import LegacyReinit from "./LegacyReinit";

type LegacyScriptsProps = {
  page: "home" | "book" | "service" | "print";
  serviceSlug?: string;
};

export default function LegacyScripts({ page, serviceSlug }: LegacyScriptsProps) {
  return (
    <>
      <LegacyReinit />
      {page === "home" || page === "print" ? (
        <>
          <Script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" strategy="afterInteractive" />
          <Script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" strategy="afterInteractive" />
          <Script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" strategy="afterInteractive" />
          <Script src="/legacy/app.js" strategy="afterInteractive" />
        </>
      ) : null}

      {page === "book" ? <Script src="/legacy/book.js" strategy="afterInteractive" /> : null}

      {page === "service" ? (
        <>
          <Script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" strategy="afterInteractive" />
          <Script
            id="techsara-service-slug"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.__TECHSARA_SERVICE_SLUG=${JSON.stringify(serviceSlug || "generative-ai")};`,
            }}
          />
          <Script src="/legacy/service-data.js" strategy="beforeInteractive" />
          <Script src="/legacy/service.js" strategy="afterInteractive" />
          <Script id="techsara-service-nav" strategy="afterInteractive">
            {`
              const navEl = document.querySelector('.nav');
              const setNav = () => navEl && navEl.classList.toggle('is-scrolled', window.scrollY > 8);
              setNav();
              window.addEventListener('scroll', setNav, { passive: true });
              if (!matchMedia('(prefers-reduced-motion: reduce)').matches && window.Lenis) {
                const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
                function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
                requestAnimationFrame(raf);
              }
            `}
          </Script>
        </>
      ) : null}

      {page === "print" ? (
        <Script id="techsara-print" strategy="afterInteractive">
          {`
            (async function(){
              try { if (document.fonts && document.fonts.ready) { await document.fonts.ready; } } catch(e) {}
              document.body.classList.add('printing');
            })();
          `}
        </Script>
      ) : null}
    </>
  );
}
