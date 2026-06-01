import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname, join, normalize } from 'node:path';
import { loadDataset, loadDefense } from './csv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const SRC_DIR = resolve(ROOT, 'src');
const DATA_DIR = resolve(ROOT, 'data');

const PORT = Number(process.env.PORT || 5174);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'cache-control': 'no-store', ...headers });
  res.end(body);
}

function serveFile(res, absPath) {
  if (!existsSync(absPath) || !statSync(absPath).isFile()) {
    return send(res, 404, 'Not Found');
  }
  const mime = MIME[extname(absPath)] || 'application/octet-stream';
  send(res, 200, readFileSync(absPath), { 'content-type': mime });
}

function safeJoin(baseDir, urlPath) {
  // パス・トラバーサル防御
  const p = normalize(join(baseDir, urlPath));
  if (!p.startsWith(baseDir)) return null;
  return p;
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // 本番（Vercel 静的）と同じパスを dev でも提供：
    // /data.json は CSV からライブ生成、/score.mjs は src/ から配信
    if (pathname === '/data.json') {
      const data = loadDataset(DATA_DIR);
      return send(res, 200, JSON.stringify(data), { 'content-type': MIME['.json'] });
    }
    if (pathname === '/defense.json') {
      const defense = loadDefense(DATA_DIR);
      return send(res, 200, JSON.stringify(defense), { 'content-type': MIME['.json'] });
    }
    if (pathname === '/score.mjs') {
      return serveFile(res, resolve(SRC_DIR, 'score.mjs'));
    }
    if (pathname === '/api/health') {
      return send(res, 200, JSON.stringify({ ok: true }), { 'content-type': MIME['.json'] });
    }

    // 静的ファイル
    const requested = pathname === '/' ? '/index.html' : pathname;
    const abs = safeJoin(PUBLIC_DIR, requested);
    if (!abs) return send(res, 400, 'Bad Path');
    return serveFile(res, abs);
  } catch (e) {
    console.error('[server error]', e);
    send(res, 500, 'Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`michizane Phase 2 server: http://localhost:${PORT}`);
});

