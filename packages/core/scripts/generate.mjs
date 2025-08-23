import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.manual.ts')) {
      out.push(full);
    }
  }
  return out;
}

function hash(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

const manualFiles = walk(root);
const before = new Map(manualFiles.map(f => [f, hash(f)]));

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit', env: { ...process.env, npm_config_yes: 'true' } });
}

run('node ./scripts/ebnf2g4.mjs -i ./grammar/IntentLang.ebnf -o ./grammar/IntentLang.g4 --grammar IntentLang');
run('npx -y antlr4ts-cli -visitor -o ./src/generated ./grammar/IntentLang.g4');
run('node ./scripts/patch-antlr-esm.mjs ./src/generated/');

let changed = false;
for (const file of manualFiles) {
  if (before.get(file) !== hash(file)) {
    console.error(`Manual file modified by generation: ${file}`);
    changed = true;
  }
}

if (changed) {
  process.exit(1);
}
