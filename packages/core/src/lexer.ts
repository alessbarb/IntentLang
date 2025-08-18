export type Token = {
  type: string;
  value: string;
  start: number;
  end: number;
};

const keywords = new Set([
  "intent",
  "tags",
  "uses",
  "types",
  "type",
  "func",
  "effect",
  "brand",
  "where",
]);

export function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '/' && input[i + 1] === '/') {
      while (i < input.length && input[i] !== '\n') i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let val = '';
      while (j < input.length && input[j] !== '"') {
        if (input[j] === '\\') {
          val += input[j + 1];
          j += 2;
        } else {
          val += input[j++];
        }
      }
      tokens.push({ type: 'string', value: val, start: i, end: j + 1 });
      i = j + 1;
      continue;
    }
    if (/\d/.test(ch)) {
      let j = i;
      while (j < input.length && /[0-9]/.test(input[j])) j++;
      tokens.push({ type: 'number', value: input.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) j++;
      const value = input.slice(i, j);
      const type = keywords.has(value) ? 'keyword' : 'identifier';
      tokens.push({ type, value, start: i, end: j });
      i = j;
      continue;
    }
    if ("{}()[],:|=;<>+-*/".includes(ch)) {
      tokens.push({ type: 'punct', value: ch, start: i, end: i + 1 });
      i++;
      continue;
    }
    tokens.push({ type: 'punct', value: ch, start: i, end: i + 1 });
    i++;
  }
  return tokens;
}
