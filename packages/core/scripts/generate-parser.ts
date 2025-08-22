import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import peggy from 'peggy';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const tspegjs = require('ts-pegjs');

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const grammarPath = path.resolve(__dirname, '../grammar/intentlang.peggy');
  const grammar = await readFile(grammarPath, 'utf8');
  const parserSource = peggy.generate(grammar, {
    output: 'source',
    format: 'es',
    plugins: [tspegjs],
    allowedStartRules: ['start'],
  });
  const outDir = path.resolve(__dirname, '../src/generated');
  await mkdir(outDir, { recursive: true });
  const header = '// AUTO-GENERATED\n';
  await writeFile(path.join(outDir, 'parser.ts'), header + parserSource, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
