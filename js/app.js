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

  // When a section is open, its book shrinks into the top right, beside the section title
  function openBookPos() {
    const W = phone.offsetWidth, scale = 0.3;
    const to = parseFloat(phone.style.getPropertyValue('--to')) || 0;
    const dx = (W - 24 - 95 * scale) - W / 2;
    const dy = (112 + to + 138 * scale) - (stage.offsetTop + 90 + 138);
    return 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0px) rotateX(0deg) rotateY(-14deg) scale(' + scale + ')';
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
        pos = isF ? openBookPos()
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
      cover.style.transform = 'translateZ(15.5px) rotateY(0deg)';
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
    $('#sec-kicker').textContent = s.chapters.length + ' chapters · ' + s.parts.length + (s.parts.length === 1 ? ' part' : ' parts');
    $('#sec-ta').textContent = s.taBook;
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
    showCurrentCard();
    setTimeout(() => { const c = $('.ch-card.cur') || $('.ch-card'); if (c) c.focus({ preventScroll: true }); }, 500);
  }
  function closeSection() { state.open = false; state.tx = 0; state.ty = 0; layout(); books[state.focus].focus({ preventScroll: true }); }
  $('#open-section').addEventListener('click', openSection);
  $('#close-section').addEventListener('click', closeSection);

  document.addEventListener('keydown', (e) => {
    if (R.open || !SECTIONS.length || view !== 'home') return;
    if (!state.open && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const n = Math.max(0, Math.min(2, state.focus + (e.key === 'ArrowRight' ? 1 : -1)));
      if (n !== state.focus) { state.focus = n; layout(); renderChapters(); books[n].focus({ preventScroll: true }); }
    } else if (state.open && e.key === 'Escape') closeSection();
  });

  /* ---------- Chapters, grouped by the section's parts ---------- */
  const partOf = (s, n) => Math.max(0, s.parts.findIndex((p) => n >= p.first && n <= p.last));
  const chosenPart = {};
  const scroller = $('#ch-scroll');

  function renderChapters() {
    const s = SECTIONS[state.focus];
    const last = lastChapter[s.id];
    if (chosenPart[s.id] == null) chosenPart[s.id] = last ? partOf(s, last) : 0;
    const pi = chosenPart[s.id];
    $('#parts').innerHTML = s.parts.map((p, i) => {
      const n = p.last - p.first + 1;
      return '<button type="button" class="part" role="tab" data-p="' + i + '" aria-selected="' + (i === pi) + '" aria-controls="ch-grid">' +
        '<span class="p-ta" lang="ta">' + esc(p.ta) + '</span>' +
        '<span class="p-en">' + esc(p.en) + ' · ' + n + '</span></button>';
    }).join('');
    const part = s.parts[pi];
    const list = s.chapters.filter((c) => c.n >= part.first && c.n <= part.last);
    $('#ch-grid').innerHTML = list.map((c, j) => {
      const read = chapterRead(c), total = c.end - c.start + 1;
      const pos = 'object-position:' + ((c.n * 13) % 100) + '% 50%';
      const status = read === total ? 'all ' + total + ' read' : read > 0 ? read + ' of ' + total + ' read' : total + ' kurals';
      return '<div class="ch-wrap" style="--d:' + (0.08 + Math.min(j, 8) * 0.04).toFixed(2) + 's">' +
        '<button type="button" class="ch-card' + (last === c.n ? ' cur' : '') + '" data-n="' + c.n + '" aria-label="Chapter ' + c.n + ', ' + esc(c.en) + ', ' + status + '">' +
          '<img src="' + art(c.n) + '" alt="" loading="lazy" style="' + pos + '">' +
          '<img class="soft" src="' + art(c.n) + '" alt="" aria-hidden="true" loading="lazy" style="' + pos + '">' +
          '<span class="scrim" aria-hidden="true"></span>' +
          '<span class="ch-top"><span class="ch-n">' + c.n + '</span>' + (last === c.n ? '<span class="ch-pill">Reading</span>' : '') + '</span>' +
          '<span class="ch-bottom"><span class="ch-ta" lang="ta">' + esc(c.ta) + '</span><span class="ch-en">' + esc(c.en) + '</span>' +
          '<span class="bar" aria-hidden="true"><span style="width:' + Math.round(read / total * 100) + '%"></span></span></span>' +
        '</button>' +
      '</div>';
    }).join('');
  }

  function showCurrentCard() {
    const tab = $('.part[aria-selected="true"]');
    if (tab) { const r = $('#parts'); r.scrollLeft = Math.max(0, tab.offsetLeft - 24); }
    const card = $('.ch-card.cur');
    scroller.scrollTop = card ? Math.max(0, card.parentElement.offsetTop - 12) : 0;
  }

  // Keep the frame itself from ever scrolling when something inside takes focus.
  phone.addEventListener('scroll', () => { phone.scrollLeft = 0; phone.scrollTop = 0; });
  $('#parts').addEventListener('click', (e) => {
    const b = e.target.closest('.part');
    if (!b) return;
    chosenPart[SECTIONS[state.focus].id] = +b.dataset.p;
    renderChapters();
    scroller.scrollTop = 0;
    $('.part[aria-selected="true"]').focus({ preventScroll: true });
  });
  $('#ch-grid').addEventListener('click', (e) => {
    const c = e.target.closest('.ch-card');
    if (!c) return;
    const s = SECTIONS[state.focus];
    const ch = s.chapters.find((x) => x.n === +c.dataset.n);
    // Pick up at the first unread kural in a chapter already started
    let start = 0;
    const read = chapterRead(ch), total = ch.end - ch.start + 1;
    if (read > 0 && read < total) { for (let k = ch.start; k <= ch.end; k++) { if (!readSet.has(k)) { start = k - ch.start; break; } } }
    openReader(ch.n, start);
  });

  /* ---------- Reader: a deck of kural cards ----------
     Swipe sideways (or use arrow keys) between kurals. Scroll inside the top card and it
     expands to full screen to show what the kural means; scroll back to the top and it
     returns to a card. Swiping past the last kural closes the chapter. */
  const reader = $('#reader');
  const deck = $('#deck');
  const sheet = $('#sheet');
  const R = { from: 'home', prevOpen: false, open: false, ch: null, idx: 0, sel: null, study: false, playing: false, big: false, dx: 0, lock: false };
  const chapterCache = new Map();
  let cards = [];
  onFit = () => { if (R.open) layoutDeck(); };

  const darken = (hex, d) => {
    const n = parseInt(hex.slice(1, 7), 16), f = (v) => Math.round(v * (1 - d));
    return [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)];
  };

  async function loadChapter(n) {
    if (chapterCache.has(n)) return chapterCache.get(n);
    const res = await fetch('data/chapters/' + pad(n) + '.json');
    if (!res.ok) throw new Error('Chapter ' + n + ' did not load');
    const ch = await res.json();
    chapterCache.set(n, ch);
    return ch;
  }

  async function openReader(chNum, startIdx, from) {
    let ch;
    try { ch = await loadChapter(chNum); } catch (e) { toast('This chapter did not load. Check your connection and try again.'); return; }
    R.from = from || 'home';
    R.prevOpen = state.open;
    R.prevFocus = state.focus;
    if (R.from === 'home' && view !== 'home') setView('home');
    const sIdx = SECTIONS.findIndex((s) => s.id === ch.section);
    chosenPart[ch.section] = partOf(SECTIONS[sIdx], chNum);
    if (sIdx !== state.focus) { state.focus = sIdx; layout(); renderChapters(); }
    if (!state.open && R.from === 'home') { state.open = true; layout(); }
    const s = SECTIONS[sIdx];
    lastChapter[s.id] = chNum;
    store.set('last', lastChapter);
    R.ch = ch; R.sel = null; R.playing = false; R.big = false; R.dx = 0;
    // Background: the card colour, darkened, so card and screen feel like one surface
    const g = darken(s.card, 0.78), sh = darken(s.card, 0.9);
    reader.style.setProperty('--r-ground', 'rgb(' + g.join(',') + ')');
    reader.style.setProperty('--r-shadow', 'rgba(' + sh.join(',') + ',0.55)');
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
    setBig(false);
    if (finished) reader.classList.add('out');
    reader.classList.remove('in');
    reader.setAttribute('aria-hidden', 'true');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    const last = R.ch.kurals[Math.min(R.idx, R.ch.kurals.length - 1)].n;
    if (R.from !== 'home') {
      // Back to Search or Saved, leaving the shelf as it was
      state.open = R.prevOpen; state.focus = R.prevFocus;
      renderChapters(); layout();
      if (R.from === 'saved') renderSaved();
      setTimeout(() => {
        reader.classList.remove('out');
        const b = $('#' + (R.from === 'saved' ? 'saved-list' : 'search-results') + ' .result[data-n="' + last + '"]');
        if (b) b.focus({ preventScroll: false });
      }, 450);
      return;
    }
    const n = R.ch.num;
    renderChapters();
    layout();
    const card = $('.ch-card[data-n="' + n + '"]');
    if (card) scroller.scrollTop = Math.max(0, card.parentElement.offsetTop - 12);
    setTimeout(() => { reader.classList.remove('out'); if (card) card.focus({ preventScroll: true }); }, 450);
  }

  function buildReader(s) {
    const ch = R.ch;
    const backTo = R.from === 'search' ? 'Search' : R.from === 'saved' ? 'Saved' : null;
    $('#r-ta').textContent = ch.ta;
    $('#r-sub').textContent = 'Chapter ' + ch.num + ' · ' + ch.en;
    $('#r-back').setAttribute('aria-label', backTo ? 'Back to ' + backTo : 'Back to Section ' + s.num + ', ' + s.en);
    $('#r-end-ta').textContent = ch.ta;
    $('#r-end-en').textContent = backTo ? 'Returning to ' + backTo : 'Returning to ' + s.en;
    deck.innerHTML = ch.kurals.map((k, i) =>
      '<article class="kcard' + (k.u ? '' : ' no-more') + '" data-i="' + i + '" aria-label="Kural ' + k.n + '">' +
        '<div class="k-scroll">' +
          '<div class="k-img"><img src="' + art(ch.num) + '" alt="" draggable="false" style="object-position:' + ((i * 11) % 100) + '% 40%"></div>' +
          '<div class="k-body">' +
            '<span class="kicker">Kural ' + k.n + '</span>' +
            '<div class="couplet" lang="ta" role="group" aria-label="Kural text. Tap a word for its meaning.">' +
              k.l.map((line, li) => '<div class="line">' + line.map((w, ti) =>
                '<span class="w"><button type="button" class="word" data-key="' + li + '-' + ti + '" aria-label="' + esc(w[0]) + (w[1] ? ', ' + esc(w[1]) : '') + '">' + esc(w[0]) + '</button>' +
                '<span class="gloss" lang="en">' + (w[1] ? '<span class="g-tr">' + esc(w[1]) + '</span>' : '') + (w[2] ? '<span class="g-en">' + esc(w[2]) + '</span>' : '') + '</span></span>'
              ).join('') + '</div>').join('') +
            '</div>' +
            '<p class="translit">' + esc(k.tr) + '</p>' +
            '<p class="meaning">' + esc(k.m) + '</p>' +
          '</div>' +
          (k.u ? '<section class="k-more" aria-label="What it means">' +
            '<div class="k-rule" aria-hidden="true"></div>' +
            '<h3>What it means <span lang="ta">பொருள்</span></h3>' +
            '<p class="k-explain" lang="ta">' + esc(k.u) + '</p>' +
            '<span class="k-credit">Commentary by Mu. Varadarasanar (<span lang="ta">மு. வரதராசனார்</span>)</span>' +
          '</section>' : '') +
        '</div>' +
        '<button type="button" class="k-grab" aria-label="Back to card"><span></span></button>' +
        '<div class="k-hint" aria-hidden="true"><span>What it means <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></div>' +
      '</article>').join('');
    cards = [...deck.children];
    cards.forEach((c) => {
      const sc = c.querySelector('.k-scroll');
      sc.addEventListener('scroll', () => onCardScroll(c, sc), { passive: true });
      sc.addEventListener('wheel', (e) => { if (R.big && c.classList.contains('top') && sc.scrollTop <= 0 && e.deltaY < -4) setBig(false); }, { passive: true });
      let ty = 0;
      sc.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
      sc.addEventListener('touchmove', (e) => { if (R.big && sc.scrollTop <= 0 && e.touches[0].clientY - ty > 40) setBig(false); }, { passive: true });
      c.querySelector('.k-grab').addEventListener('click', () => { sc.scrollTo({ top: 0, behavior: 'smooth' }); setBig(false); });
    });
  }

  function onCardScroll(c, sc) {
    if (!c.classList.contains('top')) return;
    const st = sc.scrollTop;
    c.classList.toggle('scrolled', st > 24);
    if (!R.big && st > 8) setBig(true);
    else if (R.big && st <= 0) setBig(false);
  }

  function setBig(on) {
    R.big = on;
    reader.classList.toggle('expanded', on);
    const c = cards[R.idx];
    if (c) c.classList.toggle('big', on);
    if (on) closeSheet();
  }

  // Position every card: the top card, the two waiting behind it, and the ones already swiped away
  function layoutDeck() {
    const n = cards.length, idx = R.idx, dx = R.dx;
    const fwd = dx < 0 ? Math.min(-dx / 220, 1) : 0;
    const back = dx > 0 && idx > 0 ? Math.min(dx / 260, 1) : 0;
    cards.forEach((c, i) => {
      const rel = i - idx;
      let t, op = 1, z;
      if (rel < -1) { t = 'translateX(-470px) rotate(-14deg)'; op = 0; }
      else if (rel === -1) { const x = -470 + 470 * back; t = 'translateX(' + x.toFixed(1) + 'px) rotate(' + (-14 + 14 * back).toFixed(2) + 'deg)'; op = back > 0 ? 1 : 0; }
      else if (rel === 0) {
        if (dx < 0 || idx === 0) { const d = idx === 0 && dx > 0 ? dx * 0.3 : dx; t = 'translateX(' + d.toFixed(1) + 'px) rotate(' + (d / 20).toFixed(2) + 'deg)'; }
        else t = 'translateY(' + (16 * back).toFixed(1) + 'px) scale(' + (1 - 0.06 * back).toFixed(3) + ')';
      } else if (rel === 1) t = 'translateY(' + (16 - 16 * fwd).toFixed(1) + 'px) scale(' + (0.94 + 0.06 * fwd).toFixed(3) + ')';
      else if (rel === 2) { t = 'translateY(' + (30 - 14 * fwd).toFixed(1) + 'px) scale(' + (0.88 + 0.06 * fwd).toFixed(3) + ')'; op = 0.7 + 0.3 * fwd; }
      else { t = 'translateY(40px) scale(0.84)'; op = 0; }
      z = rel < 0 ? 60 + rel : 50 - rel;
      c.style.transform = t;
      c.style.opacity = op;
      c.style.zIndex = z;
      c.style.visibility = op === 0 && rel !== -1 ? 'hidden' : 'visible';
      const on = rel === 0;
      c.classList.toggle('top', on);
      c.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) c.removeAttribute('inert'); else c.setAttribute('inert', '');
    });
    const pull = idx === n - 1 && dx < 0 ? Math.min(1, -dx / 160) : 0;
    $('#r-end').style.opacity = idx >= n ? 1 : pull;
  }

  function markRead(n) {
    if (readSet.has(n)) return;
    readSet.add(n);
    store.set('read', [...readSet]);
  }

  function setIdx(i) {
    const ch = R.ch, n = ch.kurals.length;
    if (R.big) setBig(false);
    cards.forEach((c) => c.classList.remove('big'));
    R.idx = i; R.sel = null; R.dx = 0;
    deck.classList.remove('dragging');
    layoutDeck();
    deck.querySelectorAll('.word.on').forEach((w) => w.classList.remove('on'));
    $('#r-count').textContent = (i + 1) + ' / ' + n;
    $('#r-progress').style.width = ((i + 1) / n * 100) + '%';
    closeSheet();
    setPlaying(false);
    syncSave();
    markRead(ch.kurals[i].n);
    history.replaceState(null, '', '#kural-' + ch.kurals[i].n);
  }

  function go(i) {
    const n = R.ch.kurals.length;
    if (i > n - 1) {
      // Past the last kural: show "Chapter complete", then return
      R.idx = n; R.dx = 0; layoutDeck();
      setTimeout(() => closeReader(true), 650);
      return;
    }
    setIdx(Math.max(0, i));
  }

  // Drag sideways to change kural; vertical movement is left to the card's own scrolling
  let drag = null, suppressClick = false;
  deck.addEventListener('pointerdown', (e) => {
    if ((e.button !== undefined && e.button !== 0) || R.big || R.idx >= R.ch.kurals.length) return;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, cap: false };
  });
  deck.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) / scale, dy = (e.clientY - drag.y) / scale;
    if (!drag.cap) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 10) drag = null; return; }
      drag.cap = true;
      try { deck.setPointerCapture(drag.id); } catch (err) { /* ignore */ }
      deck.classList.add('dragging');
      closeSheet();
    }
    R.dx = dx;
    layoutDeck();
  });
  function endDrag(e) {
    const g = drag; drag = null;
    if (!g || !g.cap) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    deck.classList.remove('dragging');
    const dx = (e.clientX - g.x) / scale;
    const v = dx / Math.max(1, performance.now() - g.t);
    R.dx = 0;
    let i = R.idx;
    if (dx < -80 || v < -0.5) i += 1; else if (dx > 80 || v > 0.5) i -= 1;
    if (i === R.idx) layoutDeck(); else go(i);
  }
  deck.addEventListener('pointerup', endDrag);
  deck.addEventListener('pointercancel', endDrag);

  // Trackpad sideways swipe
  deck.addEventListener('wheel', (e) => {
    if (R.big || Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 30 || R.lock) return;
    R.lock = true;
    setTimeout(() => { R.lock = false; }, 650);
    go(R.idx + (e.deltaX > 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (!R.open) return;
    if (e.key === 'ArrowRight' || (e.key === 'ArrowDown' && !R.big && e.target === document.body)) { e.preventDefault(); go(R.idx + 1); }
    else if (e.key === 'ArrowLeft' || (e.key === 'ArrowUp' && !R.big && e.target === document.body)) { e.preventDefault(); go(R.idx - 1); }
    else if (e.key === 'Escape') { if (sheet.classList.contains('open')) closeSheet(); else if (R.big) setBig(false); else closeReader(false); }
  });

  // Tap a word
  deck.addEventListener('click', (e) => {
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
    cards[R.idx].querySelectorAll('.word').forEach((el) => el.classList.toggle('on', el.dataset.key === key));
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
    deck.querySelectorAll('.word.on').forEach((el) => el.classList.remove('on'));
  }
  $('#s-close').addEventListener('click', closeSheet);
  $('#s-prev').addEventListener('click', () => { const k = wordKeys(), p = k.indexOf(R.sel); if (p > 0) selectWord(k[p - 1]); });
  $('#s-next').addEventListener('click', () => { const k = wordKeys(), p = k.indexOf(R.sel); if (p < k.length - 1) selectWord(k[p + 1]); });

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
    $('#r-play').setAttribute('aria-label', on ? 'Pause' : 'Listen');
    $('#r-play-label').textContent = on ? 'Pause' : 'Listen';
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

  /* ---------- Views: Thirukkural, Saved, Search ---------- */
  let view = 'home';
  const tabHome = $('#tab-home'), tabSaved = $('#tab-saved'), tabSearch = $('#tab-search');
  const searchView = $('#search-view'), savedView = $('#saved-view');
  const titles = () => {
    const t = {};
    SECTIONS.forEach((s) => s.chapters.forEach((c) => { t[c.n] = c.en; }));
    return t;
  };

  function setView(v) {
    view = v;
    phone.dataset.view = v;
    [[searchView, 'search'], [savedView, 'saved']].forEach(([el, name]) => {
      const on = v === name;
      el.classList.toggle('on', on);
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) el.removeAttribute('inert'); else el.setAttribute('inert', '');
    });
    [[tabHome, 'home'], [tabSaved, 'saved']].forEach(([b, name]) => {
      b.classList.toggle('active', v === name);
      if (v === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    tabSearch.classList.toggle('active', v === 'search');
    if (v === 'search') tabSearch.setAttribute('aria-current', 'page'); else tabSearch.removeAttribute('aria-current');
    if (v === 'saved') renderSaved();
  }

  tabHome.addEventListener('click', () => {
    if (view === 'home' && state.open) closeSection();
    setView('home');
  });
  tabSaved.addEventListener('click', () => { setView('saved'); savedView.scrollTop = 0; });
  tabSearch.addEventListener('click', () => {
    setView('search');
    KuralSearch.load(titles()).catch(() => {});
    setTimeout(() => { if (!$('#search-results').children.length) $('#q').focus({ preventScroll: true }); }, 350);
  });
  $('#saved-find').addEventListener('click', () => tabSearch.click());

  function resultCard(k, i, chapterName) {
    return '<li><button type="button" class="result" data-n="' + k.n + '" style="--d:' + (Math.min(i, 8) * 0.05).toFixed(2) + 's">' +
      '<span class="r-meta">Kural ' + k.n + ' · ' + esc(chapterName) + '</span>' +
      '<span class="r-ta" lang="ta">' + esc(k.ta) + '</span>' +
      '<span class="r-m">' + esc(k.m) + '</span>' +
    '</button></li>';
  }

  function openKural(n, from) {
    for (const s of SECTIONS) {
      const c = s.chapters.find((x) => n >= x.start && n <= x.end);
      if (c) { openReader(c.n, n - c.start, from); return; }
    }
  }
  [$('#search-results'), $('#saved-list')].forEach((list, i) => list.addEventListener('click', (e) => {
    const b = e.target.closest('.result');
    if (b) openKural(+b.dataset.n, i === 0 ? 'search' : 'saved');
  }));

  // Saved
  async function renderSaved() {
    const list = $('#saved-list'), empty = $('#saved-empty'), sub = $('#saved-sub');
    const nums = [...savedSet].reverse();
    sub.textContent = nums.length ? nums.length + (nums.length === 1 ? ' kural' : ' kurals') + ', newest first' : 'Kurals you save show up here.';
    empty.classList.toggle('on', !nums.length);
    if (!nums.length) { list.innerHTML = ''; return; }
    try { await KuralSearch.load(titles()); } catch (e) { list.innerHTML = ''; sub.textContent = 'Your saved kurals did not load. Check your connection.'; return; }
    const t = titles();
    list.innerHTML = nums.map((n, i) => { const k = KuralSearch.get(n); return k ? resultCard(k, i, t[k.c]) : ''; }).join('');
  }

  // Search
  const EXAMPLES = [
    'My manager criticised my work', 'I can’t control my anger', 'A friend let me down', 'I keep procrastinating',
    'Missing someone far away', 'I lost someone close to me', 'Should I quit my job?', 'Saving money'
  ];
  $('#search-chips').innerHTML = EXAMPLES.map((x) => '<button type="button" class="chip-btn">' + esc(x) + '</button>').join('');
  $('#search-chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip-btn');
    if (!b) return;
    $('#q').value = b.textContent;
    runSearch(true);
  });

  const qEl = $('#q');
  function growQ() { qEl.style.height = 'auto'; qEl.style.height = Math.min(140, qEl.scrollHeight) + 'px'; }
  let searchTimer = 0, lastQuery = '';
  async function runSearch(done) {
    const text = qEl.value.trim();
    growQ();
    if (done) qEl.blur();
    if (text === lastQuery && !done) return;
    lastQuery = text;
    const meta = $('#search-meta'), list = $('#search-results');
    $('#search-chips').hidden = !!text;
    if (!text) { meta.textContent = ''; list.innerHTML = ''; return; }
    try { await KuralSearch.load(titles()); } catch (e) { meta.textContent = 'Search did not load. Check your connection and try again.'; return; }
    if (text !== qEl.value.trim()) return;
    const r = KuralSearch.query(text, 12);
    if (!r.results.length) {
      meta.textContent = 'No kurals matched. Try describing it another way.';
      list.innerHTML = '';
      $('#search-chips').hidden = false;
      return;
    }
    meta.textContent = r.themes.length ? 'Kurals on ' + r.themes.join(', ').replace(/, ([^,]*)$/, ' and $1') : 'Kurals that mention your words';
    const t = titles();
    list.innerHTML = r.results.map((k, i) => resultCard(k, i, t[k.c])).join('');
  }
  qEl.addEventListener('input', () => {
    growQ();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(false), 350);
  });
  qEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); clearTimeout(searchTimer); runSearch(true); }
  });
  $('#search-form').addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(searchTimer); runSearch(true); });

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
    setView('home');
    phone.classList.add('ready');
    openFromHash();
  }
  window.addEventListener('hashchange', () => { if (!R.open) openFromHash(); });
  start();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
  }
})();
