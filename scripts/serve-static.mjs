// A strict production-artifact server: unknown paths return 404, never the SPA.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("dist");
const port = Number(process.env.TEST_PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain" };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) {
      if (!url.pathname.endsWith("/")) { response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end(); return; }
      path = resolve(path, "index.html");
    }
    const content = await readFile(path);
    response.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch { response.writeHead(404).end("Not found"); }
}).listen(port, "127.0.0.1", () => console.log(`Serving dist at http://127.0.0.1:${port}`));
