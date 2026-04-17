(function () {
  "use strict";

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  const canAnimate = () => !reduceMotion.matches;

  function initLenis() {
    if (!canAnimate() || typeof Lenis === "undefined") return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.85,
      smoothWheel: true,
      syncTouch: false,
    });

    window.__lenis = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  function initProgress() {
    const progress = document.createElement("div");
    progress.className = "fx-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    document.body.append(progress);

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      progress.style.setProperty("--progress", Math.min(Math.max(value, 0), 1).toFixed(4));
    };

    update();
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initReveal() {
    const targets = qsa("[data-reveal]");

    targets.forEach((target, index) => {
      const group = target.closest("[data-section]");
      const groupTargets = group ? qsa("[data-reveal]", group) : targets;
      const delayIndex = Math.max(groupTargets.indexOf(target), index === 0 ? 0 : 1);
      target.style.setProperty("--reveal-delay", `${Math.min(delayIndex * 0.08, 0.42)}s`);
    });

    if (!("IntersectionObserver" in window) || !canAnimate()) {
      targets.forEach((target) => target.classList.add("is-visible"));
      document.body.classList.add("is-loaded");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    targets.forEach((target) => observer.observe(target));

    requestAnimationFrame(() => {
      document.body.classList.add("is-loaded");
      qsa(".hero-section [data-reveal]").forEach((target) => target.classList.add("is-visible"));
    });
  }

  function initParticles() {
    if (!canAnimate() || !finePointer.matches || window.innerWidth < 860) return;

    const canvas = document.createElement("canvas");
    canvas.className = "fx-particles";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    const pointer = { x: -9999, y: -9999 };
    const particleCount = 46;
    const linkDistance = 150;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let particles = [];
    let running = true;

    const makeParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.6,
    });

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: particleCount }, makeParticle);
    };

    const draw = () => {
      if (!running) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        for (let i = index + 1; i < particles.length; i += 1) {
          const peer = particles[i];
          const dx = particle.x - peer.x;
          const dy = particle.y - peer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < linkDistance) {
            const opacity = (1 - distance / linkDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(peer.x, peer.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      particles.forEach((particle) => {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 120 && distance > 0) {
          const force = ((120 - distance) / 120) * 1.2;
          particle.x += (dx / distance) * force;
          particle.y += (dy / distance) * force;
        }

        particle.x = (particle.x + particle.vx + width) % width;
        particle.y = (particle.y + particle.vy + height) % height;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 212, 255, 0.42)";
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    window.addEventListener("mousemove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    });
    window.addEventListener("mouseleave", () => {
      pointer.x = -9999;
      pointer.y = -9999;
    });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
    });

    resize();
    requestAnimationFrame(draw);
  }

  function initTilt() {
    if (!canAnimate() || !finePointer.matches) return;

    qsa(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const depth = card.dataset.depth ? Number(card.dataset.depth) * window.scrollY : 0;

        card.style.transform = `translate3d(0, ${depth}px, 0) perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
      });

      card.addEventListener("mouseleave", () => {
        const depth = card.dataset.depth ? Number(card.dataset.depth) * window.scrollY : 0;
        card.style.transform = card.dataset.depth ? `translate3d(0, ${depth}px, 0)` : "";
      });
    });
  }

  function initParallax() {
    const depthTargets = qsa("[data-depth]");
    if (!canAnimate() || !depthTargets.length) return;

    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      depthTargets.forEach((target) => {
        if (target.matches(":hover") && finePointer.matches) return;
        const depth = Number(target.dataset.depth || 0);
        target.style.transform = `translate3d(0, ${scrollY * depth}px, 0)`;
      });
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    document.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function boot() {
    initLenis();
    initProgress();
    initReveal();
    initParticles();
    initTilt();
    initParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
