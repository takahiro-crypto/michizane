// 全ソースを 1 つの Markdown にまとめて出力する。
// claude.ai にそのまま貼り付け／添付できる形式。
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, sep } from 'node:path';
import { readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const INCLUDE = [
  'CLAUDE.md',
  'README.md',
  'SPEC.md',
  'package.json',
  'vercel.json',
  '.gitignore',
  'src',
  'tests',
  'scripts',
  'data',
  'public/index.html',
  'reference/mockup.html',
];

const EXT_LANG = {
  '.md': 'markdown', '.mjs': 'javascript', '.js': 'javascript',
  '.json': 'json', '.html': 'html', '.css': 'css', '.csv': 'csv',
  '.txt': '', '.gitignore': '',
};

function walk(p, acc = []) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const child of readdirSync(p).sort()) {
      if (child === 'node_modules' || child === '.vercel') continue;
      walk(resolve(p, child), acc);
    }
  } else {
    acc.push(p);
  }
  return acc;
}

const files = [];
for (const item of INCLUDE) {
  const abs = resolve(ROOT, item);
  try {
    walk(abs, files);
  } catch {
    // 単一ファイル指定で存在しない場合スキップ
  }
}

const rel = p => relative(ROOT, p).split(sep).join('/');
files.sort((a, b) => rel(a).localeCompare(rel(b)));

const header = `# 道真 AX診断（事業部別）— ソースバンドル

このファイルは \`scripts/bundle.mjs\` で自動生成された全ソース・スナップショットです。
claude.ai にこの 1 ファイルを貼り付け／添付すれば、プロジェクト全貌が伝わります。

- 本番URL: https://michizane.vercel.app
- リポジトリ構成: 各 \`### path\` セクションがそのままディレクトリ構成

## 概要

- **目的**: 事業部の「事業計画」と「ログ実態」を掛け合わせ、重点/非重点に応じた最適な AX 施策をランキング提案
- **Phase 1**: ダミーCSV + CLI + node:test
- **Phase 2**: Web UI（mockup.html ベース、データ駆動）→ Vercel 静的デプロイ
- **共有ロジック**: \`src/score.mjs\` を CLI / テスト / ブラウザで共有（\`public/score.mjs\` は build 時コピー）

## ファイル一覧
${files.map(f => `- \`${rel(f)}\``).join('\n')}

---

`;

const sections = files.map(f => {
  const r = rel(f);
  const body = readFileSync(f, 'utf-8');
  const ext = '.' + r.split('.').pop();
  const lang = EXT_LANG[ext] ?? '';
  // フェンス文字を本文に含むファイル（mockup.html はバックティック未使用なので OK だが安全に ~~~ を使う）
  return `### \`${r}\`\n\n~~~${lang}\n${body}\n~~~\n`;
}).join('\n');

const out = resolve(ROOT, 'BUNDLE.md');
writeFileSync(out, header + sections);

const size = statSync(out).size;
console.log(`bundle ok: ${files.length} files → ${rel(out)} (${(size / 1024).toFixed(1)} KB)`);

