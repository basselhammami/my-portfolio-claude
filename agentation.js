// Agentation — visual feedback toolbar for AI coding agents.
// https://agentation.com
//
// This static site has no build step, so Agentation (which ships as a React
// component) is loaded straight from the esm.sh CDN, which resolves its React
// peer dependencies for us.
//
// The toolbar is gated by a remembered toggle so it stays invisible to normal
// visitors even on the deployed site:
//   - visit any page with ?agentation=on  -> enables it for THIS browser
//   - visit any page with ?agentation=off -> disables it
// The choice is saved in localStorage and persists across pages and visits, so
// you only need the param once to turn it on or off.
const STORAGE_KEY = "agentation:enabled";

(async () => {
  const flag = new URLSearchParams(location.search).get("agentation");
  if (flag === "on" || flag === "1" || flag === "true") {
    localStorage.setItem(STORAGE_KEY, "1");
  } else if (flag === "off" || flag === "0" || flag === "false") {
    localStorage.removeItem(STORAGE_KEY);
  }

  if (localStorage.getItem(STORAGE_KEY) !== "1") return;

  const [agentation, reactMod, reactDomClient] = await Promise.all([
    import("https://esm.sh/agentation@3?deps=react@18,react-dom@18"),
    import("https://esm.sh/react@18"),
    import("https://esm.sh/react-dom@18/client"),
  ]);

  const React = reactMod.default ?? reactMod;
  const { Agentation } = agentation;
  const { createRoot } = reactDomClient;

  const mount = document.createElement("div");
  mount.id = "agentation-root";
  document.body.appendChild(mount);

  // `endpoint` points at the local Agentation MCP server (default port 4747),
  // so annotations sync straight to the coding agent instead of copy/paste.
  createRoot(mount).render(
    React.createElement(Agentation, { endpoint: "http://localhost:4747" })
  );
})();
