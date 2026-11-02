import { animate, stagger, createTimeline, createDrawable } from 'https://cdn.jsdelivr.net/npm/animejs@4/+esm';
import { animate as mAnimate, scroll, inView, stagger as mStagger } from 'https://cdn.jsdelivr.net/npm/motion@12/+esm';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------------------------------------------------------------- hero */
function heroIntro() {
  document.body.classList.add('is-loaded');
  if (reduce) {
    $$('.hero__title .ch').forEach(c => { c.style.opacity = 1; });
    $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  const tl = createTimeline({ defaults: { ease: 'outExpo' } });
  tl.add('.hero__title .ch', {
    translateY: ['110%', '0%'],
    opacity: [0, 1],
    duration: 1100,
    delay: stagger(38)
  })
  .add('.hero__sub', { opacity: [0, 1], translateY: [16, 0], duration: 900 }, '-=750')
  .add('.eyebrow', { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=800')
  .add('.hero__foot', { opacity: [0, 1], duration: 600 }, '-=500');
}

/* ---------------------------------------------------------- dot field */
function dotField() {
  const cv = $('#dotfield');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ptr = { x: -999, y: -999 };
  let t = 0;

  function resize() {
    const r = cv.getBoundingClientRect();
    w = r.width; h = r.height;
    cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { ptr.x = ptr.y = -999; });

  const gap = 42;
  function frame() {
    t += 0.008;
    ctx.clearRect(0, 0, w, h);
    for (let x = gap / 2; x < w; x += gap) {
      for (let y = gap / 2; y < h; y += gap) {
        const dx = x - ptr.x, dy = y - ptr.y;
        const d = Math.hypot(dx, dy);
        const prox = clamp(1 - d / 190, 0, 1);
        const wave = Math.sin(t + x * 0.007 + y * 0.005) * 0.5 + 0.5;
        const px = x + dx * -0.06 * prox;
        const py = y + dy * -0.06 * prox;
        const r = 0.7 + prox * 1.9 + wave * 0.25;
        const a = 0.10 + prox * 0.55 + wave * 0.06;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = prox > 0.25
          ? `rgba(226,180,132,${a})`
          : `rgba(244,242,238,${a * 0.7})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------ 01 anime.js */
function blueprint() {
  const svgEl = $('#bp');
  if (!svgEl) return;
  const lines = $$('.bp-line', svgEl);
  const dims = $$('.bp-dim', svgEl);
  const details = $$('.bp-detail', svgEl);

  if (reduce) return;

  try {
    const drawable = el => createDrawable(el);
    const start = () => {
      animate(drawable(lines), {
        draw: ['0 0', '0 1'],
        duration: 1200,
        delay: stagger(90),
        ease: 'inOutQuad'
      });
      animate(drawable(dims), {
        draw: ['0 0', '0 1'],
        duration: 900,
        delay: stagger(70, { start: 500 }),
        ease: 'outQuad'
      });
      animate(drawable(details), {
        draw: ['0 0', '0 1'],
        duration: 700,
        delay: stagger(80, { start: 1100 }),
        ease: 'outQuad'
      });
    };
    inView('#bp', start, { amount: 0.4 });
  } catch (err) {
    console.warn('anime draw fallback', err);
    svgEl.style.opacity = 1;
  }
}

function counters() {
  const nums = $$('[data-to], [data-count]');
  if (!nums.length) return;

  const run = el => {
    const to = Number(el.dataset.to ?? el.dataset.count ?? 0);
    const suffix = el.dataset.suffix ?? '';
    if (reduce) { el.textContent = to + suffix; return; }
    const obj = { v: 0 };
    animate(obj, {
      v: to,
      duration: 1400,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = Math.round(obj.v) + suffix;
      },
      onComplete: () => { el.textContent = to + suffix; }
    });
  };

  nums.forEach(el => {
    inView(el, () => run(el), { amount: 0.6 });
  });
}

/* --------------------------------------------------------- 02 motion */
function magnetic() {
  const zones = [
    { zone: $('#magnetZone'), btn: $('#magnet'), strength: 0.32, radius: 220 },
    { zone: $('.use__left'), btn: $('#magnet2'), strength: 0.22, radius: 200 }
  ].filter(z => z.zone && z.btn);

  zones.forEach(({ zone, btn, strength, radius }) => {
    zone.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const k = clamp(1 - dist / radius, 0, 1);
      mAnimate(btn, {
        x: dx * strength * k,
        y: dy * strength * k
      }, { type: 'spring', stiffness: 240, damping: 20, mass: 0.6 });
    });

    zone.addEventListener('pointerleave', () => {
      mAnimate(btn, { x: 0, y: 0 }, { type: 'spring', stiffness: 180, damping: 14, mass: 0.7 });
    });
  });
}

function springCards() {
  const cards = $$('.spring-card');
  if (!cards.length) return;
  if (reduce) return;

  inView('.spring-stack', () => {
    cards.forEach((card, i) => {
      mAnimate(card,
        { opacity: [0, 1], transform: ['translateY(26px) scale(.985)', 'translateY(0px) scale(1)'] },
        { type: 'spring', stiffness: 160, damping: 18, mass: .8, delay: i * 0.09 }
      );
    });
  }, { amount: 0.4 });

  cards.forEach(card => {
    card.addEventListener('pointerenter', () => {
      mAnimate(card, { scale: 1.012, x: 6 }, { type: 'spring', stiffness: 320, damping: 18 });
    });
    card.addEventListener('pointerleave', () => {
      mAnimate(card, { scale: 1, x: 0 }, { type: 'spring', stiffness: 200, damping: 16 });
    });
  });
}

function scrollProgress() {
  const bar = $('#progress');
  if (!bar) return;
  if (reduce) { bar.style.transform = 'scaleX(0)'; return; }
  try {
    scroll(mAnimate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));
  } catch (e) {
    window.addEventListener('scroll', () => {
      const max = document.body.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    }, { passive: true });
  }
}

/* ------------------------------------------------------- 03 kokonut */
function slideToConfirm() {
  const wrap = $('#slide');
  const knob = $('#slideKnob');
  if (!wrap || !knob) return;

  const hint = $('.slide__hint', wrap);
  const doneEl = $('.slide__done', wrap);
  let max = 0, dragging = false, startX = 0, base = 0, offset = 0, done = false;

  const measure = () => { max = wrap.clientWidth - knob.clientWidth - 8; };
  measure();
  window.addEventListener('resize', measure);

  const paint = () => {
    knob.style.transform = `translateX(${offset}px)`;
    if (hint) hint.style.opacity = String(clamp(1 - offset / (max * 0.5), 0, 1));
  };

  knob.addEventListener('pointerdown', e => {
    if (done) return;
    dragging = true;
    base = offset;
    startX = e.clientX;
    wrap.classList.add('is-drag');
    knob.setPointerCapture(e.pointerId);
  });

  knob.addEventListener('pointermove', e => {
    if (!dragging || done) return;
    offset = clamp(base + (e.clientX - startX), 0, max);
    paint();
  });

  const finish = () => {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-drag');

    if (offset > max * 0.88) {
      done = true;
      offset = max;
      paint();
      wrap.classList.add('is-done');
      if (doneEl) doneEl.style.opacity = '1';
      setTimeout(() => {
        wrap.classList.remove('is-done');
        if (doneEl) doneEl.style.opacity = '';
        done = false;
        offset = 0;
        paint();
      }, 1700);
    } else {
      offset = 0;
      paint();
    }
  };

  knob.addEventListener('pointerup', finish);
  knob.addEventListener('pointercancel', finish);
  paint();
}

function pullCord() {
  const cord = $('#cord');
  const knob = $('#cordKnob');
  const wire = $('#cordWire');
  if (!cord || !knob || !wire) return;

  let dragging = false, startY = 0, dy = 0, fired = false;

  const paint = v => {
    knob.style.transform = `translateY(${v}px)`;
    wire.style.height = `${64 + v}px`;
  };

  knob.addEventListener('pointerdown', e => {
    dragging = true; startY = e.clientY; dy = 0; fired = false;
    cord.classList.add('is-pulled', 'is-drag');
    knob.setPointerCapture(e.pointerId);
  });

  knob.addEventListener('pointermove', e => {
    if (!dragging) return;
    dy = clamp(e.clientY - startY, 0, 96);
    paint(dy);
    if (dy > 60 && !fired) {
      fired = true;
      cord.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(2.2)' }, { filter: 'brightness(1)' }],
        { duration: 420, easing: 'ease-out' }
      );
    }
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    cord.classList.remove('is-pulled', 'is-drag');
    paint(0);
  };

  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
}

/* ---------------------------------------------------------- 04 21st */
function halftone() {
  const cv = $('#halftone');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let w = 0, h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ptr = { x: -999, y: -999 };
  let t = 0;

  function resize() {
    const r = cv.getBoundingClientRect();
    w = r.width; h = r.height;
    cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const wrap = $('#halftoneWrap');
  wrap.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
  }, { passive: true });
  wrap.addEventListener('pointerleave', () => { ptr.x = ptr.y = -999; });

  const gap = 17;
  function frame() {
    t += 0.014;
    ctx.clearRect(0, 0, w, h);
    for (let x = gap / 2; x < w; x += gap) {
      for (let y = gap / 2; y < h; y += gap) {
        const nx = x / w, ny = y / h;
        let v = Math.sin(nx * 7 + t) * Math.cos(ny * 5 - t * 0.8);
        v += Math.sin((nx + ny) * 4.2 + t * 1.3) * 0.55;
        v = (v + 1.55) / 3.1;

        const dx = x - ptr.x, dy = y - ptr.y;
        const prox = clamp(1 - Math.hypot(dx, dy) / 220, 0, 1);

        const r = 0.4 + v * gap * 0.42 * (1 + prox * 0.9);
        const a = 0.2 + v * 0.5 + prox * 0.3;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = prox > 0.3
          ? `rgba(226,180,132,${clamp(a, 0, 1)})`
          : `rgba(184,129,79,${clamp(a * 0.75, 0, 1)})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------- 05 in use */
function revealMasks() {
  const spans = $$('.mask > span');
  if (!spans.length) return;
  if (reduce) { spans.forEach(s => s.style.transform = 'none'); return; }

  inView('.use__title', () => {
    mAnimate(spans,
      { transform: ['translateY(105%)', 'translateY(0%)'] },
      { type: 'spring', stiffness: 120, damping: 18, delay: mStagger(0.08) }
    );
  }, { amount: 0.5 });
}

function fpsMeter() {
  const el = $('#fps');
  if (!el) return;
  let last = performance.now(), frames = 0;
  function tick(now) {
    frames++;
    if (now - last > 700) {
      el.textContent = Math.round((frames * 1000) / (now - last)) + ' fps';
      frames = 0; last = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* -------------------------------------------------------------- boot */
function boot() {
  heroIntro();
  dotField();
  blueprint();
  counters();
  magnetic();
  springCards();
  scrollProgress();
  slideToConfirm();
  pullCord();
  halftone();
  revealMasks();
  fpsMeter();
  window.__motionLab = { ok: true };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
