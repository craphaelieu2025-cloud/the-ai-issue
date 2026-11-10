/* =========================================================
   THE AI ISSUE — interactions
   Everything runs in the browser. No libraries, no tracking.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth scroll for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Reading progress + active chapter in nav ---------- */
  var bar = document.querySelector('.progress span');
  var nav = document.querySelector('.nav');
  var cover = document.querySelector('.cover');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    if (nav && cover) nav.classList.toggle('is-solid', window.scrollY > cover.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = document.querySelectorAll('.nav__list a');
  if ('IntersectionObserver' in window) {
    var chapterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-current', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.chapter[id^="ch"]').forEach(function (s) { chapterObs.observe(s); });

    /* ---------- Reveal on scroll ---------- */
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Chapter 01: Data → Patterns → Predictions ---------- */
  var steps = document.querySelectorAll('.flow__step');
  var detail = document.getElementById('flow-detail');
  var flowCopy = document.getElementById('flow-copy');
  var flowLines = flowCopy ? Array.prototype.map.call(flowCopy.content.querySelectorAll('p'), function (p) { return p.textContent; }) : [];
  function setStep(i) {
    steps.forEach(function (s, n) {
      var on = n === i;
      s.classList.toggle('is-active', on);
      s.classList.toggle('is-done', n < i);
      s.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (detail && flowLines[i]) {
      detail.classList.remove('is-swap');
      void detail.offsetWidth; // restart the little fade
      detail.textContent = flowLines[i];
      detail.classList.add('is-swap');
    }
  }
  steps.forEach(function (s, i) { s.addEventListener('click', function () { setStep(i); }); });

  /* ---------- Chapter 02: flip cards ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('click', function () {
      var open = card.getAttribute('aria-expanded') === 'true';
      card.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ---------- Chapter 03: the Red Flag Files (accessible tabs) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.files__tabs [role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- Chapter 04: timeline filter ---------- */
  var chips = document.querySelectorAll('.chip');
  var items = document.querySelectorAll('.tl');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      items.forEach(function (it) {
        var show = f === 'all' || it.getAttribute('data-kind') === f;
        it.classList.toggle('is-dim', !show);
      });
    });
  });

  /* =========================================================
     COPY: quiz text lives here (counted in the word total)
     ========================================================= */
  var GUESS = [
    { clue: 'Won first prize at the 2022 Colorado State Fair art contest.',
      answer: 'ai', why: 'Jason Allen used Midjourney.',
      src: 'https://www.cbsnews.com/colorado/news/ai-created-art-exhibit-first-place-colorado-state-fair-causing-controversy-jason-allen/' },
    { clue: 'A “headless” flamingo that won a 2024 AI image prize.',
      answer: 'human', why: 'A real photo by Miles Astray.',
      src: 'https://petapixel.com/2024/06/12/photographer-disqualified-from-ai-image-contest-after-winning-with-real-photo/' },
    { clue: 'The Electrician, a 2023 Sony World Photography Award winner.',
      answer: 'ai', why: 'Boris Eldagsen used AI, then refused the prize.',
      src: 'https://www.cbsnews.com/news/artificial-intelligence-photo-competition-won-rejected-award-ai-boris-eldagsen-sony-world-photography-awards/' },
    { clue: 'The viral 2023 photo of Pope Francis in a puffer coat.',
      answer: 'ai', why: 'Made with Midjourney.',
      src: 'https://www.nbcnews.com/tech/pope-francis-ai-generated-images-fool-internet-rcna76838' }
  ];

  var STATUS_Q = [
    { q: 'Stuck on homework?', a: ['Ask AI', 'Check sources', 'Brainstorm', 'Go solo'] },
    { q: 'AI wrote your essay?', a: ['Paste', 'Fact-check', 'Remix', 'Rewrite'] },
    { q: 'Daily AI use?', a: ['Constant', 'Careful', 'Creative', 'Rare'] },
    { q: 'Dream feature?', a: ['Autopilot', 'Citations', 'Moodboards', 'Off switch'] },
    { q: 'AI in one word?', a: ['Lifesaver', 'Suspicious', 'Muse', 'Overrated'] }
  ];
  // answer index 0..3 maps to these types, in order
  var TYPES = ['power', 'skeptic', 'creative', 'minimal'];
  var RESULTS = {
    power:    { name: 'The AI Power User', head: 'Co-Pilot Included.',
                desc: 'AI runs your whole routine.',
                tip: 'Fact-check it, and keep some thinking yours.' },
    skeptic:  { name: 'The Cautious Skeptic', head: 'Trust Issues, Smart Ones.',
                desc: 'You question everything AI says.',
                tip: 'Try it for low-stakes tasks.' },
    creative: { name: 'The Creative Experimenter', head: 'Your Muse Has Wi-Fi.',
                desc: 'AI brainstorms; you create.',
                tip: 'Keep the final idea yours.' },
    minimal:  { name: 'The Digital Minimalist', head: 'Analog Is Couture.',
                desc: 'You’d rather think it through.',
                tip: 'Learn the basics, so AI never fools you.' }
  };
  /* ===================== END COPY ===================== */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- Feature A: AI or Human? ---------- */
  var guessRoot = document.getElementById('guess');
  var g = { i: 0, score: 0 };

  function renderGuess() {
    guessRoot.innerHTML = '';
    if (g.i >= GUESS.length) {
      var end = el('div', 'guess__end');
      end.appendChild(el('p', 'guess__score', g.score + '/' + GUESS.length));
      var again = el('button', 'btn btn--ghost', 'Replay');
      again.type = 'button';
      again.addEventListener('click', function () { g.i = 0; g.score = 0; renderGuess(); focusFirst(guessRoot); });
      end.appendChild(again);
      guessRoot.appendChild(end);
      return;
    }
    var item = GUESS[g.i];
    var card = el('div', 'exhibit');
    card.appendChild(el('span', 'exhibit__no type', (g.i + 1) + '/' + GUESS.length));
    card.appendChild(el('p', 'exhibit__clue', item.clue));
    var row = el('div', 'exhibit__choices');
    [['ai', 'AI'], ['human', 'Human']].forEach(function (opt) {
      var b = el('button', 'btn btn--choice', opt[1]);
      b.type = 'button';
      b.addEventListener('click', function () { b.classList.add('is-picked'); answerGuess(opt[0], card, row); });
      row.appendChild(b);
    });
    card.appendChild(row);
    guessRoot.appendChild(card);
  }

  function answerGuess(choice, card, row) {
    var item = GUESS[g.i];
    var right = choice === item.answer;
    if (right) g.score++;
    row.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    var stamp = el('span', 'exhibit__stamp ' + (item.answer === 'ai' ? 'is-ai' : 'is-human'), item.answer === 'ai' ? 'AI' : 'Human');
    stamp.setAttribute('aria-hidden', 'true');
    card.appendChild(stamp);
    var fb = el('p', 'exhibit__why');
    card.classList.add(right ? 'is-right' : 'is-wrong');
    var mark = el('span', 'sr-only', right ? 'Correct. ' : 'Incorrect. ');
    fb.appendChild(mark);
    fb.appendChild(document.createTextNode(item.why + ' '));
    var a = el('a', null, 'Source');
    a.href = item.src; a.target = '_blank'; a.rel = 'noopener';
    fb.appendChild(a);
    card.appendChild(fb);
    var next = el('button', 'btn btn--ghost', g.i + 1 < GUESS.length ? 'Next' : 'Score');
    next.type = 'button';
    next.addEventListener('click', function () { g.i++; renderGuess(); focusFirst(guessRoot); });
    card.appendChild(next);
    next.focus();
  }

  function focusFirst(root) {
    var f = root.querySelector('button');
    if (f) f.focus({ preventScroll: true });
  }

  if (guessRoot) renderGuess();

  /* ---------- Feature B: Relationship status ---------- */
  var statusRoot = document.getElementById('status');
  var s = { i: 0, tally: { power: 0, skeptic: 0, creative: 0, minimal: 0 } };

  function renderStatus() {
    statusRoot.innerHTML = '';
    if (s.i >= STATUS_Q.length) return renderResult();
    var q = STATUS_Q[s.i];
    var wrap = el('fieldset', 'sq');
    var legend = el('legend', 'sq__q', q.q);
    wrap.appendChild(legend);
    var pips = el('div', 'sq__pips');
    pips.setAttribute('aria-hidden', 'true');
    for (var p = 0; p < STATUS_Q.length; p++) pips.appendChild(el('span', p <= s.i ? 'on' : ''));
    wrap.insertBefore(pips, legend);
    var grid = el('div', 'sq__opts');
    q.a.forEach(function (label, n) {
      var b = el('button', 'btn btn--opt', label);
      b.type = 'button';
      b.addEventListener('click', function () {
        s.tally[TYPES[n]]++;
        s.i++;
        renderStatus();
        focusFirst(statusRoot);
      });
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    statusRoot.appendChild(wrap);
  }

  function winner() {
    // Highest score wins; ties go to the earlier type in TYPES.
    return TYPES.reduce(function (best, t) { return s.tally[t] > s.tally[best] ? t : best; }, TYPES[0]);
  }

  function renderResult() {
    var r = RESULTS[winner()];
    var card = el('div', 'result');
    card.setAttribute('tabindex', '-1');
    card.appendChild(el('span', 'result__mast', 'The AI Issue'));
    card.appendChild(el('h4', 'result__name', r.name));
    card.appendChild(el('p', 'result__head', r.head));
    card.appendChild(el('p', 'result__desc', r.desc));
    var tip = el('p', 'result__tip');
    tip.appendChild(el('span', 'type', 'The takeaway: '));
    tip.appendChild(document.createTextNode(r.tip));
    card.appendChild(tip);
    statusRoot.appendChild(card);

    var actions = el('div', 'result__actions');
    var save = el('button', 'btn btn--solid', 'Save image');
    save.type = 'button';
    save.addEventListener('click', function () { saveCard(r); });
    var retake = el('button', 'btn btn--ghost', 'Retake');
    retake.type = 'button';
    retake.addEventListener('click', function () {
      s.i = 0; s.tally = { power: 0, skeptic: 0, creative: 0, minimal: 0 };
      renderStatus(); focusFirst(statusRoot);
    });
    actions.appendChild(save);
    actions.appendChild(retake);
    statusRoot.appendChild(actions);
    card.focus({ preventScroll: true });
  }

  /* Draws the result card on a canvas and downloads it as a PNG. */
  function saveCard(r) {
    var W = 1080, H = 1350;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');
    var serif = '"DM Serif Display", Georgia, serif';
    var sans = '"DM Sans", Helvetica, Arial, sans-serif';
    var mono = '"Courier Prime", "Courier New", monospace';

    function wrapText(text, cx, y, maxW, lineH) {
      var words = text.split(' '), line = '';
      for (var n = 0; n < words.length; n++) {
        var test = line + words[n] + ' ';
        if (x.measureText(test).width > maxW && n > 0) {
          x.fillText(line.trim(), cx, y); line = words[n] + ' '; y += lineH;
        } else { line = test; }
      }
      x.fillText(line.trim(), cx, y);
      return y + lineH;
    }

    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(function () {
      x.fillStyle = '#F4DDE2'; x.fillRect(0, 0, W, H);
      x.strokeStyle = '#B79B65'; x.lineWidth = 3; x.strokeRect(40, 40, W - 80, H - 80);
      x.lineWidth = 1; x.strokeRect(56, 56, W - 112, H - 112);
      x.textAlign = 'center';

      x.fillStyle = '#690F26';
      x.font = '140px ' + serif;
      x.fillText('THE AI ISSUE', W / 2, 250, W - 160);
      x.font = '28px ' + mono;
      x.fillStyle = '#171717';
      x.fillText('VOL. 001 — RELATIONSHIP STATUS', W / 2, 320);

      x.fillStyle = '#690F26';
      x.font = 'italic 92px ' + serif;
      var y = wrapText(r.name, W / 2, 520, W - 200, 104);

      x.fillStyle = '#171717';
      x.font = 'italic 46px ' + serif;
      y = wrapText(r.head, W / 2, y + 40, W - 220, 58);

      x.font = '36px ' + sans;
      y = wrapText(r.desc, W / 2, y + 40, W - 260, 50);

      x.strokeStyle = '#B79B65'; x.beginPath(); x.moveTo(W / 2 - 120, y + 20); x.lineTo(W / 2 + 120, y + 20); x.stroke();
      x.font = '26px ' + mono; x.fillStyle = '#690F26';
      x.fillText('THE TAKEAWAY', W / 2, y + 80);
      x.fillStyle = '#171717'; x.font = '34px ' + sans;
      wrapText(r.tip, W / 2, y + 135, W - 260, 48);

      x.font = '22px ' + mono; x.fillStyle = '#690F26';
      x.fillText('A PLAYFUL QUIZ, NOT A SCIENTIFIC TEST', W / 2, H - 100);

      c.toBlob(function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'my-ai-relationship-status.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      }, 'image/png');
    });
  }

  if (statusRoot) renderStatus();
})();
