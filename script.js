const CASE_PASSWORD = "1995";
const unlocked = new Set();

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-case]");
  if (!link) return;
  event.preventDefault();

  const caseId = link.dataset.case;
  if (unlocked.has(caseId)) {
    alert(`Opening ${caseId} case study…`);
    return;
  }

  const entry = window.prompt("Enter password to view this case study:");
  if (entry === null) return;
  if (entry === CASE_PASSWORD) {
    unlocked.add(caseId);
    alert(`Opening ${caseId} case study…`);
  } else {
    alert("Incorrect password.");
  }
});
