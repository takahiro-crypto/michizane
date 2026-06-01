# 道真 AX診断（事業部別）— ソースバンドル

このファイルは `scripts/bundle.mjs` で自動生成された全ソース・スナップショットです。
claude.ai にこの 1 ファイルを貼り付け／添付すれば、プロジェクト全貌が伝わります。

- 本番URL: https://michizane.vercel.app
- リポジトリ構成: 各 `### path` セクションがそのままディレクトリ構成

## 概要

- **目的**: 事業部の「事業計画」と「ログ実態」を掛け合わせ、重点/非重点に応じた最適な AX 施策をランキング提案
- **Phase 1**: ダミーCSV + CLI + node:test
- **Phase 2**: Web UI（mockup.html ベース、データ駆動）→ Vercel 静的デプロイ
- **共有ロジック**: `src/score.mjs` を CLI / テスト / ブラウザで共有（`public/score.mjs` は build 時コピー）

## ファイル一覧
- `.gitignore`
- `data/bus.csv`
- `data/defense-events.csv`
- `data/defense.csv`
- `data/inits.csv`
- `data/logs.csv`
- `package.json`
- `public/index.html`
- `README.md`
- `reference/mockup.html`
- `scripts/build-static.mjs`
- `scripts/bundle.mjs`
- `SPEC.md`
- `src/cli.mjs`
- `src/csv.mjs`
- `src/score.mjs`
- `src/server.mjs`
- `tests/score.test.mjs`
- `vercel.json`

---

### `.gitignore`

~~~
node_modules/
.vercel/
.env
.env.local
.DS_Store
# ビルド成果物（Vercel 側でビルドするのでコミット不要）
public/data.json
public/score.mjs
public/defense.json

.vercel


~~~

### `data/bus.csv`

~~~csv
id,name,role,roleLabel,desc,growth,head,focus,planLine
saas,セキュリティSaaS事業部,priority,重点｜成長ドライバー,主力の成長エンジン,30,増員可（成長投資）,growth,売上 +30% / 積極投資
legacy,受託・保守事業部,nonpriority,非重点｜収益維持,成熟・効率化フェーズ,0,削減（省人化）,cost,売上 据え置き / 利益重視
newbiz,新規プロダクト事業部,priority,重点｜先行投資,立ち上げ・スケール前,30,増員可（立上げ）,growth,売上 +30% / 立ち上げ加速


~~~

### `data/defense-events.csv`

~~~csv
month,cat,title,sub,value
2026-04,leak,営業部・大量ファイル外部持出し兆候を発火前に遮断,漏洩回避｜想定 ¥21百万,¥21百万
2026-04,fraud,経理・架空仕訳とSlack削除の同時発生を検知,横領阻止｜確証2件のうち1件,¥24百万
2026-04,early,退職予定者の権限外アクセスを早期遮断,早期検知｜被害圧縮分,¥9百万
2026-05,leak,委託先経由の顧客情報ダウンロードを異常検知,漏洩回避｜想定 ¥28百万,¥28百万
2026-05,fraud,立替経費の循環振替パターンを仕訳×Slackで確証,横領阻止｜最大単件,¥31百万
2026-05,early,特権ID共有の常態化を検知し是正,早期検知｜被害圧縮分,¥11百万
2026-06,leak,M&A関連の機密資料の私有クラウド同期を遮断,漏洩回避｜想定 ¥35百万,¥35百万
2026-06,fraud,取引先キックバックの兆候を仕訳×Slackで確証,横領阻止｜最重要・実額,¥48百万
2026-06,early,深夜帯の大量DB抽出を30時間以内に検知・遮断,早期検知｜放置比の圧縮分,¥14百万

~~~

### `data/defense.csv`

~~~csv
month,label,leak,fraud,early,leakUnit,leakCnt,fraudCnt
2026-04,2026年4月,84,38,21,約700万円,12,2
2026-05,2026年5月,96,52,25,約700万円,14,3
2026-06,2026年6月,108,67,29,約700万円,15,3

~~~

### `data/inits.csv`

~~~csv
id,name,lever,baseRev,baseCost,ease,log,serves,rat,native
sales,営業事務の自動化,rev,1.6,,3,salesAdmin,売上成長,提案書・見積・日程調整をCoworkが代行。営業が顧客接点に集中し同じ人員で受注機会が増える。,アポ 2→3.6件/日
cs,カスタマーサポート一次対応の自動化,rev,1.1,,2,csLoad,売上成長・人手不足,一次対応をAIが処理。解約抑制とLTV向上、増員も抑える。,応答時間 −60%
keiri,経理・経費処理の自動化,cost,,1.2,4,backoffice,コスト削減,OCR・規程チェック・仕訳生成を内製化。外部委託費が実額で消える。,外注 ¥1.2M/月 解約
billing,請求・債権管理の自動化,cost,,0.9,3,billing,コスト削減,請求発行・消込・督促を自動化。委託費削減と担当者の負荷軽減。,委託 ¥0.9M/月
kitting,PCキッティング・情シス運用の自動化,cost,,0.7,5,itOps,コスト削減,構成適用・台帳登録を自動化。最も着手しやすく外注費を即削減。,外注 ¥0.7M/月
hire,採用オペレーションの自動化,avoid,,1.1,3,hiring,人手不足・成長,スクリーニング・日程調整を自動化。採用ペースを上げつつ人事の増員は回避。,採用工数 −70%
overtime,残業計算・勤怠処理の自動化,avoid,,0.5,5,attendance,コスト・人手不足,勤怠集計・チェックを自動化。着手容易で処理能力を確保。,1.0名分
report,月次レポーティングの自動化,avoid,,0.8,4,reporting,全社最適,集計・可視化を自動化。意思決定の高速化と管理工数削減。,管理工数 1.4名分


~~~

### `data/logs.csv`

~~~csv
bu_id,log,value
saas,salesAdmin,0.9
saas,csLoad,0.85
saas,hiring,0.7
saas,billing,0.35
saas,backoffice,0.25
saas,itOps,0.2
saas,attendance,0.25
saas,reporting,0.3
legacy,backoffice,0.9
legacy,billing,0.85
legacy,reporting,0.7
legacy,attendance,0.6
legacy,itOps,0.55
legacy,salesAdmin,0.2
legacy,csLoad,0.25
legacy,hiring,0.1
newbiz,hiring,0.9
newbiz,salesAdmin,0.6
newbiz,itOps,0.6
newbiz,reporting,0.5
newbiz,csLoad,0.4
newbiz,backoffice,0.3
newbiz,billing,0.3
newbiz,attendance,0.3


~~~

### `package.json`

~~~json
{
  "name": "michizane",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "道真 AX診断（事業部別）— Phase 1: ダミーCSVで動く最小構成",
  "scripts": {
    "start": "node src/cli.mjs",
    "dev": "node src/server.mjs",
    "build": "node scripts/build-static.mjs",
    "test": "node --test tests/score.test.mjs"
  }
}


~~~

### `public/index.html`

~~~html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>道真 AX診断（事業部別）｜事業計画 × 事業部ログ</title>
<style>
  :root{
    --navy:#1E2761; --navy2:#2A3570; --gold:#E6A817;
    --green:#00857A; --green-soft:#E6F5F3; --green-ink:#0F2A28;
    --red:#C84B31; --red-soft:#FBEDE8;
    --magenta:#C2185B; --blue:#2E5E8C;
    --paper:#F7F5EF; --card:#FFFFFF; --ink:#23262F; --muted:#71757F;
    --line:#E5E0D6; --line2:#EFEBE2;
    --serif:"Hiragino Mincho ProN","Yu Mincho","YuMincho",serif;
    --sans:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--paper);color:var(--ink);font-family:var(--sans);
    -webkit-font-smoothing:antialiased;padding:30px 26px 24px;min-height:100vh;
    background-image:radial-gradient(1100px 560px at 88% -10%, rgba(0,133,122,.06), transparent 60%),
      radial-gradient(800px 460px at -5% 110%, rgba(30,39,97,.05), transparent 55%)}
  .wrap{max-width:1180px;margin:0 auto}
  .num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}

  header{display:flex;align-items:flex-end;justify-content:space-between;
    padding-bottom:14px;border-bottom:2px solid var(--navy);margin-bottom:18px}
  .brand{display:flex;align-items:baseline;gap:15px}
  .mark{font-family:var(--serif);font-size:36px;font-weight:600;color:var(--navy);letter-spacing:.04em;line-height:1}
  .mark .dot{color:var(--green)}
  .sub .t1{font-size:12.5px;font-weight:700;color:var(--navy);letter-spacing:.08em}
  .sub .t2{font-size:11px;color:var(--muted);margin-top:3px}
  .tagright{font-size:10px;color:var(--muted);text-align:right;letter-spacing:.05em}

  .busel{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
  .bu{background:var(--card);border:1.5px solid var(--line);border-radius:12px;padding:13px 15px;cursor:pointer;transition:.18s;position:relative}
  .bu:hover{border-color:var(--navy)}
  .bu.on{border-color:var(--navy);box-shadow:0 8px 22px -12px rgba(30,39,97,.5)}
  .bu .role{font-size:9.5px;font-weight:800;letter-spacing:.06em;padding:2px 9px;border-radius:999px;display:inline-block;margin-bottom:7px}
  .bu.priority .role{background:var(--green-soft);color:var(--green)}
  .bu.nonpriority .role{background:#EDEDEA;color:var(--muted)}
  .bu .bn{font-size:14.5px;font-weight:800;color:var(--ink)}
  .bu .bd{font-size:10.5px;color:var(--muted);margin-top:3px}
  .bu.on.priority{background:linear-gradient(180deg,#fff,#F2FAF8)}
  .bu.on .check{position:absolute;top:11px;right:13px;width:18px;height:18px;border-radius:50%;background:var(--navy);color:#fff;font-size:11px;display:grid;place-items:center}
  .bu .check{display:none}

  .profile{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
  .pbox{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
  .pbox .ph{font-size:11px;font-weight:800;letter-spacing:.05em;margin-bottom:9px;display:flex;align-items:center;gap:7px}
  .pbox.plan .ph{color:var(--navy)} .pbox.logs .ph{color:var(--green)}
  .pbox .ph .tag{font-size:8.5px;font-weight:800;padding:1px 7px;border-radius:999px}
  .pbox.plan .ph .tag{background:#E8EAF2;color:var(--navy)}
  .pbox.logs .ph .tag{background:var(--green-soft);color:var(--green)}
  .prow{display:flex;justify-content:space-between;font-size:11.5px;padding:4px 0;border-bottom:1px dashed var(--line2)}
  .prow:last-child{border-bottom:none}
  .prow .k{color:var(--muted)} .prow .v{font-weight:700;color:var(--ink)}
  .logbar{display:flex;align-items:center;gap:8px;padding:5px 0}
  .logbar .lk{font-size:11px;color:var(--ink);font-weight:600;width:160px;flex-shrink:0}
  .logbar .lt{flex:1;height:8px;border-radius:4px;background:var(--line2);overflow:hidden}
  .logbar .lf{height:100%;background:var(--green);border-radius:4px;transition:width .7s cubic-bezier(.22,.9,.3,1)}
  .logbar .lv{font-size:9.5px;font-weight:800;color:var(--green);width:30px;text-align:right}

  .stance{border-radius:12px;padding:13px 18px;margin-bottom:16px;display:flex;align-items:center;gap:14px;color:#fff}
  .stance.attack{background:linear-gradient(100deg,var(--green),#00665E)}
  .stance.defend{background:linear-gradient(100deg,var(--navy),var(--navy2))}
  .stance .si{font-family:var(--serif);font-size:15px;font-weight:700;white-space:nowrap;padding-right:14px;border-right:1px solid rgba(255,255,255,.25)}
  .stance .st{font-size:12px;line-height:1.55}
  .stance .st b{color:var(--gold)}

  .hero{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin-bottom:14px;display:flex;align-items:center;gap:26px;box-shadow:0 10px 30px -22px rgba(0,0,0,.4)}
  .hero .hk{font-size:11px;color:var(--muted);letter-spacing:.05em}
  .hero .hbig{font-size:38px;font-weight:800;color:var(--navy);line-height:1}
  .hero .hbig .u{font-size:14px;color:var(--muted);font-weight:700;margin-left:5px}
  .hero .hbd{font-size:11.5px;color:var(--ink);margin-top:3px}
  .hero .hbd b{font-weight:800}
  .hero .spk{flex:1}
  .splitbar{display:flex;height:13px;border-radius:7px;overflow:hidden;background:var(--line2)}
  .splitbar .s{transition:width .8s cubic-bezier(.22,.9,.3,1)}
  .splitbar .sc{background:var(--green)}.splitbar .sr{background:var(--gold)}
  .slegend{display:flex;gap:14px;margin-top:7px;font-size:10px;color:var(--muted)}
  .slegend i{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:5px;vertical-align:middle}

  .reslabel{font-size:12px;font-weight:800;color:var(--navy);margin:2px 2px 10px;display:flex;justify-content:space-between;align-items:baseline}
  .reslabel span{font-size:10.5px;color:var(--muted);font-weight:600}
  .cards{display:flex;flex-direction:column;gap:9px}
  .icard{display:grid;grid-template-columns:38px 1fr auto;gap:13px;align-items:center;
    background:var(--card);border:1px solid var(--line);border-radius:11px;padding:12px 15px;border-left-width:4px;animation:slidein .45s both}
  .icard.rev{border-left-color:var(--magenta)}.icard.cost{border-left-color:var(--green)}.icard.avoid{border-left-color:var(--blue)}
  .rank{font-family:var(--serif);font-size:24px;font-weight:700;color:var(--navy);text-align:center;line-height:1}
  .rank small{display:block;font-family:var(--sans);font-size:7.5px;color:var(--muted);font-weight:700;letter-spacing:.1em;margin-top:2px}
  .nm{font-size:13.5px;font-weight:800;color:var(--ink);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .lev{font-size:8.5px;font-weight:800;padding:2px 7px;border-radius:999px}
  .lev.rev{background:#FBE3EE;color:var(--magenta)}.lev.cost{background:var(--green-soft);color:var(--green)}.lev.avoid{background:#E7EEF6;color:var(--blue)}
  .rat{font-size:10px;color:var(--muted);margin-top:4px;line-height:1.5}.rat b{color:var(--ink);font-weight:700}
  .why{font-size:9.5px;color:var(--green);font-weight:700;margin-top:4px}
  .iright{text-align:right;min-width:104px}
  .imp{font-size:19px;font-weight:800;color:var(--navy)}.impu{font-size:10px;color:var(--muted);font-weight:700}
  .native{font-size:9px;color:var(--muted);margin-top:1px}
  .ease{display:flex;gap:3px;justify-content:flex-end;margin-top:6px}
  .ease .d{width:6px;height:6px;border-radius:50%;background:var(--line)}.ease .d.on{background:var(--gold)}
  .ease .el{font-size:8px;color:var(--muted);margin-right:3px;align-self:center;font-weight:700}

  .portfolio{margin-top:14px;background:#FFF8E6;border:1px solid var(--gold);border-radius:12px;padding:13px 18px;font-size:11.5px;color:#6e5212;line-height:1.6}
  .portfolio b{color:#8A5F00;font-weight:800}
  footer{margin-top:14px;font-size:10px;color:var(--muted);display:flex;justify-content:space-between}

  .loading{padding:40px;text-align:center;color:var(--muted);font-size:13px}
  .err{padding:20px;background:var(--red-soft);border:1px solid var(--red);border-radius:10px;color:var(--red);font-size:12px;margin:12px 0}
  @keyframes slidein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  /* ===== mode tabs（攻め / 守り） ===== */
  .modetabs{display:flex;gap:8px;margin-bottom:18px;border-bottom:1px solid var(--line);padding-bottom:0}
  .mtab{appearance:none;border:none;background:none;cursor:pointer;font-family:var(--sans);
    font-size:13.5px;font-weight:800;color:var(--muted);padding:11px 20px 13px;position:relative;
    border-radius:9px 9px 0 0;transition:.16s;display:flex;align-items:center;gap:8px;letter-spacing:.03em}
  .mtab .ic{width:9px;height:9px;border-radius:50%;background:currentColor;opacity:.55}
  .mtab:hover{color:var(--ink)}
  .mtab.on{color:#fff}
  .mtab.on.attack{background:var(--green)}
  .mtab.on.defend{background:var(--red)}
  .mtab.on .ic{opacity:1;background:#fff}
  .mtab .mt-sub{font-size:9.5px;font-weight:700;opacity:.8;letter-spacing:.04em}

  /* ===== 守りビュー ===== */
  .d-hero{background:linear-gradient(135deg,#fff 0%,var(--red-soft) 100%);
    border:1px solid #f0d6cd;border-left:5px solid var(--red);border-radius:14px;
    padding:20px 24px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
    box-shadow:0 10px 30px -22px rgba(0,0,0,.4)}
  .d-hero .hk{font-size:11.5px;color:var(--muted);font-weight:700;letter-spacing:.04em}
  .d-hero .hbig{font-family:var(--serif);font-size:44px;font-weight:600;color:var(--navy);line-height:1.05}
  .d-hero .hbig .u{font-size:17px;color:var(--red);margin-left:4px}
  .d-hero .delta{font-size:12px;color:var(--red);font-weight:800;margin-top:3px}
  .d-hero .right{text-align:right;font-size:11.5px;color:var(--muted);max-width:330px;line-height:1.6}
  .d-hero .right .eq{font-family:var(--serif);font-size:14.5px;color:var(--navy);font-weight:700;margin-bottom:6px}
  .d-hero .right b{color:var(--ink);font-weight:800}

  .d-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}
  .d-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 17px;position:relative;overflow:hidden}
  .d-card.c2{border-color:#f3c9dc}
  .d-card .tag{font-size:10px;font-weight:800;letter-spacing:.05em;padding:3px 9px;border-radius:999px;display:inline-block}
  .d-card.c1 .tag{background:var(--red-soft);color:var(--red)}
  .d-card.c2 .tag{background:#FBE3EE;color:var(--magenta)}
  .d-card.c3 .tag{background:#FFF8E6;color:#8A5F00}
  .d-card h4{font-size:13px;color:var(--ink);margin-top:10px;font-weight:800}
  .d-card .dnum{font-family:var(--serif);font-size:29px;font-weight:600;margin-top:7px;color:var(--navy);line-height:1.1}
  .d-card.c2 .dnum{color:var(--magenta)}
  .d-card .dnum .u{font-size:13px;color:var(--muted);margin-left:3px}
  .d-card .calc{font-size:11px;color:var(--muted);margin-top:9px;border-top:1px dashed var(--line);padding-top:8px;line-height:1.5}
  .d-card .calc b{color:var(--ink);font-weight:800}
  .d-card .ribbon{position:absolute;top:13px;right:-31px;transform:rotate(38deg);background:var(--magenta);color:#fff;font-size:9px;font-weight:800;padding:3px 34px;letter-spacing:.06em}

  .d-lower{display:grid;grid-template-columns:1.5fr 1fr;gap:12px;margin-bottom:14px}
  .d-panel{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px}
  .d-panel h5{font-size:12.5px;font-weight:800;color:var(--navy);letter-spacing:.03em}
  .d-panel .ph2{font-size:10.5px;color:var(--muted);margin:3px 0 13px}
  .d-chart{display:flex;align-items:flex-end;gap:12px;height:150px;border-bottom:1px solid var(--line);padding-top:4px}
  .d-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px}
  .d-vlabel{font-size:9.5px;color:var(--muted);font-weight:800}
  .d-stack{width:56%;max-width:34px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:4px 4px 0 0;overflow:hidden;transition:.5s}
  .d-seg{width:100%;transition:.5s}
  .d-seg.s-leak{background:var(--red)}.d-seg.s-fraud{background:var(--magenta)}.d-seg.s-early{background:var(--gold)}
  .d-mlabel{font-size:10px;color:var(--muted)}
  .d-col.on .d-mlabel{color:var(--navy);font-weight:800}
  .d-legend{display:flex;gap:14px;margin-top:11px;flex-wrap:wrap}
  .d-legend span{font-size:10.5px;color:var(--muted);display:flex;align-items:center;gap:5px}
  .d-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}
  .d-ev{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}
  .d-ev:last-child{border-bottom:none}
  .d-ev .el2{font-size:12px;color:var(--ink);line-height:1.45}
  .d-ev .el2 small{display:block;color:var(--muted);font-size:10px;margin-top:2px}
  .d-ev .ev2{font-family:var(--serif);font-size:15px;font-weight:600;color:var(--navy);white-space:nowrap;padding-left:10px}

  .d-footing{display:flex;background:var(--navy);border-radius:12px;overflow:hidden}
  .d-footing .f{flex:1;padding:13px 16px;color:#fff;border-right:1px solid rgba(255,255,255,.12)}
  .d-footing .f:last-child{border-right:none}
  .d-footing .fk{font-size:10px;color:#b9c0e0;letter-spacing:.05em}
  .d-footing .fv{font-family:var(--serif);font-size:19px;font-weight:600;margin-top:2px}
  .d-footing .fv .fu{font-size:11px;color:#cfd5ee;margin-left:2px}

  @media(max-width:860px){
    .d-grid3{grid-template-columns:1fr}
    .d-lower{grid-template-columns:1fr}
    .d-hero .hbig{font-size:36px}
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">
      <div class="mark">道真<span class="dot">.</span></div>
      <div class="sub">
        <div class="t1">AX 診断（事業部別）── PLAN × UNIT-LOGS</div>
        <div class="t2">事業部の「計画」と「ログ実態」を掛け合わせ、役割に応じた最適なAXを提案する</div>
      </div>
    </div>
    <div class="tagright" id="tagright">道真プロジェクト ／ 攻めの知性<br>Phase 2 ／ CSVデータ駆動</div>
  </header>

  <!-- ===== mode tabs ===== -->
  <div class="modetabs">
    <button class="mtab attack on" id="tab-attack" data-mode="attack">
      <span class="ic"></span>攻めの知性<span class="mt-sub">AX診断（事業部別）</span>
    </button>
    <button class="mtab defend" id="tab-defend" data-mode="defend">
      <span class="ic"></span>守りの知性<span class="mt-sub">防いだ損失額</span>
    </button>
  </div>

  <!-- ===== 攻めビュー ===== -->
  <div id="attack-view">
  <div id="loading" class="loading">読み込み中…</div>
  <div id="app" style="display:none">
    <div class="busel" id="busel"></div>
    <div class="profile">
      <div class="pbox plan">
        <div class="ph">事業計画 <span class="tag">この事業部に期待する役割</span></div>
        <div id="plan-body"></div>
      </div>
      <div class="pbox logs">
        <div class="ph">事業部ログ実態 <span class="tag">実際にどこが詰まっているか</span></div>
        <div id="logs-body"></div>
      </div>
    </div>
    <div class="stance" id="stance">
      <div class="si" id="stance-i">―</div>
      <div class="st" id="stance-t">―</div>
    </div>
    <div class="hero">
      <div>
        <div class="hk">想定 P/L インパクト（年間）</div>
        <div class="hbig"><span class="num" id="h-total">0</span><span class="u">百万円/年</span></div>
        <div class="hbd">コスト減 <span class="num" id="h-cost">0</span> ／ 売上増 <span class="num" id="h-rev">0</span></div>
      </div>
      <div class="spk">
        <div class="splitbar"><div class="s sc" id="bar-cost" style="width:50%"></div><div class="s sr" id="bar-rev" style="width:50%"></div></div>
        <div class="slegend"><span><i style="background:#00857A"></i>コスト減（外注削減・増員回避）</span><span><i style="background:#E6A817"></i>売上増</span></div>
      </div>
    </div>
    <div class="reslabel">この事業部への推奨AXロードマップ <span id="res-count"></span></div>
    <div class="cards" id="cards"></div>
    <div class="portfolio" id="portfolio"></div>
  </div>
  </div><!-- /#attack-view -->

  <!-- ===== 守りビュー ===== -->
  <div id="defense-view" style="display:none">
    <div id="d-loading" class="loading">読み込み中…</div>
    <div id="d-app" style="display:none">

      <div class="busel" id="d-monthsel"></div>

      <div class="d-hero">
        <div>
          <div class="hk">当月 防いだ損失額（合計）</div>
          <div class="hbig">¥<span class="num" id="d-total">0</span><span class="u">百万円</span></div>
          <div class="delta" id="d-delta">―</div>
        </div>
        <div class="right">
          <div class="eq">守りのAXが、攻めの投資を生む</div>
          ここで守った損失は、増員回避・外注削減と同じく<br>そのまま再投資原資になる。攻めと守りは<b>同じ円</b>でつながる。
        </div>
      </div>

      <div class="d-grid3">
        <div class="d-card c1">
          <span class="tag">① 漏洩の回避損</span>
          <h4>情報漏洩インシデントの未然阻止</h4>
          <div class="dnum">¥<span class="num" id="d-leak">0</span><span class="u">百万</span></div>
          <div class="calc">漏洩想定単価 <b id="d-leak-unit">―</b> × 阻止件数 <b id="d-leak-cnt">―</b>件<br>UEBAで持出し兆候を発火前に遮断</div>
        </div>
        <div class="d-card c2">
          <div class="ribbon">最重要</div>
          <span class="tag">② 不正・横領の阻止額</span>
          <h4>道真クロス検知で止めた実額</h4>
          <div class="dnum">¥<span class="num" id="d-fraud">0</span><span class="u">百万</span></div>
          <div class="calc">仕訳×Slackクロス検知で確証 <b id="d-fraud-cnt">―</b>件<br><b>実額で語れる</b>守りの中核数字</div>
        </div>
        <div class="d-card c3">
          <span class="tag">③ 早期検知の圧縮額</span>
          <h4>検知30時間がもたらす被害逓減</h4>
          <div class="dnum">¥<span class="num" id="d-early">0</span><span class="u">百万</span></div>
          <div class="calc">放置カーブ vs 検知30hの差分<br>同種インシデントの被害逓増を時間で押さえ込む</div>
        </div>
      </div>

      <div class="d-lower">
        <div class="d-panel">
          <h5>防いだ損失額の推移（3区分の積み上げ）</h5>
          <div class="ph2">縦軸：百万円／月。当月をハイライト。</div>
          <div class="d-chart" id="d-chart"></div>
          <div class="d-legend">
            <span><i style="background:var(--red)"></i>漏洩の回避損</span>
            <span><i style="background:var(--magenta)"></i>不正・横領の阻止額</span>
            <span><i style="background:var(--gold)"></i>早期検知の圧縮額</span>
          </div>
        </div>
        <div class="d-panel">
          <h5>当月の主な阻止イベント</h5>
          <div class="ph2">経営層が「金額」で把握すべき事象</div>
          <div id="d-events"></div>
        </div>
      </div>

      <div class="d-footing">
        <div class="f"><div class="fk">国内UEBAシェア</div><div class="fv">34.5<span class="fu">%</span></div></div>
        <div class="f"><div class="fk">監視対象</div><div class="fv">37<span class="fu">万人</span></div></div>
        <div class="f"><div class="fk">解析ログ</div><div class="fv">5,605<span class="fu">億件</span></div></div>
        <div class="f"><div class="fk">平均検知時間</div><div class="fv">30<span class="fu">時間</span></div></div>
      </div>

    </div>
  </div><!-- /#defense-view -->

  <footer>
    <div id="foot-note">※ 攻めの出力は守り（内部統制）の証跡にもなる ── ひとつの知性、二つの働き</div>
    <div>Confidential ／ Phase 2</div>
  </footer>
</div>

<script type="module">
import { score, summarize } from '/score.mjs';

const LOGLABEL = {
  salesAdmin:'営業の事務工数比率', csLoad:'CS応答の逼迫度', backoffice:'管理業務の外注費',
  billing:'請求・債権の工数', itOps:'情シス運用負荷', hiring:'採用・立上げ工数',
  attendance:'勤怠処理工数', reporting:'月次レポート工数'
};
const levName = { rev:'売上増', cost:'外注削減', avoid:'増員回避' };
const focusLabel = { growth:'成長', cost:'コスト効率', labor:'人手不足対応' };

let INITS = [], BUS = [], cur = null;
const $ = id => document.getElementById(id);
const f1 = v => v.toFixed(1);

function countUp(el, t, fmt){
  const from = parseFloat(el.dataset.cur || 0);
  const s = performance.now(), d = 650;
  function tk(n){
    const k = Math.min((n - s) / d, 1);
    const e = 1 - Math.pow(1 - k, 3);
    const v = from + (t - from) * e;
    el.textContent = fmt(v);
    if(k < 1) requestAnimationFrame(tk);
    else { el.dataset.cur = t; el.textContent = fmt(t); }
  }
  requestAnimationFrame(tk);
}

function render(){
  const bu = BUS.find(b => b.id === cur);

  $('busel').innerHTML = BUS.map(b => `
    <div class="bu ${b.role} ${b.id === cur ? 'on' : ''}" data-id="${b.id}">
      <span class="check">✓</span>
      <span class="role">${b.roleLabel}</span>
      <div class="bn">${b.name}</div><div class="bd">${b.desc}</div>
    </div>`).join('');
  document.querySelectorAll('.bu').forEach(el =>
    el.addEventListener('click', () => { cur = el.dataset.id; render(); }));

  $('plan-body').innerHTML = `
    <div class="prow"><span class="k">役割</span><span class="v">${bu.roleLabel}</span></div>
    <div class="prow"><span class="k">売上目標（来期）</span><span class="v">${bu.plan.growth > 0 ? '+' + bu.plan.growth + '%' : '据え置き'}</span></div>
    <div class="prow"><span class="k">人員方針</span><span class="v">${bu.plan.head}</span></div>
    <div class="prow"><span class="k">重点</span><span class="v">${focusLabel[bu.plan.focus] || bu.plan.focus}</span></div>`;

  const lt = Object.entries(bu.logs).sort((a, b) => b[1] - a[1]).slice(0, 4);
  $('logs-body').innerHTML = lt.map(([k, v]) => `
    <div class="logbar"><span class="lk">${LOGLABEL[k] || k}</span>
      <span class="lt"><span class="lf" style="width:${Math.round(v * 100)}%"></span></span>
      <span class="lv">${v >= .7 ? '高' : v >= .4 ? '中' : '低'}</span></div>`).join('');

  const attack = bu.role === 'priority';
  $('stance').className = 'stance ' + (attack ? 'attack' : 'defend');
  $('stance-i').textContent = attack ? '攻めのAX' : '守りのAX';
  $('stance-t').innerHTML = attack
    ? `成長ドライバーの事業部。ログが示す<b>律速（営業事務・CS・採用）を自動化で外し</b>、限られた人員のまま成長を最大化する。`
    : `収益維持フェーズの事業部。<b>外注・定型業務を省人化してmarginを守り</b>、浮いた人員・予算を重点事業部へ再配置する原資をつくる。`;

  const scored = score(bu, INITS);
  const top = scored.slice(0, 5);
  const sum = summarize(top);

  countUp($('h-total'), sum.annualTotal, f1);
  countUp($('h-cost'), sum.annualCost, f1);
  countUp($('h-rev'), sum.annualRev, f1);

  const tot = (sum.monthlyCost + sum.monthlyRev) || 1;
  $('bar-cost').style.width = (sum.monthlyCost / tot * 100) + '%';
  $('bar-rev').style.width = (sum.monthlyRev / tot * 100) + '%';
  $('res-count').textContent = `計画 × ログを掛け合わせ、全${scored.length}施策から上位${top.length}件`;

  $('cards').innerHTML = top.map((it, i) => {
    const dots = [1, 2, 3, 4, 5].map(n => `<span class="d ${n <= it.ease ? 'on' : ''}"></span>`).join('');
    return `<div class="icard ${it.lever}" style="animation-delay:${i * 0.05}s">
      <div class="rank">${i + 1}<small>RANK</small></div>
      <div>
        <div class="nm">${it.name}<span class="lev ${it.lever}">${levName[it.lever]}</span></div>
        <div class="rat">${it.rat || ''}</div>
        <div class="why">▲ この事業部のログ「${LOGLABEL[it.log] || it.log}」が${it.ls >= .7 ? '高い' : it.ls >= .4 ? '中程度' : '低い'} → ${it.ls >= .7 ? '最優先で効く' : '寄与あり'}</div>
      </div>
      <div class="iright">
        <div class="imp">¥<span class="num">${f1(it.impact)}</span><span class="impu">M/月</span></div>
        <div class="native">${it.native || ''}</div>
        <div class="ease"><span class="el">容易性</span>${dots}</div>
      </div>
    </div>`;
  }).join('');

  $('portfolio').innerHTML = attack
    ? `<b>ポートフォリオ視点：</b>この重点事業部には<b>成長を加速するAX</b>を集中投下する。一方、非重点事業部で省人化して生んだ余力（人員・予算）を、ここへ再配置するのが事業部別AXの狙い。`
    : `<b>ポートフォリオ視点：</b>この非重点事業部のAXの目的は単なるコスト削減ではない。<b>省人化で生んだ余力を、重点事業部（成長ドライバー）へ再配置する原資をつくる</b>こと。守りのAXが、攻めの投資を生む。`;
}

async function main(){
  try {
    const r = await fetch('/data.json');
    if (!r.ok) throw new Error('API ' + r.status);
    const data = await r.json();
    INITS = data.inits;
    BUS = data.bus;
    if (BUS.length === 0) throw new Error('事業部データが空');
    cur = BUS[0].id;
    $('loading').style.display = 'none';
    $('app').style.display = '';
    render();
  } catch (e) {
    $('loading').innerHTML = `<div class="err">読み込みエラー: ${e.message}</div>`;
  }
}
main();

/* ===================== 守りの知性（防いだ損失額） ===================== */
let DEF = null, dCur = null, dLoaded = false;

async function loadDefense(){
  if (dLoaded) return;
  try {
    const r = await fetch('/defense.json');
    if (!r.ok) throw new Error('API ' + r.status);
    const data = await r.json();
    DEF = data.months;
    if (!DEF || DEF.length === 0) throw new Error('守りデータが空');
    dCur = DEF[DEF.length - 1].month; // 最新月を初期表示
    dLoaded = true;
    $('d-loading').style.display = 'none';
    $('d-app').style.display = '';
    dRender();
  } catch (e) {
    $('d-loading').innerHTML = `<div class="err">読み込みエラー: ${e.message}</div>`;
  }
}

function dRender(){
  const idx = DEF.findIndex(m => m.month === dCur);
  const m = DEF[idx];
  const total = m.leak + m.fraud + m.early;

  // 月セレクタ（攻めの .bu UI を流用）
  $('d-monthsel').innerHTML = DEF.map(x => `
    <div class="bu ${x.month === dCur ? 'on' : ''}" data-month="${x.month}" style="text-align:center">
      <span class="check">✓</span>
      <div class="bn">${x.label}</div>
      <div class="bd">防いだ損失 ¥${(x.leak + x.fraud + x.early).toLocaleString('ja-JP')}百万</div>
    </div>`).join('');
  document.querySelectorAll('#d-monthsel .bu').forEach(el =>
    el.addEventListener('click', () => { dCur = el.dataset.month; dRender(); }));

  // hero
  countUp($('d-total'), total, v => Math.round(v).toLocaleString('ja-JP'));
  if (idx > 0) {
    const prev = DEF[idx-1].leak + DEF[idx-1].fraud + DEF[idx-1].early;
    const diff = total - prev;
    const pct = ((diff / prev) * 100).toFixed(1);
    $('d-delta').textContent = `前月比 ${diff>=0?'+':''}${diff.toLocaleString('ja-JP')}百万円（${diff>=0?'+':''}${pct}%）`;
  } else {
    $('d-delta').textContent = '基準月';
  }

  // cards
  countUp($('d-leak'), m.leak, v => Math.round(v).toLocaleString('ja-JP'));
  countUp($('d-fraud'), m.fraud, v => Math.round(v).toLocaleString('ja-JP'));
  countUp($('d-early'), m.early, v => Math.round(v).toLocaleString('ja-JP'));
  $('d-leak-unit').textContent = m.leakUnit;
  $('d-leak-cnt').textContent = m.leakCnt;
  $('d-fraud-cnt').textContent = m.fraudCnt;

  // chart
  const maxT = Math.max(...DEF.map(x => x.leak + x.fraud + x.early));
  $('d-chart').innerHTML = DEF.map((x, i) => {
    const t = x.leak + x.fraud + x.early;
    const h = (t / maxT) * 130;
    return `<div class="d-col ${x.month===dCur?'on':''}">
      <div class="d-vlabel">¥${t.toLocaleString('ja-JP')}</div>
      <div class="d-stack" style="height:${h}px;opacity:${x.month===dCur?1:.5}">
        <div class="d-seg s-early" style="height:${(x.early/t)*100}%"></div>
        <div class="d-seg s-fraud" style="height:${(x.fraud/t)*100}%"></div>
        <div class="d-seg s-leak" style="height:${(x.leak/t)*100}%"></div>
      </div>
      <div class="d-mlabel">${x.label.replace('2026年','')}</div>
    </div>`;
  }).join('');

  // events
  $('d-events').innerHTML = m.events.map(e =>
    `<div class="d-ev"><div class="el2">${e.title}<small>${e.sub}</small></div><div class="ev2">${e.value}</div></div>`
  ).join('');
}

/* ===================== タブ切替 ===================== */
function setMode(mode){
  const attack = mode === 'attack';
  $('tab-attack').classList.toggle('on', attack);
  $('tab-defend').classList.toggle('on', !attack);
  $('attack-view').style.display = attack ? '' : 'none';
  $('defense-view').style.display = attack ? 'none' : '';
  $('tagright').innerHTML = attack
    ? '道真プロジェクト ／ 攻めの知性<br>Phase 2 ／ CSVデータ駆動'
    : '道真プロジェクト ／ 守りの知性<br>Phase 2 ／ 防いだ損失額';
  $('foot-note').textContent = attack
    ? '※ 攻めの出力は守り（内部統制）の証跡にもなる ── ひとつの知性、二つの働き'
    : '※ 守りで防いだ損失は、攻めの再投資原資になる ── ひとつの知性、二つの働き';
  if (!attack) loadDefense();
  if (history.replaceState) history.replaceState(null, '', attack ? '#attack' : '#defend');
}
$('tab-attack').addEventListener('click', () => setMode('attack'));
$('tab-defend').addEventListener('click', () => setMode('defend'));
if (location.hash === '#defend') setMode('defend');
</script>
</body>
</html>


~~~

### `README.md`

~~~markdown
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


~~~

### `reference/mockup.html`

~~~html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>道真 AX診断（事業部別）｜事業計画 × 事業部ログ</title>
<style>
  :root{
    --navy:#1E2761; --navy2:#2A3570; --gold:#E6A817;
    --green:#00857A; --green-soft:#E6F5F3; --green-ink:#0F2A28;
    --red:#C84B31; --red-soft:#FBEDE8;
    --magenta:#C2185B; --blue:#2E5E8C;
    --paper:#F7F5EF; --card:#FFFFFF; --ink:#23262F; --muted:#71757F;
    --line:#E5E0D6; --line2:#EFEBE2;
    --serif:"Hiragino Mincho ProN","Yu Mincho","YuMincho",serif;
    --sans:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--paper);color:var(--ink);font-family:var(--sans);
    -webkit-font-smoothing:antialiased;padding:30px 26px 24px;min-height:100vh;
    background-image:radial-gradient(1100px 560px at 88% -10%, rgba(0,133,122,.06), transparent 60%),
      radial-gradient(800px 460px at -5% 110%, rgba(30,39,97,.05), transparent 55%)}
  .wrap{max-width:1180px;margin:0 auto}
  .num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}

  header{display:flex;align-items:flex-end;justify-content:space-between;
    padding-bottom:14px;border-bottom:2px solid var(--navy);margin-bottom:18px}
  .brand{display:flex;align-items:baseline;gap:15px}
  .mark{font-family:var(--serif);font-size:36px;font-weight:600;color:var(--navy);letter-spacing:.04em;line-height:1}
  .mark .dot{color:var(--green)}
  .sub .t1{font-size:12.5px;font-weight:700;color:var(--navy);letter-spacing:.08em}
  .sub .t2{font-size:11px;color:var(--muted);margin-top:3px}
  .tagright{font-size:10px;color:var(--muted);text-align:right;letter-spacing:.05em}

  /* BU selector */
  .busel{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
  .bu{background:var(--card);border:1.5px solid var(--line);border-radius:12px;padding:13px 15px;cursor:pointer;transition:.18s;position:relative}
  .bu:hover{border-color:var(--navy)}
  .bu.on{border-color:var(--navy);box-shadow:0 8px 22px -12px rgba(30,39,97,.5)}
  .bu .role{font-size:9.5px;font-weight:800;letter-spacing:.06em;padding:2px 9px;border-radius:999px;display:inline-block;margin-bottom:7px}
  .bu.priority .role{background:var(--green-soft);color:var(--green)}
  .bu.nonpriority .role{background:#EDEDEA;color:var(--muted)}
  .bu .bn{font-size:14.5px;font-weight:800;color:var(--ink)}
  .bu .bd{font-size:10.5px;color:var(--muted);margin-top:3px}
  .bu.on.priority{background:linear-gradient(180deg,#fff,#F2FAF8)}
  .bu.on .check{position:absolute;top:11px;right:13px;width:18px;height:18px;border-radius:50%;background:var(--navy);color:#fff;font-size:11px;display:grid;place-items:center}
  .bu .check{display:none}

  /* profile: plan x logs */
  .profile{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
  .pbox{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
  .pbox .ph{font-size:11px;font-weight:800;letter-spacing:.05em;margin-bottom:9px;display:flex;align-items:center;gap:7px}
  .pbox.plan .ph{color:var(--navy)} .pbox.logs .ph{color:var(--green)}
  .pbox .ph .tag{font-size:8.5px;font-weight:800;padding:1px 7px;border-radius:999px}
  .pbox.plan .ph .tag{background:#E8EAF2;color:var(--navy)}
  .pbox.logs .ph .tag{background:var(--green-soft);color:var(--green)}
  .prow{display:flex;justify-content:space-between;font-size:11.5px;padding:4px 0;border-bottom:1px dashed var(--line2)}
  .prow:last-child{border-bottom:none}
  .prow .k{color:var(--muted)} .prow .v{font-weight:700;color:var(--ink)}
  .logbar{display:flex;align-items:center;gap:8px;padding:5px 0}
  .logbar .lk{font-size:11px;color:var(--ink);font-weight:600;width:160px;flex-shrink:0}
  .logbar .lt{flex:1;height:8px;border-radius:4px;background:var(--line2);overflow:hidden}
  .logbar .lf{height:100%;background:var(--green);border-radius:4px;transition:width .7s cubic-bezier(.22,.9,.3,1)}
  .logbar .lv{font-size:9.5px;font-weight:800;color:var(--green);width:30px;text-align:right}

  /* stance banner */
  .stance{border-radius:12px;padding:13px 18px;margin-bottom:16px;display:flex;align-items:center;gap:14px;color:#fff}
  .stance.attack{background:linear-gradient(100deg,var(--green),#00665E)}
  .stance.defend{background:linear-gradient(100deg,var(--navy),var(--navy2))}
  .stance .si{font-family:var(--serif);font-size:15px;font-weight:700;white-space:nowrap;padding-right:14px;border-right:1px solid rgba(255,255,255,.25)}
  .stance .st{font-size:12px;line-height:1.55}
  .stance .st b{color:var(--gold)}

  /* hero */
  .hero{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin-bottom:14px;display:flex;align-items:center;gap:26px;box-shadow:0 10px 30px -22px rgba(0,0,0,.4)}
  .hero .hk{font-size:11px;color:var(--muted);letter-spacing:.05em}
  .hero .hbig{font-size:38px;font-weight:800;color:var(--navy);line-height:1}
  .hero .hbig .u{font-size:14px;color:var(--muted);font-weight:700;margin-left:5px}
  .hero .hbd{font-size:11.5px;color:var(--ink);margin-top:3px}
  .hero .hbd b{font-weight:800}
  .hero .spk{flex:1}
  .splitbar{display:flex;height:13px;border-radius:7px;overflow:hidden;background:var(--line2)}
  .splitbar .s{transition:width .8s cubic-bezier(.22,.9,.3,1)}
  .splitbar .sc{background:var(--green)}.splitbar .sr{background:var(--gold)}
  .slegend{display:flex;gap:14px;margin-top:7px;font-size:10px;color:var(--muted)}
  .slegend i{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:5px;vertical-align:middle}

  .reslabel{font-size:12px;font-weight:800;color:var(--navy);margin:2px 2px 10px;display:flex;justify-content:space-between;align-items:baseline}
  .reslabel span{font-size:10.5px;color:var(--muted);font-weight:600}
  .cards{display:flex;flex-direction:column;gap:9px}
  .icard{display:grid;grid-template-columns:38px 1fr auto;gap:13px;align-items:center;
    background:var(--card);border:1px solid var(--line);border-radius:11px;padding:12px 15px;border-left-width:4px;animation:slidein .45s both}
  .icard.rev{border-left-color:var(--magenta)}.icard.cost{border-left-color:var(--green)}.icard.avoid{border-left-color:var(--blue)}
  .rank{font-family:var(--serif);font-size:24px;font-weight:700;color:var(--navy);text-align:center;line-height:1}
  .rank small{display:block;font-family:var(--sans);font-size:7.5px;color:var(--muted);font-weight:700;letter-spacing:.1em;margin-top:2px}
  .nm{font-size:13.5px;font-weight:800;color:var(--ink);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .lev{font-size:8.5px;font-weight:800;padding:2px 7px;border-radius:999px}
  .lev.rev{background:#FBE3EE;color:var(--magenta)}.lev.cost{background:var(--green-soft);color:var(--green)}.lev.avoid{background:#E7EEF6;color:var(--blue)}
  .rat{font-size:10px;color:var(--muted);margin-top:4px;line-height:1.5}.rat b{color:var(--ink);font-weight:700}
  .why{font-size:9.5px;color:var(--green);font-weight:700;margin-top:4px}
  .iright{text-align:right;min-width:104px}
  .imp{font-size:19px;font-weight:800;color:var(--navy)}.impu{font-size:10px;color:var(--muted);font-weight:700}
  .native{font-size:9px;color:var(--muted);margin-top:1px}
  .ease{display:flex;gap:3px;justify-content:flex-end;margin-top:6px}
  .ease .d{width:6px;height:6px;border-radius:50%;background:var(--line)}.ease .d.on{background:var(--gold)}
  .ease .el{font-size:8px;color:var(--muted);margin-right:3px;align-self:center;font-weight:700}

  .portfolio{margin-top:14px;background:#FFF8E6;border:1px solid var(--gold);border-radius:12px;padding:13px 18px;font-size:11.5px;color:#6e5212;line-height:1.6}
  .portfolio b{color:#8A5F00;font-weight:800}
  footer{margin-top:14px;font-size:10px;color:var(--muted);display:flex;justify-content:space-between}
  @keyframes slidein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">
      <div class="mark">道真<span class="dot">.</span></div>
      <div class="sub">
        <div class="t1">AX 診断（事業部別）── PLAN × UNIT-LOGS</div>
        <div class="t2">事業部の「計画」と「ログ実態」を掛け合わせ、役割に応じた最適なAXを提案する</div>
      </div>
    </div>
    <div class="tagright">道真プロジェクト ／ 攻めの知性<br>ダミーデータによるモックアップ</div>
  </header>

  <!-- BU selector -->
  <div class="busel" id="busel"></div>

  <!-- plan x logs -->
  <div class="profile">
    <div class="pbox plan">
      <div class="ph">事業計画 <span class="tag">この事業部に期待する役割</span></div>
      <div id="plan-body"></div>
    </div>
    <div class="pbox logs">
      <div class="ph">事業部ログ実態 <span class="tag">実際にどこが詰まっているか</span></div>
      <div id="logs-body"></div>
    </div>
  </div>

  <!-- stance -->
  <div class="stance" id="stance">
    <div class="si" id="stance-i">―</div>
    <div class="st" id="stance-t">―</div>
  </div>

  <!-- hero -->
  <div class="hero">
    <div>
      <div class="hk">想定 P/L インパクト（年間）</div>
      <div class="hbig"><span class="num" id="h-total">0</span><span class="u">百万円/年</span></div>
      <div class="hbd">コスト減 <span class="num" id="h-cost">0</span> ／ 売上増 <span class="num" id="h-rev">0</span></div>
    </div>
    <div class="spk">
      <div class="splitbar"><div class="s sc" id="bar-cost" style="width:50%"></div><div class="s sr" id="bar-rev" style="width:50%"></div></div>
      <div class="slegend"><span><i style="background:#00857A"></i>コスト減（外注削減・増員回避）</span><span><i style="background:#E6A817"></i>売上増</span></div>
    </div>
  </div>

  <div class="reslabel">この事業部への推奨AXロードマップ <span id="res-count"></span></div>
  <div class="cards" id="cards"></div>

  <div class="portfolio" id="portfolio"></div>

  <footer>
    <div>※ 攻めの出力は守り（内部統制）の証跡にもなる ── ひとつの知性、二つの働き</div>
    <div>Confidential</div>
  </footer>
</div>

<script>
const INITS=[
 {id:'sales',name:'営業事務の自動化',lever:'rev',baseRev:1.6,ease:3,log:'salesAdmin',serves:'売上成長',
  rat:'提案書・見積・日程調整をCoworkが代行。営業が顧客接点に集中し<b>同じ人員で受注機会が増える</b>。',native:'アポ 2→3.6件/日'},
 {id:'cs',name:'カスタマーサポート一次対応の自動化',lever:'rev',baseRev:1.1,ease:2,log:'csLoad',serves:'売上成長・人手不足',
  rat:'一次対応をAIが処理。<b>解約抑制とLTV向上</b>、増員も抑える。',native:'応答時間 −60%'},
 {id:'keiri',name:'経理・経費処理の自動化',lever:'cost',baseCost:1.2,ease:4,log:'backoffice',serves:'コスト削減',
  rat:'OCR・規程チェック・仕訳生成を内製化。<b>外部委託費が実額で消える</b>。',native:'外注 ¥1.2M/月 解約'},
 {id:'billing',name:'請求・債権管理の自動化',lever:'cost',baseCost:0.9,ease:3,log:'billing',serves:'コスト削減',
  rat:'請求発行・消込・督促を自動化。委託費削減と<b>担当者の負荷軽減</b>。',native:'委託 ¥0.9M/月'},
 {id:'kitting',name:'PCキッティング・情シス運用の自動化',lever:'cost',baseCost:0.7,ease:5,log:'itOps',serves:'コスト削減',
  rat:'構成適用・台帳登録を自動化。<b>最も着手しやすく</b>外注費を即削減。',native:'外注 ¥0.7M/月'},
 {id:'hire',name:'採用オペレーションの自動化',lever:'avoid',baseCost:1.1,ease:3,log:'hiring',serves:'人手不足・成長',
  rat:'スクリーニング・日程調整を自動化。<b>採用ペースを上げつつ人事の増員は回避</b>。',native:'採用工数 −70%'},
 {id:'overtime',name:'残業計算・勤怠処理の自動化',lever:'avoid',baseCost:0.5,ease:5,log:'attendance',serves:'コスト・人手不足',
  rat:'勤怠集計・チェックを自動化。<b>着手容易</b>で処理能力を確保。',native:'1.0名分'},
 {id:'report',name:'月次レポーティングの自動化',lever:'avoid',baseCost:0.8,ease:4,log:'reporting',serves:'全社最適',
  rat:'集計・可視化を自動化。<b>意思決定の高速化</b>と管理工数削減。',native:'管理工数 1.4名分'},
];

const LOGLABEL={salesAdmin:'営業の事務工数比率',csLoad:'CS応答の逼迫度',backoffice:'管理業務の外注費',
 billing:'請求・債権の工数',itOps:'情シス運用負荷',hiring:'採用・立上げ工数',attendance:'勤怠処理工数',reporting:'月次レポート工数'};

const BUS=[
 {id:'saas',name:'セキュリティSaaS事業部',role:'priority',roleLabel:'重点｜成長ドライバー',desc:'主力の成長エンジン',
   plan:{growth:30,head:'増員可（成長投資）',focus:'growth',planLine:'売上 +30% / 積極投資'},
   logs:{salesAdmin:.9,csLoad:.85,hiring:.7,billing:.35,backoffice:.25,itOps:.2,attendance:.25,reporting:.3}},
 {id:'legacy',name:'受託・保守事業部',role:'nonpriority',roleLabel:'非重点｜収益維持',desc:'成熟・効率化フェーズ',
   plan:{growth:0,head:'削減（省人化）',focus:'cost',planLine:'売上 据え置き / 利益重視'},
   logs:{backoffice:.9,billing:.85,reporting:.7,attendance:.6,itOps:.55,salesAdmin:.2,csLoad:.25,hiring:.1}},
 {id:'newbiz',name:'新規プロダクト事業部',role:'priority',roleLabel:'重点｜先行投資',desc:'立ち上げ・スケール前',
   plan:{growth:30,head:'増員可（立上げ）',focus:'growth',planLine:'売上 +30% / 立ち上げ加速'},
   logs:{hiring:.9,salesAdmin:.6,itOps:.6,reporting:.5,csLoad:.4,backoffice:.3,billing:.3,attendance:.3}},
];

let cur='saas';
const $=id=>document.getElementById(id);
const f1=v=>v.toFixed(1);
function countUp(el,t,fmt){const from=parseFloat(el.dataset.cur||0),s=performance.now(),d=650;
 function tk(n){const k=Math.min((n-s)/d,1),e=1-Math.pow(1-k,3),v=from+(t-from)*e;el.textContent=fmt(v);
 if(k<1)requestAnimationFrame(tk);else{el.dataset.cur=t;el.textContent=fmt(t);}}requestAnimationFrame(tk);}

function score(bu){
 const g=bu.plan.growth/20, focus=bu.plan.focus;
 return INITS.map(it=>{
   const ls=bu.logs[it.log]||0;
   let leverFit, impact, side;
   if(it.lever==='rev'){leverFit=focus==='growth'?1.6:(g>=1?1.3:0.9); impact=it.baseRev*(0.6+g*0.4)*(0.7+ls*0.6); side='rev';}
   else if(it.lever==='cost'){leverFit=focus==='cost'?1.6:1.0; impact=it.baseCost*(0.8+ls*0.6)*(focus==='cost'?1.15:1.0); side='cost';}
   else{leverFit=focus==='labor'?1.5:(focus==='cost'?1.2:(focus==='growth'?1.1:1.0)); impact=it.baseCost*(0.8+ls*0.6)*(bu.plan.head.indexOf('削減')>=0?1.2:1.0); side='cost';}
   const easeF=0.7+it.ease*0.08;
   const sc=(0.5+ls)*leverFit*easeF;
   return {...it,impact,side,ls,sc};
 }).sort((a,b)=>b.sc-a.sc);
}

function render(){
 const bu=BUS.find(b=>b.id===cur);
 // selector
 $('busel').innerHTML=BUS.map(b=>`<div class="bu ${b.role} ${b.id===cur?'on':''}" data-id="${b.id}">
   <span class="check">✓</span>
   <span class="role">${b.roleLabel}</span>
   <div class="bn">${b.name}</div><div class="bd">${b.desc}</div></div>`).join('');
 document.querySelectorAll('.bu').forEach(el=>el.addEventListener('click',()=>{cur=el.dataset.id;render();}));

 // plan
 $('plan-body').innerHTML=`
   <div class="prow"><span class="k">役割</span><span class="v">${bu.roleLabel}</span></div>
   <div class="prow"><span class="k">売上目標（来期）</span><span class="v">${bu.plan.growth>0?'+'+bu.plan.growth+'%':'据え置き'}</span></div>
   <div class="prow"><span class="k">人員方針</span><span class="v">${bu.plan.head}</span></div>
   <div class="prow"><span class="k">重点</span><span class="v">${({growth:'成長',cost:'コスト効率',labor:'人手不足対応'})[bu.plan.focus]}</span></div>`;

 // logs (top 4 by value)
 const lt=Object.entries(bu.logs).sort((a,b)=>b[1]-a[1]).slice(0,4);
 $('logs-body').innerHTML=lt.map(([k,v])=>`<div class="logbar"><span class="lk">${LOGLABEL[k]}</span>
   <span class="lt"><span class="lf" style="width:${Math.round(v*100)}%"></span></span>
   <span class="lv">${v>=.7?'高':v>=.4?'中':'低'}</span></div>`).join('');

 // stance
 const attack=bu.role==='priority';
 $('stance').className='stance '+(attack?'attack':'defend');
 $('stance-i').textContent=attack?'攻めのAX':'守りのAX';
 $('stance-t').innerHTML=attack
   ? `成長ドライバーの事業部。ログが示す<b>律速（営業事務・CS・採用）を自動化で外し</b>、限られた人員のまま成長を最大化する。`
   : `収益維持フェーズの事業部。<b>外注・定型業務を省人化してmarginを守り</b>、浮いた人員・予算を重点事業部へ再配置する原資をつくる。`;

 // results
 const scored=score(bu), top=scored.slice(0,5);
 let cost=0,rev=0; top.forEach(it=>it.side==='rev'?rev+=it.impact:cost+=it.impact);
 const totalM=(cost+rev)*12;
 countUp($('h-total'),totalM,f1); countUp($('h-cost'),cost*12,f1); countUp($('h-rev'),rev*12,f1);
 const tot=(cost+rev)||1;
 $('bar-cost').style.width=(cost/tot*100)+'%'; $('bar-rev').style.width=(rev/tot*100)+'%';
 $('res-count').textContent=`計画 × ログを掛け合わせ、全${scored.length}施策から上位${top.length}件`;

 const levName={rev:'売上増',cost:'外注削減',avoid:'増員回避'};
 $('cards').innerHTML=top.map((it,i)=>{
   const dots=[1,2,3,4,5].map(n=>`<span class="d ${n<=it.ease?'on':''}"></span>`).join('');
   return `<div class="icard ${it.lever}" style="animation-delay:${i*0.05}s">
    <div class="rank">${i+1}<small>RANK</small></div>
    <div><div class="nm">${it.name}<span class="lev ${it.lever}">${levName[it.lever]}</span></div>
      <div class="rat">${it.rat}</div>
      <div class="why">▲ この事業部のログ「${LOGLABEL[it.log]}」が${it.ls>=.7?'高い':it.ls>=.4?'中程度':'低い'} → ${it.ls>=.7?'最優先で効く':'寄与あり'}</div></div>
    <div class="iright"><div class="imp">¥<span class="num">${f1(it.impact)}</span><span class="impu">M/月</span></div>
      <div class="native">${it.native}</div>
      <div class="ease"><span class="el">容易性</span>${dots}</div></div>
   </div>`;
 }).join('');

 // portfolio note
 $('portfolio').innerHTML = attack
   ? `<b>ポートフォリオ視点：</b>この重点事業部には<b>成長を加速するAX</b>を集中投下する。一方、非重点事業部で省人化して生んだ余力（人員・予算）を、ここへ再配置するのが事業部別AXの狙い。`
   : `<b>ポートフォリオ視点：</b>この非重点事業部のAXの目的は単なるコスト削減ではない。<b>省人化で生んだ余力を、重点事業部（成長ドライバー）へ再配置する原資をつくる</b>こと。守りのAXが、攻めの投資を生む。`;
}
render();
</script>
</body>
</html>


~~~

### `scripts/build-static.mjs`

~~~javascript
// Vercel ビルド用：CSV を data.json に焼き、score.mjs を public/ にコピー
import { writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadDataset, loadDefense } from '../src/csv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const DATA_DIR = resolve(ROOT, 'data');

mkdirSync(PUBLIC_DIR, { recursive: true });

const data = loadDataset(DATA_DIR);
writeFileSync(resolve(PUBLIC_DIR, 'data.json'), JSON.stringify(data, null, 2));
copyFileSync(resolve(ROOT, 'src', 'score.mjs'), resolve(PUBLIC_DIR, 'score.mjs'));

const defense = loadDefense(DATA_DIR);
writeFileSync(resolve(PUBLIC_DIR, 'defense.json'), JSON.stringify(defense, null, 2));

console.log(`build ok: ${data.bus.length} BU / ${data.inits.length} INIT → public/data.json`);
console.log(`         public/score.mjs (copied from src/)`);
console.log(`         public/defense.json (${defense.months.length} months)`);


~~~

### `scripts/bundle.mjs`

~~~javascript
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


~~~

### `SPEC.md`

~~~markdown
# 道真 AX診断（事業部別）SPEC

> 注：ユーザーから別ファイルとしての SPEC.md が提示されなかったため、
> `reference/mockup.html` を一次仕様として §4 を抽出・整備した版。
> モックアップ更新があれば本ファイルを上書き同期する。

---

## §1 目的

事業部の **事業計画（役割）** と **ログ実態（どこが詰まっているか）** を掛け合わせ、
役割に応じた最適な AX 施策をランキングして提案する。

- 重点事業部（成長ドライバー）→ 攻めのAX：売上増レバーを上位に
- 非重点事業部（収益維持）→ 守りのAX：コスト系（外注削減・増員回避）を上位に

ポートフォリオ視点：非重点で省人化して生んだ余力を、重点に再配置する原資にする。

---

## §2 用語

- **BU（Business Unit）**：事業部。重点 (`priority`) / 非重点 (`nonpriority`) のロールを持つ。
- **plan**：事業部の事業計画属性。`growth`（売上目標%）、`head`（人員方針）、`focus`（`growth` / `cost` / `labor`）。
- **logs**：事業部のログ実態。施策ごとに対応する負荷度（0〜1）。
- **INIT（Initiative）**：AX 施策。`lever ∈ {rev, cost, avoid}` を持つ。
  - `rev`：売上増（営業/CSなど顧客接点）
  - `cost`：外注削減（実額削減）
  - `avoid`：増員回避（採用/勤怠/月次など定型工数）
- **score**：施策×事業部のスコア。降順でランキング。

---

## §3 入出力（Phase 1）

### 入力（CSV、`data/`）
- `inits.csv` — 施策マスタ
- `bus.csv` — 事業部マスタ（roleやplan）
- `logs.csv` — 事業部 × ログ（long format）

### 出力（CLI）
事業部 ID を引数に渡して、上位 5 件を標準出力。`--json` で JSON 出力。

---

## §4 提案ロジック（reference/mockup.html から忠実移植）

モックアップの `score(bu)` を JS のまま移植する。改変禁止。

```js
function score(bu){
 const g=bu.plan.growth/20, focus=bu.plan.focus;
 return INITS.map(it=>{
   const ls=bu.logs[it.log]||0;
   let leverFit, impact, side;
   if(it.lever==='rev'){
     leverFit=focus==='growth'?1.6:(g>=1?1.3:0.9);
     impact=it.baseRev*(0.6+g*0.4)*(0.7+ls*0.6);
     side='rev';
   }
   else if(it.lever==='cost'){
     leverFit=focus==='cost'?1.6:1.0;
     impact=it.baseCost*(0.8+ls*0.6)*(focus==='cost'?1.15:1.0);
     side='cost';
   }
   else{ // avoid
     leverFit=focus==='labor'?1.5:(focus==='cost'?1.2:(focus==='growth'?1.1:1.0));
     impact=it.baseCost*(0.8+ls*0.6)*(bu.plan.head.indexOf('削減')>=0?1.2:1.0);
     side='cost';
   }
   const easeF=0.7+it.ease*0.08;
   const sc=(0.5+ls)*leverFit*easeF;
   return {...it,impact,side,ls,sc};
 }).sort((a,b)=>b.sc-a.sc);
}
```

### スコアの設計意図（読み替え用メモ）
- `(0.5 + ls)` … ログ実態が高いほど効く（基底 0.5、最大 1.5）
- `leverFit` … 事業計画の重点とレバーの整合
- `easeF = 0.7 + ease * 0.08` … 容易性（1〜5）が高いほど加点（0.78 〜 1.10）
- `impact` … 想定 P/L インパクト（百万円/月）。`baseRev/baseCost × g補正 × ls補正 × focus補正`

### 期待される性質（テスト対象）
- BU.role=`priority` かつ plan.focus=`growth` → 上位5件にレバー `rev` の施策が多く含まれる
- BU.role=`nonpriority` かつ plan.focus=`cost` → 上位5件にレバー `cost` / `avoid` の施策が多く含まれる

---

## §5 ダミーデータ（モックアップ準拠）

### INITS（8件）
| id | name | lever | baseRev | baseCost | ease | log | native |
|---|---|---|---|---|---|---|---|
| sales | 営業事務の自動化 | rev | 1.6 | — | 3 | salesAdmin | アポ 2→3.6件/日 |
| cs | カスタマーサポート一次対応 | rev | 1.1 | — | 2 | csLoad | 応答時間 −60% |
| keiri | 経理・経費処理 | cost | — | 1.2 | 4 | backoffice | 外注 ¥1.2M/月 解約 |
| billing | 請求・債権管理 | cost | — | 0.9 | 3 | billing | 委託 ¥0.9M/月 |
| kitting | PCキッティング・情シス運用 | cost | — | 0.7 | 5 | itOps | 外注 ¥0.7M/月 |
| hire | 採用オペレーション | avoid | — | 1.1 | 3 | hiring | 採用工数 −70% |
| overtime | 残業計算・勤怠 | avoid | — | 0.5 | 5 | attendance | 1.0名分 |
| report | 月次レポーティング | avoid | — | 0.8 | 4 | reporting | 管理工数 1.4名分 |

### BUS（3件）
- `saas` セキュリティSaaS事業部 / **priority** / growth +30% / head=増員可（成長投資） / focus=growth
- `legacy` 受託・保守事業部 / **nonpriority** / growth 0% / head=削減（省人化） / focus=cost
- `newbiz` 新規プロダクト事業部 / **priority** / growth +30% / head=増員可（立上げ） / focus=growth

ログ強度の数値はモックアップの `BUS[].logs` をそのまま使う。

---

## §6 Phase 計画

- **Phase 1（本実装）**：ダミーCSV → score() → CLI でランキング出力＋テスト
- Phase 2：Web UI（mockup.html の見た目を React/HTML どちらかで再現）
- Phase 3：実データ連携（事業部ログ取り込み・実P/L反映）


~~~

### `src/cli.mjs`

~~~javascript
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadDataset } from './csv.mjs';
import { score, summarize } from './score.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const LEVER_LABEL = { rev: '売上増', cost: '外注削減', avoid: '増員回避' };
const LOG_LABEL = {
  salesAdmin: '営業の事務工数比率',
  csLoad: 'CS応答の逼迫度',
  backoffice: '管理業務の外注費',
  billing: '請求・債権の工数',
  itOps: '情シス運用負荷',
  hiring: '採用・立上げ工数',
  attendance: '勤怠処理工数',
  reporting: '月次レポート工数',
};

function fmt1(n) { return Number(n).toFixed(1); }

function printHuman(bu, ranked, top) {
  const sum = summarize(top);
  console.log('');
  console.log(`■ 事業部: ${bu.name}（${bu.roleLabel}）`);
  console.log(`  計画: ${bu.plan.planLine} ／ 人員: ${bu.plan.head} ／ 重点: ${bu.plan.focus}`);
  console.log('');
  console.log(`想定 P/L インパクト（年間）: ${fmt1(sum.annualTotal)} 百万円/年`);
  console.log(`  コスト減 ${fmt1(sum.annualCost)} ／ 売上増 ${fmt1(sum.annualRev)}`);
  console.log('');
  console.log(`推奨AXロードマップ（全${ranked.length}施策から上位${top.length}件）`);
  console.log('─'.repeat(60));
  top.forEach((it, i) => {
    const lsLabel = it.ls >= 0.7 ? '高' : it.ls >= 0.4 ? '中' : '低';
    console.log(`${i + 1}. [${LEVER_LABEL[it.lever]}] ${it.name}`);
    console.log(`   インパクト ¥${fmt1(it.impact)}M/月  ／  容易性 ${it.ease}/5  ／  score ${it.sc.toFixed(3)}`);
    console.log(`   ログ: ${LOG_LABEL[it.log] || it.log}（${lsLabel}=${it.ls.toFixed(2)})  ／  ${it.native}`);
  });
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const buArg = args.find(a => !a.startsWith('--'));

  const { inits, bus } = loadDataset(resolve(ROOT, 'data'));

  if (!buArg) {
    console.error('使い方: npm start -- <bu_id> [--json]');
    console.error('利用可能な事業部:');
    for (const b of bus) console.error(`  ${b.id}\t${b.name}\t(${b.roleLabel})`);
    process.exit(1);
  }

  const bu = bus.find(b => b.id === buArg);
  if (!bu) {
    console.error(`事業部 "${buArg}" が見つからない。利用可能: ${bus.map(b => b.id).join(', ')}`);
    process.exit(1);
  }

  const ranked = score(bu, inits);
  const top = ranked.slice(0, 5);

  if (isJson) {
    console.log(JSON.stringify({ bu: { id: bu.id, name: bu.name, role: bu.role }, top, summary: summarize(top) }, null, 2));
  } else {
    printHuman(bu, ranked, top);
  }
}

main();


~~~

### `src/csv.mjs`

~~~javascript
import { readFileSync } from 'node:fs';

function splitCSVLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = false; }
      } else cur += c;
    } else {
      if (c === ',') { out.push(cur); cur = ''; }
      else if (c === '"') { inQ = true; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

export function parseCSV(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const header = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const row = {};
    header.forEach((h, i) => { row[h] = cols[i] ?? ''; });
    return row;
  });
}

export function readCSV(path) {
  return parseCSV(readFileSync(path, 'utf-8'));
}

const numOrUndef = v => (v === '' || v == null) ? undefined : Number(v);

export function loadDataset(dir) {
  const inits = readCSV(`${dir}/inits.csv`).map(r => ({
    id: r.id,
    name: r.name,
    lever: r.lever,
    baseRev: numOrUndef(r.baseRev),
    baseCost: numOrUndef(r.baseCost),
    ease: Number(r.ease),
    log: r.log,
    serves: r.serves,
    rat: r.rat,
    native: r.native,
  }));

  const busRows = readCSV(`${dir}/bus.csv`);
  const logRows = readCSV(`${dir}/logs.csv`);

  const bus = busRows.map(r => {
    const logs = {};
    for (const lr of logRows) {
      if (lr.bu_id === r.id) logs[lr.log] = Number(lr.value);
    }
    return {
      id: r.id,
      name: r.name,
      role: r.role,
      roleLabel: r.roleLabel,
      desc: r.desc,
      plan: {
        growth: Number(r.growth),
        head: r.head,
        focus: r.focus,
        planLine: r.planLine,
      },
      logs,
    };
  });

  return { inits, bus };
}

// 守り（防いだ損失額）データ。攻めと同じく CSV 駆動。
// months[].{leak,fraud,early} は百万円。events は月ごとの主な阻止イベント。
export function loadDefense(dir) {
  const monthRows = readCSV(`${dir}/defense.csv`);
  const eventRows = readCSV(`${dir}/defense-events.csv`);

  const months = monthRows.map(r => ({
    month: r.month,
    label: r.label,
    leak: Number(r.leak),
    fraud: Number(r.fraud),
    early: Number(r.early),
    leakUnit: r.leakUnit,
    leakCnt: Number(r.leakCnt),
    fraudCnt: Number(r.fraudCnt),
    events: eventRows
      .filter(e => e.month === r.month)
      .map(e => ({ cat: e.cat, title: e.title, sub: e.sub, value: e.value })),
  }));

  return { months };
}


~~~

### `src/score.mjs`

~~~javascript
// reference/mockup.html §4 の score(bu) を忠実移植。
// 変更点は INITS を引数で受け取る点のみ（モックではモジュールスコープに置かれていた）。

export function score(bu, INITS) {
 const g=bu.plan.growth/20, focus=bu.plan.focus;
 return INITS.map(it=>{
   const ls=bu.logs[it.log]||0;
   let leverFit, impact, side;
   if(it.lever==='rev'){leverFit=focus==='growth'?1.6:(g>=1?1.3:0.9); impact=it.baseRev*(0.6+g*0.4)*(0.7+ls*0.6); side='rev';}
   else if(it.lever==='cost'){leverFit=focus==='cost'?1.6:1.0; impact=it.baseCost*(0.8+ls*0.6)*(focus==='cost'?1.15:1.0); side='cost';}
   else{leverFit=focus==='labor'?1.5:(focus==='cost'?1.2:(focus==='growth'?1.1:1.0)); impact=it.baseCost*(0.8+ls*0.6)*(bu.plan.head.indexOf('削減')>=0?1.2:1.0); side='cost';}
   const easeF=0.7+it.ease*0.08;
   const sc=(0.5+ls)*leverFit*easeF;
   return {...it,impact,side,ls,sc};
 }).sort((a,b)=>b.sc-a.sc);
}

// モックアップ準拠：上位5件で P/L 集計、年額換算（×12）。
export function summarize(top) {
  let cost = 0, rev = 0;
  for (const it of top) {
    if (it.side === 'rev') rev += it.impact;
    else cost += it.impact;
  }
  return {
    monthlyCost: cost,
    monthlyRev: rev,
    annualCost: cost * 12,
    annualRev: rev * 12,
    annualTotal: (cost + rev) * 12,
  };
}


~~~

### `src/server.mjs`

~~~javascript
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


~~~

### `tests/score.test.mjs`

~~~javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadDataset } from '../src/csv.mjs';
import { score } from '../src/score.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const { inits, bus } = loadDataset(DATA);

const byId = id => bus.find(b => b.id === id);

test('重点 (priority) かつ focus=growth の SaaS では、上位2件が売上増レバー(rev)', () => {
  const bu = byId('saas');
  assert.equal(bu.role, 'priority');
  assert.equal(bu.plan.focus, 'growth');

  const top = score(bu, inits).slice(0, 5);
  assert.equal(top[0].lever, 'rev', `1位は rev のはず（実際は ${top[0].lever}: ${top[0].name}）`);
  assert.equal(top[1].lever, 'rev', `2位は rev のはず（実際は ${top[1].lever}: ${top[1].name}）`);

  const top5Levers = top.map(t => t.lever);
  const revCount = top5Levers.filter(l => l === 'rev').length;
  assert.ok(revCount >= 2, `上位5件のうち rev は2件以上のはず（実際 ${revCount}件: ${top5Levers.join(', ')}）`);
});

test('非重点 (nonpriority) かつ focus=cost の legacy では、上位がコスト系 (cost+avoid)', () => {
  const bu = byId('legacy');
  assert.equal(bu.role, 'nonpriority');
  assert.equal(bu.plan.focus, 'cost');

  const top = score(bu, inits).slice(0, 5);

  // 1〜3位はすべて cost レバー（外注費削減）を期待
  for (let i = 0; i < 3; i++) {
    assert.equal(top[i].lever, 'cost', `${i + 1}位は cost のはず（実際は ${top[i].lever}: ${top[i].name}）`);
  }

  // 上位5件すべてが cost か avoid（=コスト系）であること
  const allCostSide = top.every(t => t.lever === 'cost' || t.lever === 'avoid');
  assert.ok(allCostSide, `上位5件は全てコスト系のはず（実際: ${top.map(t => `${t.name}(${t.lever})`).join(', ')}）`);

  // rev は1件も入らない
  const hasRev = top.some(t => t.lever === 'rev');
  assert.ok(!hasRev, 'rev レバーは上位5件に入らないはず');
});

test('newbiz（priority + growth）でも rev が上位に来る（採用ログが高いので avoid も混じってよい）', () => {
  const bu = byId('newbiz');
  assert.equal(bu.role, 'priority');

  const top = score(bu, inits).slice(0, 5);
  const hasRev = top.some(t => t.lever === 'rev');
  assert.ok(hasRev, `priority事業部の上位5件に rev は少なくとも1件含まれるはず`);
});

test('score関数はモックアップ §4 と同じ計算式（saas/sales のスコアを直接計算と照合）', () => {
  const bu = byId('saas');
  const ranked = score(bu, inits);
  const sales = ranked.find(it => it.id === 'sales');

  // モック §4 の式を直接展開:
  // g = 30/20 = 1.5, ls = 0.9, ease = 3
  // leverFit = 1.6 (focus=growth)
  // impact   = 1.6 * (0.6+1.5*0.4) * (0.7+0.9*0.6) = 1.6 * 1.2 * 1.24
  // easeF    = 0.7+3*0.08 = 0.94
  // sc       = (0.5+0.9)*1.6*0.94
  const expectedImpact = 1.6 * 1.2 * 1.24;
  const expectedScore = 1.4 * 1.6 * 0.94;

  assert.ok(Math.abs(sales.impact - expectedImpact) < 1e-9,
    `impact 期待${expectedImpact} 実際${sales.impact}`);
  assert.ok(Math.abs(sales.sc - expectedScore) < 1e-9,
    `score 期待${expectedScore} 実際${sales.sc}`);
});

test('降順ソートになっている（隣接ペアで sc が単調減少）', () => {
  for (const bu of bus) {
    const ranked = score(bu, inits);
    for (let i = 0; i < ranked.length - 1; i++) {
      assert.ok(ranked[i].sc >= ranked[i + 1].sc,
        `${bu.id}: ${i}位(${ranked[i].sc}) < ${i+1}位(${ranked[i+1].sc})`);
    }
  }
});


~~~

### `vercel.json`

~~~json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "node scripts/build-static.mjs",
  "outputDirectory": "public",
  "framework": null
}


~~~
