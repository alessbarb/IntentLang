import React from "react";
import CodeBlock from "@theme/CodeBlock";

type Props = {
  leftLabel: string;
  left: string;
  rightLabel: string;
  right: string;
  languageLeft?: string;
  languageRight?: string;
};

/** Diff muy simple línea a línea (sin LCS), suficiente para goldens didácticos. */
export default function GoldenDiff({
  leftLabel,
  left,
  rightLabel,
  right,
  languageLeft = "intentlang",
  languageRight = "ts",
}: Props) {
  const L = left.split("\n");
  const R = right.split("\n");
  const max = Math.max(L.length, R.length);

  const pad = (arr: string[], i: number) =>
    i < arr.length ? arr[i] : "";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{leftLabel}</div>
        <CodeBlock language={languageLeft} children={false}>{left}</CodeBlock>
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{rightLabel}</div>
        <CodeBlock language={languageRight} children={false}>{right}</CodeBlock>
      </div>
      <div style={{ gridColumn: "1 / span 2" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {Array.from({ length: max }).map((_, i) => {
              const a = pad(L, i);
              const b = pad(R, i);
              const same = a === b;
              const bg = same
                ? "transparent"
                : a && !b
                  ? "rgba(255,0,0,0.06)"
                  : !a && b
                    ? "rgba(0,128,0,0.06)"
                    : "rgba(255,165,0,0.06)";
              return (
                <tr key={i} style={{ background: bg }}>
                  <td style={{ width: "50%", verticalAlign: "top" }}>
                    <pre style={{ margin: 0 }}>{a}</pre>
                  </td>
                  <td style={{ width: "50%", verticalAlign: "top" }}>
                    <pre style={{ margin: 0 }}>{b}</pre>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
