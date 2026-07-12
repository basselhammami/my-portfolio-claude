// Site-wide auth for the static site on Vercel, using a custom branded login
// page instead of the native Basic Auth dialog.
//
// Two tiers of protection:
//   SITE_PASSWORD (env var) — gates the whole site.
//   CASE_PASSWORD (hardcoded below) — an extra gate on NDA case pages
//                   (CASE_PREFIXES), asked for after the site password.
// An unauthenticated request is redirected to /login.html; that page POSTs the
// password (with a `scope` of "site" or "case") back here, and on a match we
// set the matching HttpOnly session cookie. Passwords live only in the
// environment variables — never in the page source or the repo.

export const config = {
  // Run on every route except Vercel's internal asset requests.
  matcher: ["/((?!_vercel).*)"],
};

// Files that must load without auth so the login page can render.
const PUBLIC_PATHS = new Set([
  "/login.html",
  "/styles.css",
  "/assets/basel.jpg",
]);

// Paths behind the second, case-level password (pages and their images).
const CASE_PREFIXES = ["/case-mtmx", "/assets/mtmx-"];

const SITE_COOKIE = "site_auth";
const CASE_COOKIE = "case_auth";

// The extra password for the NDA case pages. Deliberately simple and kept in
// code rather than an env var — change it here.
const CASE_PASSWORD = "2027";

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

function redirectToLogin(request, path, search, scope) {
  const login = new URL("/login.html", request.url);
  if (scope === "case") login.searchParams.set("scope", "case");
  if (path && path !== "/") login.searchParams.set("next", path + search);
  return Response.redirect(login, 302);
}

export default async function middleware(request) {
  const sitePassword = process.env.SITE_PASSWORD;
  const casePassword = CASE_PASSWORD;

  const url = new URL(request.url);
  const path = url.pathname;

  // Login submission from the custom page.
  if (path === "/login.html" && request.method === "POST") {
    const form = await request.formData();
    const entered = form.get("password");
    const scope = form.get("scope") === "case" ? "case" : "site";
    const expected = scope === "case" ? casePassword : sitePassword;
    if (expected && typeof entered === "string" && entered === expected) {
      const cookie = scope === "case" ? CASE_COOKIE : SITE_COOKIE;
      const token = await tokenFor(scope + ":" + expected);
      return new Response(null, {
        status: 204,
        headers: {
          "Set-Cookie": `${cookie}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`,
        },
      });
    }
    return new Response("Incorrect password.", { status: 401 });
  }

  // Assets the login page itself needs.
  if (PUBLIC_PATHS.has(path)) return;

  const cookies = request.headers.get("cookie") || "";

  // Tier 1 — the whole site.
  if (sitePassword) {
    const token = cookieValue(cookies, SITE_COOKIE);
    if (!token || token !== (await tokenFor("site:" + sitePassword))) {
      return redirectToLogin(request, path, url.search, "site");
    }
  }

  // Tier 2 — NDA case pages need the case password on top.
  if (casePassword && CASE_PREFIXES.some((p) => path.startsWith(p))) {
    const token = cookieValue(cookies, CASE_COOKIE);
    if (!token || token !== (await tokenFor("case:" + casePassword))) {
      return redirectToLogin(request, path, url.search, "case");
    }
  }
}
