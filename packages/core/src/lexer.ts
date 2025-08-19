// AST v0.2 — Lexer con operadores, palabras clave y comentarios

export type Token = {
  type:
    | "kw_intent"
    | "kw_tags"
    | "kw_uses"
    | "kw_types"
    | "kw_type"
    | "kw_where"
    | "kw_func"
    | "kw_effect"
    | "kw_return"
    | "kw_let"
    | "kw_if"
    | "kw_else"
    | "kw_match"
    | "kw_true"
    | "kw_false"
    | "kw_Ok"
    | "kw_Err"
    | "kw_Some"
    | "kw_None"
    | "kw_brand"
    | "kw_test"
    | "ident"
    | "string"
    | "number"
    | "lbrace"
    | "rbrace"
    | "lparen"
    | "rparen"
    | "lbrack"
    | "rbrack"
    | "colon"
    | "comma"
    | "semi"
    | "dot"
    | "eq"
    | "pipe"
    | "lt"
    | "gt"
    | "lte"
    | "gte"
    | "eqeq"
    | "neq"
    | "bang"
    | "plus"
    | "minus"
    | "star"
    | "slash"
    | "percent"
    | "andand"
    | "oror"
    | "fat_arrow"
    | "eof";
  value?: string;
  index: number;
  line: number;
  column: number;
};

const KEYWORDS = new Map<string, Token["type"]>([
  ["intent", "kw_intent"],
  ["tags", "kw_tags"],
  ["uses", "kw_uses"],
  ["types", "kw_types"],
  ["type", "kw_type"],
  ["where", "kw_where"],
  ["func", "kw_func"],
  ["effect", "kw_effect"],
  ["return", "kw_return"],
  ["let", "kw_let"],
  ["if", "kw_if"],
  ["else", "kw_else"],
  ["match", "kw_match"],
  ["true", "kw_true"],
  ["false", "kw_false"],
  ["Ok", "kw_Ok"],
  ["Err", "kw_Err"],
  ["Some", "kw_Some"],
  ["None", "kw_None"],
  ["brand", "kw_brand"],
  ["test", "kw_test"],
]);

export function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0,
    line = 1,
    col = 1;

  const peek = (n = 0) => input[i + n] ?? "";
  const adv = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (input[i] === "\n") {
        line++;
        col = 1;
      } else col++;
      i++;
    }
  };
  const push = (type: Token["type"], value?: string) =>
    tokens.push({ type, value, index: i, line, column: col });

  const isAlpha = (c: string) => /[A-Za-z_]/.test(c);
  const isAlnum = (c: string) => /[A-Za-z0-9_]/.test(c);
  const isDigit = (c: string) => /[0-9]/.test(c);

  while (i < input.length) {
    const c = peek();

    if (/\s/.test(c)) {
      adv();
      continue;
    }

    // // ...
    if (c === "/" && peek(1) === "/") {
      while (i < input.length && peek() !== "\n") adv();
      continue;
    }
    // /* ... */
    if (c === "/" && peek(1) === "*") {
      adv(2);
      while (i < input.length && !(peek() === "*" && peek(1) === "/")) adv();
      adv(2);
      continue;
    }

    // multi-char
    if (c === "=" && peek(1) === ">") {
      push("fat_arrow");
      adv(2);
      continue;
    }
    if (c === "&" && peek(1) === "&") {
      push("andand");
      adv(2);
      continue;
    }
    if (c === "|" && peek(1) === "|") {
      push("oror");
      adv(2);
      continue;
    }
    if (c === "=" && peek(1) === "=") {
      push("eqeq");
      adv(2);
      continue;
    }
    if (c === "!" && peek(1) === "=") {
      push("neq");
      adv(2);
      continue;
    }
    if (c === "<" && peek(1) === "=") {
      push("lte");
      adv(2);
      continue;
    }
    if (c === ">" && peek(1) === "=") {
      push("gte");
      adv(2);
      continue;
    }

    // single
    if (c === "{") {
      push("lbrace");
      adv();
      continue;
    }
    if (c === "}") {
      push("rbrace");
      adv();
      continue;
    }
    if (c === "(") {
      push("lparen");
      adv();
      continue;
    }
    if (c === ")") {
      push("rparen");
      adv();
      continue;
    }
    if (c === "[") {
      push("lbrack");
      adv();
      continue;
    }
    if (c === "]") {
      push("rbrack");
      adv();
      continue;
    }
    if (c === ":") {
      push("colon");
      adv();
      continue;
    }
    if (c === ",") {
      push("comma");
      adv();
      continue;
    }
    if (c === ";") {
      push("semi");
      adv();
      continue;
    }
    if (c === ".") {
      push("dot");
      adv();
      continue;
    }
    if (c === "|") {
      push("pipe");
      adv();
      continue;
    }
    if (c === "<") {
      push("lt");
      adv();
      continue;
    }
    if (c === ">") {
      push("gt");
      adv();
      continue;
    }
    if (c === "=") {
      push("eq");
      adv();
      continue;
    }
    if (c === "!") {
      push("bang");
      adv();
      continue;
    }
    if (c === "+") {
      push("plus");
      adv();
      continue;
    }
    if (c === "-") {
      push("minus");
      adv();
      continue;
    }
    if (c === "*") {
      push("star");
      adv();
      continue;
    }
    if (c === "/") {
      push("slash");
      adv();
      continue;
    }
    if (c === "%") {
      push("percent");
      adv();
      continue;
    }

    // string
    if (c === `"` || c === `'`) {
      const quote = c;
      adv();
      let out = "";
      while (i < input.length && peek() !== quote) {
        if (peek() === "\\" && (peek(1) === quote || peek(1) === "\\")) {
          out += peek(1);
          adv(2);
          continue;
        }
        out += peek();
        adv();
      }
      if (peek() !== quote)
        throw new Error(`Unterminated string at ${line}:${col}`);
      adv();
      push("string", out);
      continue;
    }

    // number
    if (isDigit(c)) {
      let out = c;
      adv();
      while (isDigit(peek())) {
        out += peek();
        adv();
      }
      push("number", out);
      continue;
    }

    // ident / keyword
    if (isAlpha(c)) {
      let out = c;
      adv();
      while (isAlnum(peek())) {
        out += peek();
        adv();
      }
      push(KEYWORDS.get(out) ?? "ident", out);
      continue;
    }

    throw new Error(`Unexpected char '${c}' at ${line}:${col}`);
  }

  tokens.push({ type: "eof", index: i, line, column: col });
  return tokens;
}
