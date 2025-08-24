// packages/docs/src/components/CodeToggle.tsx
import React from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";

export type CodeToggleProps = {
  /** Código IL (inline) */
  il?: string;
  /** Código TS (inline) */
  ts?: string;
  /** Código PY (inline) */
  py?: string;
  /** Código IL importado con raw-loader */
  ilRaw?: string;
  /** Código TS importado con raw-loader */
  tsRaw?: string;
  /** Código PY importado con raw-loader */
  pyRaw?: string;
  /** Título/identificador del snippet (opcional) */
  title?: string;
};

export default function CodeToggle({
  il,
  ts,
  py,
  ilRaw,
  tsRaw,
  pyRaw,
  title,
}: CodeToggleProps) {
  const ilCode = (il ?? ilRaw ?? "").trim();
  const tsCode = (ts ?? tsRaw ?? "").trim();
  const pyCode = (py ?? pyRaw ?? "").trim();
  const defaultValue = ilCode ? "il" : tsCode ? "ts" : "py";
  const groupId =
    "code-toggle-" + (title ?? "snippet").toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        margin: "16px 0",
        border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
      }}
    >
      <Tabs groupId={groupId} defaultValue={defaultValue} children={false}>
        <TabItem value="il" label="IL" children={false}>
          <CodeBlock language="intentlang" title={title} children={false}>
            {ilCode || "// (no IL proporcionado)"}
          </CodeBlock>
        </TabItem>
        <TabItem value="ts" label="TS (emit)" children={false}>
          <CodeBlock language="ts" title={title} children={false}>
            {tsCode || "// (no TS proporcionado)"}
          </CodeBlock>
        </TabItem>
        <TabItem value="py" label="PY (emit)" children={false}>
          <CodeBlock language="python" title={title} children={false}>
            {pyCode || "# (no PY proporcionado)"}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div >
  );
}
