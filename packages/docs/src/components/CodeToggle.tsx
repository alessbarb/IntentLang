import React from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";

type Props = {
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
export default function CodeToggle(props: Props) {
  const ilCode = (props.il ?? props.ilRaw ?? "").trim();
  const tsCode = (props.ts ?? props.tsRaw ?? "").trim();
  const defaultValue = ilCode ? "il" : "ts";
  const groupId = `code-toggle-${(props.title ?? "snippet").toLowerCase()}`;

  return (
    <Tabs groupId={groupId} defaultValue={defaultValue}>
      <TabItem value="il" label="IL">
        <CodeBlock language="intentlang" title={props.title}>
          {ilCode || "// (no IL proporcionado)"}
        </CodeBlock>
      </TabItem>
      <TabItem value="ts" label="TS (emit)">
        <CodeBlock language="ts" title={props.title}>
          {tsCode || "// (no TS proporcionado)"}
        </CodeBlock>
      </TabItem>
    </Tabs>
  );
}
