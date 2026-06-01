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

