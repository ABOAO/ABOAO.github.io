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
  body.classList.add("motion-ready");
  const isDesktopLayout = () => window.innerWidth > 960;
  const getHeaderOffset = () => {
    const header = document.querySelector(".site-header");
    return (header?.offsetHeight || 0) + 20;
  };
  const getScrollTarget = (section) => section;
  const getCenteredScrollTop = (element) => {
    const hdr = document.querySelector('.site-header')?.offsetHeight || 88;
    const rect = element.getBoundingClientRect();
    const sectionMidDoc = rect.top + window.scrollY + rect.height / 2;
    const centeredTop = sectionMidDoc - (window.innerHeight / 2 + hdr / 2);
    const maxTop = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    return Math.min(Math.max(centeredTop, 0), maxTop);
  };

  const scrollToHash = (hash, updateHistory = false) => {
    if (!hash || hash === "#") {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (updateHistory) window.history.pushState(null, "", "#");
      return;
    }

    const target = document.querySelector(hash);
    if (!target) return;

    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -getHeaderOffset(), duration: 1.4 });
    } else {
      const scrollTarget = getScrollTarget(target);
      const top = isDesktopLayout()
        ? getCenteredScrollTop(scrollTarget)
        : Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset());
      window.scrollTo({ top, behavior: "smooth" });
    }

    if (updateHistory) {
      window.history.pushState(null, "", hash);
    }
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

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  });

  anchorLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 720) {
        closeMenu();
      }
    });
  });

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") {
        return;
      }

      const target = document.querySelector(hash);
      if (!target) {
        return;
      }

      event.preventDefault();
      scrollToHash(hash, true);
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) {
      return;
    }

    if (nav.contains(event.target) || navToggle?.contains(event.target)) {
      return;
    }

    closeMenu();
  });

  const setActiveLink = () => {
    let currentSection = sections[0];
    const focusLine = isDesktopLayout()
      ? window.innerHeight / 2
      : 160;

    sections.forEach((section) => {
      const rect = getScrollTarget(section).getBoundingClientRect();
      if (rect.top <= focusLine && rect.bottom > focusLine) {
        currentSection = section;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentSection.id}`;
      link.classList.toggle("active", isActive);
    });
  };

  setActiveLink();
  document.addEventListener("scroll", setActiveLink, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      closeMenu();
    }
    setActiveLink();
  });
  window.addEventListener("hashchange", () => {
    scrollToHash(window.location.hash);
  });

  if (window.location.hash) {
    window.setTimeout(() => {
      scrollToHash(window.location.hash);
    }, 0);
  }

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    sections.forEach((section, index) => {
      if (index === 0) {
        section.classList.add("is-visible");
        return;
      }

      sectionObserver.observe(section);
    });
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }

  if (contactForm && hiddenFrame) {
    let submitted = false;

    contactForm.addEventListener("submit", () => {
      submitted = true;
    });

    hiddenFrame.addEventListener("load", () => {
      if (!submitted) {
        return;
      }

      alert("Message has been sent!");
      contactForm.reset();
      submitted = false;
    });
  }
});
