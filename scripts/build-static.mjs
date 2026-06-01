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

