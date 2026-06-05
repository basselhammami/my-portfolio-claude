// Agentation — visual feedback toolbar for AI coding agents.
// https://agentation.com
//
// This static site has no build step, so Agentation (which ships as a React
// component) is loaded straight from the esm.sh CDN, which resolves its React
// peer dependencies for us. The toolbar only loads on localhost so it never
// appears on the deployed site.
(async () => {
  const host = location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host === ""; // opened via file://
  if (!isLocal) return;

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

  createRoot(mount).render(React.createElement(Agentation));
})();
