// Site-wide auth for the static site on Vercel, using a custom branded login
// page instead of the native Basic Auth dialog.
//
// Flow: an unauthenticated request is redirected to /login.html (styled like
// the site). That page POSTs the shared password back here; on a correct
// password we set a signed, HttpOnly session cookie and let the visitor in.
// The password lives only in the SITE_PASSWORD environment variable — never in
// the page source or the repo.

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

const COOKIE = "site_auth";

// Opaque session token derived from the password, so the cookie never carries
// the raw password. Middleware and the login handler compute it the same way.
async function tokenFor(password) {
  const data = new TextEncoder().encode("portfolio:v1:" + password);
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

export default async function middleware(request) {
  const expected = process.env.SITE_PASSWORD;

  // Fail open until the password is configured, so a missing env var never
  // locks everyone out. Set SITE_PASSWORD in Vercel to activate the gate.
  if (!expected) return;

  const url = new URL(request.url);
  const path = url.pathname;

  // Login submission from the custom page.
  if (path === "/login.html" && request.method === "POST") {
    const form = await request.formData();
    const entered = form.get("password");
    if (typeof entered === "string" && entered === expected) {
      const token = await tokenFor(expected);
      return new Response(null, {
        status: 204,
        headers: {
          "Set-Cookie": `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`,
        },
      });
    }
    return new Response("Incorrect password.", { status: 401 });
  }

  // Assets the login page itself needs.
  if (PUBLIC_PATHS.has(path)) return;

  // Everyone else needs a valid session cookie.
  const cookies = request.headers.get("cookie") || "";
  const token = cookieValue(cookies, COOKIE);
  if (token && token === (await tokenFor(expected))) return;

  // Not authenticated — send them to the branded login page, remembering
  // where they were headed.
  const login = new URL("/login.html", request.url);
  if (path && path !== "/") login.searchParams.set("next", path + url.search);
  return Response.redirect(login, 302);
}
