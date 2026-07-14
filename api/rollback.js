// =========================================================
// 管理者専用ロールバックAPI（Vercelサーバーレス関数・michizane上）
//   status画面(/status/)の「前の版に戻す」ボタンの裏側。
//   ・認証: status画面と同じ Google ログイン(GIS)の IDトークンをサーバーで検証。
//           @eltes.co.jp かつ ROLLBACK_ADMIN_EMAILS に含まれるメールのみ許可。
//   ・対象: 下の TARGETS に定義したプロジェクトのみ（任意のprojectIdは不可）。
//   ・動作: 過去の本番デプロイを一覧 → 選んだ版を promote（＝ロールバック）。
//   ※ 制御面はロールバック対象(eltes-holly)から独立した michizane に置く
//     （タツヤを戻してもこのボタンの裏側が巻き込まれないため）。
//
//   必要な環境変数（Vercel: michizane プロジェクト）:
//     VERCEL_TOKEN          … Vercel APIトークン（対象チームのデプロイ権限）。必須・秘密。
//     ROLLBACK_ADMIN_EMAILS … ロールバックを許可するメール（カンマ区切り）。必須。
//     VERCEL_TEAM_ID        … 省略時は既定のチームID。
//     ROLLBACK_GIS_CLIENT_ID… 省略時は status画面と同じ既定のクライアントID。
// =========================================================

const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_nhIzEX6UAXKRId33GtPeTxfO';
const CLIENT_ID = process.env.ROLLBACK_GIS_CLIENT_ID
  || '224281821934-370bp8phff1bi06045qp8037cr9b8h4m.apps.googleusercontent.com';
const ALLOWED_DOMAIN = 'eltes.co.jp';

// ロールバック可能な対象プロジェクトの許可リスト（クライアントからは name のみ受け取る）。
const TARGETS = {
  tatsuya: { projectId: 'prj_FZu2vS84WW5IK0MEHIixAZuhcWAU', label: 'タツヤ (eltes-holly)' },
};

const ADMINS = (process.env.ROLLBACK_ADMIN_EMAILS || '')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

// --- GISのIDトークンを Google の tokeninfo で検証し、管理者か判定する ---
async function verifyAdmin(req) {
  const m = String(req.headers.authorization || '').match(/^Bearer (.+)$/);
  if (!m) return { error: 'ログインが必要です。', status: 401 };
  let info;
  try {
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(m[1]));
    if (!r.ok) return { error: '認証トークンが無効です。サインインし直してください。', status: 401 };
    info = await r.json();
  } catch (e) {
    return { error: 'トークン検証に失敗しました。', status: 401 };
  }
  if (info.aud !== CLIENT_ID) return { error: 'トークンの発行先が不正です。', status: 401 };
  const email = String(info.email || '').toLowerCase();
  const verified = info.email_verified === true || info.email_verified === 'true';
  if (!email || !verified) return { error: 'メールアドレスが確認できないアカウントです。', status: 403 };
  const domain = String(info.hd || '').toLowerCase() || (email.split('@')[1] || '');
  if (domain !== ALLOWED_DOMAIN) return { error: `社内アカウント（@${ALLOWED_DOMAIN}）のみ利用できます。`, status: 403 };
  if (!ADMINS.length) return { error: 'ロールバックの管理者が未設定です（ROLLBACK_ADMIN_EMAILS）。', status: 403 };
  if (!ADMINS.includes(email)) return { error: 'ロールバックの権限がありません。', status: 403 };
  return { email };
}

function vercelHeaders() {
  return { Authorization: `Bearer ${process.env.VERCEL_TOKEN || ''}`, 'Content-Type': 'application/json' };
}

// 対象プロジェクトの本番デプロイ一覧＋「現在の本番」を返す。
async function listDeployments(projectId) {
  const q = `projectId=${encodeURIComponent(projectId)}&target=production&limit=15&teamId=${encodeURIComponent(TEAM_ID)}`;
  const r = await fetch(`https://api.vercel.com/v6/deployments?${q}`, { headers: vercelHeaders() });
  if (!r.ok) throw new Error(`Vercel一覧取得に失敗 (${r.status})`);
  const data = await r.json();
  // 現在の本番デプロイID（ロールバック後は最新とは限らないので project から取る）
  let currentId = null;
  try {
    const pr = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}?teamId=${encodeURIComponent(TEAM_ID)}`, { headers: vercelHeaders() });
    if (pr.ok) { const p = await pr.json(); currentId = p?.targets?.production?.id || null; }
  } catch (e) { /* 現在版マークは付かないだけ */ }
  const items = (data.deployments || []).map((d) => ({
    uid: d.uid,
    created: d.created || d.createdAt || null,
    state: d.state || d.readyState || null,
    url: d.url || null,
    sha: (d.meta && (d.meta.githubCommitSha || d.meta.gitCommitSha)) || null,
    message: (d.meta && (d.meta.githubCommitMessage || d.meta.gitCommitMessage)) || '',
    current: currentId ? d.uid === currentId : false,
  }));
  return { items, currentId };
}

async function promote(projectId, deploymentId) {
  const r = await fetch(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/promote/${encodeURIComponent(deploymentId)}?teamId=${encodeURIComponent(TEAM_ID)}`,
    { method: 'POST', headers: vercelHeaders() },
  );
  if (!(r.status === 200 || r.status === 201 || r.status === 202)) {
    let msg = `Vercel promote 失敗 (${r.status})`;
    try { const e = await r.json(); if (e && e.error && e.error.message) msg += `: ${e.error.message}`; } catch (_) {}
    throw new Error(msg);
  }
  return true;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (_) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!process.env.VERCEL_TOKEN) {
      res.status(503).json({ error: 'サーバー側の設定不足（VERCEL_TOKEN未設定）。' });
      return;
    }
    const gate = await verifyAdmin(req);
    if (gate.error) { res.status(gate.status).json({ error: gate.error }); return; }

    if (req.method === 'GET') {
      const action = String(req.query.action || 'deployments');
      if (action === 'targets') {
        res.status(200).json({ targets: Object.entries(TARGETS).map(([k, v]) => ({ key: k, label: v.label })) });
        return;
      }
      // action=deployments
      const tk = String(req.query.target || '');
      const target = TARGETS[tk];
      if (!target) { res.status(400).json({ error: '対象が不正です。' }); return; }
      const { items } = await listDeployments(target.projectId);
      res.status(200).json({ target: { key: tk, label: target.label }, admin: gate.email, deployments: items });
      return;
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (String(body.action || 'rollback') !== 'rollback') { res.status(400).json({ error: '未対応のアクションです。' }); return; }
      const tk = String(body.target || '');
      const target = TARGETS[tk];
      if (!target) { res.status(400).json({ error: '対象が不正です。' }); return; }
      const deploymentId = String(body.deploymentId || '');
      if (!deploymentId) { res.status(400).json({ error: 'deploymentId が必要です。' }); return; }
      // 安全確認: 指定IDが当該プロジェクトの本番デプロイ一覧に実在することを確認（他プロジェクト混入防止）。
      const { items, currentId } = await listDeployments(target.projectId);
      const hit = items.find((d) => d.uid === deploymentId);
      if (!hit) { res.status(400).json({ error: '指定した版がこのプロジェクトに見つかりません。' }); return; }
      if (deploymentId === currentId) { res.status(409).json({ error: 'その版は既に現在の本番です。' }); return; }

      await promote(target.projectId, deploymentId);
      // 監査ログ（Vercelの関数ログに残る）。永続監査が要るなら後日DB化。
      console.log(JSON.stringify({
        audit: 'rollback', at: new Date().toISOString(), admin: gate.email,
        target: tk, projectId: target.projectId, toDeployment: deploymentId, fromCurrent: currentId,
        sha: hit.sha, message: hit.message,
      }));
      res.status(200).json({ ok: true, promoted: deploymentId, target: tk, admin: gate.email });
      return;
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
