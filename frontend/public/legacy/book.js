// ============================================
// TECHSARA — Booking page
// 3 steps: pick date/time → details → confirmation
// ============================================

(function () {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Mock available slots per weekday (24h). Weekends closed.
  // Index: 0=Sun, 1=Mon ... 6=Sat
  const SLOTS_BY_DOW = {
    1: ['09:00','09:30','10:00','10:30','11:30','13:00','14:00','15:00','16:00','16:30'],
    2: ['09:30','10:00','11:00','11:30','13:30','14:30','15:30','16:30','17:00'],
    3: ['09:00','10:00','10:30','11:00','13:00','14:30','15:00','16:00','17:00'],
    4: ['09:00','09:30','11:00','13:00','13:30','14:00','15:30','16:30'],
    5: ['09:30','10:30','11:30','13:30','14:00','15:00','16:00'],
  };

  // State
  const today = new Date(); today.setHours(0,0,0,0);
  let cursorMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedSlot = null;
  let details = {};

  // Browser timezone label
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

  // --- Renderers ---
  const $ = (sel) => document.querySelector(sel);

  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
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
      const wd = date.getDay();
      const isPast = date < today;
      const hasSlots = SLOTS_BY_DOW[wd] && SLOTS_BY_DOW[wd].length > 0;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const disabled = isPast || !hasSlots;
      html += `<button class="cal-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}" ${disabled ? 'disabled' : ''} data-iso="${date.toISOString()}">${d}</button>`;
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
    const wd = selectedDate.getDay();
    const list = SLOTS_BY_DOW[wd] || [];
    const niceDate = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    head.textContent = niceDate;
    if (!list.length) {
      body.innerHTML = `<div class="cal-empty">No slots on this day. Try another date.</div>`;
      return;
    }
    body.innerHTML = list.map((t) => `
      <button class="slot${selectedSlot === t ? ' selected' : ''}" data-time="${t}">${fmtTime(t)}</button>
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
      selectedSlot = btn.dataset.time;
      renderSlots();
      syncNextButton();
    });

    $('#slots-tz').textContent = tz;

    $('#btn-next-1').addEventListener('click', () => {
      if (!selectedDate || !selectedSlot) return;
      // Fill summary
      const niceDate = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      $('#summary-when').textContent = `${niceDate} · ${fmtTime(selectedSlot)} (${tz})`;
      setStep(2);
    });

    $('#btn-back-2').addEventListener('click', () => setStep(1));

    $('#book-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      details = Object.fromEntries(fd.entries());
      // Render confirmation
      const niceDate = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      $('#c-when').textContent = `${niceDate}`;
      $('#c-time').textContent = `${fmtTime(selectedSlot)} (${tz})`;
      $('#c-name').textContent = `${details.firstName} ${details.lastName}`;
      $('#c-email').textContent = details.email;
      $('#c-topic').textContent = details.topic || '—';
      setStep(3);
    });

    // Pre-select if ?slot= passed
    // (No-op for now)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
