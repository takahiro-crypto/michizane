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
  const bu = byId('iri');
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
  const bu = byId('corp');
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
  const bu = byId('social');
  assert.equal(bu.role, 'priority');

  const top = score(bu, inits).slice(0, 5);
  const hasRev = top.some(t => t.lever === 'rev');
  assert.ok(hasRev, `priority事業部の上位5件に rev は少なくとも1件含まれるはず`);
});

test('score関数はモックアップ §4 と同じ計算式（saas/sales のスコアを直接計算と照合）', () => {
  const bu = byId('iri');
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

