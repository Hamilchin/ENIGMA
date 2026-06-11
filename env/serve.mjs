// Minimal static file server rooted at games/ — serves frozen game bytes offline.
// A game is reachable at  http://localhost:<port>/<id>/dist/<entry>
// Importable: `const { server, port } = await serve()`  — or run standalone: `node env/serve.mjs`
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
export const GAMES_ROOT = join(__dir, '..', 'games');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

export async function serve(root = GAMES_ROOT, port = 0) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      // prevent path traversal
      const filePath = normalize(join(root, p));
      if (!filePath.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
      let target = filePath;
      try { if ((await stat(target)).isDirectory()) target = join(target, 'index.html'); } catch {}
      const body = await readFile(target);
      const type = MIME[extname(target).toLowerCase()] || 'application/octet-stream';
      // extensionless game assets (e.g. pacific-black-cats "boat") -> serve as binary
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(body);
    } catch (e) {
      res.writeHead(e.code === 'ENOENT' ? 404 : 500).end(String(e.code || e));
    }
  });
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  return { server, port: server.address().port, root };
}

// URL for a game record (uses its `entry` path relative to dist/).
export function gameURL(port, rec) {
  const entry = rec.entry || 'index.html';
  return `http://127.0.0.1:${port}/${rec.id}/dist/${entry}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { port } = await serve(GAMES_ROOT, Number(process.argv[2]) || 8013);
  console.log(`[serve] games/ at http://127.0.0.1:${port}/  (e.g. /2025-clawstrike/dist/index.html)`);
}
