/* ==========================================================================
   Scroll-driven header state + reveal-on-scroll animations
   ========================================================================== */

(function headerScrollShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

(function autoplayVideosInView() {
  const videos = document.querySelectorAll("video[autoplay]");
  if (!videos.length) return;
  if (!("IntersectionObserver" in window)) {
    videos.forEach((v) => v.play().catch(() => {}));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.25 }
  );
  videos.forEach((v) => io.observe(v));
})();

(function revealOnScroll() {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const targets = document.querySelectorAll(
    ".projects > .project-card, .expertise, .expertise-grid, .case-section, .mockup"
  );

  targets.forEach((el) => {
    if (el.matches(".expertise-grid")) {
      el.classList.add("reveal");
      Array.from(el.children).forEach((c) => c.classList.add("reveal-child"));
    } else {
      el.classList.add("reveal");
    }
  });

  if (prefersReduced || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => io.observe(el));
})();

/* ==========================================================================
   Case-study role filter — All / Product Design / Product Management pills
   on the home page toggle which project group is shown.
   ========================================================================== */

(function projectsRoleFilter() {
  const bar = document.querySelector(".projects-filter");
  if (!bar) return;

  const pills = Array.from(bar.querySelectorAll(".filter-pill"));
  const groups = Array.from(document.querySelectorAll(".projects-group"));
  if (!pills.length || !groups.length) return;

  const apply = (filter) => {
    pills.forEach((pill) => {
      const active = pill.dataset.filter === filter;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-pressed", String(active));
    });

    bar.classList.toggle("is-filtered", filter !== "all");

    groups.forEach((group) => {
      const show = filter === "all" || group.dataset.role === filter;
      group.classList.toggle("is-hidden", !show);
      if (show) {
        // Cards hidden before their scroll-reveal fired would otherwise
        // stay invisible — force them shown.
        group
          .querySelectorAll(".reveal:not(.is-visible)")
          .forEach((el) => el.classList.add("is-visible"));
        // Restart the entrance animation.
        group.classList.remove("filter-in");
        void group.offsetWidth;
        group.classList.add("filter-in");
      }
    });
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => apply(pill.dataset.filter));
  });
})();

/* ==========================================================================
   Narrative case: choreographed scroll reveals + count-up stats
   ========================================================================== */

(function narrativeMotion() {
  const page = document.querySelector(".n-page");
  if (!page) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const groups = page.querySelectorAll("[data-reveal]");

  const setCount = (el) => {
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    el.textContent = prefix + el.dataset.count + suffix;
  };

  // Reduced motion / no IO support: show everything, set final numbers.
  if (prefersReduced || !("IntersectionObserver" in window)) {
    page.querySelectorAll(".n-rise, .n-up").forEach((el) =>
      el.classList.add("in")
    );
    page.querySelectorAll("[data-count]").forEach(setCount);
    return;
  }

  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return setCount(el);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const group = entry.target;
        group.classList.add("in");

        // Stagger each tagged child as the group enters.
        const ups = group.querySelectorAll(".n-up");
        ups.forEach((el, i) => {
          el.style.transitionDelay = Math.min(120 + i * 70, 900) + "ms";
          el.classList.add("in");
        });

        // Kick off any count-up numbers in this group.
        group.querySelectorAll("[data-count]").forEach(runCount);

        io.unobserve(group);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  groups.forEach((g) => io.observe(g));
})();

/* ==========================================================================
   Image lightbox — click any case-study image to view it full-size
   ========================================================================== */

(function imageLightbox() {
  const imgs = Array.from(document.querySelectorAll(".n-img-block img"));
  if (!imgs.length) return;

  const isRu = document.documentElement.lang === "ru";
  const viewLabel = isRu ? "Открыть изображение крупнее" : "View larger image";
  const closeLabel = isRu ? "Закрыть" : "Close";

  // Build the overlay once and reuse it for every image.
  const overlay = document.createElement("div");
  overlay.className = "n-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-hidden", "true");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "n-lightbox-close";
  closeBtn.setAttribute("aria-label", closeLabel);
  closeBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  const bigImg = document.createElement("img");
  bigImg.className = "n-lightbox-img";
  bigImg.alt = "";

  const caption = document.createElement("p");
  caption.className = "n-lightbox-caption";

  overlay.append(closeBtn, bigImg, caption);
  document.body.appendChild(overlay);

  let lastFocused = null;

  const open = (img) => {
    bigImg.src = img.currentSrc || img.src;
    bigImg.alt = img.alt || "";
    caption.textContent = img.alt || "";
    caption.style.display = img.alt ? "" : "none";

    lastFocused = document.activeElement;
    // Prevent layout shift from the disappearing scrollbar.
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    if (sbw > 0) document.body.style.paddingRight = sbw + "px";
    document.body.classList.add("n-lightbox-open");
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    closeBtn.focus();
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("n-lightbox-open");
    document.body.style.paddingRight = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  // Clicking the backdrop, the image, or the close button dismisses.
  overlay.addEventListener("click", close);

  // Keep focus inside the dialog while it's open, and close on Escape.
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      closeBtn.focus();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });

  imgs.forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute(
      "aria-label",
      img.alt ? img.alt + " — " + viewLabel : viewLabel
    );
    img.addEventListener("click", () => open(img));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(img);
      }
    });
  });
})();

/* ==========================================================================
   Mobile hint toast — on case pages, let small-screen visitors know the
   case studies are best viewed on a larger screen. Dismissible, and once
   closed it stays hidden for the rest of the browsing session.
   ========================================================================== */

(function mobileHintToast() {
  // Only on case-study pages.
  if (!document.querySelector(".n-page")) return;

  // Only on narrow (mobile) viewports.
  if (!window.matchMedia("(max-width: 640px)").matches) return;

  // Respect an earlier dismissal during this session.
  if (sessionStorage.getItem("case_mobile_hint_dismissed")) return;

  const isRu = document.documentElement.lang === "ru";
  const message = isRu
    ? "Кейсы удобнее смотреть на ноутбуке или большом экране."
    : "These case studies are best viewed on a laptop or larger screen.";
  const closeLabel = isRu ? "Закрыть" : "Close";

  const toast = document.createElement("div");
  toast.className = "n-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const text = document.createElement("p");
  text.className = "n-toast-text";
  text.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "n-toast-close";
  closeBtn.setAttribute("aria-label", closeLabel);
  closeBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  toast.append(text, closeBtn);
  document.body.appendChild(toast);

  const dismiss = () => {
    sessionStorage.setItem("case_mobile_hint_dismissed", "1");
    toast.classList.remove("is-visible");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  };

  closeBtn.addEventListener("click", dismiss);

  // Reveal on the next frame so the entrance transition runs.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("is-visible"));
  });
})();
