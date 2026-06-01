# 道真 AX診断（事業部別）— Phase 1

ダミーCSV で動く最小構成。`reference/mockup.html` の `score()` を忠実移植。

## Web UI（Phase 2）── 攻め / 守り タブ統合

本番: https://michizane.vercel.app

トップページ（`public/index.html`）は2モードをタブで切り替える:
- **攻めの知性**：AX診断（事業部別）。`/data.json`（CSV由来）＋ `/score.mjs` で動く。
- **守りの知性**：防いだ損失額ダッシュボード。`/defense.json`（CSV由来）で動く。
  - 3区分：① 漏洩の回避損 ② 不正・横領の阻止額（道真クロス検知の実額・最重要）③ 早期検知の圧縮額
  - 月切替で推移・阻止イベントを表示。初期表示は最新月。URL `#defend` で守りビュー直開き可。

守りデータは `data/defense.csv` ／ `data/defense-events.csv` を編集 → `npm run build` で `public/defense.json` に反映。
**※ 数字はすべてダミー（試算ロジック検証用）。実データは BigQuery／IRI 実績からの反映が別途必要。**

## 構成
```
michizane/
├── SPEC.md                # 仕様（§4 に score() ロジック）
├── data/
│   ├── inits.csv          # 8 施策マスタ
│   ├── bus.csv            # 3 事業部メタ
│   └── logs.csv           # 事業部 × ログ強度
├── src/
│   ├── csv.mjs            # CSVローダ
│   ├── score.mjs          # §4 のロジック移植
│   └── cli.mjs            # CLI エントリ
├── tests/
│   └── score.test.mjs     # node:test
└── reference/
    └── mockup.html        # 仕様の出処（モックアップ）
```

## 使い方
```
node src/cli.mjs saas          # セキュリティSaaS事業部
node src/cli.mjs legacy        # 受託・保守事業部
node src/cli.mjs newbiz        # 新規プロダクト事業部
node src/cli.mjs saas --json   # JSON
npm test                       # テスト
```

## 検証結果（Phase 1 停止条件）
- ✅ 重点（priority + focus=growth）SaaS → 上位2件が **売上増(rev)**：営業事務／CS
- ✅ 非重点（nonpriority + focus=cost）legacy → 上位3件が **外注削減(cost)**、4〜5位は 増員回避(avoid)
- ✅ §4 の式と `saas/sales` のスコアが厳密一致

