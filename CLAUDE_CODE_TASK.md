# Claude Code 引き渡し ── 道真 守りタブ統合（Vercel デプロイ）

このフォルダは `michizane.vercel.app` のリポジトリに、**守りの知性（防いだ損失額）タブ**を統合した完成版です。
攻めの既存機能（AX診断・事業部別）は一切変更していません。

本番: https://michizane.vercel.app

---

## Claude Code に渡す最初の指示（コピペ可）

```
このリポジトリは道真AX診断（michizane.vercel.app）の更新版。
攻め／守りのタブ統合を入れた完成状態。中身は検証済み。
やってほしいこと：
1. `npm test` と `node scripts/build-static.mjs` が通ることを確認
2. `npm run dev` で localhost を立て、攻めタブ・守りタブ両方が表示されることを目視
3. 問題なければ git add → commit → push して Vercel に反映
GitHub 認証・push・Vercel ログインは私（人間）が行うので、その手前で一度止めて。
```

---

## このバージョンで追加・変更したファイル

### 追加（守りデータ、CSV駆動）
- `data/defense.csv` — 月次×3区分の防いだ損失額（百万円）
- `data/defense-events.csv` — 月ごとの主な阻止イベント

### 変更
- `public/index.html` — ヘッダー直下に「攻めの知性／守りの知性」タブを追加。
  攻めUIを `#attack-view` でラップ、守りビュー `#defense-view` と守りJSを追加。
  既存の攻めロジック（`/data.json` + `/score.mjs`）は無変更。
- `src/csv.mjs` — `loadDefense()` を追加（守りCSVローダ）。
- `scripts/build-static.mjs` — `public/defense.json` も生成するよう拡張。
- `src/server.mjs` — dev用に `/defense.json` エンドポイントを追加。
- `.gitignore` — ビルド成果物 `public/defense.json` を除外に追加。
- `README.md` — 守りビューの説明を追記。

### 無変更（攻め側コア）
- `src/score.mjs`, `src/cli.mjs`, `tests/score.test.mjs`, `data/{bus,inits,logs}.csv`, `vercel.json`

---

## 守りビューの設計（攻めと対称）

攻めが「3つのP/L変換（売上増／外注削減／増員回避）」を**円**で見せるのに対し、
守りは「防いだ損失額」を同じ**円**で見せて経営価値を対称化する。

3区分：
1. **漏洩の回避損** — 想定単価 × 阻止件数
2. **不正・横領の阻止額** — 道真クロス検知で止めた実額（最重要・magenta強調）
3. **早期検知の圧縮額** — 検知30時間 vs 放置カーブの差分

- 月切替で推移・阻止イベントを表示。初期表示は最新月（現在 2026年6月）。
- URL `#defend` で守りビュー直開き。守りは初回タブクリック時に遅延ロード。

---

## データ更新のしかた（実データ反映時）

**※ 現在の数字はすべてダミー（試算ロジック検証用）。実データは BigQuery／IRI 実績から反映する。**

`data/defense.csv`（月・3区分の損失額・件数）と `data/defense-events.csv`（阻止イベント）を
編集 → `npm run build` で `public/defense.json` が再生成され UI に反映される。
攻め側と同じ CSV駆動なので、PPTやダッシュボードの数字を一箇所で管理できる。

---

## デプロイの流れ（人間が実施）

1. このフォルダの中身を既存 michizane リポジトリに反映（上記の追加・変更ファイル）
2. `npm test` / `node scripts/build-static.mjs` で確認、`npm run dev` で目視
3. `git add -A && git commit -m "守りの知性タブを統合（防いだ損失額）" && git push`
4. Vercel が `vercel.json` の `buildCommand`（= `build-static.mjs`）で自動ビルド
   → `data.json` / `score.mjs` / `defense.json` を生成 → `michizane.vercel.app` に反映

GitHub 連携・push・Vercel 認証は人間が行う操作（Claude Code は手前で止める想定）。
