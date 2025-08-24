import React from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";

export type CodeToggleProps = {
  /** Código IL (inline) */
  il?: string;
  /** Código TS (inline) */
  ts?: string;
  /** Código IL importado con raw-loader */
  ilRaw?: string;
  /** Código TS importado con raw-loader */
  tsRaw?: string;
  /** Título/identificador del snippet (opcional) */
  title?: string;
};

/**
 * Toggle con pestañas IL ⇄ TS, tipado para Docusaurus.
 * - Siempre renderiza ambas pestañas para satisfacer el tipo de `children`.
 * - Si falta código, muestra un fallback amable.
 */
export default function CodeToggle({ il, ts, ilRaw, tsRaw, title }: CodeToggleProps) {
  const ilCode = (il ?? ilRaw ?? "").trim();
  const tsCode = (ts ?? tsRaw ?? "").trim();
  const defaultValue = ilCode ? "il" : "ts";
  const groupId = `code-toggle-${(title ?? "snippet").toLowerCase().replace(/\s+/g, "-")}`;

  const values = [
    { label: "IL", value: "il" },
    { label: "TS (emit)", value: "ts" },
  ];

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", margin: "12px 0" }}>
      <Tabs groupId={groupId} defaultValue={defaultValue} values={values}>
        <TabItem value="il" label="IL">
          <CodeBlock language="intentlang" title={title}>
            {ilCode || "// (no IL proporcionado)"}
          </CodeBlock>
        </TabItem>
        <TabItem value="ts" label="TS (emit)">
          <CodeBlock language="ts" title={title}>
            {tsCode || "// (no TS proporcionado)"}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
}
