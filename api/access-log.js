// =========================================================
// アクセスログ記録API（Vercelサーバレス関数・michizane上）
//   要望「社内システムへのアクセスログ記録機能」対応（伊藤達也・2026-07-18）。
//   /status 等の静的ページから beacon で叩かれ、「誰が・いつ・どこに」アクセスしたかを
//   構造化ログ(JSON1行)で Vercel の関数ログ(Runtime Logs)に記録する。
//     ・記録項目: 日時 / IPアドレス / パス / リファラ / UA /（分かればログインユーザー email）
//     ・保存先: 現状は Vercel Runtime Logs（保持期間はプラン依存）。永続監査が要るなら後日DB化。
//     ・管理操作(rollback)は api/rollback.js 側で既に監査ログ済み。ここは一般アクセスの記録。
//   ※ ビーコン用途なので、失敗してもアクセス自体は妨げない（常に軽量応答を返す）。
// =========================================================

// クライアントIP（Vercelは x-forwarded-for の先頭が実IP）。
function clientIp(req) {
  const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || String(req.headers['x-real-ip'] || '') || (req.socket && req.socket.remoteAddress) || '';
}

// 小さなJSONボディを安全に読む（4KB上限。ビーコンは極小前提）。
async function readSmallBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 4096) { raw = raw.slice(0, 4096); req.destroy(); } });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (_) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const body = req.method === 'POST' ? await readSmallBody(req) : (req.query || {});
    const rec = {
      access: 'page',
      at: new Date().toISOString(),
      ip: clientIp(req),
      path: String(body.path || '').slice(0, 300),
      ref: String(body.ref || req.headers['referer'] || '').slice(0, 300),
      user: String(body.user || '').toLowerCase().slice(0, 120) || null,
      event: String(body.event || 'view').slice(0, 40),
      app: String(body.app || 'michizane').slice(0, 40),
      ua: String(req.headers['user-agent'] || '').slice(0, 300),
    };
    console.log(JSON.stringify({ audit: 'access', ...rec }));
    res.status(204).end(); // ビーコンなので本文は返さない。
  } catch (e) {
    // ログ失敗でアクセスを妨げない。
    try { res.status(204).end(); } catch (_) { /* noop */ }
  }
}
