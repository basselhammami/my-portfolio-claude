// Per-case auth for the static site on Vercel, using a custom branded login
// page instead of the native Basic Auth dialog.
//
//   SITE_PASSWORD (env var) — gates only the NDA case studies below.
// The rest of the site (home, Balady, Kafu) is public. An unauthenticated
// request for a gated case is redirected to /login.html; that page POSTs the
// password back here, and on a match we set an HttpOnly session cookie. The
// password lives only in the environment variable — never in the page source
// or the repo.

export const config = {
  // Run on every route except Vercel's internal asset requests.
  matcher: ["/((?!_vercel).*)"],
};

// NDA case studies that require the password.
const GATED_PREFIXES = ["/case-rakbank", "/case-mtmx"];

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

  // Only the NDA cases are gated; everything else is public.
  if (sitePassword && GATED_PREFIXES.some((p) => path.startsWith(p))) {
    const cookies = request.headers.get("cookie") || "";
    const token = cookieValue(cookies, SITE_COOKIE);
    if (!token || token !== (await tokenFor("site:" + sitePassword))) {
      return redirectToLogin(request, path, url.search);
    }
  }
}
