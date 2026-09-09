// Auth for the static site on Vercel, using a custom branded login page
// instead of the native Basic Auth dialog.
//
//   SITE_PASSWORD (env var) — the password gating the case studies.
//
// The landing page is public so the work can be linked and shared. Everything
// else — the case studies and the screenshots inside them — is private, so a
// request for one is redirected to /login.html. That page POSTs the password
// back here, and on a match we set an HttpOnly session cookie. The password
// lives only in the environment variable, never in the page source or the repo.

export const config = {
  // Run on every route except Vercel's internal asset requests.
  matcher: ["/((?!_vercel).*)"],
};

// The public site: the landing page, what it and the login page load, and the
// four card thumbnails the landing page shows. Anything absent from this list
// needs the password, so a new case study or screenshot is private the moment
// it is added — add a path here only to deliberately make it public.
const PUBLIC_PATHS = new Set([
  "/",
  "/index.html",
  "/index-ru.html",
  "/login.html",
  "/styles.css",
  "/script.js",
  "/agentation.js",
  "/assets/basel.jpg",
  "/assets/basel-hammami-cv.pdf",
  // Share image, so link previews render for logged-out crawlers.
  "/assets/og-image.png",
  "/assets/favicon-16.png",
  "/assets/favicon-32.png",
  "/assets/favicon-192.png",
  "/assets/apple-touch-icon.png",
  // Case study card art on the landing page. These four are the only case
  // images that stay public; the rest of each case is behind the password.
  "/assets/clm-audit-timeline.webp",
  "/assets/mtmx-card.webp",
  "/assets/balady-card.webp",
  "/assets/kafu-hero-2.webp",
]);

// Case studies hidden from the site entirely (pages and their images) —
// remove a prefix here to bring the case back.
const HIDDEN_PREFIXES = ["/case-cram", "/assets/cram-"];

const SITE_COOKIE = "site_auth";

// Opaque session token derived from the password, so the cookie never carries
// the raw password. Middleware and the login handler compute it the same way.
async function tokenFor(seed) {
  const data = new TextEncoder().encode("portfolio:v1:" + seed);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function cookieValue(header, name) {
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

function redirectToLogin(request, path, search) {
  const login = new URL("/login.html", request.url);
  if (path && path !== "/") login.searchParams.set("next", path + search);
  return Response.redirect(login, 302);
}

export default async function middleware(request) {
  const sitePassword = process.env.SITE_PASSWORD;

  const url = new URL(request.url);
  const path = url.pathname;

  // Login submission from the custom page.
  if (path === "/login.html" && request.method === "POST") {
    const form = await request.formData();
    const entered = form.get("password");
    if (sitePassword && typeof entered === "string" && entered === sitePassword) {
      const token = await tokenFor("site:" + sitePassword);
      return new Response(null, {
        status: 204,
        headers: {
          "Set-Cookie": `${SITE_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`,
        },
      });
    }
    return new Response("Incorrect password.", { status: 401 });
  }

  // Hidden case studies — send any request for them back to the homepage.
  if (HIDDEN_PREFIXES.some((p) => path.startsWith(p))) {
    return Response.redirect(new URL("/", request.url), 302);
  }

  // The public site.
  if (PUBLIC_PATHS.has(path)) return;

  // Everything else — the case studies and their images — needs the password.
  if (sitePassword) {
    const cookies = request.headers.get("cookie") || "";
    const token = cookieValue(cookies, SITE_COOKIE);
    if (!token || token !== (await tokenFor("site:" + sitePassword))) {
      return redirectToLogin(request, path, url.search);
    }
  }
}
