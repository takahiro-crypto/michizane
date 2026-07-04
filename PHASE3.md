# Phase 3 ─ 実データ差し込みガイド

現状の数字は**ダミー**（試算ロジック検証用）。ここに実データを流し込めば全体に反映される。
編集は `data/*.csv` だけ → `npm run build`（Vercelも同コマンド）→ `public/*.json` 再生成 → 反映。

> 例外：攻めビュー上部の「全社の“攻め”実測 ─ オートクリスタル」バンドは **既に実測**（2026-04操作ログ：995h/月・35.8百万円/年・手動巡回43万件/月）。ここはダミーではない。

## 差し込み先と必要データ（source）

### 守り（最優先。経営に効く実額）
| ファイル | 列 | 意味 | source |
|---|---|---|---|
| `data/defense.csv` | `leak / fraud / early`（百万円）＋`leakUnit,leakCnt,fraudCnt` | 月次の①漏洩回避損／②不正・横領阻止額／③早期検知圧縮額 | **IRI実績**（②が最重要・実額） |
| `data/defense-events.csv` | `month,cat,title,sub,value` | 月ごとの主な阻止イベント | **道真×ホーリー PoCの検知出力**（仕訳×Slack×ログのクロス検知＝経費不正/粉飾/循環取引/キックバック/持ち出し） |

### 攻め（AX診断）
| ファイル | 列 | 意味 | source |
|---|---|---|---|
| `data/logs.csv` | `bu_id,log_key,intensity` | 事業部×ログ強度（負荷分布） | **BigQuery**（事業部別ログ集計） |
| `data/bus.csv` | 事業部メタ＋`plan`(growth/focus/head/…) | 実際の事業部名・事業計画 | 事業計画（現状は仮名 saas/legacy/newbiz） |
| `data/inits.csv` | `baseRev,baseCost,ease` | 8施策の効果係数 | 業務側の妥当性確認（現状モック値） |

## 手順
1. 上表の source から値を取得し、**CSVのスキーマ（列構成）を維持したまま値だけ**書き換える。
2. `npm run build` で `public/data.json` / `public/defense.json` を再生成。
3. `git push`（`main`）→ **GitHub連携でVercelが自動デプロイ**。
4. ダミー明示の文言（守りバンドの「※現在の金額はダミー」）は、実データ化した区分から順に外す。

## 依頼（これが揃えば即実装）
- **IRI実績**：直近数か月の leak/fraud/early（百万円）と主な阻止イベント（金額つき）。
- **BigQuery**：事業部×ログ強度（`logs.csv`相当）。
- 実事業部名・事業計画（`bus.csv`の仮名を差し替え）。
