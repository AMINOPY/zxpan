import { readFile, writeFile, mkdir } from "node:fs/promises";

const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const output = `const HTML = ${JSON.stringify(html)};

const SECURITY_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  "cache-control": "public, max-age=300, s-maxage=3600"
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== "/" && url.pathname !== "/index.html" && url.pathname !== "/health" && url.pathname !== "/robots.txt" && url.pathname !== "/favicon.ico") {
      const target = new URL(request.url);
      target.hostname = "zx-panel.aminopy-xray.workers.dev";
      const upstream = await fetch(new Request(target, request));
      const headers = new Headers(upstream.headers);
      const location = headers.get("location");
      if (location && location.startsWith("https://zx-panel.aminopy-xray.workers.dev")) {
        headers.set("location", location.replace("https://zx-panel.aminopy-xray.workers.dev", url.origin));
      }
      return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
    }
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "ZX PANEL site", timestamp: new Date().toISOString() }, {
        headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { "allow": "GET, HEAD", "content-type": "text/plain; charset=utf-8" } });
    }
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\\nAllow: /\\n", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
    }
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", "x-content-type-options": "nosniff" } });
    }
    return new Response(request.method === "HEAD" ? null : HTML, { status: 200, headers: SECURITY_HEADERS });
  }
};
`;
await mkdir(new URL("../src/", import.meta.url), { recursive: true });
await writeFile(new URL("../src/index.js", import.meta.url), output);
console.log("Built ZX PANEL Worker from public/index.html");
