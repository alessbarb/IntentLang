// packages/cli/scripts/gen-docs.ts
import fs from "node:fs/promises";
import path from "node:path";
import { SPEC, type Option } from "../src/options.ts";

const outDir = path.resolve(
  process.cwd(),
  "packages/docs/docs/reference/compiler-options",
);

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function renderType(o: Option) {
  return o.kind === "enum"
    ? `enum(${(o.enumValues ?? []).join(" | ")})`
    : o.kind;
}
const fence = (lang: string, s: string) =>
  "```" + lang + "\n" + s.trim() + "\n```\n";

function renderOption(o: Option) {
  const rows = [
    ["Name", `\`${o.name}\``],
    ["Type", renderType(o)],
    ["Default", o.default === undefined ? "—" : `\`${String(o.default)}\``],
    ["Since", o.since ?? "—"],
    [
      "Deprecated",
      o.deprecated
        ? typeof o.deprecated === "string"
          ? o.deprecated
          : "Yes"
        : "No",
    ],
  ];
  const table = [
    "| " + rows.map((r) => r[0]).join(" | ") + " |",
    "| " + rows.map(() => "---").join(" | ") + " |",
    "| " + rows.map((r) => r[1]).join(" | ") + " |",
  ].join("\n");

  const examples = (o.examples ?? [])
    .map((ex) =>
      ex.cli
        ? fence("bash", ex.cli)
        : ex.config
          ? fence("json", ex.config)
          : "",
    )
    .join("\n");

  const notes = (o.notes ?? []).map((n) => `> ${n}`).join("\n");

  const aliases = o.aliases?.length
    ? `**Aliases:** ${o.aliases.map((a) => `\`${a}\``).join(", ")}`
    : "";
  const relates = o.relatesTo?.length
    ? `**Related:** ${o.relatesTo.map((a) => `[\`${a}\`](#${slug(a)})`).join(", ")}`
    : "";

  return `## ${o.name} {#${slug(o.name)}}

${o.description}

${table}

${aliases}${aliases && relates ? " · " : ""}${relates}

${examples}
${notes}
`;
}

async function main() {
  try {
    await fs.stat(path.resolve("packages/docs"));
  } catch {
    throw new Error(
      "No se encontró packages/docs. Crea el paquete de docs o ajusta 'outDir' en gen-docs.ts.",
    );
  }
  await fs.mkdir(outDir, { recursive: true });
  let mdx = `---
id: index
title: ${SPEC.tool} Compiler Options
sidebar_label: Compiler Options
description: Reference of ${SPEC.tool} CLI and compiler options.
---

`;

  for (const g of SPEC.groups) {
    mdx += `# ${g.title}\n\n`;
    if (g.description) mdx += g.description + "\n\n";
    mdx +=
      g.options
        .map(
          (o) =>
            `- [\`${o.name}\`](#${slug(o.name)}) — ${o.description.split(".")[0]}.\n`,
        )
        .join("") + "\n";
    for (const o of g.options) mdx += renderOption(o) + "\n";
  }

  const dest = path.join(outDir, "index.mdx");
  await fs.writeFile(dest, mdx, "utf8");
  console.log("✓ " + path.relative(process.cwd(), dest));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
