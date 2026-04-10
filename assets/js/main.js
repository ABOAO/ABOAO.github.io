document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const contactForm = document.getElementById("contact-form");
  const hiddenFrame = document.getElementById("hidden_iframe");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const getHeaderOffset = () => {
    const header = document.querySelector(".site-header");
    return (header?.offsetHeight || 0) + 18;
  };

  const closeMenu = () => {
    nav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  const openMenu = () => {
    nav?.classList.add("is-open");
    navToggle?.setAttribute("aria-expanded", "true");
    body.classList.add("menu-open");
  };

  const scrollToHash = (hash, updateHistory = false) => {
    if (!hash || hash === "#") return;

    const target = document.querySelector(hash);
    if (!target) return;

    const offset = -getHeaderOffset();

    if (window.__lenis && !prefersReducedMotion.matches) {
      window.__lenis.scrollTo(target, { offset, duration: 1.05 });
    } else {
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY + offset);
      window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
    }

    if (updateHistory) {
      window.history.pushState(null, "", hash);
    }
  };

  navToggle?.addEventListener("click", () => {
    if (nav?.classList.contains("is-open")) {
      closeMenu();
      return;
    }

    openMenu();
  });

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const target = hash ? document.querySelector(hash) : null;

      if (!hash || !target) return;

      event.preventDefault();
      closeMenu();
      scrollToHash(hash, true);
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(event.target) || navToggle?.contains(event.target)) return;

    closeMenu();
  });

  const setActiveLink = () => {
    if (!sections.length) return;

    const focusLine = window.innerHeight * 0.4;
    let currentSection = sections[0];

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= focusLine && rect.bottom > focusLine) {
        currentSection = section;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${currentSection.id}`);
    });
  };

  setActiveLink();
  document.addEventListener("scroll", setActiveLink, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
    setActiveLink();
  });

  window.addEventListener("hashchange", () => {
    scrollToHash(window.location.hash);
  });

  if (window.location.hash) {
    window.setTimeout(() => scrollToHash(window.location.hash), 0);
  }

  if (contactForm && hiddenFrame) {
    let submitted = false;

    contactForm.addEventListener("submit", () => {
      submitted = true;
    });

    hiddenFrame.addEventListener("load", () => {
      if (!submitted) return;

      alert("Message has been sent!");
      contactForm.reset();
      submitted = false;
    });
  }
});
