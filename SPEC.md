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

