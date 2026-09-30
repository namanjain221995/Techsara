import Script from "next/script";
import LegacyReinit from "./LegacyReinit";
import LegacyRerun from "./LegacyRerun";

type LegacyScriptsProps = {
  page: "home" | "book" | "service" | "print";
};

/**
 * Cache buster for the hand-written /public/legacy scripts.
 *
 * Files under /public are served at a stable URL, so a browser that has seen
 * one keeps it across ordinary refreshes - a returning visitor can run an old
 * script against freshly rendered HTML. That mismatch is not hypothetical: the
 * booking page rendered "Showing slots in your timezone" while a cached script
 * still drew the grid in Eastern.
 *
 * Bump this whenever a file in /public/legacy changes. The /legacy/vendor
 * bundles don't need it - their versions are pinned in the filenames.
 */
const ASSET_V = "2026-10-01.4";

export default function LegacyScripts({ page }: LegacyScriptsProps) {
  return (
    <>
      <LegacyReinit />

      <Script id="techsara-mobile-nav" strategy="afterInteractive">
        {`(function(){
          var nav = document.querySelector('.nav');
          var toggle = document.querySelector('.nav-toggle');
          if (!nav || !toggle) return;
          if (toggle.dataset.bound === '1') return;
          toggle.dataset.bound = '1';
          function setOpen(open) {
            nav.classList.toggle('is-mobile-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
          }
          toggle.addEventListener('click', function(){ setOpen(!nav.classList.contains('is-mobile-open')); });
          nav.querySelectorAll('.nav-links a').forEach(function(link){
            link.addEventListener('click', function(){ setOpen(false); });
          });
          document.addEventListener('keydown', function(e){
            if (e.key === 'Escape' && nav.classList.contains('is-mobile-open')) setOpen(false);
          });
        })();`}
      </Script>

      {page === "home" || page === "print" ? (
        <>
          {/* Self-hosted (public/legacy/vendor) instead of jsDelivr - removes 3 cross-origin
              requests counted by the "Page Objects" audit and the third-party CDN dependency.
              Versions are pinned in the filenames; still lazyOnload so they never render-block. */}
          <Script src="/legacy/vendor/lenis.min.js" strategy="lazyOnload" />
          <Script src="/legacy/vendor/gsap.min.js" strategy="lazyOnload" />
          <Script src="/legacy/vendor/ScrollTrigger.min.js" strategy="lazyOnload" />
          <Script src={`/legacy/app.js?v=${ASSET_V}`} strategy="lazyOnload" />
        </>
      ) : null}

      {page === "book" ? (
        <>
          <Script src={`/legacy/book.js?v=${ASSET_V}`} strategy="afterInteractive" />
          <LegacyRerun name="book" />
        </>
      ) : null}

      {/* There is deliberately no "service" branch. /services/[slug] is rendered
          on the server from lib/services-data.ts, so it needs neither
          service-data.js nor service.js. Loading them again would reintroduce
          the blank-page and false-404 races those files caused. */}

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
