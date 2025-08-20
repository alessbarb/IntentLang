import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@il/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(__dirname, '..');
const goldensDir = path.join(examplesDir, 'goldens');

const entries = [];
for (const file of fs.readdirSync(examplesDir)) {
  if (!file.endsWith('.il')) continue;
  const base = path.basename(file, '.il');
  const ilPath = path.join(examplesDir, file);
  const tsPath = path.join(goldensDir, `${base}.ts`);
  if (!fs.existsSync(tsPath)) {
    console.warn(`Skipping ${file}: missing golden`);
    continue;
  }
  const source_il = fs.readFileSync(ilPath, 'utf8');
  const transpiled_ts = fs.readFileSync(tsPath, 'utf8');
  let ast = null;
  try {
    ast = parse(source_il);
  } catch (err) {
    console.warn(`Failed to parse ${file}: ${err.message}`);
  }
  entries.push(JSON.stringify({ source_il, transpiled_ts, ast }));
}

const outPath = path.join(examplesDir, 'dataset.jsonl');
fs.writeFileSync(outPath, entries.join('\n') + '\n');
console.log(`Wrote ${entries.length} examples to ${outPath}`);
