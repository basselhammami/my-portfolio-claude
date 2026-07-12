// Site-wide HTTP Basic Auth, enforced at Vercel's edge before any file is
// served. The shared password is read from the SITE_PASSWORD environment
// variable — set it in the Vercel dashboard (Project → Settings → Environment
// Variables); never commit the password. Any username is accepted; only the
// password is checked, so visitors just enter the shared password.

export const config = {
  // Protect every route except Vercel's own internal asset requests.
  matcher: ["/((?!_vercel).*)"],
};

export default function middleware(request) {
  const expected = process.env.SITE_PASSWORD;

  // Fail open if the password hasn't been configured yet, so a missing env var
  // never locks everyone out silently. Once SITE_PASSWORD is set in Vercel,
  // this guard is effectively a no-op.
  if (!expected) return;

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (password === expected) return; // authorized — serve the request
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Basel Hammami — Portfolio"',
    },
  });
}
