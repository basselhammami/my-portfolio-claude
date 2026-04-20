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
