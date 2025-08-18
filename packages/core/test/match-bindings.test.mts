import assert from 'node:assert/strict';
import { parse, check, emitTypeScript } from '../src/index.ts';

const src = `
  intent "T" tags []
  types { type Payment = Card { id: String } | Cash; }
  func f(p: Payment): Int {
    match p {
      Card { id: x } => x;
      Cash => 0;
    }
  }
`;
const program = parse(src);
const diags = check(program);
assert.equal(diags.length, 0);
const out = emitTypeScript(program);
assert.match(out, /const x = _m_\d+\.id;/);
