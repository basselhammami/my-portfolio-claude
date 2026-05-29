// Per-case passwords. Fallback: the "default" key.
const CASE_PASSWORDS = {
  default: "2027",
};
const UNLOCK_TTL_MS = 1000 * 60 * 60 * 4;

function storageKey(caseId) {
  return `case_unlocked_${caseId}`;
}

function isUnlocked(caseId) {
  const ts = Number(sessionStorage.getItem(storageKey(caseId)) || 0);
  return ts && Date.now() - ts < UNLOCK_TTL_MS;
}

function unlock(caseId) {
  sessionStorage.setItem(storageKey(caseId), String(Date.now()));
}

function passwordFor(caseId) {
  return CASE_PASSWORDS[caseId] || CASE_PASSWORDS.default;
}

// Map pathname → caseId (used for direct-URL gate on case pages)
function caseIdForPath(pathname) {
  const m = pathname.match(/\/case-([a-z0-9-]+?)(?:-ru)?\.html$/);
  return m ? m[1] : null;
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-case]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href === "#") return;

  const caseId = link.dataset.case;
  if (isUnlocked(caseId)) return;

  event.preventDefault();
  const isRu = document.documentElement.lang === "ru";
  const promptText = isRu
    ? "Введите пароль для просмотра кейса:"
    : "Enter password to view this case study:";
  const wrongText = isRu ? "Неверный пароль." : "Incorrect password.";
  const entry = window.prompt(promptText);
  if (entry === null) return;
  if (entry === passwordFor(caseId)) {
    unlock(caseId);
    window.location.href = href;
  } else {
    alert(wrongText);
  }
});

(function gateCasePage() {
  const caseId = caseIdForPath(location.pathname);
  if (!caseId) return;
  if (isUnlocked(caseId)) return;
  const isRu = document.documentElement.lang === "ru";
  const promptText = isRu
    ? "Введите пароль для просмотра кейса:"
    : "Enter password to view this case study:";
  const entry = window.prompt(promptText);
  if (entry === passwordFor(caseId)) {
    unlock(caseId);
  } else {
    window.location.href = isRu ? "index-ru.html" : "index.html";
  }
})();

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
