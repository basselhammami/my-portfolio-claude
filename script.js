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

/* ==========================================================================
   Typewriter — vanilla equivalent of the React component. Activates each
   .typewriter element when it scrolls into view; cycles a list of phrases
   read from data-typewriter (JSON array). Other tunables come from data-*
   attributes: data-speed, data-delete-speed, data-wait, data-initial-delay,
   data-loop ("false" to stop after the last phrase).
   ========================================================================== */

(function typewriter() {
  const els = document.querySelectorAll(".typewriter");
  if (!els.length) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function run(el) {
    let phrases;
    try {
      phrases = JSON.parse(el.dataset.typewriter || "[]");
    } catch {
      phrases = [el.dataset.typewriter || ""];
    }
    if (!phrases.length) return;

    if (prefersReduced) {
      el.textContent = phrases[0];
      return;
    }

    const speed = Number(el.dataset.speed) || 70;
    const deleteSpeed = Number(el.dataset.deleteSpeed) || 40;
    const wait = Number(el.dataset.wait) || 1500;
    const initialDelay = Number(el.dataset.initialDelay) || 0;
    const loop = el.dataset.loop !== "false";

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIdx];

      if (!deleting) {
        if (charIdx < phrase.length) {
          el.textContent = phrase.slice(0, ++charIdx);
          setTimeout(tick, speed);
        } else if (phrases.length > 1 || loop) {
          setTimeout(() => {
            deleting = true;
            tick();
          }, wait);
        }
      } else {
        if (charIdx > 0) {
          el.textContent = phrase.slice(0, --charIdx);
          setTimeout(tick, deleteSpeed);
        } else {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          if (phraseIdx === 0 && !loop) return;
          setTimeout(tick, speed);
        }
      }
    }

    setTimeout(tick, initialDelay);
  }

  if (!("IntersectionObserver" in window)) {
    els.forEach(run);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  els.forEach((el) => io.observe(el));
})();
