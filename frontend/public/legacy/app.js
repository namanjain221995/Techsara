// ============================================
// TECHSARA - Site interactivity
// Lenis smooth scroll, GSAP ScrollTrigger pinned section,
// magnetic CTAs, count-ups, reveals, bento glow, cursor.
// ============================================

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------- Lenis smooth scroll --------
  let lenis;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    window.__techsaraLenis = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
    }
  }

  // -------- Anchor smooth scroll --------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.3 });
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // -------- Nav: ready + scrolled state --------
  const nav = document.querySelector('.nav');
  if (nav) {
    requestAnimationFrame(() => nav.classList.add('is-ready'));
    const updateNav = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      nav.classList.toggle('is-scrolled', y > 20);
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // -------- Hero word reveal (dark title) --------
  const heroTitle = document.querySelector('.hero-dark-title') || document.querySelector('.hero-title');
  if (heroTitle && !reduceMotion) {
    const words = heroTitle.querySelectorAll('.word > span');
    words.forEach((w, i) => {
      w.style.transition = `transform 0.9s cubic-bezier(.2,.7,.2,1) ${0.1 + i * 0.07}s, opacity 0.9s ease ${0.1 + i * 0.07}s`;
    });
    requestAnimationFrame(() => {
      words.forEach((w) => { w.style.transform = 'translateY(0)'; w.style.opacity = '1'; });
    });
    // Drop the per-word GPU layer once the entrance finishes so smooth-scroll
    // doesn't cause sub-pixel jitter between word layers and the parent.
    const totalMs = 900 + (words.length * 70) + 200;
    setTimeout(() => { heroTitle.classList.add('is-revealed'); }, totalMs);
  } else if (heroTitle) {
    heroTitle.querySelectorAll('.word > span').forEach((w) => { w.style.transform = 'none'; w.style.opacity = '1'; });
    heroTitle.classList.add('is-revealed');
  }

  // -------- Dark nav while over dark hero --------
  const nav2 = document.querySelector('.nav');
  const darkHero = document.querySelector('.hero--dark');
  if (nav2 && darkHero) {
    let navTick = false;
    const checkNav = () => {
      navTick = false;
      const heroBottom = darkHero.getBoundingClientRect().bottom;
      if (heroBottom > 60) {
        nav2.classList.add('over-dark');
        nav2.classList.remove('is-scrolled');
      } else {
        nav2.classList.remove('over-dark');
      }
    };
    const onScrollNav = () => {
      if (navTick) return;
      navTick = true;
      requestAnimationFrame(checkNav);
    };
    window.addEventListener('scroll', onScrollNav, { passive: true });
    checkNav();
  }

  // -------- Reveals (IntersectionObserver) --------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // -------- Magnetic CTAs --------
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
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

  // -------- Bento card cursor-follow glow --------
  document.querySelectorAll('.bento-card, .split-3 .card, .split-2 .card, .case').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // -------- Count-ups --------
  const counters = document.querySelectorAll('[data-countup]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.countup);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = 1700;
      const start = performance.now();
      const isInt = Number.isInteger(target);
      const animate = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = target * eased;
        el.textContent = prefix + (isInt ? Math.round(v).toLocaleString() : v.toFixed(1)) + suffix;
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => cio.observe(c));

  // -------- HV bars random animation --------
  const bars = document.querySelectorAll('.hv-bars span');
  bars.forEach((b, i) => {
    const set = () => {
      const h = 25 + Math.random() * 70;
      b.style.height = h + '%';
    };
    setTimeout(set, 400 + i * 80);
    setInterval(set, 2400 + i * 200);
  });

  // -------- HOW WE WORK pinned scroll --------
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const howSection = document.querySelector('#how');
    const cards = document.querySelectorAll('.how-card');
    const steps = document.querySelectorAll('.how-progress .step');

    if (howSection && cards.length) {
      const setActive = (idx) => {
        cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
        steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      };
      setActive(0);

      window.ScrollTrigger.create({
        trigger: howSection,
        start: 'top top',
        end: () => '+=' + (window.innerHeight * 2.6),
        pin: '.how-wrap',
        pinSpacing: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const idx = Math.min(cards.length - 1, Math.floor(self.progress * cards.length * 0.9999));
          setActive(idx);
        },
      });
    }
  } else {
    // Fallback: show first card
    const c0 = document.querySelector('.how-card');
    if (c0) c0.classList.add('is-active');
    const s0 = document.querySelector('.how-progress .step');
    if (s0) s0.classList.add('is-active');
  }

  // -------- Custom cursor --------
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches && window.innerWidth > 900) {
    const cur = document.createElement('div');
    cur.className = 'cursor';
    cur.innerHTML = '<div class="ring"></div><div class="dot"></div>';
    document.body.appendChild(cur);
    let tx = 0, ty = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
    const tick = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      cur.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tick);
    };
    tick();
    const hoverables = 'a, button, [data-magnetic], .bento-card, .case, .industry, .testi';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) cur.classList.add('is-over');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) cur.classList.remove('is-over');
    });
  }

  // -------- Newsletter form --------
  const nl = document.querySelector('.footer-newsletter');
  if (nl) {
    nl.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = nl.querySelector('button');
      const input = nl.querySelector('input');
      if (!input.value) return;
      btn.textContent = 'Subscribed ✓';
      input.value = '';
      setTimeout(() => { btn.textContent = 'Subscribe'; }, 2200);
    });
  }

  // -------- Hero particle / point-cloud background --------
  const particleBg = document.querySelector('.hero-particle-bg');
  if (particleBg && !reduceMotion) {
    const pctx = particleBg.getContext('2d');
    const PDPR = Math.min(2, window.devicePixelRatio || 1);
    let PW = 0, PH = 0;
    const NPTS = 320;
    const pts = [];

    function initPts() {
      pts.length = 0;
      for (let i = 0; i < NPTS; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r = 0.28 + Math.random() * 0.22;
        pts.push({
          ox: Math.sin(phi) * Math.cos(theta) * r,
          oy: Math.cos(phi) * r * 1.35,
          oz: Math.sin(phi) * Math.sin(theta) * r,
          bright: Math.random() < 0.12,
          size: 0.8 + Math.random() * 1.4,
          speed: 0.04 + Math.random() * 0.06,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function resizePB() {
      const r = particleBg.getBoundingClientRect();
      PW = r.width; PH = r.height;
      particleBg.width  = PW * PDPR;
      particleBg.height = PH * PDPR;
      pctx.setTransform(PDPR, 0, 0, PDPR, 0, 0);
      initPts();
    }

    let lastPB = performance.now();
    let rotY = 0;

    function tickPB(now) {
      const dt = Math.min(0.05, (now - lastPB) / 1000);
      lastPB = now;
      rotY += dt * 0.07;

      pctx.clearRect(0, 0, PW, PH);

      const cx = PW * 0.5, cy = PH * 0.46;
      const scale = Math.min(PW, PH) * 0.88;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const tiltX = 0.18;
      const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);

      const projected = pts.map(p => {
        // rotate Y
        const x1 = p.ox * cosY + p.oz * sinY;
        const z1 = -p.ox * sinY + p.oz * cosY;
        // tilt X
        const y2 = p.oy * cosX - z1 * sinX;
        const z2 = p.oy * sinX + z1 * cosX;
        const depth = (z2 + 1) / 2;
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        return { px, py, depth, bright: p.bright, size: p.size };
      });

      // sort back to front
      projected.sort((a, b) => a.depth - b.depth);

      for (const p of projected) {
        const alpha = p.bright
          ? 0.55 + p.depth * 0.45
          : 0.06 + p.depth * 0.22;
        const r = p.size * (0.6 + p.depth * 0.7);
        if (p.bright) {
          const g = pctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 5);
          g.addColorStop(0, `rgba(200,205,255,${alpha * 0.5})`);
          g.addColorStop(1, 'rgba(79,70,229,0)');
          pctx.fillStyle = g;
          pctx.beginPath(); pctx.arc(p.px, p.py, r * 5, 0, Math.PI * 2); pctx.fill();
        }
        pctx.fillStyle = p.bright
          ? `rgba(230,235,255,${alpha})`
          : `rgba(100,120,220,${alpha})`;
        pctx.beginPath(); pctx.arc(p.px, p.py, r, 0, Math.PI * 2); pctx.fill();
      }

      requestAnimationFrame(tickPB);
    }

    window.addEventListener('resize', () => { clearTimeout(particleBg._rs); particleBg._rs = setTimeout(resizePB, 120); });
    resizePB();
    requestAnimationFrame(tickPB);
  }

  // -------- Careers: "Why Techsara" carousel --------
  const careersCarousel = document.querySelector('.careers-pillars');
  if (careersCarousel) {
    const slides = Array.from(careersCarousel.querySelectorAll('.careers-pillar'));
    const dots = Array.from(careersCarousel.querySelectorAll('.careers-pillars-dot'));
    if (slides.length > 1) {
      let active = 0;
      const ROTATE_MS = 10000;
      let timer;

      const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('is-active', i === active));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
      };
      const next = () => show(active + 1);
      const startTimer = () => { timer = window.setInterval(next, ROTATE_MS); };
      const stopTimer = () => { if (timer) { window.clearInterval(timer); timer = null; } };

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          stopTimer();
          show(i);
          startTimer();
        });
      });
      careersCarousel.addEventListener('mouseenter', stopTimer);
      careersCarousel.addEventListener('mouseleave', startTimer);

      startTimer();
    }
  }
})();
