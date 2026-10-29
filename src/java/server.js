import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "localhost";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const requested = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const resolved = resolve(root, requested);
  const relativePath = relative(root, resolved);
  return relativePath.startsWith("..") || isAbsolute(relativePath) ? join(root, "index.html") : resolved;
}

const server = createServer(async (request, response) => {
  try {
    const filePath = safePath(request.url || "/");
    let body;
    try {
      body = await readFile(filePath);
    } catch {
      if (extname(filePath)) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found.");
        return;
      }
      body = await readFile(join(root, "index.html"));
    }
    const type = contentTypes[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Atmosphere could not serve this request.");
    console.error(error);
  }
});

server.listen(port, host, () => {
  console.log(`Atmosphere listening on http://${host}:${port}`);
});
