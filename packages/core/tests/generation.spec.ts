import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test, expect } from 'vitest';

const pkgRoot = join(__dirname, '..');
const grammarPath = join(pkgRoot, 'grammar/IntentLang.g4');
const visitorPath = join(pkgRoot, 'src/generated/grammar/IntentLangVisitor.ts');
const nodesPath = join(pkgRoot, 'src/generated/grammar/IntentLangParser.ts');

const grammar = readFileSync(grammarPath, 'utf8');
const ruleNames = grammar
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /^[a-z][A-Za-z0-9_]*\s*:/.test(l))
  .map((l) => l.split(/\s*:/)[0]);

const cap = (s: string): string => s[0].toUpperCase() + s.slice(1);
const visitorGen = readFileSync(visitorPath, 'utf8');
const nodesGen = readFileSync(nodesPath, 'utf8');

describe('generated artifacts match grammar', () => {
  test('visitor has visit methods for every rule', () => {
    for (const r of ruleNames) {
      expect(visitorGen).toContain(`visit${cap(r)}`);
    }
  });

  test('parser exposes context for every rule', () => {
    for (const r of ruleNames) {
      expect(nodesGen).toMatch(new RegExp(`class\\s+${cap(r)}Context`));
    }
  });
});
