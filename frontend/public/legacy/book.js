// ============================================
// TECHSARA - Booking page
// 3 steps: pick date/time → details → confirmation
// ============================================

(function () {
  // Same-origin proxy → Next.js route → AWS API (avoids CORS)
  const BOOKING_API_URL = '/api/book-consultation';

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // ---- Availability model -------------------------------------------------
  // The team covers Mon-Fri, 9:30 AM - 6:30 PM Eastern. They sit in IST and swap
  // their own hours (7pm-4am IST in summer, 8pm-5am IST in winter) precisely so
  // that this Eastern window stays put, so Eastern is the only shift we model -
  // the IST swap then follows from US DST on its own, as does every other zone.
  //
  // These are fixed points in time; only how they read on a clock changes by
  // timezone. So we resolve every bookable slot to a UTC instant and group them
  // by the visitor's own calendar day. East of roughly UTC+2 a single local day
  // draws its slots from two different Eastern days - that falls out of this for
  // free, whereas simply relabelling the Eastern grid would get those days wrong.
  const BUSINESS_TZ = 'America/New_York';
  const BUSINESS_DAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const SHIFT_OPEN_MIN = 9 * 60 + 30;   // 9:30 AM ET - first call may start
  const SHIFT_CLOSE_MIN = 18 * 60 + 30; // 6:30 PM ET - last call must have ended
  const SLOT_LENGTH_MIN = 30;           // the booking is a 30-minute discovery call
  const SLOT_MINUTES = (() => {
    const out = [];
    // Stop a full meeting short of close, so the last slot ends on time rather
    // than running past it.
    for (let t = SHIFT_OPEN_MIN; t <= SHIFT_CLOSE_MIN - SLOT_LENGTH_MIN; t += SLOT_LENGTH_MIN) out.push(t);
    return out;
  })();
  const HORIZON_DAYS = 92;             // matches the previous "3 months ahead" cap
  const MIN_LEAD_MS = 60 * 60 * 1000;  // nothing bookable inside the next hour

  // The visitor's IANA zone, e.g. "Asia/Kolkata". Falls back to Eastern when the
  // browser won't report one (very old browsers, some hardened privacy modes).
  const visitorTz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || BUSINESS_TZ;
    } catch (_) {
      return BUSINESS_TZ;
    }
  })();

  function zonedParts(utcMs, timeZone, opts) {
    const dtf = new Intl.DateTimeFormat('en-US', Object.assign({ timeZone }, opts));
    const p = {};
    dtf.formatToParts(new Date(utcMs)).forEach((x) => {
      if (x.type !== 'literal') p[x.type] = x.value;
    });
    return p;
  }

  // How far `timeZone` sits from UTC at a given instant, in ms.
  function tzOffsetMs(utcMs, timeZone) {
    const p = zonedParts(utcMs, timeZone, {
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    // hour12:false yields "24" for midnight in some engines.
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return asUtc - utcMs;
  }

  // "9:00 on 2026-09-14 in America/New_York" -> the UTC instant that names.
  // Two passes: the first offset can be read from the wrong side of a DST
  // transition, and re-reading it at the corrected instant settles that.
  function zonedWallTimeToUtc(y, m, d, hh, mm, timeZone) {
    const wall = Date.UTC(y, m - 1, d, hh, mm);
    const first = wall - tzOffsetMs(wall, timeZone);
    return wall - tzOffsetMs(first, timeZone);
  }

  // Day key in the browser's own timezone - what the visitor calls "this day".
  function localKey(ms) {
    const dt = new Date(ms);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  // localKey -> sorted slots, each carrying both the instant and the Eastern
  // wall time it came from (the Eastern values are what we fall back to sending).
  function buildSchedule() {
    const map = new Map();
    const now = Date.now();
    // Anchor the walk at 12:00 UTC - mid-morning Eastern, nowhere near midnight -
    // so stepping a flat 24h always lands on the next Eastern date, DST or not.
    const nowDate = new Date();
    let cursor = Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate(), 12) - 864e5;

    for (let i = 0; i < HORIZON_DAYS + 2; i++, cursor += 864e5) {
      const p = zonedParts(cursor, BUSINESS_TZ, {
        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      });
      if (!BUSINESS_DAYS.has(p.weekday)) continue;

      SLOT_MINUTES.forEach((min) => {
        const ms = zonedWallTimeToUtc(+p.year, +p.month, +p.day, Math.floor(min / 60), min % 60, BUSINESS_TZ);
        if (ms < now + MIN_LEAD_MS) return;
        const key = localKey(ms);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push({ ms, etDate: `${p.year}-${p.month}-${p.day}`, etMinutes: min });
      });
    }

    map.forEach((list) => list.sort((a, b) => a.ms - b.ms));
    return map;
  }

  const schedule = buildSchedule();

  // State
  const today = new Date(); today.setHours(0,0,0,0);
  let cursorMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedSlot = null;
  let details = {};

  // Everything on screen is now in the visitor's own timezone, so this is just
  // the name we show them. Eastern is no longer surfaced anywhere in the UI.
  const tz = visitorTz;
  // "India Standard Time" reads better in a sentence than "Asia/Calcutta";
  // the IANA name still shows above the slot column.
  const tzLabel = (() => {
    try {
      const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' }).formatToParts(new Date());
      const named = parts.find((x) => x.type === 'timeZoneName');
      if (named && named.value) return named.value;
    } catch (_) { /* fall through */ }
    return visitorTz.replace(/_/g, ' ');
  })();

  // --- Renderers ---
  const $ = (sel) => document.querySelector(sel);

  // An instant, rendered on the visitor's clock.
  function fmtTime(ms) {
    return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // 24h hour/minute -> { time: "1:00", ampm: "PM" } as the API expects.
  function split12(h, m) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return { time: `${h12}:${String(m).padStart(2, '0')}`, ampm };
  }

  // Date → "YYYY-MM-DD" in local time (NOT UTC, to avoid date drift)
  function fmtISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // When the visitor picks "Other", the dropdown itself only carries the literal
  // string "other" - useless in the Zoom title and the calendar invite. Send what
  // they typed instead, so the engineer taking the call sees the real subject.
  // Lambda caps discussionTopic at 150 characters.
  const TOPIC_MAX = 150;
  const OTHER_PREFIX = 'Other - ';

  function buildDiscussionTopic(formDetails) {
    const topic = (formDetails.topic || '').trim();
    if (topic !== 'other') return topic;

    const detail = (formDetails.topicOther || '').trim();
    if (!detail) return 'Other';
    return (OTHER_PREFIX + detail).slice(0, TOPIC_MAX);
  }

  // Does this local wall time name exactly one instant?
  //
  // Around a DST transition it can name two (the hour repeats when clocks go
  // back) or none (the hour is skipped when they go forward). Egypt is the sharp
  // case: it ends DST at midnight, so 23:00-23:59 occurs twice, and our 4:00 PM
  // and 5:00 PM Eastern slots both read as "11:00 PM" in Cairo that night.
  function namesOneInstant(y, m, d, hh, mm, timeZone) {
    const wall = Date.UTC(y, m - 1, d, hh, mm);
    const before = tzOffsetMs(wall - 864e5, timeZone);
    const after = tzOffsetMs(wall + 864e5, timeZone);
    if (before === after) return true;   // no transition within a day either side

    // A transition is close by, so test both candidate instants: an unambiguous
    // wall time reads back from exactly one of them.
    let hits = 0;
    [before, after].forEach((off) => {
      const p = zonedParts(wall - off, timeZone, {
        hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
      if (+p.day === d && +p.hour % 24 === hh && +p.minute === mm) hits++;
    });
    return hits === 1;
  }

  // What to put on the wire for the chosen slot.
  //
  // Normally we send the visitor's own date/time plus their IANA zone, and the
  // Lambda converts to Eastern - that is the path it was built for, and it makes
  // the stored `originalSelection` reflect what the visitor actually clicked.
  //
  // Two cases make the local wall time unusable, and both fall back to sending
  // the Eastern one, which always lands on the half hour and never transitions
  // inside our 9:30-18:00 window. Same booking either way - only the recorded
  // selection differs.
  //   1. The Lambda validates the submitted minute as :00 or :30, but zones
  //      offset by :45 (Kathmandu, Chatham, Eucla) turn an Eastern :00 slot into
  //      :15 or :45 locally, which it would reject.
  //   2. The local time is ambiguous or skipped by that zone's own DST change,
  //      so it cannot identify which instant the visitor picked.
  function slotPayload(slot) {
    const dt = new Date(slot.ms);
    const minute = dt.getMinutes();
    const localIsUsable =
      (minute === 0 || minute === 30) &&
      namesOneInstant(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), minute, visitorTz);

    if (localIsUsable) {
      const { time, ampm } = split12(dt.getHours(), minute);
      return { date: fmtISODate(dt), time, ampm, timezone: visitorTz };
    }

    const { time, ampm } = split12(Math.floor(slot.etMinutes / 60), slot.etMinutes % 60);
    return { date: slot.etDate, time, ampm, timezone: BUSINESS_TZ };
  }

  // ---- Details validation -------------------------------------------------
  // The Lambda only checks these are non-empty (plus an email pattern), so a
  // name of "45654654" or a phone of "cvsdfsdfds" would otherwise reach the
  // Zoom title and the calendar invite. `company` is required server-side but
  // was never marked required here, so leaving it blank failed with a raw 4xx.
  const NAME_RE = /^\p{L}[\p{L}\s.'-]*$/u;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Shared by both name fields. Deliberately no minimum length: single-character
  // names are ordinary in Chinese, Japanese and Korean, and rejecting a real name
  // is worse than letting someone enter an initial.
  function nameIssue(v) {
    if (/\d/.test(v)) return 'Names cannot contain numbers.';
    if (!NAME_RE.test(v)) return 'Use letters, spaces, hyphens or apostrophes only.';
    return '';
  }

  function fieldError(id, raw) {
    const v = (raw || '').trim();
    switch (id) {
      case 'firstName':
        return v ? nameIssue(v) : 'First Name is required.';
      case 'lastName':
        return v ? nameIssue(v) : 'Last Name is required.';
      case 'email':
        if (!v) return 'Work Email is required.';
        if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
        return '';
      case 'company':
        if (!v) return 'Company is required.';
        if (v.length < 2) return 'Must be at least 2 characters.';
        return '';
      case 'phone': {
        if (!v) return 'Phone Number is required.';
        if (/[A-Za-z]/.test(v)) return 'Phone numbers cannot contain letters.';
        const digits = (v.match(/\d/g) || []).length;
        if (digits < 7 || digits > 15) return 'Enter a valid phone number (7-15 digits).';
        return '';
      }
      case 'topic':
        return v ? '' : 'Please select a topic.';
      case 'topicOther':
        return v ? '' : "Please tell us what you'd like to discuss.";
      case 'notes':
        return v ? '' : 'Please add a little detail.';
      default:
        return '';
    }
  }

  function setFieldError(input, message) {
    const wrap = input.closest ? input.closest('.field') : null;
    if (!wrap) return;
    let el = wrap.querySelector('.contact-field-error');
    if (message) {
      if (!el) {
        el = document.createElement('span');
        el.className = 'contact-field-error';
        el.setAttribute('role', 'alert');
        wrap.appendChild(el);
      }
      el.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      input.removeAttribute('aria-invalid');
    }
  }

  function validateDetails() {
    const ids = ['firstName', 'lastName', 'email', 'company', 'phone', 'topic'];
    // "Other" carries no meaning on its own, so it also demands the two extras.
    if (($('#topic') || {}).value === 'other') ids.push('topicOther', 'notes');

    let firstBad = null;
    ids.forEach((id) => {
      const input = $('#' + id);
      if (!input) return;
      const msg = fieldError(id, input.value);
      setFieldError(input, msg);
      if (msg && !firstBad) firstBad = input;
    });

    if (firstBad) {
      if (firstBad.focus) firstBad.focus();
      return false;
    }
    return true;
  }

  async function postBooking(formDetails) {
    const when = slotPayload(selectedSlot);
    const payload = {
      firstName: formDetails.firstName || '',
      lastName: formDetails.lastName || '',
      email: formDetails.email || '',
      company: formDetails.company || '',
      phoneNumber: formDetails.phone || '',
      discussionTopic: buildDiscussionTopic(formDetails),
      notes: formDetails.notes || '',
      date: when.date,
      time: when.time,
      ampm: when.ampm,
      timezone: when.timezone,
    };

    const res = await fetch(BOOKING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch (_) {}
      const err = new Error(`Booking failed (HTTP ${res.status})${detail ? ' - ' + detail : ''}`);
      err.status = res.status;
      throw err;
    }
    return res.json().catch(() => ({}));
  }

  function renderCalendar() {
    const monthLabel = `${monthNames[cursorMonth.getMonth()]} ${cursorMonth.getFullYear()}`;
    $('#cal-label').textContent = monthLabel;

    // Disable prev if cursorMonth <= current month
    const atCurrent = cursorMonth.getFullYear() === today.getFullYear() && cursorMonth.getMonth() === today.getMonth();
    $('#cal-prev').disabled = atCurrent;

    // Cap max 3 months ahead
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    $('#cal-next').disabled = cursorMonth.getFullYear() === maxMonth.getFullYear() && cursorMonth.getMonth() === maxMonth.getMonth();

    const firstDow = cursorMonth.getDay();
    const daysInMonth = new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() + 1, 0).getDate();
    const prevDays = new Date(cursorMonth.getFullYear(), cursorMonth.getMonth(), 0).getDate();

    let html = '';
    // Leading muted days
    for (let i = firstDow - 1; i >= 0; i--) {
      html += `<button class="cal-day muted" tabindex="-1">${prevDays - i}</button>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursorMonth.getFullYear(), cursorMonth.getMonth(), d);
      const key = localKey(date.getTime());
      // A local day is bookable when any Eastern slot lands on it - which no
      // longer lines up with Mon-Fri once the visitor is far enough east or west.
      const hasSlots = schedule.has(key);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      html += `<button class="cal-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}" ${hasSlots ? '' : 'disabled'} data-key="${key}" data-iso="${date.toISOString()}">${d}</button>`;
    }
    // Trailing muted to fill last row
    const totalCells = firstDow + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      html += `<button class="cal-day muted" tabindex="-1">${i}</button>`;
    }
    $('#cal-grid').innerHTML = html;
  }

  function renderSlots() {
    const head = $('#slots-head');
    const body = $('#slots-body');
    if (!selectedDate) {
      head.textContent = 'Available times';
      body.innerHTML = `<div class="cal-empty">Pick a date to see available times.</div>`;
      return;
    }
    const list = schedule.get(localKey(selectedDate.getTime())) || [];
    const niceDate = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    head.textContent = niceDate;
    if (!list.length) {
      body.innerHTML = `<div class="cal-empty">No slots on this day. Try another date.</div>`;
      return;
    }
    body.innerHTML = list.map((slot) => `
      <button class="slot${selectedSlot && selectedSlot.ms === slot.ms ? ' selected' : ''}" data-ms="${slot.ms}">${fmtTime(slot.ms)}</button>
    `).join('');
  }

  function syncNextButton() {
    $('#btn-next-1').disabled = !(selectedDate && selectedSlot);
  }

  function setStep(n) {
    document.querySelectorAll('.book-step').forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === n));
    document.querySelectorAll('.step').forEach((s, i) => {
      const idx = i + 1;
      s.classList.toggle('active', idx === n);
      s.classList.toggle('done', idx < n);
    });
    document.querySelectorAll('.book-step-pill').forEach((s, i) => {
      const idx = i + 1;
      s.classList.toggle('active', idx === n);
      s.classList.toggle('done', idx < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Wire events ---
  function init() {
    renderCalendar();
    renderSlots();
    syncNextButton();

    $('#cal-prev').addEventListener('click', () => {
      cursorMonth = new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() - 1, 1);
      renderCalendar();
    });
    $('#cal-next').addEventListener('click', () => {
      cursorMonth = new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() + 1, 1);
      renderCalendar();
    });

    $('#cal-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('.cal-day');
      if (!btn || btn.disabled || btn.classList.contains('muted')) return;
      selectedDate = new Date(btn.dataset.iso);
      selectedSlot = null;
      renderCalendar();
      renderSlots();
      syncNextButton();
    });

    $('#slots-body').addEventListener('click', (e) => {
      const btn = e.target.closest('.slot');
      if (!btn) return;
      const ms = Number(btn.dataset.ms);
      const list = schedule.get(localKey(selectedDate.getTime())) || [];
      selectedSlot = list.find((s) => s.ms === ms) || null;
      renderSlots();
      syncNextButton();
    });

    $('#slots-tz').textContent = tz;
    // This element has existed since the page was built but was never written to,
    // which is why the placeholder text "your local timezone" reached production.
    const tzInline = $('#slots-tz-inline');
    if (tzInline) tzInline.textContent = tzLabel;

    $('#btn-next-1').addEventListener('click', () => {
      if (!selectedDate || !selectedSlot) return;
      // Fill summary
      const niceDate = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      $('#summary-when').textContent = `${niceDate} · ${fmtTime(selectedSlot.ms)} (${tz})`;
      setStep(2);
    });

    $('#btn-back-2').addEventListener('click', () => setStep(1));

    // "Other" reveals a short free-text field and makes the notes box required,
    // so an Other booking never arrives without context. `required` is toggled
    // rather than declared in the markup: a required control inside a
    // display:none container blocks submission with "not focusable" in Chrome.
    const topicEl = $('#topic');
    const otherField = $('#topic-other-field');
    const otherInput = $('#topicOther');
    const notesEl = $('#notes');
    const notesPlaceholder = notesEl ? notesEl.placeholder : '';

    function syncTopicOther() {
      const isOther = topicEl.value === 'other';

      otherField.hidden = !isOther;
      otherInput.required = isOther;
      if (!isOther) otherInput.value = '';

      if (notesEl) {
        notesEl.required = isOther;
        notesEl.placeholder = isOther
          ? 'Tell us a bit more about what you need help with.'
          : notesPlaceholder;
      }
    }

    if (topicEl && otherField && otherInput) {
      // The custom dropdown re-dispatches a bubbling `change` on the native select.
      topicEl.addEventListener('change', syncTopicOther);
      syncTopicOther();
    }

    // Drop a field's error the moment it becomes valid, rather than leaving it
    // on screen until the next submit.
    ['firstName', 'lastName', 'email', 'company', 'phone', 'topicOther', 'notes'].forEach((id) => {
      const el = $('#' + id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true' && !fieldError(id, el.value)) setFieldError(el, '');
      });
    });
    if (topicEl) topicEl.addEventListener('change', () => setFieldError(topicEl, ''));

    $('#book-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!selectedDate || !selectedSlot) return;
      // The form carries `novalidate`, so this is the only gate before the API.
      if (!validateDetails()) return;

      const fd = new FormData(e.target);
      details = Object.fromEntries(fd.entries());

      const submitBtn = e.target.querySelector('button[type="submit"]');
      const backBtn = $('#btn-back-2');
      const errorEl = $('#book-error');
      const originalLabel = submitBtn.innerHTML;

      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
      submitBtn.disabled = true;
      if (backBtn) backBtn.disabled = true;
      submitBtn.innerHTML = '<span class="book-spinner" aria-hidden="true"></span>Booking…';

      try {
        await postBooking(details);

        // Booking succeeded - suppress the auto-contact popup for the rest of this session
        try {
          window.sessionStorage.setItem('techsara:autoContactShown', '1');
        } catch (_) { /* sessionStorage may be unavailable in some private modes */ }
        // Tell AutoContactPopup the user has engaged so subsequent CTA clicks show a toast
        try {
          window.dispatchEvent(new CustomEvent('techsara:userEngaged'));
        } catch (_) {}

        // Render confirmation
        const niceDate = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        $('#c-when').textContent = `${niceDate}`;
        $('#c-time').textContent = `${fmtTime(selectedSlot.ms)} (${tz})`;
        $('#c-name').textContent = `${details.firstName} ${details.lastName}`;
        $('#c-email').textContent = details.email;
        $('#c-phone').textContent = details.phone || '-';
        $('#c-topic').textContent = buildDiscussionTopic(details) || '-';
        setStep(3);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Booking submission error:', err);
        if (errorEl) {
          errorEl.textContent = (err && err.message) ? err.message : 'Something went wrong. Please try again.';
          errorEl.hidden = false;
        } else {
          alert('Sorry, we couldn\'t complete your booking. Please try again.');
        }
      } finally {
        submitBtn.disabled = false;
        if (backBtn) backBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }
    });

    // Pre-select if ?slot= passed
    // (No-op for now)

    // Enhance any <select data-custom-select> into a custom dropdown
    document.querySelectorAll('select[data-custom-select]').forEach(enhanceCustomSelect);
  }

  function enhanceCustomSelect(selectEl) {
    if (selectEl.dataset.enhanced === 'true') return;
    selectEl.dataset.enhanced = 'true';

    const wrap = document.createElement('div');
    wrap.className = 'custom-select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (selectEl.id) trigger.setAttribute('aria-labelledby', selectEl.id + '-label');

    const valueEl = document.createElement('span');
    valueEl.className = 'custom-select__value';

    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'custom-select__chevron');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '2.2');
    chevron.setAttribute('stroke-linecap', 'round');
    chevron.setAttribute('stroke-linejoin', 'round');
    chevron.setAttribute('aria-hidden', 'true');
    const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    chevronPath.setAttribute('points', '6 9 12 15 18 9');
    chevron.appendChild(chevronPath);

    trigger.appendChild(valueEl);
    trigger.appendChild(chevron);

    const panel = document.createElement('div');
    panel.className = 'custom-select__panel';
    panel.setAttribute('role', 'listbox');

    Array.from(selectEl.options).forEach((opt) => {
      if (opt.disabled || !opt.value && !opt.textContent.trim()) return;
      if (opt.hasAttribute('hidden')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'custom-select__option';
      btn.setAttribute('role', 'option');
      btn.dataset.value = opt.value || opt.textContent;
      btn.textContent = opt.textContent;
      btn.addEventListener('click', () => {
        selectEl.value = opt.value || opt.textContent;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateUI();
        close();
        trigger.focus();
      });
      panel.appendChild(btn);
    });

    // Native select → hidden but in form
    selectEl.classList.add('custom-select__native');
    selectEl.tabIndex = -1;
    selectEl.parentNode.insertBefore(wrap, selectEl);
    wrap.appendChild(trigger);
    wrap.appendChild(panel);
    wrap.appendChild(selectEl);

    function updateUI() {
      const val = selectEl.value;
      const selectedOpt = Array.from(selectEl.options).find((o) => o.value === val && !o.disabled);
      if (selectedOpt && selectedOpt.value) {
        valueEl.textContent = selectedOpt.textContent;
        valueEl.classList.remove('is-placeholder');
      } else {
        const placeholder = Array.from(selectEl.options).find((o) => o.disabled || !o.value);
        valueEl.textContent = placeholder ? placeholder.textContent : 'Select…';
        valueEl.classList.add('is-placeholder');
      }
      panel.querySelectorAll('.custom-select__option').forEach((b) => {
        b.classList.toggle('is-selected', b.dataset.value === val);
      });
    }

    function position() {
      const rect = trigger.getBoundingClientRect();
      const gap = 8;
      panel.style.position = 'fixed';
      panel.style.left = rect.left + 'px';
      panel.style.width = rect.width + 'px';

      // The panel is fixed and lives on <body>, so anything past the viewport
      // edge can't be scrolled into view. Flip above the trigger when the space
      // below can't hold it and there is more room up top.
      const panelH = panel.offsetHeight;
      const roomBelow = window.innerHeight - rect.bottom - gap;
      const roomAbove = rect.top - gap;

      if (panelH > roomBelow && roomAbove > roomBelow) {
        panel.style.top = Math.max(gap, rect.top - gap - panelH) + 'px';
      } else {
        panel.style.top = (rect.bottom + gap) + 'px';
      }
    }
    function open() {
      wrap.classList.add('is-open');
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.appendChild(panel);
      position();
      window.addEventListener('scroll', position, true);
      window.addEventListener('resize', position);
    }
    function close() {
      wrap.classList.remove('is-open');
      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
      if (panel.parentNode === document.body) wrap.appendChild(panel);
    }
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrap.classList.contains('is-open')) close(); else open();
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target) && !panel.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrap.classList.contains('is-open')) {
        close();
        trigger.focus();
      }
    });
    selectEl.addEventListener('change', updateUI);

    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
