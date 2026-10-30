(() => {
  'use strict';

  const CFG = window.KURAL_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = document.documentElement;
  const phone = $('#phone');
  const art = (n) => CFG.chapterArt[n] || CFG.placeholderArt;
  const pad = (n) => String(n).padStart(3, '0');

  /* ---------- Saved progress (this browser only) ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('kural.' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('kural.' + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }
  };
  const readSet = new Set(store.get('read', []));
  const savedSet = new Set(store.get('saved', []));
  const lastChapter = store.get('last', {});

  /* ---------- Fit the layout to the screen ----------
     Desktop: a 390 x 844 phone frame, scaled down if the window is small.
     Phone: fill the screen edge to edge. The layout is 390 wide and as tall as the screen,
     using the space under the status bar and home indicator when there is no system UI there. */
  let scale = 1;
  let PAGE_H = 844;
  let onFit = null;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  document.body.appendChild(probe);
  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    const st = getComputedStyle(probe);
    const satPx = parseFloat(st.paddingTop) || 0, sabPx = parseFloat(st.paddingBottom) || 0;
    const mobile = w < 600;
    let W = 390, H = 844, to = 0, bo = 0, sh = 0;
    if (mobile) {
      for (let k = 0; k < 2; k++) {
        to = Math.max(-36, satPx / scale - 44);
        bo = Math.max(-14, sabPx / scale - 34);
        scale = Math.min(w / 390, h / (764 + to + bo));
      }
      W = w / scale; H = h / scale;
      sh = Math.max(0, 844 - (H - to - bo));
    } else {
      scale = Math.min(1, w / 390, h / 844);
    }
    PAGE_H = H;
    phone.style.width = W + 'px';
    phone.style.height = H + 'px';
    phone.style.setProperty('--ph', H + 'px');
    phone.style.setProperty('--to', to.toFixed(1) + 'px');
    phone.style.setProperty('--bo', bo.toFixed(1) + 'px');
    phone.style.setProperty('--sh', sh.toFixed(1) + 'px');
    phone.style.transform = 'scale(' + scale + ')';
    phone.classList.toggle('edge', mobile);
    if (onFit) onFit();
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toast]');
    if (t) toast(t.dataset.toast);
  });
  $('#tab-saved').addEventListener('click', () => {
    toast(savedSet.size ? 'You have ' + savedSet.size + ' saved ' + (savedSet.size === 1 ? 'kural' : 'kurals') + '. A Saved screen is next.' : 'Tap the bookmark on any kural to save it.');
  });

  /* ---------- Kolam cover patterns ---------- */
  function kolam(kind) {
    let d = '', dots = '';
    const cols = 5, rows = 4, sp = 28, x0 = 39, y0 = 32;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = x0 + c * sp, y = y0 + r * sp;
        dots += 'M' + (x - 1.8) + ' ' + y + 'a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0';
        if (kind === 'virtue') {
          d += 'M' + x + ' ' + (y - 14) + 'L' + (x + 14) + ' ' + y + 'L' + x + ' ' + (y + 14) + 'L' + (x - 14) + ' ' + y + 'Z';
        } else if (kind === 'wealth') {
          d += 'M' + (x - 14) + ' ' + y + 'a14 14 0 1 0 28 0a14 14 0 1 0 -28 0';
        } else {
          [[0.707, -0.707], [0.707, 0.707], [-0.707, 0.707], [-0.707, -0.707]].forEach(([dx, dy]) => {
            const px = -dy, py = dx, mx = x + dx * 6.5, my = y + dy * 6.5;
            d += 'M' + x + ' ' + y + 'Q' + (mx + px * 6).toFixed(1) + ' ' + (my + py * 6).toFixed(1) + ' ' + (x + dx * 13).toFixed(1) + ' ' + (y + dy * 13).toFixed(1) +
              'Q' + (mx - px * 6).toFixed(1) + ' ' + (my - py * 6).toFixed(1) + ' ' + x + ' ' + y + 'Z';
          });
        }
      }
    }
    return { d, dots };
  }

  let SECTIONS = [];
  const state = { focus: 1, open: false, hov: [0, 0, 0], tx: 0, ty: 0, pressed: false };
  const shelf = $('#shelf');
  let books = [], shadows = [], dotEls = [];

  function chapterRead(c) {
    let n = 0;
    for (let k = c.start; k <= c.end; k++) if (readSet.has(k)) n++;
    return n;
  }

  /* ---------- Home: 3D sections ---------- */
  function buildShelf() {
    shelf.innerHTML = SECTIONS.map((s, i) => {
      const k = kolam(s.id);
      return '<div class="book-shadow" data-i="' + i + '"></div>' +
        '<button type="button" class="book" data-i="' + i + '">' +
          '<div class="pos"><div class="tilt">' +
            '<div class="f back" style="background:' + s.spine + '"></div>' +
            '<div class="f spine" style="background:' + s.spine + '"></div>' +
            '<div class="f edge-r"></div><div class="f edge-t"></div>' +
            '<div class="inner">' +
              '<span class="inner-kicker">Section ' + s.num + ' · ' + esc(s.en) + '</span>' +
              '<span class="inner-title" lang="ta">' + esc(s.taBook) + '</span>' +
              '<span class="inner-rule" style="background:' + s.cover + '"></span>' +
              '<span class="inner-meta">Chapters ' + s.range + '<br>Kurals ' + s.kurals + '</span>' +
            '</div>' +
            '<div class="cover">' +
              '<div class="front" style="background:' + s.cover + '">' +
                '<svg class="pat" viewBox="0 0 190 276" aria-hidden="true">' +
                  '<path d="' + k.d + '" fill="none" stroke="rgba(251,244,228,0.55)" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>' +
                  '<path d="' + k.dots + '" fill="rgba(251,244,228,0.85)"/>' +
                '</svg>' +
                '<span class="frame" aria-hidden="true"></span>' +
                '<div class="title"><span class="kick">Section ' + s.num + '</span><span class="ta" lang="ta">' + esc(s.ta) + '</span><span class="en">' + esc(s.en) + '</span></div>' +
                '<div class="glare" aria-hidden="true"></div>' +
              '</div>' +
              '<div class="inside" style="background:' + s.spine + '">' +
                '<svg class="pat" viewBox="0 0 190 276" aria-hidden="true"><path d="' + k.d + '" fill="none" stroke="rgba(251,244,228,0.3)" stroke-width="1.4" stroke-linejoin="round"/></svg>' +
                '<span class="inside-title" lang="ta">திருக்குறள்</span>' +
              '</div>' +
            '</div>' +
          '</div></div>' +
        '</button>';
    }).join('');
    books = [...shelf.querySelectorAll('.book')];
    shadows = [...shelf.querySelectorAll('.book-shadow')];
    $('#dots').innerHTML = SECTIONS.map(() => '<span></span>').join('');
    dotEls = [...$('#dots').children];

    books.forEach((b) => b.addEventListener('click', () => {
      if (state.open) return;
      const i = +b.dataset.i;
      if (i === state.focus) openSection();
      else { state.focus = i; state.tx = 0; state.ty = 0; layout(); renderChapters(); }
    }));
  }

  function resumeInfo(s) {
    const last = lastChapter[s.id];
    if (last) return { label: 'Continue chapter ' + last, chapter: last };
    return { label: 'Start at Kural ' + s.chapters[0].start, chapter: s.chapters[0].n };
  }

  function layout() {
    const { focus, open } = state;
    const s = SECTIONS[focus];
    root.style.setProperty('--deep', s.deep);
    root.style.setProperty('--glow', s.glow);
    root.style.setProperty('--card', s.card);
    root.style.setProperty('--card-rgb', s.cardRgb);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', s.deep);
    phone.classList.toggle('is-open', open);

    books.forEach((b, i) => {
      const off = i - focus, isF = off === 0;
      let pos;
      if (!open) {
        pos = isF ? 'translate3d(0px,0px,0px) rotateX(0deg) rotateY(0deg) scale(1)'
          : 'translate3d(' + off * 176 + 'px,8px,-170px) rotateX(0deg) rotateY(' + (-off * 34) + 'deg) scale(0.84)';
      } else {
        pos = isF ? 'translate3d(59px,-150px,0px) rotateX(16deg) rotateY(0deg) scale(0.62)'
          : 'translate3d(' + off * 430 + 'px,-110px,-200px) rotateX(0deg) rotateY(' + (-off * 70) + 'deg) scale(0.6)';
      }
      b.querySelector('.pos').style.transform = pos;
      b.style.opacity = open && !isF ? 0 : (isF ? 1 : 0.7);
      b.style.zIndex = isF ? 3 : 1;
      b.style.pointerEvents = open && !isF ? 'none' : 'auto';
      b.tabIndex = open ? -1 : 0;
      b.classList.toggle('focused', isF);
      const cover = b.querySelector('.cover');
      cover.style.transitionDelay = open ? '.12s' : '0s';
      cover.style.transform = 'translateZ(15.5px) rotateY(' + (open && isF ? -166 : 0) + 'deg)';
      const sec = SECTIONS[i];
      b.setAttribute('aria-label', open ? 'Section ' + sec.num + ', ' + sec.en + ', open'
        : (isF ? 'Open Section ' + sec.num + ', ' + sec.en : 'Show Section ' + sec.num + ', ' + sec.en));
    });
    shadows.forEach((sh, i) => {
      const off = i - focus, isF = off === 0;
      sh.style.transform = open ? 'translateX(0px) scale(0.5)' : 'translateX(' + off * 176 + 'px) scale(' + (isF ? 1 : 0.72) + ')';
      sh.style.opacity = open ? 0 : (isF ? 0.6 : 0.25);
    });
    dotEls.forEach((d, i) => d.classList.toggle('on', i === focus));

    $('#info-kicker').textContent = 'Section ' + s.num + ' · ' + s.chapters.length + ' chapters';
    $('#info-ta').textContent = s.taBook;
    $('#info-en').textContent = s.en + ' · Kurals ' + s.kurals;
    $('#open-chip').textContent = 'Section ' + s.num + ' · ' + s.en;
    $('#resume-label').textContent = resumeInfo(s).label;
    $('#open-section').setAttribute('aria-label', 'Open Section ' + s.num + ', ' + s.en);
    tilt();
  }

  function tilt() {
    const { focus, open, tx, ty, pressed } = state;
    books.forEach((b, i) => {
      const isF = i === focus;
      const m = isF ? (open ? 0.5 : 1) : 0;
      b.querySelector('.tilt').style.transform =
        'rotateY(' + (tx * 16 * m).toFixed(2) + 'deg) rotateX(' + (-ty * 12 * m).toFixed(2) + 'deg) scale(' + (isF && pressed && !open ? 0.95 : 1) + ')';
      const lift = isF && !open;
      b.querySelector('.front .pat').style.transform = lift ? 'translate(' + (-tx * 7).toFixed(1) + 'px,' + (-ty * 7).toFixed(1) + 'px)' : 'none';
      b.querySelector('.title').style.transform = lift ? 'translate(' + (tx * 5).toFixed(1) + 'px,' + (ty * 5).toFixed(1) + 'px)' : 'none';
      b.querySelector('.glare').style.background =
        'radial-gradient(circle at ' + (50 + tx * 45).toFixed(0) + '% ' + (30 + ty * 40).toFixed(0) + '%, rgba(255,255,255,0.36), rgba(255,255,255,0) 58%)';
    });
    const sh = shadows[focus];
    if (sh && !open) sh.style.transform = 'translateX(0px) scale(' + (1 + ty * 0.06).toFixed(3) + ')';
  }

  // Pointer tilt
  const stage = $('#stage');
  let tiltRaf = 0, pending = null;
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    pending = {
      tx: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)),
      ty: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
    };
    if (!tiltRaf) tiltRaf = requestAnimationFrame(() => { tiltRaf = 0; Object.assign(state, pending); tilt(); });
  });
  stage.addEventListener('pointerleave', () => { state.tx = 0; state.ty = 0; state.pressed = false; tilt(); });
  stage.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.book');
    if (b && +b.dataset.i === state.focus && !state.open) { state.pressed = true; tilt(); }
  });
  window.addEventListener('pointerup', () => { if (state.pressed) { state.pressed = false; tilt(); } });

  function openSection() {
    state.open = true; state.pressed = false; layout();
    centerCard($('.ch-card.on'));
    setTimeout(() => { const c = $('.ch-card.on') || $('.ch-card'); if (c) c.focus({ preventScroll: true }); }, 500);
  }
  function closeSection() { state.open = false; state.tx = 0; state.ty = 0; layout(); books[state.focus].focus({ preventScroll: true }); }
  $('#open-section').addEventListener('click', openSection);
  $('#close-section').addEventListener('click', closeSection);

  document.addEventListener('keydown', (e) => {
    if (R.open || !SECTIONS.length) return;
    if (!state.open && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const n = Math.max(0, Math.min(2, state.focus + (e.key === 'ArrowRight' ? 1 : -1)));
      if (n !== state.focus) { state.focus = n; layout(); renderChapters(); books[n].focus({ preventScroll: true }); }
    } else if (state.open && e.key === 'Escape') closeSection();
  });

  /* ---------- Chapters ---------- */
  function renderChapters() {
    const s = SECTIONS[state.focus];
    const last = lastChapter[s.id];
    $('#ch-row').innerHTML = s.chapters.map((c, j) => {
      const read = chapterRead(c), total = c.end - c.start + 1;
      return '<div class="ch-wrap" style="--d:' + (0.3 + Math.min(j, 8) * 0.05).toFixed(2) + 's">' +
        '<button type="button" class="ch-card" data-j="' + j + '" aria-label="Chapter ' + c.n + ', ' + esc(c.en) + '">' +
          '<img src="' + art(c.n) + '" alt="" loading="lazy" style="object-position:' + ((c.n * 13) % 100) + '% 50%">' +
          '<span class="scrim" aria-hidden="true"></span>' +
          '<span class="ch-top"><span class="ch-n">' + c.n + '</span>' + (last === c.n ? '<span class="ch-pill">Reading</span>' : '') + '</span>' +
          '<span class="ch-bottom"><span class="ch-ta" lang="ta">' + esc(c.ta) + '</span><span class="bar" aria-hidden="true"><span style="width:' + Math.round(read / total * 100) + '%"></span></span></span>' +
          '<span class="ch-glare" aria-hidden="true"></span>' +
        '</button>' +
      '</div>';
    }).join('');
    const lastIdx = last ? s.chapters.findIndex((c) => c.n === last) : -1;
    hoverChapter(lastIdx >= 0 ? lastIdx : state.hov[state.focus]);
  }

  function hoverChapter(j) {
    const s = SECTIONS[state.focus];
    const c = s.chapters[j] || s.chapters[0];
    state.hov[state.focus] = j;
    document.querySelectorAll('.ch-card').forEach((el) => el.classList.toggle('on', +el.dataset.j === j));
    const read = chapterRead(c), total = c.end - c.start + 1;
    $('#ch-kicker').textContent = 'Chapter ' + c.n + ' · ' + (read === total ? 'All ' + total + ' read' : read > 0 ? read + ' of ' + total + ' read' : total + ' kurals');
    $('#ch-ta').textContent = c.ta;
    $('#ch-en').textContent = c.en;
  }

  const row = $('#ch-row');
  function centerCard(card) {
    if (!card) return;
    const wrap = card.parentElement;
    row.scrollLeft = Math.max(0, wrap.offsetLeft - (row.clientWidth - wrap.offsetWidth) / 2);
  }
  // Keep the frame itself from ever scrolling when something inside takes focus.
  phone.addEventListener('scroll', () => { phone.scrollLeft = 0; phone.scrollTop = 0; });
  row.addEventListener('pointerover', (e) => { const c = e.target.closest('.ch-card'); if (c && +c.dataset.j !== state.hov[state.focus]) hoverChapter(+c.dataset.j); });
  row.addEventListener('focusin', (e) => { const c = e.target.closest('.ch-card'); if (c) hoverChapter(+c.dataset.j); });
  row.addEventListener('click', (e) => {
    const c = e.target.closest('.ch-card');
    if (c) openReader(SECTIONS[state.focus].chapters[+c.dataset.j].n, 0);
  });
  $('#resume').addEventListener('click', () => {
    const s = SECTIONS[state.focus];
    const info = resumeInfo(s);
    const c = s.chapters.find((x) => x.n === info.chapter);
    let start = 0;
    if (c && lastChapter[s.id]) { for (let k = c.start; k <= c.end; k++) { if (!readSet.has(k)) { start = k - c.start; break; } } }
    openReader(info.chapter, start);
  });

  /* ---------- Reader ---------- */
  const reader = $('#reader');
  const track = $('#r-track');
  const rStage = $('#r-stage');
  const sheet = $('#sheet');
  onFit = () => {
    const n = track.children.length;
    if (!n) return;
    track.style.height = n * PAGE_H + 'px';
    track.style.transform = 'translateY(' + (-R.idx * PAGE_H) + 'px)';
  };
  const R = { open: false, ch: null, idx: 0, sel: null, study: false, playing: false, wheelLock: false };
  const chapterCache = new Map();

  async function loadChapter(n) {
    if (chapterCache.has(n)) return chapterCache.get(n);
    const res = await fetch('data/chapters/' + pad(n) + '.json');
    if (!res.ok) throw new Error('Chapter ' + n + ' did not load');
    const ch = await res.json();
    chapterCache.set(n, ch);
    return ch;
  }

  async function openReader(chNum, startIdx) {
    let ch;
    try { ch = await loadChapter(chNum); } catch (e) { toast('This chapter did not load. Check your connection and try again.'); return; }
    const sIdx = SECTIONS.findIndex((s) => s.id === ch.section);
    if (sIdx !== state.focus) { state.focus = sIdx; layout(); renderChapters(); }
    if (!state.open) { state.open = true; layout(); }
    const s = SECTIONS[sIdx];
    lastChapter[s.id] = chNum;
    store.set('last', lastChapter);
    R.ch = ch; R.sel = null; R.playing = false;
    root.style.setProperty('--ground', s.ground);
    buildReader(s);
    setIdx(Math.max(0, Math.min(ch.kurals.length - 1, startIdx || 0)));
    reader.classList.remove('out');
    reader.setAttribute('aria-hidden', 'false');
    R.open = true;
    requestAnimationFrame(() => reader.classList.add('in'));
    setTimeout(() => $('#r-back').focus({ preventScroll: true }), 300);
  }

  function closeReader(finished) {
    if (!R.open) return;
    R.open = false;
    closeSheet();
    if (finished) reader.classList.add('out');
    reader.classList.remove('in');
    reader.setAttribute('aria-hidden', 'true');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    renderChapters();
    layout();
    const card = $('.ch-card.on');
    centerCard(card);
    setTimeout(() => { reader.classList.remove('out'); if (card) card.focus({ preventScroll: true }); }, 450);
  }

  function buildReader(s) {
    const ch = R.ch, n = ch.kurals.length;
    $('#r-ta').textContent = ch.ta;
    $('#r-sub').textContent = 'Chapter ' + ch.num + ' · ' + ch.en;
    $('#r-back').setAttribute('aria-label', 'Back to Section ' + s.num + ', ' + s.en);
    $('#pull-hint').textContent = 'Release to return to ' + s.en;
    track.innerHTML = ch.kurals.map((k, i) =>
      '<section class="page" data-i="' + i + '" aria-label="Kural ' + k.n + '">' +
        '<img class="bg" src="' + art(ch.num) + '" alt="" draggable="false" style="object-position:' + ((i * 11) % 100) + '% 50%">' +
        '<div class="scrim" aria-hidden="true"></div>' +
        '<div class="page-text">' +
          '<span class="kicker">Kural ' + k.n + ' · ' + (i + 1) + ' of ' + n + '</span>' +
          '<div class="couplet" lang="ta" role="group" aria-label="Kural text. Tap a word for its meaning.">' +
            k.l.map((line, li) => '<div class="line">' + line.map((w, ti) =>
              '<span class="w"><button type="button" class="word" data-key="' + li + '-' + ti + '" aria-label="' + esc(w[0]) + (w[1] ? ', ' + esc(w[1]) : '') + '">' + esc(w[0]) + '</button>' +
              '<span class="gloss" lang="en">' + (w[1] ? '<span class="g-tr">' + esc(w[1]) + '</span>' : '') + (w[2] ? '<span class="g-en">' + esc(w[2]) + '</span>' : '') + '</span></span>'
            ).join('') + '</div>').join('') +
          '</div>' +
          '<p class="translit">' + esc(k.tr) + '</p>' +
          '<p class="meaning">' + esc(k.m) + '</p>' +
        '</div>' +
      '</section>').join('');
    track.style.height = n * PAGE_H + 'px';
    $('#r-dots').innerHTML = ch.kurals.map((k, i) =>
      '<button type="button" data-i="' + i + '" class="' + (readSet.has(k.n) ? 'read' : '') + '" aria-label="Kural ' + k.n + '"><span></span></button>').join('');
  }

  function markRead(n) {
    if (readSet.has(n)) return;
    readSet.add(n);
    store.set('read', [...readSet]);
    const dot = $('#r-dots').querySelector('button[data-i="' + R.idx + '"]');
    if (dot) dot.classList.add('read');
  }

  function setIdx(i) {
    const ch = R.ch, n = ch.kurals.length;
    R.idx = i; R.sel = null;
    track.classList.remove('dragging');
    track.style.transform = 'translateY(' + (-i * PAGE_H) + 'px)';
    track.querySelectorAll('.page').forEach((p, j) => {
      const on = j === i;
      p.classList.toggle('active', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) p.removeAttribute('inert'); else p.setAttribute('inert', '');
    });
    track.querySelectorAll('.word.on').forEach((w) => w.classList.remove('on'));
    $('#r-dots').querySelectorAll('button').forEach((b, j) => {
      b.classList.toggle('cur', j === i);
      if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    $('#r-next-label').textContent = i < n - 1 ? 'Kural ' + ch.kurals[i + 1].n : 'Finish chapter';
    $('#pull-hint').style.opacity = 0;
    closeSheet();
    setPlaying(false);
    syncSave();
    markRead(ch.kurals[i].n);
    history.replaceState(null, '', '#kural-' + ch.kurals[i].n);
  }

  function go(i) {
    const n = R.ch.kurals.length;
    if (i > n - 1) { closeReader(true); return; }
    setIdx(Math.max(0, i));
  }

  // Drag to change kural
  let drag = null, suppressClick = false;
  rStage.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    drag = { y: e.clientY, t: performance.now(), id: e.pointerId, cap: false };
  });
  rStage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dy = (e.clientY - drag.y) / scale;
    if (!drag.cap) {
      if (Math.abs(dy) < 6) return;
      drag.cap = true;
      try { rStage.setPointerCapture(drag.id); } catch (err) { /* ignore */ }
      track.classList.add('dragging');
      rStage.classList.add('dragging');
      closeSheet();
    }
    const n = R.ch.kurals.length;
    let d = dy;
    if (R.idx === 0 && d > 0) d *= 0.35;
    if (R.idx === n - 1 && d < 0) { d *= 0.45; $('#pull-hint').style.opacity = Math.min(1, -dy / 100); }
    track.style.transform = 'translateY(' + (-R.idx * PAGE_H + d).toFixed(1) + 'px)';
  });
  function endDrag(e) {
    const g = drag; drag = null;
    if (!g || !g.cap) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    rStage.classList.remove('dragging');
    const dy = (e.clientY - g.y) / scale;
    const v = dy / Math.max(1, performance.now() - g.t);
    let i = R.idx;
    if (dy < -90 || v < -0.5) i += 1; else if (dy > 90 || v > 0.5) i -= 1;
    go(i);
  }
  rStage.addEventListener('pointerup', endDrag);
  rStage.addEventListener('pointercancel', endDrag);

  rStage.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (R.wheelLock || Math.abs(e.deltaY) < 30) return;
    R.wheelLock = true;
    setTimeout(() => { R.wheelLock = false; }, 650);
    go(R.idx + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (!R.open) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(R.idx + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(R.idx - 1); }
    else if (e.key === 'Escape') { if (sheet.classList.contains('open')) closeSheet(); else closeReader(false); }
  });

  // Tap a word
  track.addEventListener('click', (e) => {
    const w = e.target.closest('.word');
    if (!w || suppressClick) return;
    const key = w.dataset.key;
    if (R.sel === key) { closeSheet(); return; }
    selectWord(key);
  });

  function wordKeys() {
    const out = [];
    R.ch.kurals[R.idx].l.forEach((line, li) => line.forEach((w, ti) => out.push(li + '-' + ti)));
    return out;
  }
  function selectWord(key) {
    const k = R.ch.kurals[R.idx];
    const [li, ti] = key.split('-').map(Number);
    const w = k.l[li][ti];
    const keys = wordKeys(), pos = keys.indexOf(key);
    R.sel = key;
    track.querySelector('.page.active').querySelectorAll('.word').forEach((el) => el.classList.toggle('on', el.dataset.key === key));
    $('#s-pos').textContent = 'Word ' + (pos + 1) + ' of ' + keys.length;
    $('#s-ta').textContent = w[0];
    $('#s-tr').textContent = w[1] || '';
    const gloss = $('#s-gloss');
    gloss.textContent = w[2] || 'Word meanings for this kural are coming soon.';
    gloss.classList.toggle('pending', !w[2]);
    $('#s-prev').disabled = pos === 0;
    $('#s-next').disabled = pos === keys.length - 1;
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
  }
  function closeSheet() {
    R.sel = null;
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    track.querySelectorAll('.word.on').forEach((el) => el.classList.remove('on'));
  }
  $('#s-close').addEventListener('click', closeSheet);
  $('#s-prev').addEventListener('click', () => { const k = wordKeys(), p = k.indexOf(R.sel); if (p > 0) selectWord(k[p - 1]); });
  $('#s-next').addEventListener('click', () => { const k = wordKeys(), p = k.indexOf(R.sel); if (p < k.length - 1) selectWord(k[p + 1]); });

  $('#r-dots').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); });
  $('#r-next').addEventListener('click', () => go(R.idx + 1));
  $('#r-back').addEventListener('click', () => closeReader(false));

  const study = $('#r-study');
  study.addEventListener('click', () => {
    R.study = !R.study;
    reader.classList.toggle('study', R.study);
    study.setAttribute('aria-pressed', String(R.study));
  });

  function syncSave() {
    const n = R.ch.kurals[R.idx].n;
    $('#r-save').setAttribute('aria-pressed', String(savedSet.has(n)));
  }
  $('#r-save').addEventListener('click', () => {
    const n = R.ch.kurals[R.idx].n;
    if (savedSet.has(n)) savedSet.delete(n); else { savedSet.add(n); toast('Kural ' + n + ' saved'); }
    store.set('saved', [...savedSet]);
    syncSave();
  });

  let audioToasted = false;
  function setPlaying(on) {
    R.playing = on;
    const btn = $('#r-play');
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-label', on ? 'Pause' : 'Listen');
    $('#r-play-icon').setAttribute('d', on ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'M7 4.5v15l12-7.5z');
  }
  $('#r-play').addEventListener('click', () => {
    setPlaying(!R.playing);
    if (R.playing && !audioToasted) { audioToasted = true; toast('Audio recitation is not recorded yet.'); }
  });

  $('#r-share').addEventListener('click', async () => {
    const k = R.ch.kurals[R.idx];
    const url = location.origin + location.pathname + '#kural-' + k.n;
    const text = 'Kural ' + k.n + '\n' + k.l.map((line) => line.map((w) => w[0]).join(' ')).join('\n') + '\n\n' + k.m;
    try {
      if (navigator.share) { await navigator.share({ text, url }); return; }
      await navigator.clipboard.writeText(text + '\n' + url);
      toast('Kural and link copied');
    } catch (err) {
      if (err && err.name !== 'AbortError') toast('Sharing is not available here.');
    }
  });

  /* ---------- Deep links: #kural-391 ---------- */
  function openFromHash() {
    const m = /^#kural-(\d{1,4})$/.exec(location.hash);
    if (!m) return;
    const kn = +m[1];
    for (const s of SECTIONS) {
      const c = s.chapters.find((x) => kn >= x.start && kn <= x.end);
      if (c) { openReader(c.n, kn - c.start); return; }
    }
  }

  /* ---------- Start ---------- */
  async function start() {
    let index;
    try {
      const res = await fetch('data/index.json');
      index = await res.json();
    } catch (e) {
      $('#info-en').textContent = 'The kurals did not load. Open this page from a web server, not as a file.';
      return;
    }
    SECTIONS = index.sections.map((s) => {
      const first = s.chapters[0], lastC = s.chapters[s.chapters.length - 1];
      return Object.assign({}, s, CFG.sections[s.id], {
        range: first.n + '–' + lastC.n,
        kurals: first.start + '–' + lastC.end
      });
    });
    buildShelf();
    layout();
    renderChapters();
    phone.classList.add('ready');
    openFromHash();
  }
  window.addEventListener('hashchange', () => { if (!R.open) openFromHash(); });
  start();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
  }
})();
