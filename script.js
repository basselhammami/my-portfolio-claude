// Per-case passwords. Fallback: the "default" key.
const CASE_PASSWORDS = {
  paywalls: "2027",
  default: "1995",
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
