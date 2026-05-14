// ============================================
// TECHSARA — Service detail page
// Reads ?slug=… from URL and renders from SERVICES[slug]
// ============================================

(function () {
  const params = new URLSearchParams(window.location.search);
  const routeSlug = window.__TECHSARA_SERVICE_SLUG || window.location.pathname.match(/\/(?:services|solutions)\/([^/]+)/)?.[1];
  const slug = params.get('slug') || routeSlug || 'generative-ai';
  const data = window.SERVICES[slug];

  if (!data) {
    document.getElementById('service-root').innerHTML = `
      <section style="padding: 200px 0; text-align: center;">
        <div class="container">
          <span class="eyebrow" style="justify-content:center;">404</span>
          <h1 class="section-title" style="margin: 24px auto;">Service not found</h1>
          <p class="section-sub" style="margin: 0 auto 32px;">We couldn't find a service with that slug.</p>
          <a href="/" class="btn btn-primary">Back to home</a>
        </div>
      </section>`;
    return;
  }

  document.title = `${data.name} — Techsara`;

  // Render
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const capsHtml = data.capabilities.map((c, i) => `
    <article class="cap reveal" data-delay="${i % 4}">
      <div class="cap-num">CAP / ${String(i + 1).padStart(2, '0')}</div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.desc)}</p>
    </article>`).join('');

  const stackHtml = data.stack.map((s) => `<span class="stack-chip">${esc(s)}</span>`).join('');

  const delvHtml = data.deliverables.map((d, i) => `
    <li class="reveal" data-delay="${i % 4}">
      <span class="num">${String(i + 1).padStart(2, '0')}</span>
      ${esc(d)}
    </li>`).join('');

  const metricsHtml = data.metrics.map((m) => `
    <div class="service-aside-metric">
      <div class="num">${esc(m.num)}</div>
      <div class="lbl">${esc(m.lbl)}</div>
    </div>`).join('');

  const relatedHtml = data.related.map((rs) => {
    const r = window.SERVICES[rs];
    if (!r) return '';
    return `
      <a href="/solutions/${rs}" class="related-card reveal">
        <span class="service-cat" style="margin:0;">${esc(r.category)}</span>
        <h4>${esc(r.name)}</h4>
        <p>${esc((r.intro || '').slice(0, 110) + (r.intro.length > 110 ? '…' : ''))}</p>
        <span class="ar">Explore <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </a>`;
  }).join('');

  document.getElementById('service-root').innerHTML = `
    <!-- HERO -->
    <section class="service-hero">
      <div class="hero-mesh" aria-hidden="true">
        <span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span>
      </div>
      <div class="grid-overlay" aria-hidden="true"></div>

      <div class="container">
        <div class="service-hero-grid">
          <div>
            <span class="service-cat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>
              ${esc(data.category)}
            </span>
            <div class="service-name">${esc(data.name)}</div>
            <h1 class="service-title">${esc(data.headline)}</h1>
            <p class="service-intro">${esc(data.intro)}</p>
            <div class="service-hero-actions">
              <a href="/book" class="btn btn-primary btn-lg" data-magnetic="0.3">
                Book a consultation
                <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
            </div>
          </div>

          <aside class="service-aside reveal">
            <div class="service-aside-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${data.icon}</svg>
            </div>
            <h4>What we deliver</h4>
            <div class="service-aside-metrics">${metricsHtml}</div>
          </aside>
        </div>
      </div>
    </section>

    <!-- CAPABILITIES -->
    <section class="detail-section">
      <div class="container">
        <div class="detail-head reveal">
          <span class="eyebrow">Capabilities</span>
          <h2 class="section-title">What's inside this engagement.</h2>
          <p class="section-sub">Every project is composed from these capabilities — tuned to your data, your domain and your deployment target.</p>
        </div>
        <div class="cap-grid">${capsHtml}</div>
      </div>
    </section>

    <!-- STACK + DELIVERABLES -->
    <section class="detail-section surface">
      <div class="container service-stack-grid">
        <div class="reveal service-stack-col">
          <span class="eyebrow">Stack</span>
          <h2 class="section-title service-stack-title">Modern tools, used with intent.</h2>
          <p class="section-sub service-stack-sub">A curated stack chosen for production reliability — not novelty.</p>
          <div class="stack-chips">${stackHtml}</div>
        </div>
        <div class="reveal service-delv-col" data-delay="1">
          <span class="eyebrow">Deliverables</span>
          <h3 class="section-title service-delv-title">Concrete artifacts at the end of every phase.</h3>
          <ul class="delv-list">${delvHtml}</ul>
        </div>
      </div>
    </section>

    <!-- RELATED -->
    <section class="detail-section">
      <div class="container">
        <div class="detail-head reveal">
          <span class="eyebrow">Related Services</span>
          <h2 class="section-title">Often delivered together.</h2>
        </div>
        <div class="related-grid">${relatedHtml}</div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="cta-banner-wrap">
      <div class="container">
        <div class="cta-banner reveal">
          <div>
            <h2>Want a tailored proposal for ${esc(data.name)}?</h2>
            <p>30-minute call with a senior engineer. We'll come back within one business day with scope, timeline and a fixed-fee proposal.</p>
          </div>
          <div class="cta-banner-actions">
            <a href="/book" class="btn btn-primary btn-lg" data-magnetic="0.3">
              Book a free consultation
              <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=hello@techsarasolutions.com&cc=sales@techsarasolutions.com&su=Project%20inquiry%20%E2%80%94%20Techsara&body=Hi%20Techsara%20team%2C%0A%0AI%27d%20like%20to%20learn%20more%20about%20your%20services.%20A%20bit%20about%20my%20project%3A%0A%0A-%20Company%3A%0A-%20Role%3A%0A-%20What%20we%27re%20trying%20to%20solve%3A%0A-%20Timeline%20%2F%20budget%3A%0A%0ABest%2C" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-lg">Email the team</a>
          </div>
        </div>
      </div>
    </section>`;

  // Re-run reveal observer + magnetic for newly-injected content
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  document.querySelectorAll('#service-root .reveal').forEach((el) => io.observe(el));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('#service-root [data-magnetic]').forEach((btn) => {
    if (reduceMotion) return;
    const strength = parseFloat(btn.dataset.magnetic) || 0.35;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();
