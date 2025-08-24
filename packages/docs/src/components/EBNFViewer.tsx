import React from "react";
import CodeBlock from "@theme/CodeBlock";
import grammarRaw from "!!raw-loader!@site/../../packages/core/grammar/IntentLang.ebnf";

type Rule = { name: string; line: number };

function extractRules(src: string): Rule[] {
  const lines = src.split("\n");
  const rules: Rule[] = [];
  lines.forEach((ln, i) => {
    // heurística simple: RuleName = ...
    const m = ln.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (m) rules.push({ name: m[1], line: i + 1 });
  });
  return rules;
}

export default function EBNFViewer() {
  const src = String((grammarRaw as any).default ?? grammarRaw);
  const rules = extractRules(src);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
      <aside
        style={{
          border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
          borderRadius: 12,
          padding: 10,
          maxHeight: 480,
          overflow: "auto",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Reglas</div>
        {rules.map((r) => (
          <a
            key={r.name}
            href={`#rule-${r.name}`}
            style={{ display: "block", padding: "4px 0" }}
          >
            {r.name}
          </a>
        ))}
      </aside>
      <main>
        {/* Añadimos anchors ligeros en el código */}
        <CodeBlock language="ebnf" children={false}>
          {src
            .split("\n")
            .map((ln) => {
              const m = ln.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
              return m ? `/* #rule-${m[1]} */\n${ln}` : ln;
            })
            .join("\n")}
        </CodeBlock>
      </main>
    </div>
  );
}
