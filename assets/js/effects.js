/**
 * effects.js — Lusion-inspired interactive effects
 * Scroll snap (卡點), particles, custom cursor, grain overlay,
 * text character reveal, magnetic hover, scroll progress indicator.
 */
(function () {
  'use strict';

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));
  const isFine = () => window.matchMedia('(pointer: fine)').matches;

  /* ============================================================
   * 1. SECTION SCROLL SNAP (卡點)
   *    Smart JS-based snap: free scroll within tall sections,
   *    snaps to next/prev when reaching a section boundary.
   * ============================================================ */
  function initScrollSnap() {
    const sections = qa('.section');
    if (sections.length === 0) return;

    const hdr = () => q('.site-header')?.offsetHeight || 88;
    let snapping = false;
    let wheelAccum = 0;
    let lastWheelTime = 0;

    const snapTo = (idx) => {
      if (idx < 0 || idx >= sections.length || snapping) return;
      snapping = true;
      const top = Math.max(
        0,
        sections[idx].getBoundingClientRect().top + window.scrollY - hdr()
      );
      window.scrollTo({ top, behavior: 'smooth' });
      setTimeout(() => { snapping = false; }, 1000);
    };

    const currentIdx = () => {
      const threshold = window.scrollY + hdr() + 60;
      let best = 0;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top + window.scrollY <= threshold) best = i;
      });
      return best;
    };

    window.addEventListener('wheel', (e) => {
      // Skip form inputs — allow natural scroll within them
      if (e.target.closest('input, textarea, select')) return;

      if (snapping) {
        e.preventDefault();
        return;
      }

      const now = Date.now();
      if (now - lastWheelTime > 250) wheelAccum = 0;
      lastWheelTime = now;
      wheelAccum += e.deltaY;

      // Ignore tiny movements — no preventDefault, let natural scroll happen
      if (Math.abs(wheelAccum) < 60) return;

      const dir = Math.sign(wheelAccum);
      wheelAccum = 0;

      const idx = currentIdx();
      const rect = sections[idx].getBoundingClientRect();
      const ZONE = 80; // px from section edge to trigger snap

      // Scrolling down and near the bottom of current section → snap to next
      if (dir > 0 && rect.bottom <= window.innerHeight + ZONE) {
        e.preventDefault();
        snapTo(idx + 1);
        return;
      }

      // Scrolling up and near the top of current section → snap to previous
      if (dir < 0 && rect.top >= hdr() - ZONE) {
        e.preventDefault();
        snapTo(idx - 1);
      }
    }, { passive: false });

    // Touch swipe support
    let touchStartY = 0;
    let touchStartTime = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (snapping) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      const dt = Date.now() - touchStartTime;
      if (Math.abs(dy) < 55 || dt > 600) return; // too slow or too small

      const dir = Math.sign(dy);
      const idx = currentIdx();
      const rect = sections[idx].getBoundingClientRect();
      const ZONE = 100;

      if (dir > 0 && rect.bottom <= window.innerHeight + ZONE) snapTo(idx + 1);
      else if (dir < 0 && rect.top >= hdr() - ZONE) snapTo(idx - 1);
    }, { passive: true });
  }

  /* ============================================================
   * 2. SCROLL PROGRESS INDICATOR (side dots)
   * ============================================================ */
  function initScrollProgress() {
    const sections = qa('.section');
    if (sections.length === 0) return;

    const container = document.createElement('nav');
    container.className = 'fx-scroll-progress';
    container.setAttribute('aria-hidden', 'true');

    const dots = sections.map((_, i) => {
      const d = document.createElement('span');
      d.className = 'fx-scroll-progress-dot';
      if (i === 0) d.classList.add('active');
      container.appendChild(d);
      return d;
    });

    document.body.appendChild(container);

    const hdr = () => q('.site-header')?.offsetHeight || 88;

    const update = () => {
      const threshold = window.scrollY + hdr() + window.innerHeight * 0.4;
      let activeIdx = 0;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top + window.scrollY <= threshold) activeIdx = i;
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================================
   * 3. CANVAS PARTICLE NETWORK (ambient background, desktop only)
   * ============================================================ */
  function initParticles() {
    if (!isFine()) return; // skip on touch devices

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-particles';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const N = 55;
    const LINK = 130;
    let W, H;
    const mouse = { x: -9999, y: -9999 };
    let pts = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const mkPt = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.8 + 0.7,
    });

    const frame = () => {
      requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);

      // Draw connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(100,140,185,${(1 - d / LINK) * 0.13})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw dots
      pts.forEach((p) => {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 100 && d > 0) {
          const f = ((100 - d) / 100) * 1.4;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }

        // Move and wrap
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,140,185,0.22)';
        ctx.fill();
      });
    };

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', resize);

    resize();
    pts = Array.from({ length: N }, mkPt);
    frame();
  }

  /* ============================================================
   * 4. GRAIN OVERLAY (noise texture, generated via canvas)
   * ============================================================ */
  function initGrain() {
    // Generate a random noise texture once
    const size = 200;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext('2d');
    const id = ctx.createImageData(size, size);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);

    const el = document.createElement('div');
    el.className = 'fx-grain';
    el.style.backgroundImage = `url(${offscreen.toDataURL()})`;
    document.body.appendChild(el);
  }

  /* ============================================================
   * 5. CUSTOM CURSOR with spring physics (desktop only)
   * ============================================================ */
  function initCursor() {
    if (!isFine()) return;

    const ring = document.createElement('div');
    ring.className = 'fx-cursor-ring';
    const dot = document.createElement('div');
    dot.className = 'fx-cursor-dot';
    document.body.append(ring, dot);
    document.body.classList.add('has-cursor');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;

      // Reveal on first move
      if (!ring.classList.contains('visible')) {
        ring.classList.add('visible');
        dot.classList.add('visible');
      }
    });

    document.addEventListener('mouseleave', () => {
      ring.classList.remove('visible');
      dot.classList.remove('visible');
    });

    document.addEventListener('mouseenter', () => {
      ring.classList.add('visible');
      dot.classList.add('visible');
    });

    // Spring animation for ring
    (function animateRing() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(animateRing);
    })();

    // Expand ring on interactive elements
    qa('a, button, input, textarea, label').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('big'));
      el.addEventListener('mouseleave', () => ring.classList.remove('big'));
    });
  }

  /* ============================================================
   * 6. TEXT CHARACTER REVEAL (h1, h2 headings)
   * ============================================================ */
  function initTextReveal() {
    const headings = qa('.hero-copy h1, .section-heading h2');

    headings.forEach((el) => {
      const chars = [...el.textContent].map((ch, i) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', i);
        s.textContent = ch === ' ' ? '\u00a0' : ch;
        return s;
      });
      el.replaceChildren(...chars);
    });

    if (!('IntersectionObserver' in window)) {
      headings.forEach((el) => el.classList.add('chars-in'));
      return;
    }

    // Trigger reveal when the heading is well into the viewport
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('chars-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    headings.forEach((el) => obs.observe(el));
  }

  /* ============================================================
   * 7. MAGNETIC HOVER (buttons and social links)
   * ============================================================ */
  function initMagnetic() {
    if (!isFine()) return;

    qa('.button, .social-links a, .scroll-indicator').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        el.style.transform = `translate(${(e.clientX - cx) * 0.22}px, ${(e.clientY - cy) * 0.22}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => { el.style.transition = ''; }, 350);
      });
    });
  }

  /* ============================================================
   * 8. HERO VISUAL PARALLAX on scroll
   * ============================================================ */
  function initParallax() {
    const visual = q('.hero-visual');
    if (!visual) return;

    // Switch from CSS float animation to JS parallax
    visual.classList.add('has-parallax');

    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        visual.style.transform = `translateY(${y * 0.06}px)`;
      },
      { passive: true }
    );
  }

  /* ============================================================
   * 9. CARD STAGGER DELAYS — assign CSS custom property per card
   * ============================================================ */
  function initStagger() {
    // Info grid panels
    qa('.info-grid .panel-card').forEach((el, i) => {
      el.style.setProperty('--stagger-delay', `${0.12 + i * 0.12}s`);
    });
    // Statement card
    const stmt = q('.statement-card');
    if (stmt) stmt.style.setProperty('--stagger-delay', '0.35s');

    // Timeline items
    qa('.timeline-item').forEach((el, i) => {
      el.style.setProperty('--stagger-delay', `${0.1 + i * 0.14}s`);
    });
  }

  /* ============================================================
   * BOOT
   * ============================================================ */
  function boot() {
    initGrain();
    initCursor();
    initParticles();
    initScrollProgress();
    initScrollSnap();
    initTextReveal();
    initMagnetic();
    initParallax();
    initStagger();
  }

  if (document.readyState !== 'loading') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
