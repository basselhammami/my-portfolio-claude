const CASE_PASSWORD = "1995";
const STORAGE_KEY = "cases_unlocked_at";
const UNLOCK_TTL_MS = 1000 * 60 * 60 * 4;

function isUnlocked() {
  const ts = Number(sessionStorage.getItem(STORAGE_KEY) || 0);
  return ts && Date.now() - ts < UNLOCK_TTL_MS;
}

function unlock() {
  sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-case]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href === "#") return;

  if (isUnlocked()) return;

  event.preventDefault();
  const entry = window.prompt("Enter password to view this case study:");
  if (entry === null) return;
  if (entry === CASE_PASSWORD) {
    unlock();
    window.location.href = href;
  } else {
    alert("Incorrect password.");
  }
});

(function gateCasePage() {
  const isCasePage = /\/case-[a-z0-9-]+\.html$/.test(location.pathname);
  if (!isCasePage) return;
  if (isUnlocked()) return;
  const entry = window.prompt("Enter password to view this case study:");
  if (entry === CASE_PASSWORD) {
    unlock();
  } else {
    window.location.href = "index.html";
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
