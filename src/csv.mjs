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

